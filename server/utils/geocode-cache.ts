import type { IglesiaOption } from '#shared/types/iglesia'
import { hasValidCoords } from '#shared/utils/geo'
import { geocodeIglesia } from './geocode'

const cache = new Map<string, { lat: number; lng: number }>()

export async function resolveIglesiaCoords(
  item: IglesiaOption
): Promise<{ lat: number; lng: number } | null> {
  if (hasValidCoords(item)) {
    return { lat: item.lat, lng: item.lng }
  }

  const cached = cache.get(item.id)
  if (cached) {
    return cached
  }

  const geocoded = await geocodeIglesia({
    name: item.name,
    direccion: item.direccion,
    bloque: item.bloque
  })

  if (!geocoded) {
    return null
  }

  const coords = { lat: geocoded.lat, lng: geocoded.lng }
  cache.set(item.id, coords)
  return coords
}
