import { odooAuthenticate, odooSearchRead, type OdooConfig } from './odoo'

type RuntimeOdoo = {
  url: string
  db: string
  username: string
  password: string
  churchModel: string
  churchDomain: string
  churchNameField: string
  churchLimit: number
  appendOtras: boolean
  useFallback: boolean
}

function parseOdooDomain(raw: string): unknown[] {
  if (!raw.trim()) {
    return []
  }

  try {
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) {
      throw new Error('El dominio debe ser un arreglo JSON')
    }
    return parsed
  } catch {
    throw new Error('ODOO_CHURCH_DOMAIN debe ser JSON válido (ej. [["active","=",true]])')
  }
}

function isOdooConfigured(odoo: RuntimeOdoo): boolean {
  return Boolean(odoo.url && odoo.db && odoo.username && odoo.password)
}

/** Consulta iglesias en Odoo (lista plana con id numérico). */
export async function fetchIglesiasFromOdoo(odoo: RuntimeOdoo): Promise<{
  items: Array<{ id: number; name: string }>
}> {
  if (!isOdooConfigured(odoo)) {
    throw new Error('Odoo no está configurado (revisa ODOO_URL, ODOO_DB, ODOO_USERNAME, ODOO_PASSWORD)')
  }

  const config: OdooConfig = {
    url: odoo.url,
    db: odoo.db,
    username: odoo.username,
    password: odoo.password
  }

  const domain = parseOdooDomain(odoo.churchDomain)
  const uid = await odooAuthenticate(config)

  const records = await odooSearchRead<Record<string, unknown>>(
    config,
    uid,
    odoo.churchModel,
    domain,
    {
      fields: ['id', odoo.churchNameField],
      limit: odoo.churchLimit,
      order: `${odoo.churchNameField} asc`
    }
  )

  const items = records
    .map((record) => {
      const id = Number(record.id)
      const name = String(record[odoo.churchNameField] ?? '').trim()
      if (!Number.isFinite(id) || !name) {
        return null
      }
      return { id, name }
    })
    .filter((item): item is { id: number; name: string } => item !== null)

  if (items.length === 0) {
    throw new Error(`Odoo no devolvió registros en el modelo "${odoo.churchModel}"`)
  }

  if (odoo.appendOtras && !items.some((item) => item.id === 0)) {
    items.push({ id: 0, name: 'Otras' })
  }

  return { items }
}
