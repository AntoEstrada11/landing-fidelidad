import type { H3Event } from 'h3'

export function assertAnalyticsAccess(event: H3Event) {
  const config = useRuntimeConfig()
  const expected = String(config.analytics.apiKey ?? '').trim()

  if (!expected) {
    throw createError({
      statusCode: 503,
      statusMessage: 'Las APIs de analítica no están configuradas (ANALYTICS_API_KEY).'
    })
  }

  const headerKey = getRequestHeader(event, 'x-analytics-key')
  const query = getQuery(event)
  const queryKey = typeof query.key === 'string' ? query.key : ''

  if (headerKey !== expected && queryKey !== expected) {
    throw createError({
      statusCode: 401,
      statusMessage: 'No autorizado para consultar analítica.'
    })
  }
}
