import { headers } from "next/headers";
import { auth } from "@/lib/clients/auth";
import {
  createApiKey,
  getApiKeyMeta,
  revokeApiKey,
} from "@/features/key/key.service";

async function getSession() {
  return auth.api.getSession({ headers: await headers() });
}

/** GET /api/keys - return current key metadata (prefix, createdAt) or null. */
export async function GET() {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  const meta = await getApiKeyMeta(session.user.id);
  return Response.json({ key: meta });
}

/** POST /api/keys - generate a new key (rotates if one exists). Returns the raw key once. */
export async function POST() {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  const result = await createApiKey(session.user.id);
  return Response.json(result, { status: 201 });
}

/** DELETE /api/keys - revoke the current key. */
export async function DELETE() {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  await revokeApiKey(session.user.id);
  return new Response(null, { status: 204 });
}
