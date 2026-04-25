import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated/client";

const connectionString = `${process.env.DATABASE_URL}`;
const adapter = new PrismaPg({ connectionString, max: 3 });
const prisma = new PrismaClient({ adapter });

export { prisma };
export * from "./generated/client";
export { searchPins, type SearchResult } from "./search";
