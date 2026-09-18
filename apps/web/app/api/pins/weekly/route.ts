import { headers } from "next/headers";
import { auth } from "@/lib/clients/auth";
import { prisma } from "@pinmy/db";

const MAX_DAYS = 365;

export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const days = Math.min(
    Math.max(Number(searchParams.get("days")) || 30, 7),
    MAX_DAYS,
  );

  const now = new Date();
  const startDate = new Date(now);
  startDate.setDate(now.getDate() - (days - 1));
  startDate.setHours(0, 0, 0, 0);

  const pins = await prisma.pin.findMany({
    where: {
      userId: session.user.id,
      archivedAt: null,
      createdAt: { gte: startDate },
    },
    select: { createdAt: true },
  });

  const counts = new Map<string, number>();
  for (const { createdAt } of pins) {
    const day = new Date(createdAt);
    day.setHours(0, 0, 0, 0);
    const key = day.toISOString().slice(0, 10);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  const data = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(now.getDate() - i);
    date.setHours(0, 0, 0, 0);
    const key = date.toISOString().slice(0, 10);
    data.push({ date: key, dow: date.getDay(), count: counts.get(key) ?? 0 });
  }

  return Response.json(data);
}
