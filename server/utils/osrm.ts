import type { TravelProfile } from '#shared/types/routing'
import { parseOsrmRoute, type OsrmResponse } from './osrm-parse'

const OSRM_BASE = 'https://router.project-osrm.org/route/v1'

export async function fetchOsrmRoute(
  fromLat: number,
  fromLng: number,
  toLat: number,
  toLng: number,
  profile: TravelProfile
) {
  const coords = `${fromLng},${fromLat};${toLng},${toLat}`
  const params = new URLSearchParams({
    overview: 'full',
    geometries: 'geojson',
    steps: 'true',
    alternatives: 'false'
  })

  const response = await fetch(`${OSRM_BASE}/${profile}/${coords}?${params}`, {
    signal: AbortSignal.timeout(12000)
  })

  if (!response.ok) {
    throw new Error('No se pudo calcular la ruta')
  }

  const data = (await response.json()) as OsrmResponse
  if (data.code !== 'Ok') {
    throw new Error('No hay ruta disponible entre tu ubicación y el templo')
  }

  const parsed = parseOsrmRoute(profile, data)
  if (!parsed) {
    throw new Error('No se pudo interpretar la ruta')
  }

  return parsed
}
