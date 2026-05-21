export interface IglesiaOption {
  /** Identificador estable (slug): `{bloqueId}|{iglesiaSlug}` */
  id: string
  name: string
  bloque: string
  bloqueId: string
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

export type IglesiasSource = 'json' | 'odoo' | 'fallback'

export interface IglesiasApiResponse {
  source: IglesiasSource
  bloques: IglesiaBloque[]
  /** Lista plana para consumo simple (filtros, autocompletado, etc.) */
  items: IglesiaOption[]
  meta: IglesiasApiMeta
}

/** Formato crudo del archivo `server/data/iglesias-bloques.json` */
export interface IglesiaBloqueRaw {
  bloque: string
  iglesias: string[]
}
