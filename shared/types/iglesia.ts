export interface IglesiaLocation {
  direccion?: string
  lat?: number
  lng?: number
}

export interface IglesiaOption {
  /** Identificador estable (slug): `{bloqueId}|{iglesiaSlug}` */
  id: string
  name: string
  bloque: string
  bloqueId: string
  direccion?: string
  lat?: number
  lng?: number
}

export interface IglesiaBloque {
  bloque: string
  bloqueId: string
  iglesias: IglesiaOption[]
}

export interface IglesiasApiMeta {
  totalBloques: number
  totalIglesias: number
  sourceFile?: string
}

export type IglesiasSource = 'json' | 'odoo' | 'api' | 'fallback'

export interface IglesiasApiResponse {
  source: IglesiasSource
  bloques: IglesiaBloque[]
  /** Lista plana para consumo simple (filtros, autocompletado, etc.) */
  items: IglesiaOption[]
  meta: IglesiasApiMeta
}

/** Entrada de iglesia en el catálogo crudo (string o objeto con ubicación) */
export type IglesiaRawEntry = string | ({ nombre: string } & IglesiaLocation)

/** Formato crudo del catálogo (JSON local o SELECTOR-IGLESIAS-API) */
export interface IglesiaBloqueRaw {
  bloque: string
  iglesias: IglesiaRawEntry[]
}
