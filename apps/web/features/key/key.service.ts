import { randomBytes, createHash } from "node:crypto";
import { prisma } from "@/lib/clients/prisma";

const PREFIX_LENGTH = 8;

function hashKey(raw: string): string {
  return createHash("sha256").update(raw).digest("hex");
}

/** Generate a new raw API key string and its hash + display prefix. */
function generateRawKey(): { raw: string; hash: string; prefix: string } {
  const raw = `pm_${randomBytes(24).toString("base64url")}`;
  return { raw, hash: hashKey(raw), prefix: raw.slice(0, PREFIX_LENGTH) };
}

/** Create (or rotate) a single API key for a user. Returns the raw key only on creation. */
export async function createApiKey(userId: string): Promise<{
  raw: string;
  prefix: string;
  createdAt: Date;
}> {
  // Delete any existing key first (one key per user)
  await prisma.apiKey.deleteMany({ where: { userId } });

  const { raw, hash, prefix } = generateRawKey();
  const record = await prisma.apiKey.create({
    data: { userId, key: raw, keyHash: hash, prefix },
  });

  return { raw, prefix, createdAt: record.createdAt };
}

/** Get the current key info including the raw key. */
export async function getApiKey(userId: string) {
  return prisma.apiKey.findUnique({
    where: { userId },
    select: { id: true, key: true, prefix: true, createdAt: true },
  });
}

/** Revoke the user's API key. */
export async function revokeApiKey(userId: string) {
  await prisma.apiKey.deleteMany({ where: { userId } });
}

/** Resolve a raw bearer token to a userId, or null if invalid. */
export async function resolveApiKey(
  raw: string,
): Promise<string | null> {
  const hash = hashKey(raw);
  const record = await prisma.apiKey.findUnique({
    where: { keyHash: hash },
    select: { userId: true },
  });
  return record?.userId ?? null;
}
