import { mkdir, appendFile, readFile } from 'node:fs/promises'
import { join } from 'node:path'
import type {
  AnalyticsEventRecord,
  AnalyticsQuery,
  AnalyticsSummary
} from '#shared/types/analytics'

const DATA_DIR = join(process.cwd(), 'server', 'data', 'analytics')
const EVENTS_FILE = join(DATA_DIR, 'events.jsonl')

async function ensureDataDir() {
  await mkdir(DATA_DIR, { recursive: true })
}

export async function appendAnalyticsEvents(events: AnalyticsEventRecord[]): Promise<void> {
  if (events.length === 0) return
  await ensureDataDir()
  const lines = events.map((event) => JSON.stringify(event)).join('\n') + '\n'
  await appendFile(EVENTS_FILE, lines, 'utf8')
}

async function readAllEvents(): Promise<AnalyticsEventRecord[]> {
  try {
    const raw = await readFile(EVENTS_FILE, 'utf8')
    return raw
      .split('\n')
      .filter(Boolean)
      .map((line) => JSON.parse(line) as AnalyticsEventRecord)
  } catch {
    return []
  }
}

function matchesQuery(event: AnalyticsEventRecord, query: AnalyticsQuery): boolean {
  if (query.type && event.type !== query.type) return false
  if (query.action && event.action !== query.action) return false
  if (query.sessionId && event.sessionId !== query.sessionId) return false
  if (query.context && event.context !== query.context) return false
  if (query.since && event.timestamp < query.since) return false
  if (query.until && event.timestamp > query.until) return false
  return true
}

export async function queryAnalyticsEvents(query: AnalyticsQuery): Promise<AnalyticsEventRecord[]> {
  const limit = Math.min(Math.max(query.limit ?? 100, 1), 1000)
  const events = await readAllEvents()
  const filtered = events.filter((event) => matchesQuery(event, query))
  return filtered.slice(-limit).reverse()
}

function increment(map: Map<string, number>, key: string, amount = 1) {
  map.set(key, (map.get(key) ?? 0) + amount)
}

export async function buildAnalyticsSummary(query: AnalyticsQuery = {}): Promise<AnalyticsSummary> {
  const events = (await readAllEvents()).filter((event) => matchesQuery(event, query))
  const sessions = new Set<string>()
  const clicksByAction = new Map<string, { action: string; label: string; count: number }>()
  const navigationsByPath = new Map<string, number>()
  const errorsByContext = new Map<
    string,
    { context: string; action: string; message: string; count: number }
  >()
  const paymentFunnel = new Map<string, number>()

  for (const event of events) {
    sessions.add(event.sessionId)

    if (event.type === 'click') {
      const key = event.action
      const current = clicksByAction.get(key) ?? {
        action: event.action,
        label: event.label ?? event.action,
        count: 0
      }
      current.count += 1
      clicksByAction.set(key, current)
    }

    if (event.type === 'pageview' || event.type === 'navigation') {
      const path = event.path ?? event.to ?? '/'
      increment(navigationsByPath, path)
    }

    if (event.type === 'error') {
      const ctx = event.context ?? 'general'
      const key = `${ctx}|${event.action}|${event.message ?? ''}`
      const current = errorsByContext.get(key) ?? {
        context: ctx,
        action: event.action,
        message: event.message ?? '',
        count: 0
      }
      current.count += 1
      errorsByContext.set(key, current)
    }

    if (
      event.type === 'payment' ||
      event.action.startsWith('payment.') ||
      event.action.startsWith('wizard.')
    ) {
      increment(paymentFunnel, event.action)
    }
  }

  const recentErrors = events
    .filter((event) => event.type === 'error')
    .slice(-20)
    .reverse()

  return {
    totalEvents: events.length,
    uniqueSessions: sessions.size,
    clicksByAction: [...clicksByAction.values()].sort((a, b) => b.count - a.count).slice(0, 30),
    navigationsByPath: [...navigationsByPath.entries()]
      .map(([path, count]) => ({ path, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 30),
    errorsByContext: [...errorsByContext.values()].sort((a, b) => b.count - a.count).slice(0, 30),
    paymentFunnel: [...paymentFunnel.entries()]
      .map(([action, count]) => ({ action, count }))
      .sort((a, b) => b.count - a.count),
    recentErrors
  }
}
