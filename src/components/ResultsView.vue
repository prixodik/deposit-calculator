<script setup lang="ts">
import { downloadText } from '../composables/download'
import type { Schedule } from '../core'
import { buildCsv } from '../format/csv'
import GrowthChart from './GrowthChart.vue'
import ScheduleTable from './ScheduleTable.vue'
import SummaryCards from './SummaryCards.vue'

const props = defineProps<{ schedule: Schedule | null; stale: boolean }>()

function download() {
  if (props.schedule) downloadText('график-выплат.csv', buildCsv(props.schedule))
}
</script>

<template>
  <div class="results">
    <p v-if="!schedule" class="results__empty">Введите параметры вклада, чтобы увидеть расчёт.</p>
    <template v-else>
      <p v-if="stale" class="results__stale" role="status">Результат устарел: исправьте ошибки в форме</p>
      <div class="results__body" :class="{ 'results__body--stale': stale }">
        <SummaryCards :totals="schedule.totals" />
        <GrowthChart :schedule="schedule" />
        <div class="results__toolbar">
          <h2 class="results__title">График выплат</h2>
          <button class="results__download" type="button" data-action="download-csv" @click="download">
            Скачать CSV
          </button>
        </div>
        <ScheduleTable :schedule="schedule" />
      </div>
    </template>
  </div>
</template>

<style>
.results {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: var(--space-4);
}

.results__body {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: var(--space-4);
  transition: opacity var(--duration-normal);
}

.results__body--stale {
  opacity: 0.55;
}

.results__stale {
  margin: 0;
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-md);
  background: var(--color-danger-soft);
  color: var(--color-danger);
  font-weight: 600;
}

.results__empty {
  margin: 0;
  padding: var(--space-5);
  border: 1px dashed var(--color-border-strong);
  border-radius: var(--radius-md);
  color: var(--color-text-muted);
  text-align: center;
}

.results__toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
}

.results__title {
  margin: 0;
  font-size: var(--font-size-lg);
}

.results__download {
  min-height: var(--size-touch);
  padding: 0 var(--space-4);
  border: 1px solid var(--color-accent);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  color: var(--color-accent);
  font: inherit;
  font-weight: 600;
  cursor: pointer;
  transition: background var(--duration-fast);
}

.results__download:hover {
  background: var(--color-accent-soft);
}
</style>
