import { headers } from "next/headers";
import { auth } from "@/lib/clients/auth";
import { prisma } from "@pinmy/db";
import type { NextRequest } from "next/server";

export async function GET(
  _req: NextRequest,
  ctx: RouteContext<"/api/pins/[id]">,
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  const { id } = await ctx.params;
  const pin = await prisma.pin.findFirst({
    where: { uniqueId: id, userId: session.user.id, archivedAt: null },
  });

  if (!pin) {
    return Response.json({ error: "Pin not found" }, { status: 404 });
  }

  return Response.json(pin);
}

export async function PUT(
  request: NextRequest,
  ctx: RouteContext<"/api/pins/[id]">,
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  const { id } = await ctx.params;
  const body = await request.json();
  const { title, link, note } = body;

  if (!title || !link) {
    return Response.json(
      { error: "title and link are required" },
      { status: 400 },
    );
  }

  // Ownership filter in the write itself: one round trip instead of lookup + update.
  const [pin] = await prisma.pin.updateManyAndReturn({
    where: { uniqueId: id, userId: session.user.id, archivedAt: null },
    data: {
      title,
      link,
      // Only touch the note when the caller sends the field; null clears it.
      ...("note" in body
        ? { note: typeof note === "string" && note.trim() ? note.trim() : null }
        : {}),
    },
  });

  if (!pin) {
    return Response.json({ error: "pin not found" }, { status: 404 });
  }

  return Response.json(pin);
}

export async function DELETE(
  _req: NextRequest,
  ctx: RouteContext<"/api/pins/[id]">,
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  const { id } = await ctx.params;
  const { count } = await prisma.pin.updateMany({
    where: { uniqueId: id, userId: session.user.id, archivedAt: null },
    data: { archivedAt: new Date() },
  });

  if (count === 0) {
    return Response.json({ error: "pin not found" }, { status: 404 });
  }

  return new Response(null, { status: 204 });
}
