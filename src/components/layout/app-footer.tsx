'use client'

import React from 'react'

export function AppFooter() {
  return (
    <footer className="mt-auto border-t bg-slate-50 py-3 px-4">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-1 text-xs text-slate-400">
        <p>&copy; 2024 Agentic Fox Labs. All rights reserved.</p>
        <p className="hidden sm:block text-slate-300">|</p>
        <p>Real Estate Intelligence Platform &middot; v1.0.0</p>
      </div>
    </footer>
  )
}
