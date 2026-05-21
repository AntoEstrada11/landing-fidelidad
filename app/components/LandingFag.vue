<template>
  <section id="faq" class="lp-section lp-section--cream">
    <div class="container lp-faq-wrap">
      <header class="lp-section-head">
        <p class="lp-label">Resuelve tus dudas</p>
        <h2 class="lp-display lp-display--md">Preguntas frecuentes</h2>
      </header>

      <div class="lp-faq">
        <details v-for="item in faq" :key="item.q" class="lp-faq__item">
          <summary>{{ item.q }}</summary>
          <div class="lp-faq__body">
            <p>{{ item.a }}</p>
            <p v-if="item.note" class="lp-faq__note">{{ item.note }}</p>
          </div>
        </details>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const faq = [
  {
    q: '¿Qué es la fidelidad a Dios?',
    a: 'Es ponerlo en primer lugar, obedecer Su Palabra y actuar con honestidad diaria, aun en los momentos difíciles.'
  },
  {
    q: '¿Para quién es este propósito?',
    a: 'Para quienes están cansados del caos y buscan construir su vida, economía y familia sobre una base sólida.'
  },
  {
    q: '¿Qué es un voto de fidelidad?',
    a: 'Es una acción práctica que demuestra tu confianza en que Dios cumplirá Sus promesas en tu vida. Económicamente no se puede comprar nada de Dios; pero el voto demuestra confianza basada en Su Palabra. Ningún milagro de Jesús fue realizado por la fe sin actos de fe: “Muéstrame tu fe sin tus obras, y yo te mostraré mi fe por mis obras” (Santiago 2:18). No se trata de cantidad, sino de calidad. El voto de fe involucra el alma de cada uno y la decisión es personal; consulta primero con el Espíritu Santo para hacer algo que represente tu verdadero esfuerzo.',
    note: '* Nota: Estas donaciones se destinan única y exclusivamente al funcionamiento y continuidad de la obra de Dios.'
  }
]
</script>
