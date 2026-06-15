import type { UserArea, GeocodedPlace } from '#shared/types/geo'
import { extractLocalityFromName } from '#shared/utils/geo'

export type { GeocodedPlace }

const NOMINATIM_HEADERS = {
  'User-Agent': 'landing-fidelidad/1.0 (fidelidad contacto@ejemplo.com)'
}

type NominatimSearchHit = {
  lat: string
  lon: string
  display_name?: string
}

async function nominatimSearch(query: string): Promise<GeocodedPlace | null> {
  const params = new URLSearchParams({
    q: query,
    format: 'json',
    limit: '1',
    countrycodes: 'mx',
    'accept-language': 'es'
  })

  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/search?${params}`, {
      headers: NOMINATIM_HEADERS,
      signal: AbortSignal.timeout(8000)
    })

    if (!response.ok) return null

    const data = (await response.json()) as NominatimSearchHit[]
    const hit = data[0]
    if (!hit) return null

    const lat = Number(hit.lat)
    const lng = Number(hit.lon)
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null

    return {
      lat,
      lng,
      label: hit.display_name ?? query
    }
  } catch {
    return null
  }
}

export async function geocodeIglesia(opts: {
  name: string
  direccion?: string
  bloque?: string
}): Promise<GeocodedPlace | null> {
  const locality =
    extractLocalityFromName(opts.name) ||
    opts.bloque?.replace(/^bloque\s+/i, '').replace(/\s*\([^)]*\)/, '').trim() ||
    ''

  const queries = [
    opts.direccion?.trim() ? `${opts.direccion.trim()}, México` : null,
    locality
      ? `Iglesia Universal del Reino de Dios ${opts.name}, ${locality}, México`
      : null,
    locality ? `${opts.name}, ${locality}, México` : null,
    `Iglesia Universal ${opts.name}, México`
  ].filter((query): query is string => Boolean(query))

  for (const query of queries) {
    const hit = await nominatimSearch(query)
    if (hit) return hit
  }

  return null
}

type NominatimReverse = {
  display_name?: string
  address?: {
    city?: string
    town?: string
    village?: string
    municipality?: string
    county?: string
    state?: string
    suburb?: string
    neighbourhood?: string
    city_district?: string
    borough?: string
  }
}

export async function reverseGeocode(lat: number, lng: number): Promise<UserArea> {
  const params = new URLSearchParams({
    lat: String(lat),
    lon: String(lng),
    format: 'json',
    'accept-language': 'es'
  })

  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?${params}`, {
      headers: NOMINATIM_HEADERS,
      signal: AbortSignal.timeout(8000)
    })

    if (!response.ok) {
      throw new Error('Reverse geocode failed')
    }

    const data = (await response.json()) as NominatimReverse
    const address = data.address ?? {}

    return {
      city: address.city ?? address.town ?? address.village ?? '',
      municipality: address.municipality ?? address.county ?? '',
      state: address.state ?? '',
      suburb:
        address.suburb ??
        address.neighbourhood ??
        address.city_district ??
        address.borough ??
        '',
      displayName: data.display_name ?? ''
    }
  } catch {
    return {
      city: '',
      municipality: '',
      state: '',
      suburb: '',
      displayName: ''
    }
  }
}
