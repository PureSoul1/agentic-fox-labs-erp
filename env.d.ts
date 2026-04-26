/// <reference types="@cloudflare/next-on-pages" />

interface CloudflareEnv {
  DB: D1Database
  ZAI_API_KEY?: string
}

declare module "@cloudflare/next-on-pages" {
  export function getRequestContext<T = CloudflareEnv>(): {
    env: T
    ctx: ExecutionContext
    cf: IncomingRequestCfProperties
  }
}
