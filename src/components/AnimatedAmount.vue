<script setup lang="ts">
import Decimal from 'decimal.js'
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { prefersReducedMotion } from '../composables/useReducedMotion'
import { formatRub } from '../format/money'

const props = defineProps<{ value: string }>()

const DURATION = 400
const shown = ref(props.value)
let frame = 0

function stop() {
  if (frame && typeof cancelAnimationFrame === 'function') cancelAnimationFrame(frame)
  frame = 0
}

watch(
  () => props.value,
  (to) => {
    stop()
    if (prefersReducedMotion() || typeof requestAnimationFrame !== 'function') {
      shown.value = to
      return
    }
    // Промежуточные значения нужны только для показа; итог всегда выводится точным значением.
    const from = new Decimal(shown.value).toNumber()
    const target = new Decimal(to).toNumber()
    const started = performance.now()
    const step = (now: number) => {
      const t = Math.min(1, (now - started) / DURATION)
      if (t >= 1) {
        shown.value = to
        frame = 0
        return
      }
      const eased = 1 - (1 - t) ** 3
      shown.value = (from + (target - from) * eased).toFixed(2)
      frame = requestAnimationFrame(step)
    }
    frame = requestAnimationFrame(step)
  },
)

onBeforeUnmount(stop)

const text = computed(() => formatRub(shown.value))
</script>

<template>
  <span class="animated-amount">{{ text }}</span>
</template>

<style>
.animated-amount {
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}
</style>
