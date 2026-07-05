/** YouTube video pins: id parsing, transcript fetch via YouTube's player API
 * (the official Data API v3 only serves captions to the video's owner), and
 * timestamped transcript chunking. Pure helpers are dependency-free for tests. */

export interface TranscriptSegment {
  startSec: number;
  text: string;
}

export interface YouTubeVideo {
  title: string;
  description: string;
  durationSec: number | null;
  thumbnail: string;
  transcript: TranscriptSegment[];
}

const VIDEO_ID = /^[\w-]{11}$/;

export function getYouTubeVideoId(url: string): string | null {
  let u: URL;
  try {
    u = new URL(url);
  } catch {
    return null;
  }
  const host = u.hostname.replace(/^(www|m|music)\./, "").toLowerCase();

  if (host === "youtu.be") {
    const id = u.pathname.slice(1).split("/")[0];
    return VIDEO_ID.test(id) ? id : null;
  }
  if (host !== "youtube.com") return null;

  if (u.pathname === "/watch") {
    const id = u.searchParams.get("v") ?? "";
    return VIDEO_ID.test(id) ? id : null;
  }
  const path = u.pathname.match(/^\/(?:shorts|embed|live)\/([\w-]{11})(?:$|\/)/);
  return path ? path[1] : null;
}

function decodeXmlEntities(text: string): string {
  return text
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCodePoint(Number(code)))
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
}

/** Parse YouTube timedtext XML (`<p t="ms" d="ms">text</p>`) into segments. */
export function parseTimedText(xml: string): TranscriptSegment[] {
  const segments: TranscriptSegment[] = [];
  for (const match of xml.matchAll(/<p\b[^>]*\bt="(\d+)"[^>]*>([\s\S]*?)<\/p>/g)) {
    const text = decodeXmlEntities(match[2].replace(/<[^>]+>/g, " "))
      .replace(/\s+/g, " ")
      .trim();
    if (!text) continue;
    segments.push({ startSec: Math.floor(Number(match[1]) / 1000), text });
  }
  return segments;
}

/** Group transcript segments into ~`size`-char chunks, keeping the start time of each chunk. */
export function chunkTranscript(
  segments: TranscriptSegment[],
  size = 800,
): { sequence: number; content: string; startSec: number }[] {
  const chunks: { sequence: number; content: string; startSec: number }[] = [];
  let parts: string[] = [];
  let length = 0;
  let startSec = 0;

  const flush = () => {
    if (!parts.length) return;
    chunks.push({ sequence: chunks.length, content: parts.join(" "), startSec });
    parts = [];
    length = 0;
  };

  for (const segment of segments) {
    if (!parts.length) startSec = segment.startSec;
    parts.push(segment.text);
    length += segment.text.length + 1;
    if (length >= size) flush();
  }
  flush();
  return chunks;
}

interface CaptionTrack {
  baseUrl?: string;
  languageCode?: string;
  kind?: string;
}

interface PlayerResponse {
  playabilityStatus?: { status?: string };
  videoDetails?: {
    title?: string;
    shortDescription?: string;
    lengthSeconds?: string;
    thumbnail?: { thumbnails?: { url?: string }[] };
  };
  captions?: {
    playerCaptionsTracklistRenderer?: { captionTracks?: CaptionTrack[] };
  };
}

async function fetchWithTimeout(url: string, init?: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

function pickTrack(tracks: CaptionTrack[]): CaptionTrack | undefined {
  // Prefer human English captions, then auto-generated English, then anything.
  return (
    tracks.find((t) => t.languageCode?.startsWith("en") && t.kind !== "asr") ??
    tracks.find((t) => t.languageCode?.startsWith("en")) ??
    tracks[0]
  );
}

/** Fetch metadata + transcript through youtubei/v1/player. Null on any failure
 * so the caller can fall back to the regular scrape pipeline. */
export async function fetchYouTubeVideo(videoId: string): Promise<YouTubeVideo | null> {
  try {
    const res = await fetchWithTimeout("https://www.youtube.com/youtubei/v1/player", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        context: {
          client: {
            clientName: "ANDROID",
            clientVersion: "20.10.38",
            androidSdkVersion: 30,
            hl: "en",
          },
        },
        videoId,
      }),
    });
    if (!res.ok) return null;
    // All fields optional; every leaf is typeof/optional-chain checked before use.
    const data = (await res.json()) as PlayerResponse;
    if (data.playabilityStatus?.status !== "OK") return null;

    const details = data.videoDetails ?? {};
    const tracks = data.captions?.playerCaptionsTracklistRenderer?.captionTracks ?? [];
    const track = pickTrack(tracks);

    let transcript: TranscriptSegment[] = [];
    if (track?.baseUrl) {
      const capRes = await fetchWithTimeout(track.baseUrl);
      if (capRes.ok) transcript = parseTimedText(await capRes.text());
    }

    return {
      title: typeof details.title === "string" ? details.title : "",
      description:
        typeof details.shortDescription === "string" ? details.shortDescription : "",
      durationSec: Number(details.lengthSeconds) || null,
      thumbnail: details.thumbnail?.thumbnails?.at(-1)?.url ?? "",
      transcript,
    };
  } catch {
    return null;
  }
}
