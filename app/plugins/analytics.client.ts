import { flushAnalytics, useAnalytics } from '~/composables/useAnalytics'

function closestSection(el: HTMLElement): string | undefined {
  const section =
    el.closest('[data-analytics-section]') ??
    el.closest('section[id]') ??
    el.closest('[id]')
  if (!section || !(section instanceof HTMLElement)) return undefined
  return section.dataset.analyticsSection || section.id || undefined
}

function describeClick(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return null

  const tracked = target.closest('[data-track]') as HTMLElement | null
  if (tracked?.dataset.track) {
    return {
      action: `click.${tracked.dataset.track}`,
      label: tracked.dataset.trackLabel || tracked.dataset.track,
      element: tracked.tagName.toLowerCase(),
      section: tracked.dataset.trackSection || closestSection(tracked)
    }
  }

  const clickable = target.closest(
    'button, a, [role="button"], input[type="submit"], summary'
  ) as HTMLElement | null
  if (!clickable) return null

  const label =
    clickable.getAttribute('aria-label') ||
    clickable.textContent?.replace(/\s+/g, ' ').trim().slice(0, 80) ||
    clickable.tagName.toLowerCase()

  const slug = label
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '')
    .slice(0, 60)

  return {
    action: `click.${slug || clickable.tagName.toLowerCase()}`,
    label,
    element: clickable.tagName.toLowerCase() + (clickable.id ? `#${clickable.id}` : ''),
    section: closestSection(clickable)
  }
}

export default defineNuxtPlugin((nuxtApp) => {
  const { trackClick, trackPageview, trackNavigation, trackError } = useAnalytics()
  const router = useRouter()

  trackPageview(router.currentRoute.value.fullPath, { section: 'app' })

  router.afterEach((to, from) => {
    trackNavigation(from.fullPath, to.fullPath, { section: to.name?.toString() })
    trackPageview(to.fullPath, { section: to.name?.toString() })
  })

  document.addEventListener(
    'click',
    (event) => {
      const info = describeClick(event.target)
      if (!info) return
      trackClick(info.action, {
        label: info.label,
        element: info.element,
        section: info.section
      })
    },
    true
  )

  window.addEventListener('error', (event) => {
    trackError('client.unhandled_error', event.error ?? event.message, {
      context: 'client',
      label: event.filename,
      meta: { line: event.lineno, col: event.colno }
    })
  })

  window.addEventListener('unhandledrejection', (event) => {
    trackError('client.unhandled_rejection', event.reason, { context: 'client' })
  })

  window.addEventListener('pagehide', () => {
    void flushAnalytics()
  })

  nuxtApp.hook('vue:error', (error, _instance, info) => {
    trackError('vue.render_error', error, {
      context: 'vue',
      label: info
    })
  })
})
