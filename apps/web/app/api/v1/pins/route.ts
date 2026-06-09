import { resolveApiKey } from "@/lib/clients/api-key";
import { prisma } from "@/lib/clients/prisma";
import { searchPins } from "@pinmy/db";

async function authenticateApiKey(request: Request): Promise<string | null> {
  const header = request.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) return null;
  const token = header.slice(7);
  if (!token) return null;
  return resolveApiKey(token);
}

/** GET /api/v1/pins - public API to list your pins (requires API key). */
export async function GET(request: Request) {
  const userId = await authenticateApiKey(request);
  if (!userId) {
    return Response.json(
      { error: "Invalid or missing API key. Pass it as: Authorization: Bearer pm_..." },
      { status: 401 },
    );
  }

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim();
  const category = searchParams.get("category")?.trim();
  const limitParam = searchParams.get("limit");
  const offsetParam = searchParams.get("offset");

  const limit = Math.min(Math.max(Number(limitParam) || 50, 1), 200);
  const offset = Math.max(Number(offsetParam) || 0, 0);

  // Full-text search path
  if (q) {
    const results = await searchPins(q, userId);
    // Apply category filter, pagination on search results
    let filtered = category
      ? results.filter((r) => r.category?.toLowerCase() === category.toLowerCase())
      : results;
    const total = filtered.length;
    filtered = filtered.slice(offset, offset + limit);

    return Response.json({
      data: filtered.map(formatPin),
      pagination: { total, limit, offset },
    });
  }

  // Standard listing with optional category filter
  const where: Record<string, unknown> = {
    userId,
    archivedAt: null,
  };
  if (category) {
    where.category = category;
  }

  const [pins, total] = await Promise.all([
    prisma.pin.findMany({
      where,
      orderBy: { id: "desc" },
      skip: offset,
      take: limit,
      select: {
        uniqueId: true,
        title: true,
        link: true,
        description: true,
        image: true,
        category: true,
        status: true,
        platform: true,
        createdAt: true,
      },
    }),
    prisma.pin.count({ where }),
  ]);

  return Response.json({
    data: pins.map(formatPin),
    pagination: { total, limit, offset },
  });
}

function formatPin(pin: {
  uniqueId?: string;
  title: string;
  link: string;
  description?: string | null;
  image?: string | null;
  category?: string | null;
  status: string;
  platform: string;
  createdAt: string | Date;
}) {
  return {
    id: pin.uniqueId,
    title: pin.title,
    link: pin.link,
    description: pin.description ?? null,
    image: pin.image ?? null,
    category: pin.category ?? null,
    status: pin.status,
    platform: pin.platform,
    created_at: pin.createdAt,
  };
}
