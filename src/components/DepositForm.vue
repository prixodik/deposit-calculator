<script setup lang="ts">
import { formatMoneyInput, parseMoneyInput } from '../format/input'
import type { FormIssues, FormState, TermUnit } from '../composables/useDeposit'
import type { Frequency } from '../core'

const props = defineProps<{ modelValue: FormState; issues: FormIssues }>()
const emit = defineEmits<{ 'update:modelValue': [value: FormState] }>()

const QUICK_AMOUNTS: { value: string; label: string }[] = [
  { value: '100000', label: '100 тыс.' },
  { value: '500000', label: '500 тыс.' },
  { value: '1000000', label: '1 млн' },
  { value: '3000000', label: '3 млн' },
]

const FREQUENCY_OPTIONS: { value: Frequency; label: string }[] = [
  { value: 'monthly', label: 'Ежемесячно' },
  { value: 'quarterly', label: 'Ежеквартально' },
  { value: 'yearly', label: 'Ежегодно' },
  { value: 'end_of_term', label: 'В конце срока' },
]

const UNITS: { value: TermUnit; label: string }[] = [
  { value: 'months', label: 'Месяцы' },
  { value: 'years', label: 'Годы' },
]

function update(patch: Partial<FormState>) {
  emit('update:modelValue', { ...props.modelValue, ...patch })
}

const text = (event: Event) => (event.target as HTMLInputElement).value

function onAmountBlur(event: Event) {
  const value = text(event)
  if (parseMoneyInput(value) !== null) update({ amount: formatMoneyInput(value) })
}
</script>

<template>
  <form class="deposit-form" novalidate @submit.prevent>
    <h2 class="deposit-form__title">Параметры вклада</h2>

    <div class="deposit-form__field">
      <label class="deposit-form__label" for="deposit-amount">Сумма вклада, ₽</label>
      <input
        id="deposit-amount"
        class="deposit-form__input"
        :class="{ 'deposit-form__input--invalid': issues.amount }"
        type="text"
        inputmode="decimal"
        autocomplete="off"
        :value="modelValue.amount"
        :aria-invalid="issues.amount ? 'true' : undefined"
        :aria-describedby="issues.amount ? 'deposit-amount-error' : undefined"
        @input="update({ amount: text($event) })"
        @blur="onAmountBlur"
      />
      <p v-if="issues.amount" id="deposit-amount-error" class="deposit-form__error" role="alert">{{ issues.amount }}</p>
      <div class="deposit-form__chips" role="group" aria-label="Быстрый выбор суммы">
        <button
          v-for="quick in QUICK_AMOUNTS"
          :key="quick.value"
          class="deposit-form__chip"
          type="button"
          :data-quick="quick.value"
          @click="update({ amount: formatMoneyInput(quick.value) })"
        >
          {{ quick.label }}
        </button>
      </div>
    </div>

    <div class="deposit-form__field">
      <label class="deposit-form__label" for="deposit-rate">Ставка, % годовых</label>
      <input
        id="deposit-rate"
        class="deposit-form__input"
        :class="{ 'deposit-form__input--invalid': issues.rate }"
        type="text"
        inputmode="decimal"
        autocomplete="off"
        :value="modelValue.rate"
        :aria-invalid="issues.rate ? 'true' : undefined"
        :aria-describedby="issues.rate ? 'deposit-rate-error' : undefined"
        @input="update({ rate: text($event) })"
      />
      <p v-if="issues.rate" id="deposit-rate-error" class="deposit-form__error" role="alert">{{ issues.rate }}</p>
    </div>

    <div class="deposit-form__field">
      <label class="deposit-form__label" for="deposit-term">Срок</label>
      <div class="deposit-form__row">
        <input
          id="deposit-term"
          class="deposit-form__input"
          :class="{ 'deposit-form__input--invalid': issues.months }"
          type="text"
          inputmode="decimal"
          autocomplete="off"
          :value="modelValue.term"
          :aria-invalid="issues.months ? 'true' : undefined"
          :aria-describedby="issues.months ? 'deposit-term-error' : undefined"
          @input="update({ term: text($event) })"
        />
        <div class="deposit-form__segmented" role="group" aria-label="Единица срока">
          <button
            v-for="unit in UNITS"
            :key="unit.value"
            class="deposit-form__segment"
            :class="{ 'deposit-form__segment--active': modelValue.termUnit === unit.value }"
            type="button"
            :data-unit="unit.value"
            :aria-pressed="modelValue.termUnit === unit.value"
            @click="update({ termUnit: unit.value })"
          >
            {{ unit.label }}
          </button>
        </div>
      </div>
      <p v-if="issues.months" id="deposit-term-error" class="deposit-form__error" role="alert">{{ issues.months }}</p>
    </div>

    <div class="deposit-form__field">
      <label class="deposit-form__label" for="deposit-start">Дата открытия</label>
      <input
        id="deposit-start"
        class="deposit-form__input"
        :class="{ 'deposit-form__input--invalid': issues.startDate }"
        type="date"
        :value="modelValue.startDate"
        :aria-invalid="issues.startDate ? 'true' : undefined"
        :aria-describedby="issues.startDate ? 'deposit-start-error' : undefined"
        @input="update({ startDate: text($event) })"
      />
      <p v-if="issues.startDate" id="deposit-start-error" class="deposit-form__error" role="alert">
        {{ issues.startDate }}
      </p>
    </div>

    <div class="deposit-form__field">
      <label class="deposit-form__label" for="deposit-frequency">Периодичность начисления</label>
      <select
        id="deposit-frequency"
        class="deposit-form__input deposit-form__input--select"
        :value="modelValue.frequency"
        @change="update({ frequency: text($event) as Frequency })"
      >
        <option v-for="option in FREQUENCY_OPTIONS" :key="option.value" :value="option.value">
          {{ option.label }}
        </option>
      </select>
    </div>

    <div class="deposit-form__switch">
      <input
        id="deposit-capitalize"
        class="deposit-form__toggle"
        type="checkbox"
        role="switch"
        :checked="modelValue.capitalize"
        @change="update({ capitalize: ($event.target as HTMLInputElement).checked })"
      />
      <label class="deposit-form__switch-label" for="deposit-capitalize">
        <span class="deposit-form__switch-title">Капитализация процентов</span>
        <span class="deposit-form__hint">Проценты добавляются к вкладу и сами приносят доход</span>
      </label>
    </div>
  </form>
</template>

<style>
.deposit-form {
  display: grid;
  gap: var(--space-4);
  padding: var(--space-5);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: var(--color-surface);
  box-shadow: var(--shadow-card);
}

.deposit-form__title {
  margin: 0;
  font-size: var(--font-size-lg);
}

.deposit-form__field {
  display: grid;
  gap: var(--space-2);
}

.deposit-form__label {
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--color-text-muted);
}

.deposit-form__input {
  width: 100%;
  min-height: var(--size-touch);
  padding: 0 var(--space-3);
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-sm);
  background: var(--color-surface);
  color: var(--color-text);
  font: inherit;
  transition: border-color var(--duration-fast), box-shadow var(--duration-fast);
}

.deposit-form__input:hover {
  border-color: var(--color-accent);
}

.deposit-form__input--invalid {
  border-color: var(--color-danger);
  background: var(--color-danger-soft);
}

.deposit-form__error {
  margin: 0;
  color: var(--color-danger);
  font-size: var(--font-size-sm);
}

.deposit-form__row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: var(--space-3);
}

.deposit-form__chips {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.deposit-form__chip {
  min-height: var(--size-touch);
  padding: 0 var(--space-3);
  border: 1px solid var(--color-border);
  border-radius: 999px;
  background: var(--color-surface-2);
  color: var(--color-text);
  font: inherit;
  font-size: var(--font-size-sm);
  cursor: pointer;
  transition: background-color var(--duration-fast), border-color var(--duration-fast);
}

.deposit-form__chip:hover {
  border-color: var(--color-accent);
  background: var(--color-accent-soft);
}

.deposit-form__segmented {
  display: inline-flex;
  padding: var(--space-1);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-surface-2);
}

.deposit-form__segment {
  min-width: 72px;
  min-height: 36px;
  padding: 0 var(--space-3);
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: var(--color-text);
  font: inherit;
  font-size: var(--font-size-sm);
  cursor: pointer;
  transition: background-color var(--duration-fast), color var(--duration-fast);
}

.deposit-form__segment--active {
  background: var(--color-accent);
  color: var(--color-accent-contrast);
}

.deposit-form__switch {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: var(--space-3);
  align-items: center;
}

.deposit-form__toggle {
  position: relative;
  flex: none;
  width: 52px;
  height: 30px;
  margin: 0;
  border: 1px solid var(--color-border-strong);
  border-radius: 999px;
  background: var(--color-surface-2);
  appearance: none;
  cursor: pointer;
  transition: background-color var(--duration-fast), border-color var(--duration-fast);
}

.deposit-form__toggle::after {
  content: '';
  position: absolute;
  top: 3px;
  left: 3px;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: var(--color-text-muted);
  transition: transform var(--duration-fast), background-color var(--duration-fast);
}

.deposit-form__toggle:checked {
  border-color: var(--color-accent);
  background: var(--color-accent);
}

.deposit-form__toggle:checked::after {
  background: var(--color-accent-contrast);
  transform: translateX(22px);
}

.deposit-form__switch-label {
  display: grid;
  min-height: var(--size-touch);
  align-content: center;
  cursor: pointer;
}

.deposit-form__switch-title {
  font-weight: 600;
}

.deposit-form__hint {
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
}
</style>
