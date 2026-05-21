<template>
  <section id="historias" class="lp-section lp-section--dark">
    <div class="container">
      <header class="lp-section-head lp-section-head--center">
        <p class="lp-label lp-label--light">Experiencias de fe</p>
        <h2 class="lp-display lp-display--md lp-display--light">Historias reales</h2>
        <p class="lp-body lp-body--on-dark lp-section-head__lead">
          Decidieron ser fieles y su vida revolucionó
        </p>
      </header>

      <div class="lp-testimonials">
        <article v-for="t in testimonios" :key="t.name" class="lp-testimonial">
          <span class="lp-testimonial__mark" aria-hidden="true">"</span>
          <p class="lp-testimonial__quote">{{ t.quote }}</p>
          <p class="lp-testimonial__author">{{ t.name }}</p>
        </article>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const testimonios = [
  {
    quote:
      'Al poner a Dios en primer lugar, dejamos de comer de los desperdicios del mercado de abastos, obtuve casa propia, negocios y una flota de transporte; mi familia fue restaurada.',
    name: 'Edgar Vázquez'
  },
  {
    quote:
      'Llegué al extremo de vivir en un tejabán de lámina y madera e intentar quitarme la vida, pero ser fiel a Dios me dio paz, un matrimonio restaurado y dos casas propias.',
    name: 'Josefa Salazar'
  },
  {
    quote:
      'Tuvimos que rematar nuestras alianzas de boda para poder comer, pero el poder de la fidelidad a Dios transformó nuestra escasez en un negocio exitoso que hoy vende a todo el país.',
    name: 'Paola Gómez'
  }
]
</script>
