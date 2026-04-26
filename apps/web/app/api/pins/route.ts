import { headers } from "next/headers";
import { auth } from "@/lib/clients/auth";
import { prisma } from "@/lib/clients/prisma";
import { searchPins, decodeEntities } from "@pinmy/db";
import { MessageQueueClient } from "@pinmy/queue";

export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim();

  if (q) {
    const results = await searchPins(q, session.user.id);
    return Response.json(results);
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
      { status: 400 },
    );
  }

  const pin = await prisma.pin.create({
    data: { title: decodeEntities(title), link, userId: session.user.id },
  });

  MessageQueueClient.publish("/webhook/general", {
    phone: session.user.phoneNumber as string,
    link: pin.link,
    pinUniqueId: pin.uniqueId,
  });

  return Response.json(pin, { status: 201 });
}
