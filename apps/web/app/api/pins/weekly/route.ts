import { headers } from "next/headers";
import { auth } from "@/lib/clients/auth";
import { prisma } from "@/lib/clients/prisma";

const MAX_DAYS = 365;

export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const days = Math.min(Math.max(Number(searchParams.get("days")) || 30, 7), MAX_DAYS);

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

  const data = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(now.getDate() - i);
    date.setHours(0, 0, 0, 0);
    const nextDate = new Date(date);
    nextDate.setDate(date.getDate() + 1);
    const count = pins.filter((p) => p.createdAt >= date && p.createdAt < nextDate).length;
    data.push({
      date: date.toISOString().slice(0, 10),
      dow: date.getDay(),
      count,
    });
  }

  return Response.json(data);
}
