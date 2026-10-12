<script setup lang="ts">
import type { Schedule } from '../core'
import { formatDate, formatRub } from '../format/money'

defineProps<{ schedule: Schedule }>()
</script>

<template>
  <div class="schedule-table__scroll" role="region" aria-label="График выплат, таблица с прокруткой" tabindex="0">
    <table class="schedule-table__table">
      <caption class="schedule-table__caption">График выплат по периодам</caption>
      <thead>
        <tr>
          <th class="schedule-table__head schedule-table__head--first" scope="col">Период</th>
          <th class="schedule-table__head" scope="col">Дата</th>
          <th class="schedule-table__head schedule-table__head--number" scope="col">Остаток на начало</th>
          <th class="schedule-table__head schedule-table__head--number" scope="col">Начислено</th>
          <th class="schedule-table__head schedule-table__head--number" scope="col">Выплачено</th>
          <th class="schedule-table__head schedule-table__head--number" scope="col">Остаток на конец</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in schedule.rows" :key="row.index" class="schedule-table__row">
          <th class="schedule-table__cell schedule-table__cell--first" scope="row">{{ row.index }}</th>
          <td class="schedule-table__cell">{{ formatDate(row.endDate) }}</td>
          <td class="schedule-table__cell schedule-table__cell--number">{{ formatRub(row.openingBalance) }}</td>
          <td class="schedule-table__cell schedule-table__cell--number">{{ formatRub(row.interest) }}</td>
          <td class="schedule-table__cell schedule-table__cell--number">{{ formatRub(row.paid) }}</td>
          <td class="schedule-table__cell schedule-table__cell--number">{{ formatRub(row.closingBalance) }}</td>
        </tr>
      </tbody>
      <tfoot>
        <tr class="schedule-table__total">
          <th class="schedule-table__cell schedule-table__cell--first schedule-table__cell--total" scope="row">Итого</th>
          <td class="schedule-table__cell schedule-table__cell--total"></td>
          <td class="schedule-table__cell schedule-table__cell--number schedule-table__cell--total"></td>
          <td class="schedule-table__cell schedule-table__cell--number schedule-table__cell--total">{{ formatRub(schedule.totals.accrued) }}</td>
          <td class="schedule-table__cell schedule-table__cell--number schedule-table__cell--total">{{ formatRub(schedule.totals.paid) }}</td>
          <td class="schedule-table__cell schedule-table__cell--number schedule-table__cell--total">
            {{ formatRub(schedule.totals.closingBalance) }}
          </td>
        </tr>
      </tfoot>
    </table>
  </div>
</template>

<style>
.schedule-table__scroll {
  max-height: 480px;
  overflow: auto;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
}

.schedule-table__table {
  width: 100%;
  min-width: 640px;
  border-collapse: separate;
  border-spacing: 0;
  font-size: var(--font-size-sm);
}

.schedule-table__caption {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
}

.schedule-table__head {
  position: sticky;
  top: 0;
  z-index: 2;
  padding: var(--space-3);
  background: var(--color-surface-2);
  border-bottom: 1px solid var(--color-border);
  color: var(--color-text-muted);
  font-weight: 600;
  text-align: left;
  white-space: nowrap;
}

.schedule-table__head--number {
  text-align: right;
}

.schedule-table__head--first {
  left: 0;
  z-index: 3;
}

.schedule-table__cell {
  padding: var(--space-3);
  border-bottom: 1px solid var(--color-border);
  background: inherit;
  font-weight: 400;
  text-align: left;
  white-space: nowrap;
}

.schedule-table__cell--number {
  font-variant-numeric: tabular-nums;
  text-align: right;
}

.schedule-table__cell--first {
  position: sticky;
  left: 0;
  z-index: 1;
  font-weight: 600;
}

.schedule-table__row {
  background: var(--color-surface);
}

.schedule-table__row:hover {
  background: var(--color-accent-soft);
}

.schedule-table__total {
  background: var(--color-surface-2);
}

.schedule-table__cell--total {
  position: sticky;
  bottom: 0;
  z-index: 2;
  border-top: 2px solid var(--color-border-strong);
  border-bottom: 0;
  font-weight: 700;
}
</style>
