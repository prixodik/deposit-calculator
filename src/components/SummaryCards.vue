<script setup lang="ts">
import { computed } from 'vue'
import type { Totals } from '../core'
import { formatRub } from '../format/money'
import AnimatedAmount from './AnimatedAmount.vue'

const props = defineProps<{ totals: Totals }>()

const cards = computed(() => [
  { key: 'balance', label: 'Остаток на конец срока', value: props.totals.closingBalance.toFixed(2), main: true },
  { key: 'income', label: 'Доход', value: props.totals.income.toFixed(2), main: false },
  { key: 'accrued', label: 'Начислено процентов', value: props.totals.accrued.toFixed(2), main: false },
  { key: 'paid', label: 'Выплачено', value: props.totals.paid.toFixed(2), main: false },
])

const announcement = computed(() =>
  cards.value.map((card) => `${card.label}: ${formatRub(card.value)}`).join('. '),
)
</script>

<template>
  <section class="summary" aria-label="Итоги расчёта">
    <div
      v-for="card in cards"
      :key="card.key"
      class="summary__card"
      :class="{ 'summary__card--main': card.main }"
      :data-card="card.key"
    >
      <p class="summary__label" :class="{ 'summary__label--main': card.main }">{{ card.label }}</p>
      <p class="summary__value" :class="{ 'summary__value--main': card.main }" aria-hidden="true"><AnimatedAmount :value="card.value" /></p>
    </div>
    <p class="summary__live" aria-live="polite">{{ announcement }}</p>
  </section>
</template>

<style>
.summary {
  position: relative;
  display: grid;
  gap: var(--space-3);
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.summary__card {
  padding: var(--space-4);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  box-shadow: var(--shadow-card);
}

.summary__card--main {
  grid-column: 1 / -1;
  border-color: transparent;
  background: var(--color-accent);
  color: var(--color-accent-contrast);
}

.summary__label {
  margin: 0;
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
}

.summary__label--main {
  color: inherit;
  opacity: 0.9;
}

.summary__value {
  margin: var(--space-1) 0 0;
  font-size: clamp(1.125rem, 5.5vw, var(--font-size-xl));
  font-weight: 700;
  line-height: 1.2;
  overflow-wrap: anywhere;
}

.summary__value--main {
  font-size: clamp(1.5rem, 8vw, var(--font-size-hero));
}

.summary__live {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}

@media (min-width: 640px) {
  .summary {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
</style>
