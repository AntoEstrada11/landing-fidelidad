export interface FidelidadCheckoutPayload {
  nombres: string
  apellidos: string
  correo?: string
  telefono: string
  importe: number
  iglesiaId: string
  iglesiaNombre: string
  iglesiaBloque?: string
  peticion?: string
}

export interface CheckoutSessionResponse {
  preferenceId: string
  checkoutUrl: string
  externalReference: string
}

export interface FidelidadPaymentSession {
  checkoutUrl: string
  preferenceId: string
  externalReference: string
  peticion: {
    nombres: string
    apellidos: string
    iglesia: string
    importe: number
    peticion?: string
  }
  navigation?: import('#shared/utils/maps').NavigationContext
  createdAt: number
}

export const FIDELIDAD_PAYMENT_SESSION_KEY = 'fidelidad-payment-session'
