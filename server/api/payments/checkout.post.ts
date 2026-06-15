import type { CheckoutSessionResponse, FidelidadCheckoutPayload } from '#shared/types/payment'
import { logServerAnalytics } from '../../utils/analytics-log'
import { createMercadoPagoPreference } from '../../utils/mercadopago'
import { getSiteUrl } from '../../utils/site-url'

function readString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

function readNumber(value: unknown): number | null {
  const num = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(num) ? num : null
}

export default defineEventHandler(async (event): Promise<CheckoutSessionResponse> => {
  const body = await readBody<
    Partial<FidelidadCheckoutPayload> & { analyticsSessionId?: string }
  >(event)

  const analyticsSessionId = readString(body.analyticsSessionId) || 'anonymous-server'

  async function logPayment(
    action: string,
    details: { phase?: string; message?: string; meta?: Record<string, string | number | boolean | null> }
  ) {
    await logServerAnalytics(analyticsSessionId, [
      {
        type: 'payment',
        action,
        context: 'payment',
        phase: details.phase,
        message: details.message,
        meta: details.meta
      }
    ]).catch(() => {})
  }

  const payload: FidelidadCheckoutPayload = {
    nombres: readString(body.nombres),
    apellidos: readString(body.apellidos),
    correo: readString(body.correo) || undefined,
    telefono: readString(body.telefono),
    importe: readNumber(body.importe) ?? 0,
    iglesiaId: readString(body.iglesiaId),
    iglesiaNombre: readString(body.iglesiaNombre),
    iglesiaBloque: readString(body.iglesiaBloque) || undefined,
    peticion: readString(body.peticion) || undefined
  }

  if (!payload.nombres || !payload.apellidos || !payload.telefono) {
    await logPayment('payment.checkout_validation_error', {
      phase: 'validate',
      message: 'Faltan datos de contacto'
    })
    throw createError({
      statusCode: 400,
      statusMessage: 'Nombre, apellido y teléfono son obligatorios.'
    })
  }

  if (!payload.iglesiaId || !payload.iglesiaNombre) {
    await logPayment('payment.checkout_validation_error', {
      phase: 'validate',
      message: 'Iglesia no seleccionada'
    })
    throw createError({
      statusCode: 400,
      statusMessage: 'Debes seleccionar una iglesia.'
    })
  }

  if (payload.importe < 5) {
    await logPayment('payment.checkout_validation_error', {
      phase: 'validate',
      message: 'Monto inválido',
      meta: { importe: payload.importe }
    })
    throw createError({
      statusCode: 400,
      statusMessage: 'El monto mínimo para pagar en línea es de $5 MXN.'
    })
  }

  const externalReference = `fidelidad-${crypto.randomUUID()}`
  const siteUrl = getSiteUrl(event)

  await logPayment('payment.checkout_start', {
    phase: 'create_preference',
    meta: { importe: payload.importe, iglesiaId: payload.iglesiaId }
  })

  try {
    const { preferenceId, checkoutUrl } = await createMercadoPagoPreference({
      payload,
      externalReference,
      siteUrl
    })

    await logPayment('payment.checkout_created', {
      phase: 'gate_ready',
      meta: { preferenceId, externalReference }
    })

    return {
      preferenceId,
      checkoutUrl,
      externalReference
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error al crear preferencia de pago'
    await logPayment('payment.checkout_provider_error', {
      phase: 'create_preference',
      message
    })
    throw err
  }
})