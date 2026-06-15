<template>
  <main class="lp-payment-result">
    <div class="lp-payment-result__card">
      <p class="lp-payment-result__eyebrow">Voto de fidelidad</p>
      <h1>{{ headline }}</h1>
      <p class="lp-payment-result__message">{{ message }}</p>

      <div v-if="session" class="lp-payment-result__summary">
        <p><span>Monto</span><strong>{{ formatImporte(session.peticion.importe) }}</strong></p>
        <p><span>Iglesia</span><strong>{{ session.peticion.iglesia }}</strong></p>
      </div>

      <div class="lp-payment-result__actions">
        <button
          v-if="isApproved && session"
          type="button"
          class="lp-btn lp-btn--primary lp-btn--lg lp-btn--block"
          @click="openPeticion"
        >
          Abrir hoja de petición
        </button>

        <button
          v-if="isPending && session?.checkoutUrl"
          type="button"
          class="lp-btn lp-btn--primary lp-btn--lg lp-btn--block"
          @click="goToCheckout(session.checkoutUrl)"
        >
          Ver instrucciones de pago
        </button>

        <button
          v-if="isFailure && session?.checkoutUrl"
          type="button"
          class="lp-btn lp-btn--primary lp-btn--lg lp-btn--block"
          @click="goToCheckout(session.checkoutUrl)"
        >
          Reintentar pago
        </button>

        <NuxtLink to="/#voto" class="lp-btn lp-btn--ghost-dark lp-btn--block">
          Volver al inicio
        </NuxtLink>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import type { FidelidadPaymentSession } from '#shared/types/payment'
import { FIDELIDAD_PAYMENT_SESSION_KEY } from '#shared/types/payment'
import { formatImporte } from '#shared/utils/iglesia-search'

const route = useRoute()
const { openPeticionSheet, goToCheckout, clearSession } = useFidelidadPayment()
const { trackPayment } = useAnalytics()

const session = ref<FidelidadPaymentSession | null>(null)

const paymentStatus = computed(() => {
  const raw =
    String(route.query.collection_status ?? '') ||
    String(route.query.status ?? '') ||
    String(route.query.outcome ?? '')
  return raw.toLowerCase()
})

const isApproved = computed(() =>
  ['approved', 'success', 'accredited'].includes(paymentStatus.value)
)
const isPending = computed(() =>
  ['pending', 'in_process', 'in_mediation'].includes(paymentStatus.value)
)
const isFailure = computed(() =>
  ['rejected', 'failure', 'cancelled', 'refunded', 'charged_back'].includes(paymentStatus.value)
)

const headline = computed(() => {
  if (isApproved.value) return '¡Pago recibido!'
  if (isPending.value) return 'Pago pendiente'
  if (isFailure.value) return 'Pago no completado'
  return 'Resultado del pago'
})

const message = computed(() => {
  if (isApproved.value) {
    return 'Tu voto de fidelidad quedó registrado. Abriremos tu hoja de petición para que la imprimas y lleves al altar.'
  }
  if (isPending.value) {
    return 'Tu pago está en proceso (por ejemplo, depósito en OXXO). Cuando se confirme, podrás imprimir tu hoja de petición.'
  }
  if (isFailure.value) {
    return 'El pago no se completó. Puedes intentarlo de nuevo con el mismo enlace o regresar al formulario.'
  }
  return 'Revisa el estado de tu pago. Si ya pagaste, abre tu hoja de petición.'
})

function openPeticion() {
  if (!session.value) return
  openPeticionSheet(session.value)
}

function loadSession() {
  if (!import.meta.client) return

  const raw = sessionStorage.getItem(FIDELIDAD_PAYMENT_SESSION_KEY)
  if (!raw) return

  try {
    session.value = JSON.parse(raw) as FidelidadPaymentSession
  } catch {
    session.value = null
  }
}

onMounted(() => {
  loadSession()

  let resultAction = 'payment.result_unknown'

  if (isApproved.value) resultAction = 'payment.result_approved'
  else if (isPending.value) resultAction = 'payment.result_pending'
  else if (isFailure.value) resultAction = 'payment.result_failed'

  trackPayment(resultAction, {
    phase: 'result',
    section: 'pago_resultado',
    meta: { status: paymentStatus.value || 'unknown' }
  })

  if (isApproved.value && session.value) {
    openPeticionSheet(session.value)
    clearSession()
  }
})

useHead({
  title: 'Resultado del pago · Fidelidad a Dios'
})
</script>

<style scoped>
.lp-payment-result {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  background: linear-gradient(165deg, #1a1510 0%, #2c2416 45%, #1a1510 100%);
}

.lp-payment-result__card {
  width: min(100%, 28rem);
  padding: 1.75rem 1.5rem;
  border-radius: var(--lp-radius-lg, 12px);
  background: var(--lp-paper, #fff);
  box-shadow: 0 18px 48px rgba(0, 0, 0, 0.28);
}

.lp-payment-result__eyebrow {
  margin: 0 0 0.35rem;
  font-size: 0.72rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--lp-text-muted-light, #6b5b4a);
}

.lp-payment-result__card h1 {
  margin: 0 0 0.75rem;
  font-size: 1.45rem;
  color: var(--lp-text-on-light, #2c2416);
}

.lp-payment-result__message {
  margin: 0 0 1.25rem;
  font-size: 0.92rem;
  line-height: 1.55;
  color: var(--lp-text-muted-light, #6b5b4a);
}

.lp-payment-result__summary {
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
  margin-bottom: 1.25rem;
  padding: 0.85rem 1rem;
  border-radius: var(--lp-radius-md, 8px);
  background: #faf9f7;
  border: 1px solid var(--lp-border-on-light, #ddd5c8);
}

.lp-payment-result__summary p {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  margin: 0;
  font-size: 0.85rem;
}

.lp-payment-result__summary span {
  color: var(--lp-text-muted-light, #6b5b4a);
}

.lp-payment-result__actions {
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
}
</style>
