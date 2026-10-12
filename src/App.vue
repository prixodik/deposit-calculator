<script setup lang="ts">
import AppHeader from './components/AppHeader.vue'
import DepositForm from './components/DepositForm.vue'
import { createDefaults, useDeposit } from './composables/useDeposit'
import { readState, useUrlState } from './composables/urlState'

const deposit = useDeposit(readState(location.search, createDefaults()))
useUrlState(deposit.state)
</script>

<template>
  <div class="app">
    <AppHeader />
    <main class="app__main">
      <section class="app__form" aria-label="Параметры вклада">
        <DepositForm v-model="deposit.state.value" :issues="deposit.issues.value" />
      </section>
      <section class="app__results" aria-label="Результаты расчёта"></section>
    </main>
  </div>
</template>

<style>
.app {
  display: grid;
  gap: var(--space-5);
  width: 100%;
  max-width: var(--content-width);
  margin: 0 auto;
  padding: var(--space-4);
}

.app__main {
  display: grid;
  gap: var(--space-5);
  align-items: start;
}

.app__form,
.app__results {
  min-width: 0;
}

@media (min-width: 1024px) {
  .app {
    padding: var(--space-6) var(--space-5);
  }

  .app__main {
    grid-template-columns: minmax(320px, 400px) minmax(0, 1fr);
  }

  .app__form {
    position: sticky;
    top: var(--space-5);
  }
}
</style>
