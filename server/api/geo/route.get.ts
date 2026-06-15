import type { TravelProfile } from '#shared/types/routing'
import { fetchOsrmRoute } from '../../utils/osrm'

const PROFILES = new Set<TravelProfile>(['foot', 'driving'])

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const fromLat = Number(query.fromLat)
  const fromLng = Number(query.fromLng)
  const toLat = Number(query.toLat)
  const toLng = Number(query.toLng)
  const profile = String(query.profile ?? 'foot') as TravelProfile

  if (![fromLat, fromLng, toLat, toLng].every(Number.isFinite)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Coordenadas inválidas'
    })
  }

  if (!PROFILES.has(profile)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Perfil de ruta no válido'
    })
  }

  return fetchOsrmRoute(fromLat, fromLng, toLat, toLng, profile)
})
