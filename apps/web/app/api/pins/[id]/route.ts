import { headers } from "next/headers";
import { auth } from "@/lib/clients/auth";
import { prisma } from "@/lib/clients/prisma";
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
  const { title, link } = body;

  if (!title || !link) {
    return Response.json(
      { error: "title and link are required" },
      { status: 400 },
    );
  }

  const existing = await prisma.pin.findFirst({
    where: { uniqueId: id, userId: session.user.id, archivedAt: null },
  });

  if (!existing) {
    return Response.json({ error: "pin not found" }, { status: 404 });
  }

  const pin = await prisma.pin.update({
    where: { uniqueId: id },
    data: { title, link },
  });

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
  const existing = await prisma.pin.findFirst({
    where: { uniqueId: id, userId: session.user.id, archivedAt: null },
  });

  if (!existing) {
    return Response.json({ error: "pin not found" }, { status: 404 });
  }

  await prisma.pin.update({
    where: { uniqueId: id },
    data: { archivedAt: new Date() },
  });

  return new Response(null, { status: 204 });
}
