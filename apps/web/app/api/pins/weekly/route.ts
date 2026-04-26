import { headers } from "next/headers";
import { auth } from "@/lib/clients/auth";
import { prisma } from "@/lib/clients/prisma";

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const dayOfWeek = now.getDay();
  const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - diff);
  startOfWeek.setHours(0, 0, 0, 0);

  const pins = await prisma.pin.findMany({
    where: {
      userId: session.user.id,
      createdAt: { gte: startOfWeek },
    },
    select: { createdAt: true },
  });

  const counts = new Array(7).fill(0);
  for (const pin of pins) {
    const d = pin.createdAt.getDay();
    const idx = d === 0 ? 6 : d - 1;
    counts[idx]++;
  }

  const DAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
  const data = DAYS.map((day, i) => ({ day, count: counts[i] }));

  return Response.json(data);
}
