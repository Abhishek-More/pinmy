/** Pure URL/HTML coordinate extraction for map links. No imports so it stays trivially testable. */

export interface Coords {
  latitude: number;
  longitude: number;
}

/** Is this a link to a maps product (Google, Apple, OSM, Waze, Bing)? */
export function isMapLink(url: string): boolean {
  let u: URL;
  try {
    u = new URL(url);
  } catch {
    return false;
  }
  const host = u.hostname.replace(/^www\./, "").toLowerCase();

  if (
    host === "maps.google.com" ||
    host === "maps.app.goo.gl" ||
    host === "maps.apple.com" ||
    host === "maps.apple" ||
    host === "guides.apple.com"
  ) {
    return true;
  }
  if (host === "goo.gl" && u.pathname.startsWith("/maps")) return true;
  if (/(^|\.)google\.[a-z.]+$/.test(host) && u.pathname.startsWith("/maps")) return true;
  if (host === "openstreetmap.org" || host.endsWith(".openstreetmap.org")) return true;
  if (host === "waze.com" || host.endsWith(".waze.com")) return true;
  if (host.endsWith("bing.com") && u.pathname.startsWith("/maps")) return true;
  return false;
}

function toCoords(lat: string, lng: string): Coords | null {
  const latitude = Number(lat);
  const longitude = Number(lng);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
  if (Math.abs(latitude) > 90 || Math.abs(longitude) > 180) return null;
  if (latitude === 0 && longitude === 0) return null;
  return { latitude, longitude };
}

const NUM = "(-?\\d{1,3}(?:\\.\\d+)?)";

// Ordered: most precise first. Google's !3d!4d is the actual place pin;
// @lat,lng is only the viewport center, so it goes last.
const URL_PATTERNS: RegExp[] = [
  new RegExp(`!3d${NUM}!4d${NUM}`), // google place pin
  new RegExp(`[?&](?:ll|sll|coordinate|center)=${NUM},${NUM}`, "i"), // apple/waze/google
  new RegExp(`[?&]cp=${NUM}~${NUM}`, "i"), // bing
  new RegExp(`[?&](?:q|query|destination|daddr|saddr)=${NUM},${NUM}`, "i"),
  new RegExp(`[?&]mlat=${NUM}&mlon=${NUM}`, "i"), // osm marker
  new RegExp(`#map=\\d+/${NUM}/${NUM}`), // osm viewport
  new RegExp(`to=ll\\.${NUM},${NUM}`, "i"), // waze
  new RegExp(`@${NUM},${NUM}`), // google viewport center
];

/** Extract coordinates from a (possibly percent-encoded) map URL. */
export function extractCoordsFromUrl(url: string): Coords | null {
  let decoded = url;
  try {
    decoded = decodeURIComponent(url);
  } catch {
    // ponytail: malformed escapes fall back to the raw URL
  }
  for (const pattern of URL_PATTERNS) {
    const match = decoded.match(pattern) ?? url.match(pattern);
    if (!match) continue;
    const coords = toCoords(match[1], match[2]);
    if (coords) return coords;
  }
  return null;
}

const HTML_PATTERNS: [RegExp, RegExp][] = [
  [
    /property=["']place:location:latitude["'][^>]+content=["']([^"']+)["']|content=["']([^"']+)["'][^>]+property=["']place:location:latitude["']/i,
    /property=["']place:location:longitude["'][^>]+content=["']([^"']+)["']|content=["']([^"']+)["'][^>]+property=["']place:location:longitude["']/i,
  ],
  [/"latitude"\s*:\s*"?(-?\d{1,3}\.\d+)/, /"longitude"\s*:\s*"?(-?\d{1,3}\.\d+)/],
];

/** Fallback: pull coordinates out of page HTML (og place tags, geo meta, embedded JSON). */
export function extractCoordsFromHtml(html: string): Coords | null {
  // geo.position / ICBM meta: content="lat; lng" or "lat, lng"
  const geo = html.match(
    /name=["'](?:geo\.position|ICBM)["'][^>]+content=["']\s*(-?\d{1,3}(?:\.\d+)?)\s*[;,]\s*(-?\d{1,3}(?:\.\d+)?)/i,
  );
  if (geo) {
    const coords = toCoords(geo[1], geo[2]);
    if (coords) return coords;
  }

  for (const [latPattern, lngPattern] of HTML_PATTERNS) {
    const lat = html.match(latPattern);
    const lng = html.match(lngPattern);
    if (!lat || !lng) continue;
    const coords = toCoords(lat[1] ?? lat[2], lng[1] ?? lng[2]);
    if (coords) return coords;
  }
  return null;
}

/**
 * Derive the place name from the URL itself. Map pages are JS shells when
 * fetched server-side, so the URL is often the only reliable source.
 */
export function placeNameFromUrl(url: string): string | null {
  let u: URL;
  try {
    u = new URL(url);
  } catch {
    return null;
  }

  // google.com/maps/place/<name>/...
  const googlePlace = u.pathname.match(/\/maps\/place\/([^/]+)/);
  if (googlePlace) {
    const name = decodeURIComponent(googlePlace[1].replace(/\+/g, " ")).trim();
    if (name) return name;
  }

  // apple/waze/google share links: ?name= or ?q= (skip when q is coordinates)
  for (const param of ["name", "q", "query", "destination"]) {
    const value = u.searchParams.get(param)?.trim();
    if (!value) continue;
    if (/^-?\d{1,3}(\.\d+)?\s*,\s*-?\d{1,3}(\.\d+)?$/.test(value)) continue;
    return value;
  }
  return null;
}
