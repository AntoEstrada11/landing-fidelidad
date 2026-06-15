import type {
  IglesiaBloque,
  IglesiaBloqueRaw,
  IglesiaOption,
  IglesiaRawEntry,
  IglesiasApiResponse
} from '#shared/types/iglesia'
import { slugify } from './slug'
import rawCatalog from '../data/iglesias-bloques.json'

function buildIglesiaId(bloqueId: string, name: string, occurrence: number): string {
  const nameSlug = slugify(name) || 'iglesia'
  if (occurrence === 0) {
    return `${bloqueId}|${nameSlug}`
  }
  return `${bloqueId}|${nameSlug}-${occurrence + 1}`
}

function parseRawIglesiaEntry(entry: IglesiaRawEntry): {
  name: string
  direccion?: string
  lat?: number
  lng?: number
} | null {
  if (typeof entry === 'string') {
    const name = entry.trim()
    return name ? { name } : null
  }

  const name = entry?.nombre?.trim()
  if (!name) return null

  return {
    name,
    direccion: entry.direccion?.trim() || undefined,
    lat: typeof entry.lat === 'number' ? entry.lat : undefined,
    lng: typeof entry.lng === 'number' ? entry.lng : undefined
  }
}

function normalizeRawCatalog(raw: IglesiaBloqueRaw[]): IglesiaBloque[] {
  const bloques: IglesiaBloque[] = []

  for (const entry of raw) {
    const bloqueLabel = entry.bloque?.trim()
    if (!bloqueLabel) {
      continue
    }

    const bloqueId = slugify(bloqueLabel) || `bloque-${bloques.length}`
    const nameCounts = new Map<string, number>()
    const iglesias: IglesiaOption[] = []

    for (const rawItem of entry.iglesias ?? []) {
      const parsed = parseRawIglesiaEntry(rawItem)
      if (!parsed) {
        continue
      }

      const occurrence = nameCounts.get(parsed.name) ?? 0
      nameCounts.set(parsed.name, occurrence + 1)

      iglesias.push({
        id: buildIglesiaId(bloqueId, parsed.name, occurrence),
        name: parsed.name,
        bloque: bloqueLabel,
        bloqueId,
        ...(parsed.direccion ? { direccion: parsed.direccion } : {}),
        ...(parsed.lat !== undefined ? { lat: parsed.lat } : {}),
        ...(parsed.lng !== undefined ? { lng: parsed.lng } : {})
      })
    }

    if (iglesias.length === 0) {
      continue
    }

    iglesias.sort((a, b) => a.name.localeCompare(b.name, 'es'))

    bloques.push({
      bloque: bloqueLabel,
      bloqueId,
      iglesias
    })
  }

  return bloques
}

function flattenBloques(bloques: IglesiaBloque[]): IglesiaOption[] {
  return bloques.flatMap((bloque) => bloque.iglesias)
}

export function buildIglesiasFromRawBloques(
  raw: IglesiaBloqueRaw[],
  source: IglesiasApiResponse['source'] = 'json'
): IglesiasApiResponse {
  const bloques = normalizeRawCatalog(raw)
  const items = flattenBloques(bloques)

  return {
    source,
    bloques,
    items,
    meta: {
      totalBloques: bloques.length,
      totalIglesias: items.length,
      ...(source === 'json' ? { sourceFile: 'server/data/iglesias-bloques.json' } : {})
    }
  }
}

export function loadIglesiasFromJson(): IglesiasApiResponse {
  return buildIglesiasFromRawBloques(rawCatalog as IglesiaBloqueRaw[], 'json')
}

export function buildApiResponseFromFlatItems(
  source: IglesiasApiResponse['source'],
  items: Array<{ id: string | number; name: string; bloque?: string }>,
  bloqueLabel = 'General'
): IglesiasApiResponse {
  const bloqueId = slugify(bloqueLabel) || 'general'
  const iglesias: IglesiaOption[] = items.map((item) => ({
    id: String(item.id),
    name: item.name,
    bloque: item.bloque ?? bloqueLabel,
    bloqueId: item.bloque ? slugify(item.bloque) : bloqueId
  }))

  const bloques: IglesiaBloque[] = [
    {
      bloque: bloqueLabel,
      bloqueId,
      iglesias
    }
  ]

  return {
    source,
    bloques,
    items: iglesias,
    meta: {
      totalBloques: bloques.length,
      totalIglesias: iglesias.length
    }
  }
}
