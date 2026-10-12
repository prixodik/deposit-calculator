<script setup lang="ts">
import ThemeToggle from './ThemeToggle.vue'
</script>

<template>
  <header class="app-header">
    <div class="app-header__brand">
      <span class="app-header__logo" aria-hidden="true">₽</span>
      <div>
        <h1 class="app-header__title">Калькулятор вклада</h1>
        <p class="app-header__subtitle">График выплат, проценты и итоговая сумма</p>
      </div>
    </div>
    <ThemeToggle />
  </header>
</template>

<style>
.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
}

.app-header__brand {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  min-width: 0;
}

.app-header__logo {
  display: grid;
  place-items: center;
  flex: none;
  width: var(--size-touch);
  height: var(--size-touch);
  border-radius: var(--radius-md);
  background: var(--color-accent);
  color: var(--color-accent-contrast);
  font-size: var(--font-size-lg);
  font-weight: 700;
}

.app-header__title {
  margin: 0;
  font-size: var(--font-size-lg);
  line-height: 1.2;
}

.app-header__subtitle {
  margin: 0;
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
}
</style>
