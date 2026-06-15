import type { CheckoutSessionResponse, FidelidadPaymentSession } from '#shared/types/payment'
import { FIDELIDAD_PAYMENT_SESSION_KEY } from '#shared/types/payment'
import type { NavigationContext } from '#shared/utils/maps'
import { buildPeticionUrl } from '#shared/utils/peticion-url'
import { flushAnalytics } from '~/composables/useAnalytics'

export interface StartCheckoutInput {
  nombres: string
  apellidos: string
  correo?: string
  telefono: string
  importe: number
  iglesiaId: string
  iglesiaNombre: string
  iglesiaBloque?: string
  peticion?: string
  navigation?: NavigationContext | null
}

export function useFidelidadPayment() {
  const { trackPayment, trackError, sessionId } = useAnalytics()
  const checkoutUrl = ref('')
  const preferenceId = ref('')
  const externalReference = ref('')
  const submitting = ref(false)
  const submitError = ref('')
  const savedNavigation = ref<NavigationContext | null>(null)

  function saveSession(input: StartCheckoutInput, session: CheckoutSessionResponse) {
    if (!import.meta.client) return

    const payload: FidelidadPaymentSession = {
      checkoutUrl: session.checkoutUrl,
      preferenceId: session.preferenceId,
      externalReference: session.externalReference,
      peticion: {
        nombres: input.nombres,
        apellidos: input.apellidos,
        iglesia: input.iglesiaNombre,
        importe: input.importe,
        peticion: input.peticion
      },
      navigation: input.navigation ?? undefined,
      createdAt: Date.now()
    }

    savedNavigation.value = input.navigation ?? null
    sessionStorage.setItem(FIDELIDAD_PAYMENT_SESSION_KEY, JSON.stringify(payload))
  }

  function restoreSession(): FidelidadPaymentSession | null {
    if (!import.meta.client) return null

    const raw = sessionStorage.getItem(FIDELIDAD_PAYMENT_SESSION_KEY)
    if (!raw) return null

    try {
      const parsed = JSON.parse(raw) as FidelidadPaymentSession
      if (!parsed.checkoutUrl || !parsed.peticion) return null

      checkoutUrl.value = parsed.checkoutUrl
      preferenceId.value = parsed.preferenceId
      externalReference.value = parsed.externalReference
      savedNavigation.value = parsed.navigation ?? null
      return parsed
    } catch {
      return null
    }
  }

  function clearSession() {
    if (!import.meta.client) return
    sessionStorage.removeItem(FIDELIDAD_PAYMENT_SESSION_KEY)
    checkoutUrl.value = ''
    preferenceId.value = ''
    externalReference.value = ''
    savedNavigation.value = null
  }

  function openPeticionSheet(session: FidelidadPaymentSession) {
    const url = buildPeticionUrl(session.peticion)
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  function goToCheckout(url = checkoutUrl.value) {
    if (!import.meta.client || !url) return
    trackPayment('payment.redirect_gateway', {
      phase: 'redirect',
      meta: { preferenceId: preferenceId.value }
    })
    void flushAnalytics()
    window.location.assign(url)
  }
  async function startCheckout(input: StartCheckoutInput): Promise<boolean> {
    submitting.value = true
    submitError.value = ''

    trackPayment('payment.checkout_request', {
      phase: 'request',
      section: 'voto',
      meta: { importe: input.importe, iglesiaId: input.iglesiaId }
    })

    try {
      const session = await $fetch<CheckoutSessionResponse>('/api/payments/checkout', {
        method: 'POST',
        body: {
          nombres: input.nombres,
          apellidos: input.apellidos,
          correo: input.correo,
          telefono: input.telefono,
          importe: input.importe,
          iglesiaId: input.iglesiaId,
          iglesiaNombre: input.iglesiaNombre,
          iglesiaBloque: input.iglesiaBloque,
          peticion: input.peticion,
          analyticsSessionId: sessionId.value
        }
      })

      checkoutUrl.value = session.checkoutUrl
      preferenceId.value = session.preferenceId
      externalReference.value = session.externalReference
      saveSession(input, session)

      trackPayment('payment.checkout_ready', {
        phase: 'gate',
        meta: {
          preferenceId: session.preferenceId,
          externalReference: session.externalReference
        }
      })

      return true
    } catch (err: unknown) {
      const fetchErr = err as { statusMessage?: string; message?: string; statusCode?: number }
      submitError.value =
        fetchErr.statusMessage ||
        fetchErr.message ||
        'No se pudo preparar el pago. Verifica tu conexión e intenta de nuevo.'

      trackError('payment.checkout_failed', err, {
        context: 'payment',
        phase: 'request',
        message: submitError.value,
        meta: { statusCode: fetchErr.statusCode ?? null }
      })

      return false    } finally {
      submitting.value = false
    }
  }

  return {
    checkoutUrl,
    preferenceId,
    externalReference,
    savedNavigation,
    submitting,
    submitError,
    startCheckout,
    restoreSession,
    clearSession,
    openPeticionSheet,
    goToCheckout
  }
}
