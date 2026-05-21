type JsonRpcResponse<T> = {
  jsonrpc: string
  id: number
  result?: T
  error?: {
    code: number
    message: string
    data?: { message?: string; name?: string }
  }
}

export type OdooConfig = {
  url: string
  db: string
  username: string
  password: string
}

export async function odooCall<T>(
  baseUrl: string,
  service: string,
  method: string,
  args: unknown[]
): Promise<T> {
  const url = `${baseUrl.replace(/\/$/, '')}/jsonrpc`

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      method: 'call',
      params: { service, method, args },
      id: Date.now()
    })
  })

  if (!response.ok) {
    throw new Error(`Odoo HTTP ${response.status}: ${response.statusText}`)
  }

  const payload = (await response.json()) as JsonRpcResponse<T>

  if (payload.error) {
    const detail = payload.error.data?.message || payload.error.message
    throw new Error(`Odoo: ${detail}`)
  }

  return payload.result as T
}

export async function odooAuthenticate(config: OdooConfig): Promise<number> {
  const uid = await odooCall<number | false>(config.url, 'common', 'authenticate', [
    config.db,
    config.username,
    config.password,
    {}
  ])

  if (!uid || typeof uid !== 'number') {
    throw new Error('Credenciales Odoo inválidas')
  }

  return uid
}

export async function odooSearchRead<T extends Record<string, unknown>>(
  config: OdooConfig,
  uid: number,
  model: string,
  domain: unknown[],
  options: { fields: string[]; limit?: number; order?: string }
): Promise<T[]> {
  const kwargs: Record<string, unknown> = {
    fields: options.fields,
    order: options.order ?? 'name asc'
  }

  if (options.limit) {
    kwargs.limit = options.limit
  }

  return odooCall<T[]>(config.url, 'object', 'execute_kw', [
    config.db,
    uid,
    config.password,
    model,
    'search_read',
    [domain],
    kwargs
  ])
}
