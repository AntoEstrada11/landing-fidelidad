<template>
  <section id="inicio" class="lp-hero">
    <div class="lp-hero__media" aria-hidden="true">
      <div
        v-for="(slide, index) in slides"
        :key="slide.src"
        class="lp-hero__slide"
        :class="{
          'lp-hero__slide--active': index === activeIndex,
          'lp-hero__slide--ken-burns': prefersMotion
        }"
      >
        <img
          :src="slide.src"
          :alt="slide.alt"
          width="1920"
          height="1080"
          fetchpriority="high"
          :loading="index === 0 ? 'eager' : 'lazy'"
          decoding="async"
        />
      </div>
    </div>

    <div class="lp-hero__overlay" aria-hidden="true" />
    <div class="lp-hero__glow" aria-hidden="true" />

    <div class="lp-hero__inner container">
      <p class="lp-label lp-label--light">Propósito de fe</p>
      <h1 class="lp-display lp-display--hero lp-display--light">
        Descubre el poder de la
        <span>fidelidad a Dios</span>
      </h1>
      <p class="lp-hero__lead">
        En un mundo incierto, dar este paso revolucionará tu vida: te devolverá la esperanza,
        la estabilidad y la dirección que necesitas.
      </p>
      <div class="lp-hero__actions">
        <a href="#voto" class="lp-btn lp-btn--primary lp-btn--lg">Quiero hacer mi voto de fe hoy</a>
        <a href="#que-es-fiel" class="lp-btn lp-btn--ghost">Conocer más</a>
      </div>

      <div v-if="prefersMotion && slides.length > 1" class="lp-hero__dots" role="tablist" aria-label="Imágenes del hero">
        <button
          v-for="(slide, index) in slides"
          :key="slide.src"
          type="button"
          role="tab"
          class="lp-hero__dot"
          :class="{ 'lp-hero__dot--active': index === activeIndex }"
          :aria-selected="index === activeIndex"
          :aria-label="`Mostrar imagen ${index + 1}`"
          @click="goTo(index)"
        />
      </div>
    </div>

    <a href="#que-es-fiel" class="lp-hero__scroll" aria-label="Continuar leyendo">
      <span>Desplázate</span>
    </a>
  </section>
</template>

<script setup lang="ts">
const slides = [
  {
    src: '/hero/hero-faith-1.jpg',
    alt: 'Amanecer con luz dorada, símbolo de esperanza y fidelidad'
  },
  {
    src: '/hero/hero-faith-2.jpg',
    alt: 'Persona en actitud de fe ante la luz'
  },
  {
    src: '/hero/hero-faith-3.jpg',
    alt: 'Luz cálida sobre un libro sagrado, símbolo de la Palabra de Dios'
  }
] as const

const INTERVAL_MS = 7000
const activeIndex = ref(0)
const prefersMotion = ref(true)
let timer: ReturnType<typeof setInterval> | null = null

function goTo(index: number) {
  activeIndex.value = index
  restartTimer()
}

function next() {
  activeIndex.value = (activeIndex.value + 1) % slides.length
}

function restartTimer() {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
  if (!prefersMotion.value || slides.length <= 1) {
    return
  }
  timer = setInterval(next, INTERVAL_MS)
}

onMounted(() => {
  prefersMotion.value = !window.matchMedia('(prefers-reduced-motion: reduce)').matches
  restartTimer()
})

onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
  }
})
</script>
