/** GitHub repo link detection + API enrichment. Parse logic is pure for easy testing. */

const MAX_README_LENGTH = 50_000;

// Top-level github.com paths that are not usernames.
const RESERVED: Record<string, true> = {
  about: true,
  apps: true,
  codespaces: true,
  collections: true,
  contact: true,
  enterprise: true,
  events: true,
  explore: true,
  features: true,
  issues: true,
  join: true,
  login: true,
  marketplace: true,
  new: true,
  notifications: true,
  orgs: true,
  pricing: true,
  pulls: true,
  search: true,
  settings: true,
  sponsors: true,
  topics: true,
  trending: true,
};

/**
 * Match repo-root links only (github.com/owner/repo). Deep links (issues, PRs,
 * blobs) keep the normal scrape path since their og: tags carry the context.
 */
export function parseGithubRepoLink(
  url: string,
): { owner: string; repo: string } | null {
  let u: URL;
  try {
    u = new URL(url);
  } catch {
    return null;
  }
  const host = u.hostname.replace(/^www\./, "").toLowerCase();
  if (host !== "github.com") return null;

  const segments = u.pathname.split("/").filter(Boolean);
  if (segments.length !== 2) return null;

  const [owner, repo] = segments;
  if (RESERVED[owner.toLowerCase()]) return null;

  return { owner, repo: repo.replace(/\.git$/, "") };
}

export interface GithubRepoInfo {
  title: string;
  description: string;
  image: string;
  content: string;
  stars: number;
  language: string | null;
}

/** Strip markdown images/badges and HTML so the README chunks cleanly for FTS. */
export function cleanReadme(markdown: string): string {
  return markdown
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .slice(0, MAX_README_LENGTH)
    .trim();
}

/** Fetch repo metadata + README from the GitHub API. Null on any failure. */
// ponytail: unauthenticated API = 60 req/hr. Send a GITHUB_TOKEN header if that ever bites.
export async function fetchGithubRepo(
  owner: string,
  repo: string,
): Promise<GithubRepoInfo | null> {
  const headers = {
    Accept: "application/vnd.github+json",
    "User-Agent": "pinmy",
  };
  try {
    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
      headers,
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const fullName: string = data.full_name ?? `${owner}/${repo}`;

    let readme = "";
    try {
      const r = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/readme`,
        {
          headers: { ...headers, Accept: "application/vnd.github.raw+json" },
          signal: AbortSignal.timeout(10_000),
        },
      );
      if (r.ok) readme = cleanReadme(await r.text());
    } catch {
      // README is optional; metadata alone is still worth it.
    }

    return {
      title: fullName,
      description: data.description ?? "",
      image: `https://opengraph.githubassets.com/1/${fullName}`,
      content: readme,
      stars: data.stargazers_count ?? 0,
      language: data.language ?? null,
    };
  } catch {
    return null;
  }
}
