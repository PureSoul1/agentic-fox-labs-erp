/**
 * Cloudflare D1 Database Helper
 * Used in API routes when running on Cloudflare Workers/Pages
 * Falls back to Prisma when running locally
 */

import { db } from './db'

// Type for Cloudflare Worker environment bindings
export interface CloudflareEnv {
  DB?: D1Database
  ZAI_API_KEY?: string
}

// Get the D1 database from the request context
function getD1FromRequest(request: Request): D1Database | null {
  try {
    // In Cloudflare Workers, env is available via process.env or globalThis
    const env = (globalThis as unknown as { __CF_ENV__: CloudflareEnv }).__CF_ENV__
    if (env?.DB) return env.DB
  } catch {}
  return null
}

// Check if we're running on Cloudflare
export function isCloudflare(): boolean {
  return typeof (globalThis as any).__CF_ENV__ !== 'undefined'
}

export { db }
