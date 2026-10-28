import path from "path";
import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function resolveSqliteUrl(): string {
  const raw = process.env.DATABASE_URL || "file:./prisma/dev.db";
  if (!raw.startsWith("file:")) {
    return raw;
  }
  const filePart = raw.slice("file:".length);
  if (path.isAbsolute(filePart)) {
    return `file:${filePart}`;
  }
  return `file:${path.resolve(/*turbopackIgnore: true*/ process.cwd(), filePart)}`;
}

function createPrismaClient(): PrismaClient {
  const url = process.env.DATABASE_URL || "file:./prisma/dev.db";
  if (url.startsWith("postgresql://") || url.startsWith("postgres://")) {
    const adapter = new PrismaPg({ connectionString: url });
    return new PrismaClient({ adapter });
  }

  const sqliteAdapter = new PrismaBetterSqlite3({
    url: resolveSqliteUrl(),
  });
  return new PrismaClient({ adapter: sqliteAdapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
