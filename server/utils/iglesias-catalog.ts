import type {
  IglesiaBloque,
  IglesiaBloqueRaw,
  IglesiaOption,
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

    for (const rawName of entry.iglesias ?? []) {
      const name = rawName?.trim()
      if (!name) {
        continue
      }

      const occurrence = nameCounts.get(name) ?? 0
      nameCounts.set(name, occurrence + 1)

      iglesias.push({
        id: buildIglesiaId(bloqueId, name, occurrence),
        name,
        bloque: bloqueLabel,
        bloqueId
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

export function loadIglesiasFromJson(): IglesiasApiResponse {
  const bloques = normalizeRawCatalog(rawCatalog as IglesiaBloqueRaw[])
  const items = flattenBloques(bloques)

  return {
    source: 'json',
    bloques,
    items,
    meta: {
      totalBloques: bloques.length,
      totalIglesias: items.length,
      sourceFile: 'server/data/iglesias-bloques.json'
    }
  }
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
