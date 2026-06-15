<template>
  <div ref="rootEl" class="lp-iglesia-search">
    <label class="lp-iglesia-search__label" :for="inputId">
      {{ label }}
    </label>

    <div v-if="selected" class="lp-iglesia-search__selected">
      <div class="lp-iglesia-search__selected-info">
        <strong>{{ selected.name }}</strong>
        <span>{{ selected.bloque }}</span>
      </div>
      <button type="button" class="lp-iglesia-search__change" @click="clearSelection">
        Cambiar
      </button>
    </div>

    <template v-else>
      <input
        :id="inputId"
        v-model="query"
        type="search"
        class="lp-iglesia-search__input"
        :placeholder="placeholder"
        :disabled="disabled || loading"
        autocomplete="off"
        enterkeyhint="search"
        @focus="open = true"
        @input="open = true"
      />

      <p v-if="loading" class="lp-iglesia-search__hint">Cargando iglesias...</p>
      <p v-else-if="disabled" class="lp-iglesia-search__hint">No hay iglesias disponibles</p>
      <p
        v-else-if="hint"
        class="lp-iglesia-search__hint"
        :class="{ 'lp-iglesia-search__hint--error': hintError }"
      >
        {{ hint }}
      </p>

      <ul
        v-if="open && results.length > 0"
        class="lp-iglesia-search__results"
        role="listbox"
      >
        <li v-for="item in results" :key="item.id" role="option">
          <button type="button" class="lp-iglesia-search__option" @click="select(item)">
            <span class="lp-iglesia-search__option-name">{{ item.name }}</span>
            <span class="lp-iglesia-search__option-bloque">{{ item.bloque }}</span>
          </button>
        </li>
      </ul>

      <p
        v-else-if="open && query.trim().length >= 2 && !loading"
        class="lp-iglesia-search__hint"
      >
        No encontramos iglesias con ese nombre. Intenta con otra palabra.
      </p>
    </template>
  </div>
</template>

<script setup lang="ts">
import type { IglesiaOption } from '#shared/types/iglesia'
import { filterIglesias } from '#shared/utils/iglesia-search'

const props = withDefaults(
  defineProps<{
    modelValue: string
    items: IglesiaOption[]
    label?: string
    placeholder?: string
    loading?: boolean
    disabled?: boolean
    hint?: string
    hintError?: boolean
  }>(),
  {
    label: '¿No ves tu iglesia en el mapa? Búscala por nombre',
    placeholder: 'Escribe el nombre de tu iglesia...',
    loading: false,
    disabled: false,
    hint: '',
    hintError: false
  }
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const inputId = `iglesia-search-${useId()}`
const rootEl = ref<HTMLElement | null>(null)
const query = ref('')
const open = ref(false)

const selected = computed(
  () => props.items.find((item) => item.id === props.modelValue) ?? null
)

const results = computed(() => filterIglesias(props.items, query.value))

function select(item: IglesiaOption) {
  emit('update:modelValue', item.id)
  query.value = ''
  open.value = false
}

function clearSelection() {
  emit('update:modelValue', '')
  query.value = ''
  open.value = true
}

function onDocumentClick(e: MouseEvent) {
  const el = e.target as Node
  if (!rootEl.value?.contains(el)) {
    open.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', onDocumentClick)
})

onUnmounted(() => {
  document.removeEventListener('click', onDocumentClick)
})
</script>
