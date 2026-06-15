import type { AnalyticsEventRecord, AnalyticsIngestBody } from '#shared/types/analytics'
import { appendAnalyticsEvents } from '../../utils/analytics-store'

function sanitizeMeta(
  meta: Record<string, unknown> | undefined
): Record<string, string | number | boolean | null> | undefined {
  if (!meta || typeof meta !== 'object') return undefined

  const clean: Record<string, string | number | boolean | null> = {}
  for (const [key, value] of Object.entries(meta)) {
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      clean[key] = value
    } else if (value === null) {
      clean[key] = null
    }
  }
  return Object.keys(clean).length > 0 ? clean : undefined
}

export default defineEventHandler(async (event) => {
  const body = await readBody<AnalyticsIngestBody>(event)
  const sessionId = String(body?.sessionId ?? '').trim()

  if (!sessionId || !Array.isArray(body?.events) || body.events.length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Se requiere sessionId y al menos un evento.'
    })
  }

  if (body.events.length > 50) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Máximo 50 eventos por solicitud.'
    })
  }

  const userAgent = getRequestHeader(event, 'user-agent') ?? undefined
  const receivedAt = new Date().toISOString()

  const records: AnalyticsEventRecord[] = body.events
    .filter((item) => item?.type && item?.action)
    .map((item) => {
      const meta = sanitizeMeta(item.meta as Record<string, unknown> | undefined)
      return {
        id: crypto.randomUUID(),
        sessionId,
        type: item.type,
        action: String(item.action).slice(0, 120),
        timestamp: new Date().toISOString(),
        receivedAt,
        path: item.path?.slice(0, 300),
        url: item.url?.slice(0, 500),
        section: item.section?.slice(0, 120),
        element: item.element?.slice(0, 120),
        label: item.label?.slice(0, 200),
        from: item.from?.slice(0, 300),
        to: item.to?.slice(0, 300),
        message: item.message?.slice(0, 500),
        stack: item.stack?.slice(0, 1200),
        context: item.context?.slice(0, 120),
        phase: item.phase?.slice(0, 120),
        meta,
        viewportW: typeof meta?.viewportW === 'number' ? meta.viewportW : undefined,
        viewportH: typeof meta?.viewportH === 'number' ? meta.viewportH : undefined,
        userAgent
      }
    })

  await appendAnalyticsEvents(records)

  return { ok: true, ingested: records.length }
})
