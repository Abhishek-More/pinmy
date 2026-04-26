import { prisma } from "./index";

export interface SearchResult {
  id: number;
  uniqueId: string;
  title: string;
  link: string;
  description: string | null;
  userId: string;
  createdAt: string;
  relevance: number;
  snippet: string | null;
}

function toTsquery(query: string): string {
  return query
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 0)
    .map((w) => w.replace(/[^\w]/g, ""))
    .filter((w) => w.length > 0)
    .map((w) => `${w}:*`)
    .join(" & ");
}

export async function searchPins(
  query: string,
  userId: string,
): Promise<SearchResult[]> {
  const tsquery = toTsquery(query);
  if (!tsquery) return [];

  const results = await prisma.$queryRawUnsafe<SearchResult[]>(
    `
    WITH pin_matches AS (
      SELECT
        p.id,
        p.unique_id AS "uniqueId",
        p.title,
        p.link,
        p.description,
        p."userId",
        p."createdAt",
        ts_rank_cd(p.tsv, to_tsquery('english', $1), 32) AS relevance,
        NULL::TEXT AS snippet
      FROM "Pin" p
      WHERE p."userId" = $2
        AND p.archived_at IS NULL
        AND p.tsv @@ to_tsquery('english', $1)
    ),
    chunk_matches AS (
      SELECT DISTINCT ON (p.id)
        p.id,
        p.unique_id AS "uniqueId",
        p.title,
        p.link,
        p.description,
        p."userId",
        p."createdAt",
        ts_rank_cd(pc.tsv, to_tsquery('english', $1), 32) AS relevance,
        ts_headline(
          'english',
          pc.content,
          to_tsquery('english', $1),
          'StartSel=<mark>, StopSel=</mark>, MaxWords=35, MinWords=15, MaxFragments=1'
        ) AS snippet
      FROM "Pin" p
      INNER JOIN "pin_chunk" pc ON p.id = pc.pin_id
      WHERE p."userId" = $2
        AND p.archived_at IS NULL
        AND pc.tsv @@ to_tsquery('english', $1)
      ORDER BY p.id, ts_rank_cd(pc.tsv, to_tsquery('english', $1), 32) DESC
    ),
    combined AS (
      SELECT * FROM pin_matches
      UNION ALL
      SELECT * FROM chunk_matches
    )
    SELECT
      id,
      "uniqueId",
      title,
      link,
      description,
      "userId",
      "createdAt",
      MAX(relevance) AS relevance,
      MAX(snippet) AS snippet
    FROM combined
    GROUP BY id, "uniqueId", title, link, description, "userId", "createdAt"
    ORDER BY relevance DESC
    LIMIT 50
    `,
    tsquery,
    userId,
  );

  return results;
}
