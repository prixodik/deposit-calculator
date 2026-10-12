<script setup lang="ts">
import { computed, defineAsyncComponent } from 'vue'
import type { Schedule } from '../core'
import { chartPoints, describeChart } from '../format/chart'

const props = defineProps<{ schedule: Schedule }>()

const GrowthChartCanvas = defineAsyncComponent(() => import('./GrowthChartCanvas.vue'))

const amount = computed(() => props.schedule.rows[0]?.openingBalance ?? 0)
const points = computed(() => chartPoints(props.schedule, amount.value))
const description = computed(() => describeChart(props.schedule, amount.value))
</script>

<template>
  <figure class="growth-chart">
    <GrowthChartCanvas :points="points" :description="description" />
    <figcaption class="growth-chart__summary">{{ description }}</figcaption>
  </figure>
</template>

<style>
.growth-chart {
  margin: 0;
  padding: var(--space-4);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  box-shadow: var(--shadow-card);
}

.growth-chart__frame {
  position: relative;
  height: 280px;
}

.growth-chart__summary {
  margin-top: var(--space-3);
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
}
</style>
