/// <reference types="@opennextjs/cloudflare" />

// Extend the global CloudflareEnv with our D1 binding
declare global {
  interface CloudflareEnv {
    DB?: D1Database
    ASSETS?: Fetcher
    ZAI_API_KEY?: string
  }
}

export {}
