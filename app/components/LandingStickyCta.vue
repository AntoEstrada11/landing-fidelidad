<template>
  <div
    class="lp-sticky-cta"
    :class="{ 'lp-sticky-cta--visible': visible }"
    aria-label="Acciones rápidas"
  >
    <a href="#voto" class="lp-btn lp-btn--primary lp-sticky-cta__pay" @click="scrollToVoto">
      Realizar mi fidelidad
    </a>
    <a href="tel:+525555743266" class="lp-btn lp-sticky-cta__call">
      Llamar
    </a>
  </div>
</template>

<script setup lang="ts">
const visible = ref(false)
const MOBILE_MAX = 959
const SCROLL_THRESHOLD = 280

function updateVisibility() {
  if (!import.meta.client) return
  const isMobile = window.innerWidth <= MOBILE_MAX
  visible.value = isMobile && window.scrollY > SCROLL_THRESHOLD
}

function scrollToVoto(e: Event) {
  e.preventDefault()
  document.getElementById('voto')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

onMounted(() => {
  updateVisibility()
  window.addEventListener('scroll', updateVisibility, { passive: true })
  window.addEventListener('resize', updateVisibility)
})

onUnmounted(() => {
  window.removeEventListener('scroll', updateVisibility)
  window.removeEventListener('resize', updateVisibility)
})
</script>
