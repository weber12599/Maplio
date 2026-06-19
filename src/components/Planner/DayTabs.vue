<template>
    <div
        :class="[
            'flex items-center border-b shrink-0 transition-colors duration-500',
            themeConfig.sidebarClass
        ]"
    >
        <div class="flex overflow-x-auto no-scrollbar px-6 py-4 gap-3">
            <button
                v-for="(day, index) in itinerary"
                :key="index"
                :id="`day-tab-${index}`"
                @click="$emit('update:activeDay', index)"
                :class="[
                    'px-5 py-2 rounded-2xl text-sm font-black whitespace-nowrap flex flex-col items-center min-w-[85px] transition-all duration-300',
                    activeDay === index ? themeConfig.tabActiveClass : themeConfig.tabInactiveClass
                ]"
            >
                Day {{ index + 1 }}
                <span class="text-[9px] font-bold opacity-60">{{ formatDate(index) }}</span>
            </button>
            <button
                v-if="canEdit"
                @click="$emit('add-day')"
                :class="['px-4 py-2 rounded-2xl transition-colors', themeConfig.tabInactiveClass]"
            >
                <i class="fa-solid fa-plus"></i>
            </button>
        </div>
    </div>
</template>

<script setup>
import { watch, nextTick } from 'vue'
import { getDayDate } from '../../utils/dateUtils'

const props = defineProps({
    itinerary: Array,
    activeDay: Number,
    startDate: String,
    themeConfig: Object,
    canEdit: { type: Boolean, default: true }
})

defineEmits(['update:activeDay', 'add-day'])

const formatDate = (idx) => {
    return getDayDate(props.startDate, idx)
}

watch(
    () => props.activeDay,
    async (newVal) => {
        await nextTick()
        const activeTab = document.getElementById(`day-tab-${newVal}`)
        if (activeTab) {
            activeTab.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
                inline: 'center'
            })
        }
    },
    { immediate: true }
)
</script>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
    display: none;
}
.no-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
}
</style>
