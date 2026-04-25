const MAX_HTML_SIZE = 1024 * 1024; // 1MB
const MAX_CONTENT_LENGTH = 50_000;

/**
 * Extract text content from HTML without a DOM parser.
 * Strips tags, scripts, styles, and collapses whitespace.
 */
function extractText(html: string): string {
  console.log("[scraper] extractText: starting, html length =", html.length);
  let result = html;
  result = result.replace(/<script[\s\S]*?<\/script>/gi, " ");
  console.log("[scraper] extractText: stripped scripts");
  result = result.replace(/<style[\s\S]*?<\/style>/gi, " ");
  console.log("[scraper] extractText: stripped styles");
  result = result.replace(/<nav[\s\S]*?<\/nav>/gi, " ");
  result = result.replace(/<header[\s\S]*?<\/header>/gi, " ");
  result = result.replace(/<footer[\s\S]*?<\/footer>/gi, " ");
  result = result.replace(/<aside[\s\S]*?<\/aside>/gi, " ");
  console.log("[scraper] extractText: stripped semantic tags");
  result = result.replace(/<[^>]+>/g, " ");
  console.log("[scraper] extractText: stripped all tags");
  result = result.replace(/&nbsp;/g, " ");
  result = result.replace(/&amp;/g, "&");
  result = result.replace(/&lt;/g, "<");
  result = result.replace(/&gt;/g, ">");
  result = result.replace(/&quot;/g, '"');
  result = result.replace(/&#\d+;/g, " ");
  console.log("[scraper] extractText: decoded entities");
  result = result.replace(/\s+/g, " ");
  console.log("[scraper] extractText: collapsed whitespace");
  result = result.substring(0, MAX_CONTENT_LENGTH).trim();
  console.log("[scraper] extractText: done, length =", result.length);
  return result;
}

function extractMeta(html: string, patterns: RegExp[]): string {
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match?.[1]) return match[1].trim();
  }
  return "";
}

export async function scrapeLink(url: string) {
  console.log("[scraper] starting fetch:", url);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);

  let html: string;
  try {
    const response = await fetch(url, { signal: controller.signal });
    console.log("[scraper] response status:", response.status);
    const buffer = await response.arrayBuffer();
    console.log("[scraper] buffer size:", buffer.byteLength);
    html = new TextDecoder().decode(buffer.slice(0, MAX_HTML_SIZE));
    console.log("[scraper] html length after truncation:", html.length);
  } catch (e) {
    console.log("[scraper] fetch error:", e);
    return { title: url, description: "", content: "", url };
  } finally {
    clearTimeout(timeout);
  }

  console.log("[scraper] extracting title...");
  const title = extractMeta(html, [
    /<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:title["']/i,
    /<title[^>]*>([^<]+)<\/title>/i,
  ]) || url;
  console.log("[scraper] title:", title);

  console.log("[scraper] extracting description...");
  const description = extractMeta(html, [
    /<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:description["']/i,
    /<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description["']/i,
  ]);
  console.log("[scraper] description length:", description.length);

  console.log("[scraper] extracting content...");
  const content = extractText(html);
  console.log("[scraper] content length:", content.length);

  console.log("[scraper] done");
  return { title, description, content, url };
}
