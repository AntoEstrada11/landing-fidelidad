import type { AnalyticsEventType, AnalyticsQuery } from '#shared/types/analytics'
import { assertAnalyticsAccess } from '../../utils/analytics-auth'
import { buildAnalyticsSummary } from '../../utils/analytics-store'

const VALID_TYPES: AnalyticsEventType[] = ['click', 'pageview', 'navigation', 'error', 'payment']

export default defineEventHandler(async (event) => {
  assertAnalyticsAccess(event)

  const query = getQuery(event)
  const typeRaw = typeof query.type === 'string' ? query.type : undefined
  const type = VALID_TYPES.includes(typeRaw as AnalyticsEventType)
    ? (typeRaw as AnalyticsEventType)
    : undefined

  const parsed: AnalyticsQuery = {
    type,
    sessionId: typeof query.sessionId === 'string' ? query.sessionId : undefined,
    context: typeof query.context === 'string' ? query.context : undefined,
    since: typeof query.since === 'string' ? query.since : undefined,
    until: typeof query.until === 'string' ? query.until : undefined
  }

  const summary = await buildAnalyticsSummary(parsed)
  return summary
})
