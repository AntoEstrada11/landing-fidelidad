import { geocodeIglesia } from '../../utils/geocode'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const name = String(query.name ?? '').trim()

  if (!name) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Se requiere el nombre de la iglesia'
    })
  }

  const result = await geocodeIglesia({
    name,
    direccion: String(query.direccion ?? '').trim() || undefined,
    bloque: String(query.bloque ?? '').trim() || undefined
  })

  if (!result) {
    throw createError({
      statusCode: 404,
      statusMessage: 'No se pudo ubicar el templo en el mapa'
    })
  }

  return result
})
