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
        @click="toggleMenu"
      >
        <span class="lp-nav__toggle-bar" />
        <span class="lp-nav__toggle-bar" />
        <span class="lp-nav__toggle-bar" />
      </button>
    </div>

    <Teleport to="body">
      <Transition name="lp-nav-fade">
        <div
          v-if="menuOpen"
          class="lp-nav__overlay"
          aria-label="Cerrar menú"
          @click="closeMenu"
        >
          <aside
            id="lp-nav-drawer"
            class="lp-nav__drawer"
            aria-label="Menú móvil"
            @click.stop
          >
            <div class="lp-nav__drawer-head">
              <p class="lp-nav__drawer-title">Menú</p>
              <button
                type="button"
                class="lp-nav__drawer-close"
                aria-label="Cerrar menú"
                @click="closeMenu"
              >
                Cerrar
              </button>
            </div>

            <a
              href="#voto"
              class="lp-btn lp-btn--primary lp-btn--block lp-nav__drawer-cta"
              data-track="nav.realizar_fidelidad"
              data-track-section="nav_drawer"
              @click="closeMenu"
            >
              Realizar mi fidelidad
            </a>

            <nav class="lp-nav__drawer-links" aria-label="Secciones">
              <a
                v-for="item in mobileLinks"
                :key="item.href"
                :href="item.href"
                @click="closeMenu"
              >
                <span class="lp-nav__drawer-icon" aria-hidden="true">{{ item.icon }}</span>
                <span class="lp-nav__drawer-label">{{ item.label }}</span>
              </a>
            </nav>

            <div class="lp-nav__drawer-footer">
              <a href="tel:+525555743266" class="lp-nav__drawer-help" @click="closeMenu">
                <span aria-hidden="true">📞</span>
                <span>
                  <strong>¿Necesitas ayuda?</strong>
                  <small>55 55 74 32 66</small>
                </span>
              </a>
            </div>
          </aside>
        </div>
      </Transition>
    </Teleport>
  </header>
</template>

<script setup lang="ts">
const mobileLinks = [
  { href: '#inicio', label: 'Inicio', icon: '⌂' },
  { href: '#que-es-fiel', label: '¿Qué es ser fiel?', icon: '✦' },
  { href: '#que-esperar', label: '¿Qué esperar?', icon: '◎' },
  { href: '#historias', label: 'Historias reales', icon: '♥' },
  { href: '#faq', label: 'Preguntas frecuentes', icon: '?' }
] as const

const menuOpen = ref(false)
const scrolled = ref(false)

function closeMenu() {
  menuOpen.value = false
}

function toggleMenu() {
  menuOpen.value = !menuOpen.value
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
  closeMenu()
})
</script>
