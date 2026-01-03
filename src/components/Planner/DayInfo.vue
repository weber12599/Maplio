<template>
    <div :class="['h-full flex flex-col relative overflow-hidden', themeConfig.appClass]">
        <div
            class="flex-grow overflow-y-auto p-4 md:p-8 max-w-3xl mx-auto w-full z-10 space-y-4 md:space-y-8"
        >
            <section v-if="mode === 'all' || mode === 'summary'" class="space-y-3">
                <h3
                    :class="[
                        'text-lg font-bold flex items-center gap-2',
                        themeConfig.dialogTitleClass
                    ]"
                >
                    <i class="fa-solid fa-align-left opacity-60"></i>
                    單日摘要
                </h3>
                <textarea
                    v-model="localSummary"
                    @input="handleSummaryInput"
                    placeholder="紀錄本日重點，例如：天氣預報、穿搭建議、總預算..."
                    :class="[
                        'w-full h-32 p-4 rounded-xl outline-none resize-none transition-all shadow-sm focus:ring-2 focus:ring-blue-400 focus:border-transparent',
                        themeConfig.inputClass
                    ]"
                ></textarea>
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
                    待辦事項
                </h3>

                <div class="flex gap-2">
                    <input
                        v-model="newTodoText"
                        @keyup.enter="addTodo"
                        type="text"
                        placeholder="新增待辦事項 (按 Enter 新增)"
                        :class="[
                            'flex-grow px-4 py-2 rounded-lg focus:outline-none focus:border-blue-400 transition-colors',
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
                        v-for="(todo, index) in localTodos"
                        :key="index"
                        :class="[
                            'group flex items-center gap-3 p-3 rounded-lg border transition-all duration-300',
                            todo.done ? 'opacity-60' : '',
                            todo.level === 1 ? 'ml-8 border-l-4' : '',
                            // 使用 cardClass 作為列表項目樣式
                            themeConfig.cardClass
                        ]"
                        :style="todo.level === 1 ? { borderLeftColor: 'currentColor' } : {}"
                    >
                        <div
                            @click="toggleTodo(index)"
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

                        <span
                            class="flex-grow select-none cursor-pointer"
                            :class="todo.done ? 'line-through opacity-60' : ''"
                            @click="toggleTodo(index)"
                        >
                            {{ todo.text }}
                        </span>

                        <div
                            class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <button
                                v-if="todo.level === 0"
                                @click="setIndent(index, 1)"
                                :class="[
                                    'w-7 h-7 flex items-center justify-center rounded hover:bg-slate-500/10',
                                    themeConfig.dialogLabelClass
                                ]"
                                title="縮排"
                            >
                                <i class="fa-solid fa-indent"></i>
                            </button>
                            <button
                                v-if="todo.level === 1"
                                @click="setIndent(index, 0)"
                                :class="[
                                    'w-7 h-7 flex items-center justify-center rounded hover:bg-slate-500/10',
                                    themeConfig.dialogLabelClass
                                ]"
                                title="取消縮排"
                            >
                                <i class="fa-solid fa-outdent"></i>
                            </button>
                            <button
                                @click="removeTodo(index)"
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
                    尚無待辦事項
                </div>
            </section>
        </div>
    </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'

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
const localSummary = ref('')
const localTodos = ref([])
const newTodoText = ref('')
let debounceTimer = null

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
    (val) => (localTodos.value = val ? JSON.parse(JSON.stringify(val)) : [])
)

const handleSummaryInput = () => {
    if (debounceTimer) clearTimeout(debounceTimer)
    debounceTimer = setTimeout(emitData, 500)
}

const addTodo = () => {
    if (!newTodoText.value.trim()) return
    localTodos.value.push({ text: newTodoText.value, done: false, level: 0 })
    newTodoText.value = ''
    emitData()
}

const toggleTodo = (index) => {
    localTodos.value[index].done = !localTodos.value[index].done
    emitData()
}

const removeTodo = (index) => {
    localTodos.value.splice(index, 1)
    emitData()
}

const setIndent = (index, level) => {
    localTodos.value[index].level = level
    emitData()
}

const emitData = () => {
    emit('update', { summary: localSummary.value, todos: localTodos.value })
}
</script>
