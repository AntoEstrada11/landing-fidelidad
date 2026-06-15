import { rankNearbyIglesias } from '#shared/utils/geo'
import { reverseGeocode } from '../../utils/geocode'
import { loadIglesiasFromJson } from '../../utils/iglesias-catalog'

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

  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Coordenadas fuera de rango'
    })
  }

  const userArea = await reverseGeocode(lat, lng)
  const catalog = loadIglesiasFromJson()
  const iglesias = rankNearbyIglesias(catalog.items, lat, lng, userArea).slice(0, 8)

  return {
    userArea,
    iglesias
  }
})
