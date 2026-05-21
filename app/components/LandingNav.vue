<template>
  <header
    class="lp-nav"
    :class="{ 'lp-nav--scrolled': scrolled, 'lp-nav--open': menuOpen }"
  >
    <div class="lp-nav__bar container">
      <a href="#inicio" class="lp-nav__brand" @click="closeMenu">Fidelidad a Dios</a>

      <nav class="lp-nav__desktop" aria-label="Principal">
        <a href="#inicio">Inicio</a>
        <a href="#que-es-fiel">¿Qué es ser fiel?</a>
        <a href="#que-esperar">¿Qué esperar?</a>
        <a href="#historias">Historias reales</a>
        <a href="#faq">Preguntas frecuentes</a>
        <a href="#voto" class="lp-btn lp-btn--primary lp-nav__cta">Hacer mi voto de fe</a>
      </nav>

      <button
        type="button"
        class="lp-nav__toggle"
        :class="{ 'lp-nav__toggle--open': menuOpen }"
        :aria-expanded="menuOpen"
        aria-controls="lp-nav-drawer"
        :aria-label="menuOpen ? 'Cerrar menú' : 'Abrir menú'"
        @click="menuOpen = !menuOpen"
      >
        <span class="lp-nav__toggle-bar" />
        <span class="lp-nav__toggle-bar" />
        <span class="lp-nav__toggle-bar" />
      </button>
    </div>

    <Transition name="lp-nav-fade">
      <button
        v-if="menuOpen"
        type="button"
        class="lp-nav__backdrop"
        aria-label="Cerrar menú"
        @click="closeMenu"
      />
    </Transition>

    <nav
      id="lp-nav-drawer"
      class="lp-nav__drawer"
      :class="{ 'lp-nav__drawer--open': menuOpen }"
      :aria-hidden="!menuOpen"
      aria-label="Menú móvil"
    >
      <a href="#inicio" @click="closeMenu">Inicio</a>
      <a href="#que-es-fiel" @click="closeMenu">¿Qué es ser fiel a Dios?</a>
      <a href="#que-esperar" @click="closeMenu">¿Qué esperar?</a>
      <a href="#historias" @click="closeMenu">Historias reales</a>
      <a href="#faq" @click="closeMenu">Preguntas frecuentes</a>
      <a href="#voto" class="lp-btn lp-btn--primary lp-nav__cta" @click="closeMenu">
        Hacer mi voto de fe
      </a>
    </nav>
  </header>
</template>

<script setup lang="ts">
const menuOpen = ref(false)
const scrolled = ref(false)

function closeMenu() {
  menuOpen.value = false
}

function onScroll() {
  scrolled.value = window.scrollY > 24
}

function onEscape(e: KeyboardEvent) {
  if (e.key === 'Escape') closeMenu()
}

function onResize() {
  if (window.innerWidth >= 960) menuOpen.value = false
}

watch(menuOpen, (open) => {
  if (!import.meta.client) return
  document.body.style.overflow = open ? 'hidden' : ''
})

onMounted(() => {
  onScroll()
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', onResize)
  window.addEventListener('keydown', onEscape)
})

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('resize', onResize)
  window.removeEventListener('keydown', onEscape)
  document.body.style.overflow = ''
})
</script>
