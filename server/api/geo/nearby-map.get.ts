import type { IglesiaOption } from '#shared/types/iglesia'
import { haversineKm, rankNearbyIglesias } from '#shared/utils/geo'
import { reverseGeocode } from '../../utils/geocode'
import { resolveIglesiaCoords } from '../../utils/geocode-cache'
import { loadIglesiasFromJson } from '../../utils/iglesias-catalog'

const MAX_GEOCODE = 20
const MAX_MARKERS = 10
const GEOCODE_CONCURRENCY = 3

async function mapWithConcurrency<T, R>(
  items: T[],
  concurrency: number,
  fn: (item: T) => Promise<R>
): Promise<R[]> {
  const results: R[] = []

  for (let index = 0; index < items.length; index += concurrency) {
    const chunk = items.slice(index, index + concurrency)
    const chunkResults = await Promise.all(chunk.map(fn))
    results.push(...chunkResults)
  }

  return results
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const lat = Number(query.lat)
  const lng = Number(query.lng)

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Se requieren lat y lng válidos'
    })
  }

  const userArea = await reverseGeocode(lat, lng)
  const catalog = loadIglesiasFromJson()
  const ranked = rankNearbyIglesias(catalog.items, lat, lng, userArea)

  const candidateIds = new Set<string>()
  const candidates: IglesiaOption[] = []

  for (const entry of ranked) {
    if (candidates.length >= MAX_GEOCODE) break
    if (candidateIds.has(entry.id)) continue

    const item = catalog.items.find((church) => church.id === entry.id)
    if (!item) continue

    candidateIds.add(entry.id)
    candidates.push(item)
  }

  const resolved = await mapWithConcurrency(candidates, GEOCODE_CONCURRENCY, async (item) => {
    const coords = await resolveIglesiaCoords(item)
    if (!coords) return null

    return {
      id: item.id,
      name: item.name,
      bloque: item.bloque,
      bloqueId: item.bloqueId,
      direccion: item.direccion,
      lat: coords.lat,
      lng: coords.lng,
      distanceKm: haversineKm(lat, lng, coords.lat, coords.lng)
    }
  })

  const iglesias = resolved
    .filter((item): item is NonNullable<typeof item> => item !== null)
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, MAX_MARKERS)

  return {
    user: { lat, lng },
    userArea,
    iglesias,
    nearestId: iglesias[0]?.id ?? null
  }
})
