import type { FidelidadCheckoutPayload } from '#shared/types/payment'

type MercadoPagoPreferenceResponse = {
  id: string
  init_point?: string
  sandbox_init_point?: string
}

export async function createMercadoPagoPreference(opts: {
  payload: FidelidadCheckoutPayload
  externalReference: string
  siteUrl: string
}): Promise<{ preferenceId: string; checkoutUrl: string }> {
  const config = useRuntimeConfig()
  const accessToken = String(config.mercadopago.accessToken ?? '').trim()

  if (!accessToken) {
    throw createError({
      statusCode: 503,
      statusMessage: 'La pasarela de pago no está configurada. Contacta al administrador.'
    })
  }

  const sandbox = config.mercadopago.sandbox !== false
  const { payload, externalReference, siteUrl } = opts
  const returnUrl = `${siteUrl}/pago/resultado`

  const body = {
    items: [
      {
        title: 'Voto de fidelidad a Dios',
        description: payload.iglesiaNombre
          ? `Iglesia: ${payload.iglesiaNombre}`
          : 'Voto de fidelidad',
        quantity: 1,
        unit_price: Number(payload.importe.toFixed(2)),
        currency_id: 'MXN'
      }
    ],
    payer: {
      name: payload.nombres.trim(),
      surname: payload.apellidos.trim(),
      email: payload.correo?.trim() || undefined,
      phone: payload.telefono.trim()
        ? { number: payload.telefono.trim().replace(/\D/g, '') }
        : undefined
    },
    back_urls: {
      success: returnUrl,
      failure: returnUrl,
      pending: returnUrl
    },
    auto_return: 'approved',
    external_reference: externalReference,
    statement_descriptor: 'FIDELIDAD',
    metadata: {
      iglesia_id: payload.iglesiaId,
      iglesia_nombre: payload.iglesiaNombre,
      iglesia_bloque: payload.iglesiaBloque ?? '',
      telefono: payload.telefono,
      peticion: payload.peticion?.slice(0, 250) ?? ''
    }
  }

  const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(15000)
  })

  if (!response.ok) {
    const detail = await response.text().catch(() => '')
    throw createError({
      statusCode: 502,
      statusMessage: 'No se pudo iniciar el pago. Intenta de nuevo en unos momentos.',
      data: detail.slice(0, 300)
    })
  }

  const data = (await response.json()) as MercadoPagoPreferenceResponse
  const checkoutUrl = sandbox ? data.sandbox_init_point : data.init_point

  if (!checkoutUrl) {
    throw createError({
      statusCode: 502,
      statusMessage: 'La pasarela no devolvió un enlace de pago válido.'
    })
  }

  return {
    preferenceId: data.id,
    checkoutUrl
  }
}
