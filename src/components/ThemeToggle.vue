<script setup lang="ts">
import { computed } from 'vue'
import { useTheme } from '../composables/useTheme'

const { theme, toggle } = useTheme()
const label = computed(() => (theme.value === 'dark' ? 'Включить светлую тему' : 'Включить тёмную тему'))
</script>

<template>
  <button class="theme-toggle" type="button" :aria-label="label" :title="label" @click="toggle">
    <svg class="theme-toggle__icon" viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false">
      <path
        v-if="theme === 'dark'"
        d="M12 4V2m0 20v-2m8-8h2M2 12h2m13.66-5.66 1.41-1.41M4.93 19.07l1.41-1.41m0-11.32L4.93 4.93m14.14 14.14-1.41-1.41M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10Z"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
      />
      <path
        v-else
        d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linejoin="round"
      />
    </svg>
  </button>
</template>

<style>
.theme-toggle {
  display: inline-flex;
  flex: none;
  align-items: center;
  justify-content: center;
  width: var(--size-touch);
  height: var(--size-touch);
  border: 1px solid var(--color-border);
  border-radius: 50%;
  background: var(--color-surface);
  color: var(--color-text);
  cursor: pointer;
  transition: background-color var(--duration-fast), border-color var(--duration-fast);
}

.theme-toggle:hover {
  background: var(--color-accent-soft);
  border-color: var(--color-accent);
}

.theme-toggle__icon {
  display: block;
}
</style>
