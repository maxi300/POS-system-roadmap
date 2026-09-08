"use client"

import type { ReactNode } from "react"
import { SWRConfig } from "swr"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export function Providers({ children }: { children: ReactNode }) {
  return <SWRConfig value={{ fetcher }}>{children}</SWRConfig>
}
