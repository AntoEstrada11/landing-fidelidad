<template>
  <section id="que-esperar" class="lp-section lp-section--paper">
    <div class="container">
      <header class="lp-section-head">
        <p class="lp-label">Beneficios</p>
        <h2 class="lp-display lp-display--md">¿Qué esperar de este propósito?</h2>
        <p class="lp-body lp-section-head__lead">
          Quien decide ser fiel a Dios aprende a no rendirse y empieza a ver resultados que antes
          parecían imposibles. Al participar y perseverar, comenzarás a notar:
        </p>
      </header>

      <ul class="lp-benefits">
        <li v-for="(card, i) in cards" :key="card.title" class="lp-benefit">
          <span class="lp-benefit__num" aria-hidden="true">{{ String(i + 1).padStart(2, '0') }}</span>
          <h3>{{ card.title }}</h3>
          <p>{{ card.text }}</p>
        </li>
      </ul>
    </div>
  </section>
</template>

<script setup lang="ts">
const cards = [
  {
    title: 'Prosperidad y mentalidad nueva',
    text: 'Rompe con la maldición de la pobreza y recibe claridad para tomar decisiones financieras correctas, dejando atrás el miedo al futuro.'
  },
  {
    title: 'Multiplicación y negocios',
    text: 'Cuando Dios entra en tus finanzas, lo poco se multiplica. Él te abre puertas donde antes estaban cerradas y te da sabiduría para avanzar.'
  },
  {
    title: 'Protección del patrimonio',
    text: 'Dios cierra las puertas al devorador, al robo, a las pérdidas y a los fraudes, cuidando lo que con esfuerzo has construido.'
  },
  {
    title: 'Victoria sobre las deudas',
    text: 'Rompe el círculo vicioso financiero, vence los compromisos económicos acumulados y comienza una nueva historia de estabilidad.'
  },
  {
    title: 'Restauración familiar',
    text: 'Sabiduría para tomar decisiones correctas, acabando con los pleitos, la violencia y los divorcios, transformando el caos de tu hogar en un ambiente de paz.'
  },
  {
    title: 'Fuerza y bendición material',
    text: 'Recibe el valor necesario para superar cualquier crisis y prepárate para tomar posesión de lo que Dios tiene listo para ti a través de esta fidelidad.'
  }
]
</script>
