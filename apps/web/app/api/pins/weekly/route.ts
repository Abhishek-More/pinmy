import { headers } from "next/headers";
import { auth } from "@/lib/clients/auth";
import { prisma } from "@/lib/clients/prisma";

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const startDate = new Date(now);
  startDate.setDate(now.getDate() - 6);
  startDate.setHours(0, 0, 0, 0);

  const pins = await prisma.pin.findMany({
    where: {
      userId: session.user.id,
      createdAt: { gte: startDate },
    },
    select: { createdAt: true },
  });

  const DAY_LABELS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
  const data = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(now.getDate() - i);
    date.setHours(0, 0, 0, 0);
    const nextDate = new Date(date);
    nextDate.setDate(date.getDate() + 1);
    const count = pins.filter((p) => p.createdAt >= date && p.createdAt < nextDate).length;
    data.push({ day: DAY_LABELS[date.getDay()], count });
  }

  return Response.json(data);
}
