<template>
  <section id="voto" class="lp-section lp-section--cta">
    <div class="lp-cta__glow" aria-hidden="true" />
    <div class="container lp-cta-grid">
      <div class="lp-cta-intro">
        <p class="lp-label lp-label--light">Tu momento</p>
        <h2 class="lp-display lp-display--md lp-display--light">Ha llegado tu momento</h2>
        <p class="lp-body lp-body--on-dark">
          Miles en todo el mundo han comprobado que la fidelidad a Dios nunca falla cuando uno hace su
          parte. ¡Tú también puedes hacer tu desafío de fe hoy mismo! Realiza tu voto de fidelidad de
          forma segura y prepara tu petición para el Altar.
        </p>

        <ul class="lp-cta-meta">
          <li>
            <span class="lp-cta-meta__label">Sede Nacional</span>
            <span class="lp-cta-meta__value">Av. Revolución #253, col. Tacubaya</span>
          </li>
          <li>
            <span class="lp-cta-meta__label">Soporte</span>
            <a class="lp-cta-meta__value" href="tel:+525555743266">55 55 74 32 66</a>
          </li>
          <li>
            <span class="lp-cta-meta__label">Templos</span>
            <a
              class="lp-cta-meta__value"
              :href="LOCALIZADOR_URL"
              target="_blank"
              rel="noopener noreferrer"
            >
              Localizador de templos
            </a>
          </li>
        </ul>
      </div>

      <div class="lp-cta-form-wrap">
        <h3 class="lp-step-title">Paso 1 · Realiza tu voto de fidelidad en línea</h3>
        <form class="lp-form" @submit.prevent="onSubmit">
          <div class="lp-form__row">
            <label>
              Nombre(s)*
              <input v-model="form.nombres" type="text" required autocomplete="given-name" />
            </label>
            <label>
              Apellido(s)*
              <input v-model="form.apellidos" type="text" required autocomplete="family-name" />
            </label>
          </div>
          <label>
            Correo*
            <input v-model="form.correo" type="email" required autocomplete="email" />
          </label>
          <label>
            Teléfono*
            <input v-model="form.telefono" type="tel" required autocomplete="tel" />
          </label>
          <label>
            Importe de mi voto de fidelidad*
            <input v-model.number="form.importe" type="number" min="0" step="0.01" required />
          </label>
          <label>
            ¿A qué iglesia pertenece?
            <select v-model="form.iglesia" required :disabled="iglesiasLoading">
              <option disabled value="">
                {{ iglesiasSelectLabel }}
              </option>
              <optgroup
                v-for="grupo in iglesiasBloques"
                :key="grupo.bloqueId"
                :label="grupo.bloque"
              >
                <option
                  v-for="iglesia in grupo.iglesias"
                  :key="iglesia.id"
                  :value="iglesia.id"
                >
                  {{ iglesia.name }}
                </option>
              </optgroup>
            </select>
            <span v-if="iglesiasError" class="lp-form__hint lp-form__hint--error" role="alert">
              {{ iglesiasError }}
            </span>
          </label>
          <label>
            Mi petición digital
            <textarea v-model="form.peticion" rows="4" placeholder="Escribe tu petición de fe..." />
          </label>
          <button type="submit" class="lp-btn lp-btn--primary lp-btn--lg lp-btn--block">
            Enviar mi fidelidad ahora
          </button>
          <p class="lp-form__legal">
            * Al dar clic en enviar, estás realizando un acto voluntario y consciente basado
            estrictamente en tu fe personal. Recuerda que los resultados y bendiciones dependen de tu
            entrega y perseverancia personal con Dios.
          </p>
        </form>

        <div class="lp-paso2">
          <h3 class="lp-step-title">Paso 2 · Imprime tu petición y llévala al altar</h3>
          <p class="lp-body">
            Una vez realizado tu movimiento en línea, descarga e imprime esta hoja para llevar tu
            petición escrita a la Universal más cercana en el
            <a :href="LOCALIZADOR_URL" target="_blank" rel="noopener noreferrer">localizador de templos</a>.
          </p>

          <div
            class="lp-sheet lp-sheet--placeholder"
            role="img"
            aria-label="Hoja de petición del propósito"
          >
            Vista previa — añade <code>public/peticion.jpg</code>
          </div>

          <ul class="lp-paso2__list">
            <li>
              <strong>Descarga alternativa:</strong>
              Si no puedes guardar la imagen,
              <a href="#" @click.prevent>descárgala aquí</a>.
            </li>
            <li>
              <strong>Entrega:</strong>
              Lleva tu petición con tu comprobante al
              <a :href="LOCALIZADOR_URL" target="_blank" rel="noopener noreferrer">altar más cercano</a>
              o a la Sede Nacional.
            </li>
          </ul>

          <div class="lp-qr-box">
            <p>Acceso rápido desde tu móvil</p>
            <Qrcode :value="diezmoPageUrl" :width="120" :height="120" />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { IGLESIAS_FALLBACK } from '#shared/constants/iglesias-fallback'
import type { IglesiasApiResponse } from '#shared/types/iglesia'

const LOCALIZADOR_URL = 'https://ejemplo.com/localizador-templos'

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

const iglesiasBloques = computed(() => iglesiasCatalog.value?.bloques ?? [])

const iglesiasLoading = computed(() => iglesiasStatus.value === 'pending')

const iglesiasError = computed(() => {
  if (iglesiasUsingFallback.value) {
    return 'Listado temporal: no se pudo cargar el catálogo completo.'
  }
  return ''
})

const iglesiasSelectLabel = computed(() => {
  if (iglesiasLoading.value) return 'Cargando iglesias...'
  if (iglesiasBloques.value.length === 0) return 'No hay iglesias disponibles'
  return 'Selecciona tu iglesia'
})

/** Resuelve bloque + nombre a partir del id seleccionado (útil al enviar el formulario). */
const iglesiaSeleccionada = computed(() =>
  iglesiasCatalog.value?.items.find((item) => item.id === form.iglesia) ?? null
)

const route = useRoute()
const diezmoPageUrl = computed(() => {
  if (import.meta.client) {
    return `${window.location.origin}${route.path}#voto`
  }
  return 'https://ejemplo.com/#voto'
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

function onSubmit() {
  console.log('Enviar formulario', {
    ...form,
    iglesiaId: form.iglesia,
    iglesiaNombre: iglesiaSeleccionada.value?.name,
    iglesiaBloque: iglesiaSeleccionada.value?.bloque
  })
}
</script>
