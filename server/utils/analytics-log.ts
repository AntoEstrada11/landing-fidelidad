import type { AnalyticsEventPayload, AnalyticsEventRecord } from '#shared/types/analytics'
import { appendAnalyticsEvents } from './analytics-store'

export async function logServerAnalytics(
  sessionId: string,
  events: AnalyticsEventPayload[]
): Promise<void> {
  if (events.length === 0) return

  const receivedAt = new Date().toISOString()
  const records: AnalyticsEventRecord[] = events.map((item) => ({
    id: crypto.randomUUID(),
    sessionId,
    type: item.type,
    action: item.action,
    timestamp: receivedAt,
    receivedAt,
    path: item.path,
    url: item.url,
    section: item.section,
    element: item.element,
    label: item.label,
    from: item.from,
    to: item.to,
    message: item.message,
    stack: item.stack,
    context: item.context ?? 'server',
    phase: item.phase,
    meta: item.meta
  }))

  await appendAnalyticsEvents(records)
}
