import { IGLESIAS_FALLBACK } from '#shared/constants/iglesias-fallback'
import type { IglesiasApiResponse } from '#shared/types/iglesia'
import { buildApiResponseFromFlatItems, loadIglesiasFromJson } from '../utils/iglesias-catalog'
import { fetchIglesiasFromOdoo } from '../utils/iglesias'

export default defineCachedEventHandler(
  async (event): Promise<IglesiasApiResponse> => {
    const config = useRuntimeConfig(event)
    const source = config.iglesias.source as 'json' | 'odoo'

    if (source === 'odoo') {
      try {
        const odoo = config.odoo
        const result = await fetchIglesiasFromOdoo({
          url: odoo.url,
          db: odoo.db,
          username: odoo.username,
          password: odoo.password,
          churchModel: odoo.churchModel,
          churchDomain: odoo.churchDomain,
          churchNameField: odoo.churchNameField,
          churchLimit: odoo.churchLimit,
          appendOtras: odoo.appendOtras,
          useFallback: false
        })

        return buildApiResponseFromFlatItems(
          'odoo',
          result.items.map((item) => ({
            id: String(item.id),
            name: item.name
          })),
          'Odoo'
        )
      } catch (error) {
        if (config.odoo.fallbackOnError) {
          console.error('[api/iglesias] Odoo error, usando JSON local:', error)
          return loadIglesiasFromJson()
        }
        throw createError({
          statusCode: 502,
          statusMessage: 'No se pudieron cargar las iglesias desde Odoo',
          message: error instanceof Error ? error.message : 'Error desconocido'
        })
      }
    }

    try {
      return loadIglesiasFromJson()
    } catch (error) {
      console.error('[api/iglesias] Error leyendo catálogo JSON:', error)
      return IGLESIAS_FALLBACK
    }
  },
  {
    maxAge: 60 * 15,
    name: 'iglesias',
    getKey: (event) => {
      const source = useRuntimeConfig(event).iglesias.source
      return `catalog-${source}`
    }
  }
)
