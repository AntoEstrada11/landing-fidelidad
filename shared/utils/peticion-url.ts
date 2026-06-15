export interface PeticionUrlParams {
  nombres?: string
  apellidos?: string
  iglesia?: string
  importe?: number | string
  peticion?: string
  fecha?: string
}

export function buildPeticionUrl(params: PeticionUrlParams, basePath = '/peticion.html'): string {
  const search = new URLSearchParams()
  if (params.nombres) search.set('nombres', params.nombres)
  if (params.apellidos) search.set('apellidos', params.apellidos)
  if (params.iglesia) search.set('iglesia', params.iglesia)
  if (params.importe !== undefined && params.importe !== '') {
    search.set('importe', String(params.importe))
  }
  if (params.peticion) search.set('peticion', params.peticion)
  if (params.fecha) search.set('fecha', params.fecha)
  const query = search.toString()
  return query ? `${basePath}?${query}` : basePath
}
