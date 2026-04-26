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
  result = result.replace(/&nbsp;/g, " ");
  result = result.replace(/&amp;/g, "&");
  result = result.replace(/&lt;/g, "<");
  result = result.replace(/&gt;/g, ">");
  result = result.replace(/&quot;/g, '"');
  result = result.replace(/&#\d+;/g, " ");
  result = result.replace(/\s+/g, " ");
  result = result.substring(0, MAX_CONTENT_LENGTH).trim();
  return result;
}

import { decodeEntities } from "@pinmy/db";

function extractMeta(html: string, patterns: RegExp[]): string {
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match?.[1]) return decodeEntities(match[1].trim());
  }
  return "";
}

export async function scrapeLink(url: string) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);

  let html: string;
  try {
    const response = await fetch(url, { signal: controller.signal });
    const buffer = await response.arrayBuffer();
    html = new TextDecoder().decode(buffer.slice(0, MAX_HTML_SIZE));
  } catch (e) {
    return { title: url, description: "", content: "", url };
  } finally {
    clearTimeout(timeout);
  }

  const title = extractMeta(html, [
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

  const content = extractText(html);

  return { title, description, content, url };
}
