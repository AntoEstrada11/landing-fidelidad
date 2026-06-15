import type { IglesiaBloqueRaw, IglesiasApiResponse } from '#shared/types/iglesia'
import { buildIglesiasFromRawBloques } from './iglesias-catalog'

export async function fetchIglesiasFromSelectorApi(opts: {
  url: string
  key: string
  timeoutMs: number
}): Promise<IglesiasApiResponse> {
  if (!opts.url) {
    throw new Error('IGLESIAS_API_URL no está configurada')
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), opts.timeoutMs)

  try {
    const headers: Record<string, string> = { Accept: 'application/json' }
    if (opts.key.trim()) {
      headers['X-API-Key'] = opts.key.trim()
    }

    const res = await fetch(opts.url, { headers, signal: controller.signal })

    if (!res.ok) {
      throw new Error(`Selector API HTTP ${res.status}`)
    }

    const data = await res.json()
    if (!Array.isArray(data)) {
      throw new Error('Formato inválido: se esperaba un array de bloques')
    }

    return buildIglesiasFromRawBloques(data as IglesiaBloqueRaw[], 'api')
  } finally {
    clearTimeout(timeout)
  }
}
