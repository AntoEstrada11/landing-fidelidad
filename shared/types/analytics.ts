export type AnalyticsEventType = 'click' | 'pageview' | 'navigation' | 'error' | 'payment'

export interface AnalyticsEventPayload {
  type: AnalyticsEventType
  /** Identificador legible: wizard.step_2, payment.checkout_error */
  action: string
  path?: string
  url?: string
  section?: string
  element?: string
  label?: string
  from?: string
  to?: string
  message?: string
  stack?: string
  context?: string
  phase?: string
  meta?: Record<string, string | number | boolean | null>
}

export interface AnalyticsEventRecord extends AnalyticsEventPayload {
  id: string
  sessionId: string
  timestamp: string
  receivedAt: string
  viewportW?: number
  viewportH?: number
  userAgent?: string
}

export interface AnalyticsIngestBody {
  sessionId: string
  events: AnalyticsEventPayload[]
}

export interface AnalyticsQuery {
  type?: AnalyticsEventType
  action?: string
  sessionId?: string
  context?: string
  since?: string
  until?: string
  limit?: number
}

export interface AnalyticsSummary {
  totalEvents: number
  uniqueSessions: number
  clicksByAction: Array<{ action: string; label: string; count: number }>
  navigationsByPath: Array<{ path: string; count: number }>
  errorsByContext: Array<{ context: string; action: string; message: string; count: number }>
  paymentFunnel: Array<{ action: string; count: number }>
  recentErrors: AnalyticsEventRecord[]
}
