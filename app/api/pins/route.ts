import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  const pins = await prisma.pin.findMany({
    where: { userId: session.user.id },
    orderBy: { id: "desc" },
  });

  return Response.json(pins);
}

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { title, link } = body;

  if (!title || !link) {
    return Response.json(
      { error: "title and link are required" },
      { status: 400 }
    );
  }

  const pin = await prisma.pin.create({
    data: { title, link, userId: session.user.id },
  });

  return Response.json(pin, { status: 201 });
}
