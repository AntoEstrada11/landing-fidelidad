import type { H3Event } from 'h3'

export function getSiteUrl(event: H3Event): string {
  const config = useRuntimeConfig()
  const configured = String(config.public.siteUrl ?? '').trim()
  if (configured) {
    return configured.replace(/\/$/, '')
  }

  const host = getRequestHeader(event, 'x-forwarded-host') || getRequestHeader(event, 'host')
  if (!host) {
    return 'http://localhost:3000'
  }

  const proto = getRequestHeader(event, 'x-forwarded-proto') || 'http'
  return `${proto}://${host}`
}
