<template>
  <div class="lp-payment-gate">
    <h3 class="lp-payment-gate__title">{{ title }}</h3>
    <p class="lp-payment-gate__summary">
      <strong>{{ importeLabel }}</strong>
      <span v-if="iglesiaName"> · {{ iglesiaName }}</span>
    </p>

    <NavigationAppLinks
      v-if="navigation"
      :navigation="navigation"
    />

    <ClientOnly>
      <div v-if="checkoutUrl" class="lp-qr-simple">
        <Qrcode :value="checkoutUrl" variant="pixelated" :radius="0.35" />
        <p>Escanea el código para pagar desde otro celular</p>
      </div>
    </ClientOnly>

    <button
      type="button"
      class="lp-btn lp-btn--primary lp-btn--lg lp-btn--block"
      data-track="payment.open_gateway"
      data-track-section="payment_gate"
      :disabled="!checkoutUrl"
      @click="$emit('pay')"
    >
      Ir a la pasarela de pago
    </button>

    <p v-if="autoRedirect" class="lp-payment-gate__redirect">
      Te llevaremos al pago en {{ countdown }} segundos…
    </p>

    <p class="lp-form__legal">
      Al completar tu pago se abrirá automáticamente tu hoja de petición para imprimir.
    </p>
  </div>
</template>

<script setup lang="ts">
import type { NavigationContext } from '#shared/utils/maps'

const props = withDefaults(
  defineProps<{
    checkoutUrl: string
    importeLabel: string
    iglesiaName?: string
    navigation?: NavigationContext | null
    title?: string
    autoRedirect?: boolean
    redirectDelayMs?: number
  }>(),
  {
    title: 'Paso final · Realiza tu pago',
    iglesiaName: '',
    navigation: null,
    autoRedirect: true,
    redirectDelayMs: 3000
  }
)

const emit = defineEmits<{
  pay: []
}>()

const { trackPayment } = useAnalytics()

onMounted(() => {
  trackPayment('payment.gate_view', { phase: 'gate', section: 'payment_gate' })
})

const countdown = ref(Math.max(1, Math.ceil(props.redirectDelayMs / 1000)))
let timer: ReturnType<typeof setInterval> | null = null
const payEmitted = ref(false)

function emitPayOnce() {
  if (payEmitted.value || !props.checkoutUrl) return
  payEmitted.value = true
  emit('pay')
}

onMounted(() => {
  if (!props.autoRedirect || !props.checkoutUrl) return

  timer = setInterval(() => {
    countdown.value -= 1
    if (countdown.value <= 0) {
      if (timer) clearInterval(timer)
      emitPayOnce()
    }
  }, 1000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<style scoped>
.lp-payment-gate {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.lp-payment-gate__title {
  margin: 0;
  font-size: 1.05rem;
  color: var(--lp-text-on-light);
}

.lp-payment-gate__summary {
  margin: 0;
  font-size: 0.92rem;
  color: var(--lp-text-muted-light);
}

.lp-payment-gate__summary strong {
  color: var(--lp-accent-hover);
}

.lp-payment-gate__redirect {
  margin: 0;
  font-size: 0.82rem;
  text-align: center;
  color: var(--lp-text-muted-light);
}
</style>
