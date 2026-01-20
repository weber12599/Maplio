<template>
    <input
        ref="inputRef"
        :value="modelValue"
        @input="onInput"
        @compositionstart="onCompositionStart"
        @compositionend="onCompositionEnd"
        @keydown.enter="onEnter"
    />
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
    modelValue: [String, Number]
})

const emit = defineEmits(['update:modelValue', 'enter'])

const inputRef = ref(null)
const isComposing = ref(false)

const onInput = (e) => {
    emit('update:modelValue', e.target.value)
}

const onCompositionStart = () => {
    isComposing.value = true
}

const onCompositionEnd = () => {
    setTimeout(() => {
        isComposing.value = false
    }, 0)
}

const onEnter = (e) => {
    if (isComposing.value || e.isComposing) return

    if (e.repeat) return

    emit('enter', e)
}

defineExpose({
    focus: () => inputRef.value?.focus()
})
</script>
