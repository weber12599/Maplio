<template>
    <div :class="['h-full flex flex-col relative overflow-hidden', themeConfig.appClass]">
        <div
            class="flex-grow overflow-y-auto p-4 md:p-8 max-w-3xl mx-auto w-full space-y-4 md:space-y-8"
        >
            <section v-if="mode === 'all' || mode === 'summary'" class="space-y-3">
                <h3
                    :class="[
                        'text-lg font-bold flex items-center gap-2',
                        themeConfig.dialogTitleClass
                    ]"
                >
                    <i class="fa-solid fa-align-left opacity-60"></i>
                    {{ $t('planner.day_summary') }}
                </h3>

                <div class="relative group">
                    <textarea
                        v-if="isEditingSummary"
                        ref="summaryInputRef"
                        v-model="localSummary"
                        @input="handleSummaryInput"
                        @blur="isEditingSummary = false"
                        :placeholder="$t('planner.day_summary_placeholder')"
                        :class="[
                            'w-full h-32 p-4 rounded-xl outline-none resize-none transition-all shadow-sm focus:ring-2 focus:ring-blue-400 focus:border-transparent block',
                            themeConfig.inputClass
                        ]"
                    ></textarea>

                    <div
                        v-else
                        @click="handleViewClick"
                        :class="[
                            'w-full h-32 p-4 rounded-xl transition-all shadow-sm cursor-text overflow-y-auto break-words whitespace-pre-wrap',
                            themeConfig.inputClass,
                            !localSummary ? 'text-stone-400 italic' : ''
                        ]"
                    >
                        <span v-if="localSummary" v-html="formattedSummary"></span>
                        <span v-else>{{ $t('planner.day_summary_placeholder') }}</span>

                        <div
                            class="absolute top-2 right-2 opacity-0 group-hover:opacity-50 transition-opacity pointer-events-none"
                        >
                            <i class="fa-solid fa-pen text-xs"></i>
                        </div>
                    </div>
                </div>
            </section>

            <hr v-if="mode === 'all'" :class="['border-0 h-px', themeConfig.lineClass]" />

            <section v-if="mode === 'all' || mode === 'todo'" class="space-y-4">
                <h3
                    :class="[
                        'text-lg font-bold flex items-center gap-2',
                        themeConfig.dialogTitleClass
                    ]"
                >
                    <i class="fa-solid fa-list-check opacity-60"></i>
                    {{ $t('planner.todo_list') }}
                </h3>

                <div class="flex gap-2">
                    <composition-input
                        v-model="newTodoText"
                        @enter="addTodo"
                        type="text"
                        :placeholder="$t('planner.add_todo_placeholder')"
                        :class="[
                            'flex-grow px-4 py-2 rounded-lg outline-none resize-none transition-all shadow-sm focus:ring-2 focus:ring-blue-400 focus:border-transparent block',
                            themeConfig.inputClass
                        ]"
                    />
                    <button
                        @click="addTodo"
                        :class="[
                            'px-4 py-2 rounded-lg transition-colors',
                            themeConfig.primaryBtnClass
                        ]"
                    >
                        <i class="fa-solid fa-plus"></i>
                    </button>
                </div>

                <ul class="space-y-2">
                    <li
                        v-for="(todo, index) in displayTodos"
                        :key="index"
                        :class="[
                            'group flex items-center gap-3 p-3 rounded-lg border transition-all duration-300',
                            todo.done ? 'opacity-60' : '',
                            todo.level === 1 ? 'ml-8 border-l-4' : '',
                            themeConfig.cardClass
                        ]"
                        :style="todo.level === 1 ? { borderLeftColor: 'currentColor' } : {}"
                    >
                        <div
                            @click="toggleTodo(todo)"
                            class="cursor-pointer text-xl min-w-[24px]"
                            :class="
                                todo.done
                                    ? 'text-blue-500'
                                    : themeConfig.dialogLabelClass || 'text-slate-400'
                            "
                        >
                            <i
                                :class="
                                    todo.done ? 'fa-solid fa-square-check' : 'fa-regular fa-square'
                                "
                            ></i>
                        </div>

                        <div class="flex-grow">
                            <composition-input
                                v-if="editingTodo === todo"
                                ref="activeInputRef"
                                v-model="todo.text"
                                @blur="finishEditTodo"
                                @enter="finishEditTodo"
                                type="text"
                                class="w-full bg-transparent outline-none border-b border-blue-400"
                            />
                            <span
                                v-else
                                @click="startEditTodo(todo)"
                                class="block w-full cursor-text select-none"
                                :class="todo.done ? 'line-through opacity-60' : ''"
                            >
                                {{ todo.text }}
                            </span>
                        </div>

                        <div
                            class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <button
                                v-if="todo.level === 0"
                                @click="setIndent(todo, 1)"
                                :class="[
                                    'w-7 h-7 flex items-center justify-center rounded hover:bg-slate-500/10',
                                    themeConfig.dialogLabelClass
                                ]"
                                :title="$t('planner.todo_indent')"
                            >
                                <i class="fa-solid fa-indent"></i>
                            </button>
                            <button
                                v-if="todo.level === 1"
                                @click="setIndent(todo, 0)"
                                :class="[
                                    'w-7 h-7 flex items-center justify-center rounded hover:bg-slate-500/10',
                                    themeConfig.dialogLabelClass
                                ]"
                                :title="$t('planner.todo_outdent')"
                            >
                                <i class="fa-solid fa-outdent"></i>
                            </button>
                            <button
                                @click="removeTodo(todo)"
                                class="w-7 h-7 flex items-center justify-center rounded hover:bg-red-500/10 text-stone-300 hover:text-red-500"
                            >
                                <i class="fa-solid fa-xmark"></i>
                            </button>
                        </div>
                    </li>
                </ul>
                <div
                    v-if="localTodos.length === 0"
                    :class="[
                        'text-center py-8 text-sm italic',
                        themeConfig.dialogLabelClass || 'text-stone-400'
                    ]"
                >
                    {{ $t('planner.no_todos') }}
                </div>
            </section>
        </div>
    </div>
</template>

<script setup>
import { formatNote } from '@/utils/stringUtils'
import { ref, watch, onMounted, computed, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import CompositionInput from '@/components/Common/CompositionInput.vue'

const props = defineProps({
    summary: String,
    todos: Array,
    themeConfig: Object,
    mode: {
        type: String,
        default: 'all'
    }
})

const emit = defineEmits(['update'])
const { t } = useI18n()
const localSummary = ref('')
const localTodos = ref([])
const newTodoText = ref('')
let debounceTimer = null

// --- Summary Editing State ---
const isEditingSummary = ref(false)
const summaryInputRef = ref(null)

// Computed property to format summary text: escapes HTML, links URLs, and handles newlines
const formattedSummary = computed(() => {
    return formatNote(localSummary.value)
})

const enableEdit = async () => {
    isEditingSummary.value = true
    await nextTick()
    if (summaryInputRef.value) {
        summaryInputRef.value.focus()
    }
}

const handleViewClick = (e) => {
    if (e.target.tagName === 'A') return
    enableEdit()
}

const editingTodo = ref(null)
const activeInputRef = ref(null)

const displayTodos = computed(() => {
    return [...localTodos.value].sort((a, b) => {
        return Number(a.done) - Number(b.done)
    })
})

onMounted(() => {
    localSummary.value = props.summary || ''
    localTodos.value = props.todos ? JSON.parse(JSON.stringify(props.todos)) : []
})

watch(
    () => props.summary,
    (val) => (localSummary.value = val || '')
)

watch(
    () => props.todos,
    (val) => {
        localTodos.value = val ? JSON.parse(JSON.stringify(val)) : []
    }
)

const handleSummaryInput = () => {
    if (debounceTimer) clearTimeout(debounceTimer)
    debounceTimer = setTimeout(emitData, 500)
}

const addTodo = () => {
    if (!newTodoText.value.trim()) {
        return
    }
    localTodos.value.unshift({ text: newTodoText.value, done: false, level: 0 })
    newTodoText.value = ''
    emitData()
}

const startEditTodo = async (todo) => {
    editingTodo.value = todo
    await nextTick()
    if (Array.isArray(activeInputRef.value) && activeInputRef.value.length > 0) {
        activeInputRef.value[0].focus()
    } else if (activeInputRef.value) {
        activeInputRef.value.focus()
    }
}

const finishEditTodo = () => {
    if (editingTodo.value) {
        if (!editingTodo.value.text.trim()) {
            removeTodo(editingTodo.value)
        }
        editingTodo.value = null
        emitData()
    }
}

const toggleTodo = (todo) => {
    todo.done = !todo.done
    emitData()
}

const removeTodo = (todo) => {
    const index = localTodos.value.indexOf(todo)
    if (index !== -1) {
        localTodos.value.splice(index, 1)
        emitData()
    }
}

const setIndent = (todo, level) => {
    todo.level = level
    emitData()
}

const emitData = () => {
    emit('update', { summary: localSummary.value, todos: localTodos.value })
}
</script>
