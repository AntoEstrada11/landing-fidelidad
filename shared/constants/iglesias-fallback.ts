import type { IglesiasApiResponse } from '../types/iglesia'

const fallbackIglesias = [
  {
    id: 'tacubaya|sede-nacional-tacubaya-miguel-hidalgo',
    name: 'SEDE NACIONAL TACUBAYA-MIGUEL HIDALGO',
    bloque: 'TACUBAYA',
    bloqueId: 'tacubaya'
  },
  {
    id: 'general|otras',
    name: 'Otras',
    bloque: 'TACUBAYA',
    bloqueId: 'tacubaya'
  }
]

/** Respaldo mínimo si falla la carga del catálogo. */
export const IGLESIAS_FALLBACK: IglesiasApiResponse = {
  source: 'fallback',
  bloques: [
    {
      bloque: 'TACUBAYA',
      bloqueId: 'tacubaya',
      iglesias: fallbackIglesias
    }
  ],
  items: fallbackIglesias,
  meta: {
    totalBloques: 1,
    totalIglesias: fallbackIglesias.length
  }
}
