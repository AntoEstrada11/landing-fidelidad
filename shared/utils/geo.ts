import type { IglesiaOption } from '#shared/types/iglesia'
import type { UserArea } from '#shared/types/geo'

export interface NearbyIglesiaResult {
  id: string
  name: string
  bloque: string
  bloqueId: string
  direccion?: string
  lat?: number
  lng?: number
  distanceKm: number | null
  matchType: 'coordinates' | 'city' | 'bloque'
}

const EARTH_RADIUS_KM = 6371

export function normalizePlace(value: string): string {
  return value
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
  return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export function extractLocalityFromName(name: string): string {
  const parts = name.split(' - ')
  if (parts.length < 2) return ''
  return parts[parts.length - 1]?.trim() ?? ''
}

export function formatDistanceKm(km: number | null): string {
  if (km === null) return 'En tu zona'
  if (km < 1) return `${Math.round(km * 1000)} m`
  if (km < 10) return `${km.toFixed(1)} km`
  return `${Math.round(km)} km`
}

export function bearingDegrees(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180
  const toDeg = (rad: number) => (rad * 180) / Math.PI
  const dLng = toRad(lng2 - lng1)
  const y = Math.sin(dLng) * Math.cos(toRad(lat2))
  const x =
    Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) -
    Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(dLng)
  return (toDeg(Math.atan2(y, x)) + 360) % 360
}

const CARDINALS_ES = [
  'norte',
  'noreste',
  'este',
  'sureste',
  'sur',
  'suroeste',
  'oeste',
  'noroeste'
] as const

export function bearingToCardinalEs(bearing: number): string {
  const index = Math.round(bearing / 45) % CARDINALS_ES.length
  return CARDINALS_ES[index] ?? 'norte'
}

export function hasValidCoords(item: {
  lat?: number
  lng?: number
}): item is { lat: number; lng: number } {
  return (
    typeof item.lat === 'number' &&
    typeof item.lng === 'number' &&
    !Number.isNaN(item.lat) &&
    !Number.isNaN(item.lng)
  )
}

const STOP_TOKENS = new Set([
  'mexico',
  'mx',
  'estados unidos mexicanos',
  'centro',
  'ciudad de mexico',
  'cdmx',
  'sec',
  'seccion'
])

function cityTokens(userArea: UserArea): string[] {
  const fromFields = [
    userArea.suburb,
    userArea.municipality,
    userArea.city,
    userArea.state
  ]
  const fromDisplay = userArea.displayName.split(',').map((part) => part.trim())

  return [...fromFields, ...fromDisplay]
    .map(normalizePlace)
    .filter((token) => token.length >= 3 && !STOP_TOKENS.has(token))
    .filter((token, index, arr) => arr.indexOf(token) === index)
}

function scoreCityMatch(item: IglesiaOption, tokens: string[]): number {
  const haystack = normalizePlace(`${item.name} ${item.bloque} ${item.direccion ?? ''}`)
  let score = 0

  for (const token of tokens) {
    if (token.length < 4) continue
    if (haystack.includes(token)) {
      score += token.length
    }
  }

  const locality = normalizePlace(extractLocalityFromName(item.name))
  if (locality.length >= 4) {
    for (const token of tokens) {
      if (token.length >= 4 && locality.includes(token)) {
        score += token.length * 2
      }
    }
  }

  return score
}

function matchesBloque(item: IglesiaOption, tokens: string[]): boolean {
  if (tokens.length === 0) return false
  const bloque = normalizePlace(item.bloque)
  return tokens.some((token) => token.length >= 4 && bloque.includes(token))
}

export function rankNearbyIglesias(
  items: IglesiaOption[],
  userLat: number,
  userLng: number,
  userArea: UserArea
): NearbyIglesiaResult[] {
  const tokens = cityTokens(userArea)
  const withCoords: NearbyIglesiaResult[] = []
  const byCity: NearbyIglesiaResult[] = []
  const byBloque: NearbyIglesiaResult[] = []
  const seen = new Set<string>()

  for (const item of items) {
    if (hasValidCoords(item)) {
      withCoords.push({
        ...item,
        distanceKm: haversineKm(userLat, userLng, item.lat, item.lng),
        matchType: 'coordinates'
      })
      seen.add(item.id)
    }
  }

  withCoords.sort((a, b) => (a.distanceKm ?? 0) - (b.distanceKm ?? 0))

  const cityCandidates = items
    .filter((item) => !seen.has(item.id))
    .map((item) => ({ item, score: scoreCityMatch(item, tokens) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)

  for (const { item } of cityCandidates) {
    byCity.push({
      ...item,
      distanceKm: null,
      matchType: 'city'
    })
    seen.add(item.id)
  }

  for (const item of items) {
    if (seen.has(item.id)) continue
    if (matchesBloque(item, tokens)) {
      byBloque.push({
        ...item,
        distanceKm: null,
        matchType: 'bloque'
      })
      seen.add(item.id)
    }
  }

  return [...withCoords, ...byCity, ...byBloque]
}
