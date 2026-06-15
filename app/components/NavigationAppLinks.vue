<template>
  <p v-if="links" class="lp-nav-links">
    <span v-if="label" class="lp-nav-links__label">{{ label }}</span>
    <span class="lp-nav-links__icons">
      <a
        :href="links.googleMaps"
        target="_blank"
        rel="noopener noreferrer"
        class="lp-nav-links__icon"
        aria-label="Abrir en Google Maps"
        title="Google Maps"
      >
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
          <path
            fill="#EA4335"
            d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 11.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z"
          />
        </svg>
      </a>
      <a
        :href="links.waze"
        target="_blank"
        rel="noopener noreferrer"
        class="lp-nav-links__icon"
        aria-label="Abrir en Waze"
        title="Waze"
      >
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
          <circle cx="12" cy="12" r="10" fill="#33CCFF" />
          <ellipse cx="9" cy="10.5" rx="1.1" ry="1.4" fill="#fff" />
          <ellipse cx="15" cy="10.5" rx="1.1" ry="1.4" fill="#fff" />
          <path
            d="M8.5 14.5c1.2 1.8 2.8 2.7 3.5 2.7s2.3-.9 3.5-2.7"
            fill="none"
            stroke="#fff"
            stroke-width="1.4"
            stroke-linecap="round"
          />
        </svg>
      </a>
    </span>
  </p>
</template>

<script setup lang="ts">
import type { NavigationContext } from '#shared/utils/maps'
import { buildNavigationLinksFromContext } from '#shared/utils/maps'

const props = withDefaults(
  defineProps<{
    navigation?: NavigationContext | null
    label?: string
  }>(),
  {
    navigation: null,
    label: ''
  }
)

const links = computed(() => buildNavigationLinksFromContext(props.navigation))
</script>

<style scoped>
.lp-nav-links {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.35rem 0.5rem;
  margin: 0;
  line-height: 1;
}

.lp-nav-links__label {
  flex-shrink: 0;
  font-size: 0.68rem;
  font-style: italic;
  font-weight: 500;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--lp-text-muted-light);
}

.lp-nav-links__icons {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
}

.lp-nav-links__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.85rem;
  height: 1.85rem;
  border-radius: 50%;
  border: 1px solid rgba(184, 134, 11, 0.28);
  background: var(--lp-paper);
  text-decoration: none;
  transition:
    border-color 0.2s var(--lp-ease),
    box-shadow 0.2s var(--lp-ease),
    transform 0.15s var(--lp-ease);
}

.lp-nav-links__icon:hover {
  border-color: var(--lp-accent);
  box-shadow: var(--lp-shadow-cta);
  transform: translateY(-1px);
}

.lp-nav-links__icon svg {
  display: block;
}
</style>
