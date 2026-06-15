<template>
  <div class="lp-church-picker">
    <div v-if="needsPermission" class="lp-church-picker__intro">
      <span class="lp-church-picker__intro-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="28" height="28" fill="none">
          <path
            d="M12 21s-6.5-5.2-6.5-10a6.5 6.5 0 1 1 13 0c0 4.8-6.5 10-6.5 10z"
            stroke="currentColor"
            stroke-width="1.6"
          />
          <circle cx="12" cy="11" r="2.2" fill="currentColor" />
        </svg>
      </span>
      <p class="lp-church-picker__intro-text">
        Activa tu ubicación para encontrar el templo de la Iglesia Universal más cercano a ti.
      </p>
      <button type="button" class="lp-btn lp-btn--primary lp-btn--block" @click="loadMap">
        Buscar mi templo
      </button>
    </div>

    <template v-else>
      <div v-if="error" class="lp-church-picker__intro lp-church-picker__intro--error">
        <p class="lp-church-picker__intro-text">{{ error }}</p>
        <button v-if="!userPoint" type="button" class="lp-btn lp-btn--ghost-dark" @click="loadMap">
          Reintentar
        </button>
      </div>

      <template v-else>
        <div class="lp-church-picker__layout">
          <!-- Parte 1: Lista -->
          <section
            class="lp-church-picker__panel lp-church-picker__panel--list"
            aria-label="Templos cercanos"
          >
            <header class="lp-church-picker__panel-head">
              <p class="lp-church-picker__eyebrow">Tu templo</p>
              <h4 class="lp-church-picker__panel-title">Encuentra el más cercano</h4>
              <p class="lp-church-picker__panel-sub">
                {{
                  loading
                    ? 'Calculando distancias desde tu ubicación…'
                    : nearestPoint
                      ? `A ${formatDistanceKm(nearestPoint.distanceKm)} de ti`
                      : 'Selecciona tu iglesia en la lista'
                }}
              </p>
            </header>

            <div
              v-if="nearestPoint && userPoint && !loading"
              class="lp-church-picker__nearest"
            >
              <span class="lp-church-picker__nearest-mark" aria-hidden="true" />
              <div class="lp-church-picker__nearest-body">
                <span class="lp-church-picker__nearest-badge">Tu iglesia más cercana</span>
                <strong>{{ nearestPoint.name }}</strong>
                <span>{{ nearestPoint.bloque }} Â· {{ formatDistanceKm(nearestPoint.distanceKm) }}</span>
              </div>
              <button
                v-if="modelValue !== nearestPoint.id"
                type="button"
                class="lp-church-picker__nearest-btn"
                @click="selectNearest"
              >
                Elegir
              </button>
            </div>

            <div v-if="$slots.search" class="lp-church-picker__search">
              <slot name="search" />
            </div>

            <ul
              v-if="pickerPoints.length > 0"
              class="lp-church-picker__list"
              role="listbox"
              aria-label="Lista de templos"
            >
              <li v-for="point in pickerPoints" :key="point.id">
                <button
                  type="button"
                  role="option"
                  class="lp-church-picker__item"
                  :class="{ 'lp-church-picker__item--active': modelValue === point.id }"
                  :aria-selected="modelValue === point.id"
                  @click="selectPoint(point.id)"
                >
                  <span class="lp-church-picker__item-radio" aria-hidden="true">
                    <span v-if="modelValue === point.id">âœ“</span>
                  </span>
                  <span class="lp-church-picker__item-body">
                    <strong>{{ point.name }}</strong>
                    <span>{{ point.bloque }}</span>
                    <span
                      v-if="point.id === nearestPoint?.id && !point.searched"
                      class="lp-church-picker__item-tag lp-church-picker__item-tag--nearest"
                    >
                      Más cercana
                    </span>
                    <span v-else-if="point.searched" class="lp-church-picker__item-tag">Por búsqueda</span>
                  </span>
                  <span class="lp-church-picker__item-distance">
                    {{ formatDistanceKm(point.distanceKm) }}
                  </span>
                </button>
              </li>
            </ul>

            <p v-else-if="!loading" class="lp-church-picker__empty">
              No hay templos con ubicación cerca. Usa el buscador por nombre.
            </p>
          </section>

          <!-- Parte 2: Mapa -->
          <section
            class="lp-church-picker__panel lp-church-picker__panel--map"
            aria-label="Mapa del templo"
          >
            <header class="lp-church-picker__panel-head lp-church-picker__panel-head--map">
              <p class="lp-church-picker__eyebrow">Camino al templo</p>
              <h4 class="lp-church-picker__panel-title">Ubicación y ruta</h4>
              <p v-if="selectedPoint" class="lp-church-picker__panel-sub">
                {{ selectedPoint.name }}
              </p>
              <p v-else class="lp-church-picker__panel-sub">Elige un templo en la lista</p>
            </header>

            <div class="lp-church-picker__map-wrap">
              <div v-if="loading || routeLoading" class="lp-church-picker__map-loading">
                <span class="lp-church-picker__spinner" aria-hidden="true"></span>
                {{ loading ? 'Cargando mapa…' : 'Calculando ruta…' }}
              </div>
              <div ref="mapEl" class="lp-church-picker__map" aria-label="Mapa de templos cercanos" />
            </div>

            <div v-if="selectedPoint && userPoint" class="lp-church-picker__map-actions">
              <div class="lp-church-picker__map-footer">
                <div class="lp-church-picker__route-stats">
                  <span v-if="routeSummary">
                    {{ routeSummary.profileLabel }} Â· {{ formatDuration(routeSummary.durationS) }} Â·
                    {{ formatMeters(routeSummary.distanceM) }}
                  </span>
                  <span v-else-if="selectedPoint.distanceKm">
                    A {{ formatDistanceKm(selectedPoint.distanceKm) }} en línea recta
                  </span>
                </div>
                <NavigationAppLinks :navigation="navigationContext" />
              </div>

              <div class="lp-church-picker__modes" role="tablist" aria-label="Modo de viaje">
                <button
                  v-for="profile in travelProfiles"
                  :key="profile"
                  type="button"
                  role="tab"
                  class="lp-church-picker__mode"
                  :class="{ 'lp-church-picker__mode--active': travelMode === profile }"
                  :aria-selected="travelMode === profile"
                  @click="setTravelMode(profile)"
                >
                  <span aria-hidden="true">{{ travelIcons[profile] }}</span>
                  {{ travelLabels[profile] }}
                </button>
              </div>

              <p v-if="routeError" class="lp-church-picker__route-error" role="alert">
                {{ routeError }}
              </p>
            </div>
          </section>

          <div v-if="selectedPoint" class="lp-church-picker__confirm">
            <span class="lp-church-picker__confirm-icon" aria-hidden="true">âœ“</span>
            <span class="lp-church-picker__confirm-text">
              <strong>Tu iglesia para el voto</strong>
              <span>{{ selectedPoint.name }}</span>
              <small>{{ selectedPoint.bloque }}</small>
            </span>
          </div>
        </div>
      </template>
    </template>
  </div>
</template>

<script setup lang="ts">
import type { MapIglesiaPoint, NearbyMapResponse } from '#shared/types/geo'
import type { IglesiaOption } from '#shared/types/iglesia'
import type { RouteResponse, TravelProfile } from '#shared/types/routing'
import type { NavigationContext } from '#shared/utils/maps'
import { formatDistanceKm, haversineKm } from '#shared/utils/geo'
import {
  formatDuration,
  formatMeters,
  TRAVEL_PROFILE_ICONS,
  TRAVEL_PROFILE_SHORT,
  TRAVEL_PROFILES
} from '#shared/utils/routing'

type PickerPoint = MapIglesiaPoint & { searched?: boolean }

const props = withDefaults(
  defineProps<{
    modelValue: string
    items?: IglesiaOption[]
    active?: boolean
  }>(),
  {
    items: () => [],
    active: true
  }
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
  navigation: [value: NavigationContext | null]
}>()

const mapEl = ref<HTMLElement | null>(null)
const loading = ref(false)
const routeLoading = ref(false)
const error = ref('')
const routeError = ref('')
const needsPermission = ref(false)
const points = ref<MapIglesiaPoint[]>([])
const nearestId = ref<string | null>(null)
const userPoint = ref<{ lat: number; lng: number } | null>(null)
const travelMode = ref<TravelProfile>('foot')
const routeSummary = ref<RouteResponse | null>(null)
const mapInitialized = ref(false)

const travelProfiles = TRAVEL_PROFILES
const travelIcons = TRAVEL_PROFILE_ICONS
const travelLabels = TRAVEL_PROFILE_SHORT

let mapInstance: import('leaflet').Map | null = null
let markersLayer: import('leaflet').LayerGroup | null = null
let routeLine: import('leaflet').Polyline | null = null
let leafletModule: typeof import('leaflet') | null = null
let syncingSelection = false

const { requestLocation } = useUserLocation()

const resolvedPoint = ref<MapIglesiaPoint | null>(null)
const selectedPoint = computed(() => resolvedPoint.value)

const nearestPoint = computed(() => {
  if (nearestId.value) {
    return points.value.find((point) => point.id === nearestId.value) ?? points.value[0] ?? null
  }
  return points.value[0] ?? null
})

const pickerPoints = computed<PickerPoint[]>(() => {
  const list: PickerPoint[] = points.value.map((point) => ({ ...point }))
  const selected = resolvedPoint.value

  if (selected && !list.some((point) => point.id === selected.id)) {
    list.unshift({ ...selected, searched: true })
  }

  return list
})

const navigationContext = computed<NavigationContext | null>(() => {
  if (!userPoint.value || !resolvedPoint.value) return null
  return {
    origin: { lat: userPoint.value.lat, lng: userPoint.value.lng },
    destination: {
      lat: resolvedPoint.value.lat,
      lng: resolvedPoint.value.lng,
      name: resolvedPoint.value.name
    },
    travelMode: travelMode.value,
    geometry: routeSummary.value?.geometry
  }
})

function syncNavigationEmit() {
  emit('navigation', navigationContext.value)
}

async function ensureLeaflet() {
  if (!leafletModule) {
    leafletModule = await import('leaflet')
  }
  return leafletModule
}

function destroyMap() {
  if (mapInstance) {
    mapInstance.remove()
    mapInstance = null
  }
  markersLayer = null
  routeLine = null
  mapInitialized.value = false
}

function clearRouteLine() {
  if (routeLine && mapInstance) {
    mapInstance.removeLayer(routeLine)
    routeLine = null
  }
}

async function ensureMapReady(): Promise<import('leaflet').Map | null> {
  if (!mapInstance) return null

  await new Promise<void>((resolve) => {
    mapInstance!.invalidateSize()
    mapInstance!.whenReady(() => {
      requestAnimationFrame(() => resolve())
    })
  })

  return mapInstance
}

async function fitMapToBounds(
  bounds: import('leaflet').LatLngBounds,
  maxZoom = 15,
  animate = false
) {
  const map = await ensureMapReady()
  if (!map) return

  if (bounds.isValid()) {
    map.fitBounds(bounds.pad(0.18), { maxZoom, animate })
    return
  }

  const center = bounds.getCenter()
  if (center) {
    map.setView(center, maxZoom, { animate })
  }
}

async function initMapIfNeeded() {
  if (!import.meta.client || !mapEl.value || mapInstance) return

  const L = await ensureLeaflet()
  mapInstance = L.map(mapEl.value, {
    zoomControl: true,
    attributionControl: true
  })

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap'
  }).addTo(mapInstance)

  markersLayer = L.layerGroup().addTo(mapInstance)

  const center = userPoint.value
    ? ([userPoint.value.lat, userPoint.value.lng] as [number, number])
    : ([19.4326, -99.1332] as [number, number])

  mapInstance.setView(center, 13)
  mapInitialized.value = true
  await ensureMapReady()
}

async function renderMarkers() {
  if (!userPoint.value || !mapInstance || !markersLayer) return

  const L = await ensureLeaflet()
  markersLayer.clearLayers()

  const userIcon = L.divIcon({
    className: 'lp-map-pin lp-map-pin--user',
    html: '<span></span>',
    iconSize: [22, 22],
    iconAnchor: [11, 11]
  })

  L.marker([userPoint.value.lat, userPoint.value.lng], { icon: userIcon, zIndexOffset: 1000 })
    .bindPopup('Tú estás aquí')
    .addTo(markersLayer)

  for (const point of points.value) {
    const isSelected = point.id === props.modelValue
    const churchIcon = L.divIcon({
      className: isSelected
        ? 'lp-map-pin lp-map-pin--church lp-map-pin--selected'
        : 'lp-map-pin lp-map-pin--church',
      html: '<span></span>',
      iconSize: [26, 26],
      iconAnchor: [13, 24]
    })

    L.marker([point.lat, point.lng], {
      icon: churchIcon,
      zIndexOffset: isSelected ? 900 : 0
    })
      .bindPopup(`<strong>${point.name}</strong>`)
      .on('click', () => selectPoint(point.id))
      .addTo(markersLayer)
  }

  const searched = resolvedPoint.value
  if (searched && !points.value.some((point) => point.id === searched.id)) {
    const churchIcon = L.divIcon({
      className: 'lp-map-pin lp-map-pin--church lp-map-pin--selected',
      html: '<span></span>',
      iconSize: [26, 26],
      iconAnchor: [13, 24]
    })

    L.marker([searched.lat, searched.lng], {
      icon: churchIcon,
      zIndexOffset: 900
    })
      .bindPopup(`<strong>${searched.name}</strong><br><small>Buscada por nombre</small>`)
      .on('click', () => selectPoint(searched.id))
      .addTo(markersLayer)
  }
}

async function resolveSelectionPoint(id: string): Promise<MapIglesiaPoint | null> {
  if (!id) return null

  const fromNearby = points.value.find((point) => point.id === id)
  if (fromNearby) return fromNearby

  const item = props.items.find((entry) => entry.id === id)
  if (!item || !userPoint.value) return null

  let lat = item.lat
  let lng = item.lng

  if (typeof lat !== 'number' || typeof lng !== 'number') {
    const geocoded = await $fetch<{ lat: number; lng: number }>('/api/geo/geocode-iglesia', {
      query: {
        name: item.name,
        direccion: item.direccion ?? '',
        bloque: item.bloque ?? ''
      }
    })
    lat = geocoded.lat
    lng = geocoded.lng
  }

  return {
    id: item.id,
    name: item.name,
    bloque: item.bloque,
    bloqueId: item.bloqueId,
    direccion: item.direccion,
    lat,
    lng,
    distanceKm: haversineKm(userPoint.value.lat, userPoint.value.lng, lat, lng)
  }
}

async function focusSelection(animate = false) {
  if (!mapInstance || !userPoint.value || !resolvedPoint.value) return

  const L = await ensureLeaflet()
  await fitMapToBounds(
    L.latLngBounds([
      [userPoint.value.lat, userPoint.value.lng],
      [resolvedPoint.value.lat, resolvedPoint.value.lng]
    ]),
    15,
    animate
  )
}

async function drawRouteGeometry(geometry: Array<[number, number]>) {
  if (!mapInstance || geometry.length < 2) return

  const L = await ensureLeaflet()
  clearRouteLine()

  routeLine = L.polyline(geometry, {
    color: travelMode.value === 'foot' ? '#2563eb' : '#b8860b',
    weight: 5,
    opacity: 0.85
  }).addTo(mapInstance)
}

async function fetchRoute() {
  if (!userPoint.value || !resolvedPoint.value) {
    routeSummary.value = null
    clearRouteLine()
    return
  }

  routeLoading.value = true
  routeError.value = ''

  try {
    const data = await $fetch<RouteResponse>('/api/geo/route', {
      query: {
        fromLat: userPoint.value.lat,
        fromLng: userPoint.value.lng,
        toLat: resolvedPoint.value.lat,
        toLng: resolvedPoint.value.lng,
        profile: travelMode.value
      }
    })

    routeSummary.value = data

    if (mapInstance) {
      await drawRouteGeometry(data.geometry)
    }
  } catch (err) {
    routeSummary.value = null
    clearRouteLine()
    routeError.value =
      err instanceof Error ? err.message : 'No se pudo calcular la ruta. Intenta otro modo.'
  } finally {
    routeLoading.value = false
  }
}

async function ensureMapVisible() {
  await nextTick()
  await initMapIfNeeded()
  await ensureMapReady()
  await renderMarkers()
  if (resolvedPoint.value) {
    await focusSelection(false)
    if (routeSummary.value?.geometry) {
      await drawRouteGeometry(routeSummary.value.geometry)
    }
  }
}

async function updateSelection(options: { animateMap?: boolean } = {}) {
  const { animateMap = false } = options

  if (!props.modelValue) {
    resolvedPoint.value = null
    clearRouteLine()
    routeSummary.value = null
    routeError.value = ''
    if (mapInstance) await renderMarkers()
    syncNavigationEmit()
    return
  }

  const fromSearch = !points.value.some((point) => point.id === props.modelValue)
  if (fromSearch) {
    routeLoading.value = true
    routeError.value = ''
  }

  try {
    resolvedPoint.value = await resolveSelectionPoint(props.modelValue)
  } catch (err) {
    resolvedPoint.value = null
    clearRouteLine()
    routeSummary.value = null
    routeError.value =
      err instanceof Error ? err.message : 'No se pudo ubicar el templo en el mapa.'
    if (mapInstance) await renderMarkers()
    syncNavigationEmit()
    return
  } finally {
    if (fromSearch) {
      routeLoading.value = false
    }
  }

  if (!resolvedPoint.value) {
    clearRouteLine()
    routeSummary.value = null
    if (mapInstance) await renderMarkers()
    syncNavigationEmit()
    return
  }

  await fetchRoute()

  if (mapInstance) {
    await renderMarkers()
    await focusSelection(animateMap)
  }

  syncNavigationEmit()
}

function selectPoint(id: string) {
  if (props.modelValue === id) return
  emit('update:modelValue', id)
}

function selectNearest() {
  const nearest = nearestPoint.value
  if (!nearest) return
  selectPoint(nearest.id)
}

function setTravelMode(profile: TravelProfile) {
  if (travelMode.value === profile) return
  travelMode.value = profile
}

async function loadMap() {
  if (!props.active) return

  loading.value = true
  error.value = ''
  needsPermission.value = false

  try {
    const user = await requestLocation()
    if (!user) {
      needsPermission.value = true
      return
    }

    userPoint.value = user

    const data = await $fetch<NearbyMapResponse>('/api/geo/nearby-map', {
      query: { lat: user.lat, lng: user.lng }
    })

    points.value = data.iglesias
    nearestId.value = data.nearestId ?? data.iglesias[0]?.id ?? null

    if (points.value.length === 0) {
      error.value = 'No encontramos templos con ubicación cerca de ti. Usa el buscador por nombre.'
    }

    syncingSelection = true
    const nearest = data.nearestId ?? data.iglesias[0]?.id ?? null
    const currentInList =
      Boolean(props.modelValue) && data.iglesias.some((point) => point.id === props.modelValue)

    if (!currentInList && nearest) {
      emit('update:modelValue', nearest)
    }

    await updateSelection({ animateMap: false })
    await ensureMapVisible()

    syncingSelection = false
  } catch (err) {
    syncingSelection = false
    if (err instanceof Error && err.message.includes('ubicación')) {
      needsPermission.value = true
      error.value = ''
    } else {
      error.value = err instanceof Error ? err.message : 'No se pudo cargar los templos.'
      needsPermission.value = false
    }
  } finally {
    loading.value = false
  }
}

watch(
  () => props.modelValue,
  async (value, previous) => {
    if (syncingSelection || !userPoint.value) return
    await updateSelection({ animateMap: Boolean(previous && value) })
  }
)

watch(travelMode, async () => {
  if (!resolvedPoint.value) return
  await fetchRoute()
  syncNavigationEmit()
})

watch(
  () => props.active,
  async (active) => {
    if (!active) return

    await nextTick()

    if (points.value.length > 0 && userPoint.value) {
      if (mapInstance) {
        await ensureMapReady()
        if (selectedPoint.value) {
          await updateSelection({ animateMap: false })
        }
      } else {
        await ensureMapVisible()
      }
      return
    }

    await loadMap()
  },
  { immediate: true }
)

function onResize() {
  if (mapInstance) {
    mapInstance.invalidateSize()
  }
}

onMounted(() => {
  if (import.meta.client) {
    window.addEventListener('resize', onResize, { passive: true })
  }
})

onUnmounted(() => {
  if (import.meta.client) {
    window.removeEventListener('resize', onResize)
  }
  destroyMap()
})
</script>

<style scoped>
.lp-church-picker {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  width: 100%;
  min-width: 0;
}

.lp-church-picker__intro {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.85rem;
  padding: 1.35rem 1.15rem;
  border-radius: var(--lp-radius-lg);
  background: linear-gradient(165deg, #faf8f5 0%, #f0ebe3 100%);
  border: 1px solid rgba(184, 134, 11, 0.28);
  box-shadow: var(--lp-shadow-card);
  text-align: center;
}

.lp-church-picker__intro-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3.25rem;
  height: 3.25rem;
  border-radius: 50%;
  background: var(--lp-navy);
  color: var(--lp-accent);
  box-shadow: 0 4px 16px rgba(20, 24, 32, 0.2);
}

.lp-church-picker__intro-text {
  margin: 0;
  max-width: 28ch;
  font-size: 0.9rem;
  line-height: 1.55;
  color: var(--lp-text-on-light);
}

.lp-church-picker__intro--error {
  border-color: #fecdca;
  background: linear-gradient(165deg, #fff8f8 0%, #fff1f1 100%);
}

.lp-church-picker__layout {
  display: grid;
  gap: 0.85rem;
  grid-template-columns: minmax(0, 1fr);
  grid-template-areas:
    'list'
    'map'
    'confirm';
  width: 100%;
  min-width: 0;
}

.lp-church-picker__panel {
  position: relative;
  display: flex;
  flex-direction: column;
  min-width: 0;
  border-radius: var(--lp-radius-lg);
  background: var(--lp-paper);
  border: 1px solid rgba(184, 134, 11, 0.22);
  box-shadow: var(--lp-shadow-card);
  overflow: hidden;
}

.lp-church-picker__panel::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--lp-accent-hover), var(--lp-accent), #d4a853);
  z-index: 1;
}

.lp-church-picker__panel--list {
  grid-area: list;
  overflow: visible;
}

.lp-church-picker__panel--map {
  grid-area: map;
}

.lp-church-picker__panel--map .lp-church-picker__panel-head {
  padding-bottom: 0.65rem;
}

.lp-church-picker__confirm {
  grid-area: confirm;
}

.lp-church-picker__panel-head {
  padding: 1rem 1rem 0.75rem;
  background: linear-gradient(180deg, #faf8f5 0%, var(--lp-paper) 100%);
  border-bottom: 1px solid rgba(214, 205, 196, 0.65);
}

.lp-church-picker__eyebrow {
  margin: 0 0 0.25rem;
  font-size: 0.68rem;
  font-style: italic;
  font-weight: 500;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--lp-accent-hover);
}

.lp-church-picker__panel-title {
  margin: 0;
  font-family: var(--lp-font-display);
  font-size: clamp(0.95rem, 2.8vw, 1.05rem);
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--lp-navy);
}

.lp-church-picker__panel-sub {
  margin: 0.25rem 0 0;
  font-size: 0.78rem;
  color: var(--lp-text-muted-light);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.lp-church-picker__search {
  padding: 0.65rem 1rem;
  border-bottom: 1px solid rgba(214, 205, 196, 0.65);
  background: #faf8f5;
  position: relative;
  z-index: 5;
}

.lp-church-picker__search :deep(.lp-iglesia-search__label) {
  font-size: 0.72rem;
  font-style: italic;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--lp-text-muted-light);
}

.lp-church-picker__search :deep(.lp-iglesia-search__input) {
  font-size: 0.95rem;
  padding: 0.75rem 0.9rem;
  border-color: rgba(184, 134, 11, 0.25);
  background: var(--lp-paper);
}

.lp-church-picker__nearest {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin: 0 0.75rem 0.75rem;
  padding: 0.85rem 0.9rem;
  border-radius: var(--lp-radius-md);
  background: linear-gradient(135deg, var(--lp-navy) 0%, #1c2230 100%);
  box-shadow: 0 6px 20px rgba(20, 24, 32, 0.18);
}

.lp-church-picker__nearest-mark {
  flex-shrink: 0;
  width: 4px;
  align-self: stretch;
  border-radius: 999px;
  background: linear-gradient(180deg, #d4a853, var(--lp-accent));
}

.lp-church-picker__nearest-body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.lp-church-picker__nearest-body strong {
  font-size: 0.9rem;
  font-weight: 700;
  color: #fff;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.lp-church-picker__nearest-body > span:last-child {
  font-size: 0.74rem;
  color: rgba(255, 255, 255, 0.62);
}

.lp-church-picker__nearest-badge {
  display: inline-block;
  width: fit-content;
  font-size: 0.62rem;
  font-style: italic;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--lp-accent);
}

.lp-church-picker__nearest-btn {
  flex-shrink: 0;
  padding: 0.5rem 0.85rem;
  border: none;
  border-radius: var(--lp-radius-pill);
  background: var(--lp-accent);
  font-family: var(--lp-font);
  font-size: 0.74rem;
  font-weight: 700;
  color: #fff;
  cursor: pointer;
  box-shadow: var(--lp-shadow-cta);
  transition:
    background 0.2s var(--lp-ease),
    transform 0.2s var(--lp-ease);
}

.lp-church-picker__nearest-btn:hover {
  background: var(--lp-accent-hover);
  transform: translateY(-1px);
}

.lp-church-picker__list {
  margin: 0;
  padding: 0.35rem 0;
  list-style: none;
  max-height: min(240px, 38dvh);
  overflow-y: auto;
  overscroll-behavior: contain;
}

.lp-church-picker__item {
  position: relative;
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 0.65rem;
  width: 100%;
  padding: 0.8rem 1rem;
  border: none;
  background: transparent;
  text-align: left;
  cursor: pointer;
  font-family: var(--lp-font);
  transition: background 0.18s var(--lp-ease);
}

.lp-church-picker__item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0.65rem;
  bottom: 0.65rem;
  width: 3px;
  border-radius: 0 2px 2px 0;
  background: transparent;
  transition: background 0.18s var(--lp-ease);
}

.lp-church-picker__item + .lp-church-picker__item {
  border-top: 1px solid rgba(214, 205, 196, 0.45);
}

.lp-church-picker__item:hover,
.lp-church-picker__item:focus-visible {
  background: rgba(184, 134, 11, 0.05);
}

.lp-church-picker__item--active {
  background: rgba(184, 134, 11, 0.09);
}

.lp-church-picker__item--active::before {
  background: var(--lp-accent);
}

.lp-church-picker__item-radio {
  flex-shrink: 0;
  width: 1.15rem;
  height: 1.15rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  border: 2px solid rgba(184, 134, 11, 0.35);
  font-size: 0.62rem;
  font-weight: 700;
  color: #fff;
  background: var(--lp-paper);
  transition:
    border-color 0.18s,
    background 0.18s;
}

.lp-church-picker__item--active .lp-church-picker__item-radio {
  border-color: var(--lp-accent);
  background: var(--lp-accent);
}

.lp-church-picker__item-body {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}

.lp-church-picker__item-body strong {
  font-size: clamp(0.82rem, 2.8vw, 0.9rem);
  font-weight: 700;
  line-height: 1.25;
  color: var(--lp-navy);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.lp-church-picker__item-body > span:not(.lp-church-picker__item-tag) {
  font-size: 0.72rem;
  color: var(--lp-text-muted-light);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.lp-church-picker__item-tag {
  display: inline-block;
  width: fit-content;
  margin-top: 0.12rem;
  padding: 0.08rem 0.4rem;
  border-radius: var(--lp-radius-pill);
  background: rgba(20, 24, 32, 0.07);
  color: var(--lp-text-muted-light);
  font-size: 0.62rem;
  font-style: italic;
  font-weight: 600;
  letter-spacing: 0.04em;
}

.lp-church-picker__item-tag--nearest {
  background: rgba(184, 134, 11, 0.15);
  color: var(--lp-accent-hover);
  font-style: normal;
}

.lp-church-picker__item-distance {
  flex-shrink: 0;
  font-size: 0.76rem;
  font-weight: 700;
  color: var(--lp-accent-hover);
  white-space: nowrap;
}

.lp-church-picker__empty {
  margin: 0;
  padding: 1.25rem 1rem;
  font-size: 0.82rem;
  font-style: italic;
  color: var(--lp-text-muted-light);
  text-align: center;
}

.lp-church-picker__map-wrap {
  position: relative;
  margin: 0 0.75rem;
  border-radius: var(--lp-radius-md);
  overflow: hidden;
  border: 1px solid rgba(184, 134, 11, 0.2);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.4);
}

.lp-church-picker__map {
  width: 100%;
  height: clamp(200px, 34dvh, 260px);
  background: #e8e4df;
}

.lp-church-picker__map-loading {
  position: absolute;
  inset: 0;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  background: rgba(250, 248, 245, 0.92);
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--lp-navy);
}

.lp-church-picker__spinner {
  display: inline-block;
  width: 1rem;
  height: 1rem;
  border: 2px solid rgba(184, 134, 11, 0.25);
  border-top-color: var(--lp-accent);
  border-radius: 50%;
  animation: lp-church-spin 0.8s linear infinite;
}

@keyframes lp-church-spin {
  to {
    transform: rotate(360deg);
  }
}

.lp-church-picker__map-actions {
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
  margin-top: 0.75rem;
  padding: 0.85rem 1rem 1rem;
  background: #faf8f5;
  border-top: 1px solid rgba(214, 205, 196, 0.65);
}

.lp-church-picker__map-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.lp-church-picker__route-stats {
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--lp-accent-hover);
  line-height: 1.35;
}

.lp-church-picker__modes {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.45rem;
}

.lp-church-picker__mode {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  min-height: 2.5rem;
  padding: 0.45rem 0.65rem;
  border: 2px solid var(--lp-border-on-light);
  border-radius: var(--lp-radius-pill);
  background: var(--lp-paper);
  font-family: var(--lp-font);
  font-size: clamp(0.72rem, 2.5vw, 0.8rem);
  font-weight: 700;
  color: var(--lp-text-on-light);
  cursor: pointer;
  transition:
    border-color 0.2s var(--lp-ease),
    background 0.2s var(--lp-ease),
    color 0.2s var(--lp-ease);
}

.lp-church-picker__mode--active {
  border-color: var(--lp-accent);
  background: rgba(184, 134, 11, 0.1);
  color: var(--lp-accent-hover);
  box-shadow: var(--lp-shadow-cta);
}

.lp-church-picker__route-error {
  margin: 0;
  padding: 0.6rem 0.75rem;
  border-radius: var(--lp-radius-md);
  background: #fff5f5;
  border: 1px solid #fecdca;
  font-size: 0.78rem;
  color: #b42318;
}

.lp-church-picker__confirm {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.85rem 1rem;
  border-radius: var(--lp-radius-lg);
  background: linear-gradient(135deg, var(--lp-navy) 0%, #1a2030 100%);
  box-shadow: 0 8px 28px rgba(20, 24, 32, 0.22);
}

.lp-church-picker__confirm-icon {
  flex-shrink: 0;
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: var(--lp-accent);
  color: #fff;
  font-size: 0.85rem;
  font-weight: 700;
  box-shadow: var(--lp-shadow-cta);
}

.lp-church-picker__confirm-text {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.08rem;
}

.lp-church-picker__confirm-text strong {
  font-size: 0.65rem;
  font-style: italic;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--lp-accent);
}

.lp-church-picker__confirm-text > span {
  font-size: clamp(0.88rem, 2.8vw, 0.95rem);
  font-weight: 700;
  color: #fff;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.lp-church-picker__confirm-text small {
  font-size: 0.74rem;
  color: rgba(255, 255, 255, 0.58);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

@media (min-width: 960px) {
  .lp-church-picker__layout {
    gap: 1rem;
  }

  .lp-church-picker__list {
    max-height: min(280px, 42dvh);
  }

  .lp-church-picker__map {
    height: clamp(220px, 32dvh, 280px);
  }

  .lp-church-picker__map-wrap {
    margin: 0 1rem;
  }

  .lp-church-picker__item {
    padding: 0.85rem 1.1rem;
  }
}

:deep(.lp-map-pin) {
  background: transparent;
  border: none;
}

:deep(.lp-map-pin--user span) {
  display: block;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: var(--lp-navy);
  border: 3px solid #fff;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.35);
}

:deep(.lp-map-pin--church span) {
  display: block;
  width: 0;
  height: 0;
  border-left: 11px solid transparent;
  border-right: 11px solid transparent;
  border-bottom: 20px solid var(--lp-accent);
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.35));
}

:deep(.lp-map-pin--selected span) {
  border-bottom-color: #8b4513;
  transform: scale(1.15);
}

:deep(.lp-nav-links__icon) {
  border-color: rgba(184, 134, 11, 0.25);
  background: var(--lp-paper);
  border-radius: 50%;
}

:deep(.lp-nav-links__icon:hover) {
  border-color: var(--lp-accent);
  box-shadow: var(--lp-shadow-cta);
}
</style>
