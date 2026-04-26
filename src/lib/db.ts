/**
 * Database Client - Dual Mode Support
 *
 * - Local development: Prisma + SQLite
 * - Cloudflare Workers: Prisma + D1 (via @prisma/adapter-d1)
 *
 * Usage: Call getDB() at the start of each API route handler.
 * Do NOT import `db` at module scope for Cloudflare compatibility.
 */

import { PrismaClient } from '@prisma/client'
import { PrismaD1 } from '@prisma/adapter-d1'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

/**
 * Get the database client for the current environment.
 *
 * In Cloudflare Workers, this creates a PrismaClient with D1 adapter
 * using getCloudflareContext() from @opennextjs/cloudflare.
 *
 * In local development, this returns a singleton PrismaClient using SQLite.
 */
export function getDB(): PrismaClient {
  // Try Cloudflare D1 first
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { getCloudflareContext } = require('@opennextjs/cloudflare')
    const { env } = getCloudflareContext()
    if (env?.DB) {
      const adapter = new PrismaD1(env.DB as D1Database)
      return new PrismaClient({ adapter })
    }
  } catch {
    // Not on Cloudflare - fall through to local Prisma
  }

  // Local development: Prisma + SQLite (singleton pattern)
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = new PrismaClient({
      log: ['query'],
    })
  }
  return globalForPrisma.prisma
}

// Legacy export for backward compatibility during migration
// Prefer using getDB() in API route handlers
export const db = globalForPrisma.prisma ?? new PrismaClient({ log: ['query'] })
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
