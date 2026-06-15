<template>
  <section id="voto" class="lp-section lp-section--cta" data-analytics-section="voto">
    <div class="lp-cta__glow" aria-hidden="true"></div>

    <div class="container">
      <div class="lp-cta-grid">
        <div class="lp-cta-intro lp-cta-intro--compact-mobile">
          <p class="lp-label lp-label--light">Tu momento</p>
          <h2 class="lp-display lp-display--md lp-display--light">
            Realiza tu fidelidad en 3 pasos
          </h2>
          <p class="lp-body lp-body--on-dark lp-cta-intro__desktop-only">
            Miles en todo el mundo han comprobado que la fidelidad a Dios nunca falla cuando uno
            hace su parte. ¡Tú también puedes hacer tu desafío de fe hoy mismo!
          </p>

          <ul class="lp-cta-meta">
            
            <li class="lp-cta-meta__desktop-only">
              <span class="lp-cta-meta__label">Sede Nacional</span>
              <span class="lp-cta-meta__value">Av. Revolución #253, col. Tacubaya</span>
            </li>
          </ul>
        </div>

        <div class="lp-cta-form-wrap">
          <!-- Wizard móvil -->
          <div class="lp-wizard lp-only-mobile">
            <div class="lp-wizard__progress" aria-label="Progreso">
              <span
                v-for="step in 4"
                :key="step"
                class="lp-wizard__dot"
                :class="{ 'lp-wizard__dot--active': wizardStep >= step }"
              />
            </div>

            <LandingPaymentGate
              v-if="showPaymentGate"
              :checkout-url="checkoutUrl"
              :importe-label="importeLabel"
              :iglesia-name="iglesiaSeleccionada?.name"
              :navigation="paymentNavigation"
              @pay="goToCheckout()"
            />

            <form v-else class="lp-wizard__form" @submit.prevent="onWizardSubmit">
              <div v-show="wizardStep === 1" class="lp-wizard__step">
                <h3 class="lp-wizard__title">Paso 1 · ¿Cuánto deseas entregar?</h3>
                <div class="lp-amount-grid">
                  <button
                    v-for="amount in montosRapidos"
                    :key="amount"
                    type="button"
                    class="lp-amount-btn"
                    :class="{ 'lp-amount-btn--active': importePreset === amount }"
                    @click="selectImporte(amount)"
                  >
                    {{ formatImporte(amount) }}
                  </button>
                  <button
                    type="button"
                    class="lp-amount-btn"
                    :class="{ 'lp-amount-btn--active': importePreset === 'other' }"
                    @click="selectImporte('other')"
                  >
                    Otro monto
                  </button>
                </div>

                <label v-if="importePreset === 'other'" class="lp-wizard__field">
                  Escribe tu monto
                  <input
                    v-model.number="form.importe"
                    type="number"
                    min="1"
                    step="1"
                    inputmode="numeric"
                    placeholder="Ej. 250"
                    required
                  />
                </label>

                <button
                  type="button"
                  class="lp-btn lp-btn--primary lp-btn--lg lp-btn--block"
                  data-track="wizard.continue_step1"
                  data-track-section="wizard"
                  :disabled="!canAdvanceStep1"
                  @click="wizardStep = 2"
                >
                  Continuar
                </button>
              </div>

              <div v-show="wizardStep === 2" class="lp-wizard__step lp-wizard__step--map">
                <ClientOnly>
                  <IglesiaNearbyMap
                    v-model="form.iglesia"
                    :items="iglesiasItems"
                    :active="wizardStep === 2"
                    @navigation="churchNavigation = $event"
                  >
                    <template #search>
                      <IglesiaSearchField
                        v-model="form.iglesia"
                        :items="iglesiasItems"
                        label="Buscar por nombre"
                        placeholder="Escribe el nombre del templo"
                        :loading="iglesiasLoading"
                        :disabled="iglesiasItems.length === 0"
                        :hint="iglesiasError"
                        :hint-error="Boolean(iglesiasError)"
                      />
                    </template>
                  </IglesiaNearbyMap>
                </ClientOnly>

                <div class="lp-wizard__nav">
                  <button type="button" class="lp-btn lp-btn--ghost-dark" @click="wizardStep = 1">
                    Atrás
                  </button>
                  <button
                    type="button"
                    class="lp-btn lp-btn--primary lp-btn--lg"
                    data-track="wizard.continue_step2"
                    data-track-section="wizard"
                    :disabled="!form.iglesia"
                    @click="wizardStep = 3"
                  >
                    Continuar
                  </button>
                </div>
              </div>

              <div v-show="wizardStep === 3" class="lp-wizard__step">
                <h3 class="lp-wizard__title">Paso 3 · Tus datos</h3>

                <label class="lp-wizard__field">
                  Nombre(s)*
                  <input
                    v-model="form.nombres"
                    type="text"
                    required
                    autocomplete="given-name"
                  />
                </label>

                <label class="lp-wizard__field">
                  Apellido(s)*
                  <input
                    v-model="form.apellidos"
                    type="text"
                    required
                    autocomplete="family-name"
                  />
                </label>

                <label class="lp-wizard__field">
                  Teléfono*
                  <input v-model="form.telefono" type="tel" required autocomplete="tel" />
                </label>

                <details class="lp-wizard__optional">
                  <summary>Agregar correo o petición (opcional)</summary>
                  <label class="lp-wizard__field">
                    Correo
                    <input v-model="form.correo" type="email" autocomplete="email" />
                  </label>
                  <label class="lp-wizard__field">
                    Mi petición digital
                    <textarea
                      v-model="form.peticion"
                      rows="3"
                      placeholder="Escribe tu petición de fe..."
                    />
                  </label>
                </details>

                <div class="lp-wizard__summary">
                  <p>
                    <span>Monto</span>
                    <strong>{{ importeLabel }}</strong>
                  </p>
                  <p v-if="iglesiaSeleccionada">
                    <span>Iglesia</span>
                    <strong>{{ iglesiaSeleccionada.name }}</strong>
                  </p>
                </div>

                <div class="lp-wizard__nav">
                  <button type="button" class="lp-btn lp-btn--ghost-dark" @click="wizardStep = 2">
                    Atrás
                  </button>
                  <button
                    type="submit"
                    class="lp-btn lp-btn--primary lp-btn--lg"
                    data-track="payment.form_submit"
                    data-track-section="wizard"
                    :disabled="submitting"
                  >
                    {{ submitting ? 'Preparando pago…' : 'Continuar al pago' }}
                  </button>
                </div>

                <p v-if="submitError" class="lp-form__error" role="alert">{{ submitError }}</p>

                <p class="lp-form__legal">
                  Al enviar, realizas un acto voluntario basado en tu fe personal.
                </p>
              </div>
            </form>
          </div>

          <!-- Formulario desktop -->
          <LandingPaymentGate
            v-if="showPaymentGate"
            :checkout-url="checkoutUrl"
            :importe-label="importeLabel"
            :iglesia-name="iglesiaSeleccionada?.name"
            :navigation="paymentNavigation"
            title="Realiza tu pago en línea"
            @pay="goToCheckout()"
          />

          <form v-else class="lp-form lp-only-desktop" @submit.prevent="onSubmit">
            <h3 class="lp-step-title">Realiza tu voto de fidelidad en línea</h3>

            <fieldset class="lp-amount-fieldset">
              <legend>Importe de mi voto de fidelidad*</legend>
              <div class="lp-amount-grid lp-amount-grid--desktop">
                <button
                  v-for="amount in montosRapidos"
                  :key="amount"
                  type="button"
                  class="lp-amount-btn"
                  :class="{ 'lp-amount-btn--active': importePreset === amount }"
                  @click="selectImporte(amount)"
                >
                  {{ formatImporte(amount) }}
                </button>
                <button
                  type="button"
                  class="lp-amount-btn"
                  :class="{ 'lp-amount-btn--active': importePreset === 'other' }"
                  @click="selectImporte('other')"
                >
                  Otro
                </button>
              </div>
              <input
                v-if="importePreset === 'other'"
                v-model.number="form.importe"
                type="number"
                min="1"
                step="0.01"
                required
                placeholder="Monto en pesos"
              />
            </fieldset>

            <ClientOnly>
              <IglesiaNearbyMap
                v-model="form.iglesia"
                :items="iglesiasItems"
                @navigation="churchNavigation = $event"
              >
                <template #search>
                  <IglesiaSearchField
                    v-model="form.iglesia"
                    :items="iglesiasItems"
                    label="Buscar por nombre"
                    placeholder="Escribe el nombre del templo"
                    :loading="iglesiasLoading"
                    :disabled="iglesiasItems.length === 0"
                    :hint="iglesiasError"
                    :hint-error="Boolean(iglesiasError)"
                  />
                </template>
              </IglesiaNearbyMap>
            </ClientOnly>

            <div class="lp-form__row">
              <label>
                Nombre(s)*
                <input
                  v-model="form.nombres"
                  type="text"
                  required
                  autocomplete="given-name"
                />
              </label>
              <label>
                Apellido(s)*
                <input
                  v-model="form.apellidos"
                  type="text"
                  required
                  autocomplete="family-name"
                />
              </label>
            </div>

            <label>
              Teléfono*
              <input v-model="form.telefono" type="tel" required autocomplete="tel" />
            </label>

            <label>
              Correo
              <input v-model="form.correo" type="email" autocomplete="email" />
            </label>

            <label>
              Mi petición digital
              <textarea
                v-model="form.peticion"
                rows="4"
                placeholder="Escribe tu petición de fe..."
              />
            </label>

            <button
              type="submit"
              class="lp-btn lp-btn--primary lp-btn--lg lp-btn--block"
              data-track="payment.form_submit"
              data-track-section="desktop_form"
              :disabled="!canSubmitDesktop || submitting"
            >
              {{ submitting ? 'Preparando pago…' : 'Continuar al pago' }}
            </button>

            <p v-if="submitError" class="lp-form__error" role="alert">{{ submitError }}</p>

            <p class="lp-form__legal">
              * Al dar clic en enviar, estás realizando un acto voluntario y consciente basado
              estrictamente en tu fe personal. Recuerda que los resultados y bendiciones dependen
              de tu entrega y perseverancia personal con Dios.
            </p>
          </form>
        </div>
      </div>

      <div id="paso-2" class="lp-next-steps" data-analytics-section="paso-2">
        <h3 class="lp-next-steps__title">¿Qué sigue después de tu fidelidad?</h3>

        <div class="lp-action-list">
          <div
            v-if="showPaymentGate && checkoutUrl"
            class="lp-action-card lp-action-card--download"
          >
            <span class="lp-action-card__label">Pagar con QR</span>
            <span class="lp-action-card__value">Escanea para ir a la pasarela</span>
            <ClientOnly>
              <div class="lp-qr-simple">
                <Qrcode :value="checkoutUrl" variant="pixelated" :radius="0.35" />
              </div>
            </ClientOnly>
            <button type="button" class="lp-action-card__cta lp-action-card__cta--btn" @click="goToCheckout()">
              Ir a la pasarela de pago →
            </button>
          </div>

          <div
            v-if="showPaymentGate && paymentNavigation"
            class="lp-action-card"
          >
            <NavigationAppLinks :navigation="paymentNavigation" />
          </div>

          <a
            :href="peticionPrintUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="lp-action-card lp-action-card--download"
          >
            <span class="lp-action-card__label">Descargar mi petición</span>
            <span class="lp-action-card__value">Hoja para llevar al altar</span>
            <span class="lp-action-card__cta">Abrir hoja de petición →</span>
          </a>

          <a href="tel:+525555743266" class="lp-action-card">
            <span class="lp-action-card__label">¿Necesitas ayuda?</span>
            <span class="lp-action-card__value">55 55 74 32 66</span>
            <span class="lp-action-card__cta">Llamar ahora →</span>
          </a>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { IGLESIAS_FALLBACK } from '#shared/constants/iglesias-fallback'
import type { IglesiasApiResponse } from '#shared/types/iglesia'
import { buildPeticionUrl } from '#shared/utils/peticion-url'
import type { NavigationContext } from '#shared/utils/maps'
import { formatImporte } from '#shared/utils/iglesia-search'

const {
  checkoutUrl,
  submitting,
  submitError,
  startCheckout,
  restoreSession,
  goToCheckout,
  savedNavigation
} = useFidelidadPayment()

const churchNavigation = ref<NavigationContext | null>(null)
const paymentNavigation = computed(() => savedNavigation.value || churchNavigation.value)
const { trackPayment } = useAnalytics()

const showPaymentGate = computed(() => Boolean(checkoutUrl.value))

const montosRapidos = [100, 500, 1000] as const
type ImportePreset = (typeof montosRapidos)[number] | 'other' | null

const wizardStep = ref(1)
const importePreset = ref<ImportePreset>(null)

watch(wizardStep, (step) => {
  if (!import.meta.client) return
  trackPayment('wizard.step_view', {
    phase: `step_${step}`,
    section: 'wizard',
    meta: { step }
  })
})

const {
  data: iglesiasData,
  status: iglesiasStatus,
  error: iglesiasFetchError
} = await useFetch<IglesiasApiResponse>('/api/iglesias', {
  key: 'iglesias-catalog'
})

const iglesiasUsingFallback = computed(
  () => iglesiasFetchError.value !== null && iglesiasFetchError.value !== undefined
)

const iglesiasCatalog = computed(() => {
  if (iglesiasData.value?.bloques?.length) {
    return iglesiasData.value
  }
  if (iglesiasUsingFallback.value) {
    return IGLESIAS_FALLBACK
  }
  return null
})

const iglesiasItems = computed(() => iglesiasCatalog.value?.items ?? [])

const iglesiasLoading = computed(() => iglesiasStatus.value === 'pending')

const iglesiasError = computed(() => {
  if (iglesiasUsingFallback.value) {
    return 'Listado temporal: no se pudo cargar el catálogo completo.'
  }
  return ''
})

const form = reactive({
  nombres: '',
  apellidos: '',
  correo: '',
  telefono: '',
  importe: null as number | null,
  iglesia: '',
  peticion: ''
})

const iglesiaSeleccionada = computed(
  () => iglesiasCatalog.value?.items.find((item) => item.id === form.iglesia) ?? null
)

const importeLabel = computed(() => {
  if (form.importe === null || form.importe <= 0) return '—'
  return formatImporte(form.importe)
})

const canAdvanceStep1 = computed(
  () => form.importe !== null && form.importe > 0 && Number.isFinite(form.importe)
)

const canSubmitDesktop = computed(
  () =>
    canAdvanceStep1.value &&
    Boolean(form.iglesia) &&
    form.nombres.trim() &&
    form.apellidos.trim() &&
    form.telefono.trim()
)

const peticionPrintUrl = computed(() =>
  buildPeticionUrl({
    nombres: form.nombres,
    apellidos: form.apellidos,
    iglesia: iglesiaSeleccionada.value?.name,
    importe: form.importe ?? undefined,
    peticion: form.peticion
  })
)

function buildCheckoutInput() {
  if (!iglesiaSeleccionada.value || form.importe === null) return null

  return {
    nombres: form.nombres.trim(),
    apellidos: form.apellidos.trim(),
    correo: form.correo.trim() || undefined,
    telefono: form.telefono.trim(),
    importe: form.importe,
    iglesiaId: form.iglesia,
    iglesiaNombre: iglesiaSeleccionada.value.name,
    iglesiaBloque: iglesiaSeleccionada.value.bloque,
    peticion: form.peticion.trim() || undefined,
    navigation: churchNavigation.value
  }
}

async function finalizeSubmission() {
  const input = buildCheckoutInput()
  if (!input) return

  trackPayment('payment.form_validated', { phase: 'submit', section: 'voto' })

  const ok = await startCheckout(input)
  if (!ok) return

  if (import.meta.client) {
    document.getElementById('paso-2')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

function onWizardSubmit() {
  if (!canSubmitDesktop.value || submitting.value) return
  finalizeSubmission()
}

function onSubmit() {
  if (!canSubmitDesktop.value || submitting.value) return
  finalizeSubmission()
}

function selectImporte(value: ImportePreset) {
  importePreset.value = value
  if (value === 'other') {
    form.importe = null
    return
  }
  if (typeof value === 'number') {
    form.importe = value
  }
}

onMounted(() => {
  const restored = restoreSession()
  if (restored) {
    if (restored.navigation) {
      churchNavigation.value = restored.navigation
    }
    document.getElementById('paso-2')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }
})
</script>
