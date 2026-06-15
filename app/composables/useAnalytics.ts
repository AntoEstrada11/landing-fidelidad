import type { AnalyticsEventPayload } from '#shared/types/analytics'

const SESSION_KEY = 'fidelidad-analytics-session'
const QUEUE: AnalyticsEventPayload[] = []
const FLUSH_MS = 4000
let flushTimer: ReturnType<typeof setTimeout> | null = null
let flushing = false

function getSessionId(): string {
  if (!import.meta.client) return 'server'

  let id = sessionStorage.getItem(SESSION_KEY)
  if (!id) {
    id = crypto.randomUUID()
    sessionStorage.setItem(SESSION_KEY, id)
  }
  return id
}

function viewportMeta() {
  if (!import.meta.client) return {}
  return {
    viewportW: window.innerWidth,
    viewportH: window.innerHeight
  }
}

function scheduleFlush() {
  if (!import.meta.client || flushTimer) return
  flushTimer = setTimeout(() => {
    flushTimer = null
    void flushAnalytics()
  }, FLUSH_MS)
}

export async function flushAnalytics() {
  if (!import.meta.client || flushing || QUEUE.length === 0) return

  flushing = true
  const batch = QUEUE.splice(0, 50)

  try {
    await $fetch('/api/analytics/events', {
      method: 'POST',
      body: {
        sessionId: getSessionId(),
        events: batch
      }
    })
  } catch {
    QUEUE.unshift(...batch)
  } finally {
    flushing = false
    if (QUEUE.length > 0) scheduleFlush()
  }
}

function enqueue(event: AnalyticsEventPayload) {
  if (!import.meta.client) return

  QUEUE.push({
    ...event,
    path: event.path ?? window.location.pathname,
    url: event.url ?? window.location.href,
    meta: { ...viewportMeta(), ...event.meta }
  })

  if (QUEUE.length >= 20) {
    void flushAnalytics()
    return
  }

  scheduleFlush()
}

export function useAnalytics() {
  function trackClick(action: string, details?: Partial<AnalyticsEventPayload>) {
    enqueue({
      type: 'click',
      action,
      ...details
    })
  }

  function trackPageview(path: string, details?: Partial<AnalyticsEventPayload>) {
    enqueue({
      type: 'pageview',
      action: 'page.view',
      path,
      to: path,
      ...details
    })
  }

  function trackNavigation(from: string, to: string, details?: Partial<AnalyticsEventPayload>) {
    enqueue({
      type: 'navigation',
      action: 'route.change',
      from,
      to,
      path: to,
      ...details
    })
  }

  function trackError(
    action: string,
    error: unknown,
    details?: Partial<AnalyticsEventPayload>
  ) {
    const err = error instanceof Error ? error : new Error(String(error))
    enqueue({
      type: 'error',
      action,
      message: err.message.slice(0, 500),
      stack: err.stack?.slice(0, 1200),
      ...details
    })
  }

  function trackPayment(action: string, details?: Partial<AnalyticsEventPayload>) {
    enqueue({
      type: 'payment',
      action,
      context: details?.context ?? 'payment',
      phase: details?.phase,
      ...details
    })
  }

  return {
    sessionId: computed(() => getSessionId()),
    trackClick,
    trackPageview,
    trackNavigation,
    trackError,
    trackPayment,
    flush: flushAnalytics
  }
}
