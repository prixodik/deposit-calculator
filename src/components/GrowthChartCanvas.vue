<script setup lang="ts">
import {
  CategoryScale,
  Chart,
  Filler,
  Legend,
  LineController,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
} from 'chart.js'
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { prefersReducedMotion } from '../composables/useReducedMotion'
import type { ChartPoint } from '../format/chart'
import { formatDate, formatRub } from '../format/money'

Chart.register(CategoryScale, LinearScale, PointElement, LineElement, LineController, Filler, Legend, Tooltip)

const props = defineProps<{ points: ChartPoint[]; description: string }>()

const canvas = ref<HTMLCanvasElement | null>(null)
let chart: Chart | null = null
let observer: MutationObserver | null = null

const token = (name: string) => getComputedStyle(document.documentElement).getPropertyValue(name).trim()

function build() {
  if (!canvas.value) return
  chart?.destroy()
  const text = token('--color-text-muted')
  const grid = token('--color-chart-grid')
  const balance = token('--color-chart-balance')
  const paid = token('--color-chart-paid')
  chart = new Chart(canvas.value, {
    type: 'line',
    data: {
      labels: props.points.map((p) => formatDate(p.date)),
      datasets: [
        {
          label: 'Остаток вклада',
          data: props.points.map((p) => Number(p.balance)),
          borderColor: balance,
          backgroundColor: balance,
          pointRadius: 2,
          tension: 0.25,
        },
        {
          label: 'Выплачено процентов',
          data: props.points.map((p) => Number(p.paid)),
          borderColor: paid,
          backgroundColor: paid,
          pointRadius: 2,
          tension: 0.25,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: prefersReducedMotion() ? false : { duration: 400 },
      plugins: {
        legend: { labels: { color: text } },
        tooltip: { callbacks: { label: (c) => `${c.dataset.label}: ${formatRub(String(c.parsed.y))}` } },
      },
      scales: {
        x: { ticks: { color: text, maxTicksLimit: 8 }, grid: { color: grid } },
        y: { ticks: { color: text, callback: (v) => formatRub(String(v)) }, grid: { color: grid } },
      },
    },
  })
}

onMounted(() => {
  build()
  observer = new MutationObserver(build)
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
})
watch(() => props.points, build)
onBeforeUnmount(() => {
  observer?.disconnect()
  chart?.destroy()
})
</script>

<template>
  <div class="growth-chart__frame">
    <canvas ref="canvas" class="growth-chart__canvas" role="img" :aria-label="description"></canvas>
  </div>
</template>
