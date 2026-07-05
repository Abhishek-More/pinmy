import { decodeEntities } from "@pinmy/db";
import {
  isMapLink,
  extractCoordsFromUrl,
  extractCoordsFromHtml,
  placeNameFromUrl,
  type Coords,
} from "../utils/maps";
import { parseGithubRepoLink, fetchGithubRepo } from "../utils/github";

const MAX_HTML_SIZE = 1024 * 1024; // 1MB
const MAX_CONTENT_LENGTH = 50_000;

/**
 * Extract text content from HTML without a DOM parser.
 * Strips tags, scripts, styles, and collapses whitespace.
 */
function extractText(html: string): string {
  let result = html;
  result = result.replace(/<script[\s\S]*?<\/script>/gi, " ");
  result = result.replace(/<style[\s\S]*?<\/style>/gi, " ");
  result = result.replace(/<nav[\s\S]*?<\/nav>/gi, " ");
  result = result.replace(/<header[\s\S]*?<\/header>/gi, " ");
  result = result.replace(/<footer[\s\S]*?<\/footer>/gi, " ");
  result = result.replace(/<aside[\s\S]*?<\/aside>/gi, " ");
  result = result.replace(/<[^>]+>/g, " ");
  result = decodeEntities(result);
  result = result.replace(/\s+/g, " ");
  result = result.substring(0, MAX_CONTENT_LENGTH).trim();
  return result;
}

function extractMeta(html: string, patterns: RegExp[]): string {
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match?.[1]) return decodeEntities(match[1].trim());
  }
  return "";
}

export async function scrapeLink(url: string) {
  // GitHub repos: the HTML page is a JS shell; the API gives clean metadata + README.
  const gh = parseGithubRepoLink(url);
  if (gh) {
    const repo = await fetchGithubRepo(gh.owner, gh.repo);
    if (repo) {
      return { ...repo, url, latitude: null, longitude: null };
    }
    // API failure (rate limit, network): fall through to the normal scrape.
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);

  let html: string;
  let finalUrl = url;
  try {
    const response = await fetch(url, { signal: controller.signal });
    finalUrl = response.url || url;
    const buffer = await response.arrayBuffer();
    html = new TextDecoder().decode(buffer.slice(0, MAX_HTML_SIZE));
  } catch (e) {
    // Short map links still carry coords and a place name even when the fetch fails.
    const coords = isMapLink(url) ? extractCoordsFromUrl(url) : null;
    const title = (isMapLink(url) && placeNameFromUrl(url)) || url;
    return { title, description: "", image: "", content: "", url, stars: null, language: null, ...(coords ?? { latitude: null, longitude: null }) };
  } finally {
    clearTimeout(timeout);
  }

  let title = extractMeta(html, [
    /<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:title["']/i,
    /<title[^>]*>([^<]+)<\/title>/i,
  ]) || url;

  const description = extractMeta(html, [
    /<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:description["']/i,
    /<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description["']/i,
  ]);

  const image = extractMeta(html, [
    /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i,
    /<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image["']/i,
  ]);

  const content = extractText(html);

  let coords: Coords | null = null;
  if (isMapLink(finalUrl) || isMapLink(url)) {
    coords =
      extractCoordsFromUrl(finalUrl) ??
      extractCoordsFromUrl(url) ??
      extractCoordsFromHtml(html);
    // Map pages fetched server-side are JS shells with junk titles ("Google Maps");
    // the shared URL itself names the place.
    const placeName = placeNameFromUrl(finalUrl) ?? placeNameFromUrl(url);
    if (placeName) title = placeName;
  }

  return {
    title,
    description,
    image,
    content,
    url,
    stars: null,
    language: null,
    ...(coords ?? { latitude: null, longitude: null }),
  };
}
