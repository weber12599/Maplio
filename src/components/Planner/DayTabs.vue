<template>
    <div class="flex items-center bg-slate-900 border-b border-slate-800 shrink-0">
        <div class="flex overflow-x-auto no-scrollbar px-6 py-4 gap-3">
            <button
                v-for="(day, index) in itinerary"
                :key="index"
                @click="$emit('update:activeDay', index)"
                :class="
                    activeDay === index
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'bg-slate-800 text-slate-500'
                "
                class="px-5 py-2 rounded-2xl text-sm font-black whitespace-nowrap flex flex-col items-center min-w-[85px]"
            >
                Day {{ index + 1 }}
                <span class="text-[9px] font-bold opacity-60">{{ formatDate(index) }}</span>
            </button>
            <button
                @click="$emit('add-day')"
                class="px-4 py-2 bg-slate-800 text-slate-600 rounded-2xl"
            >
                <i class="fa-solid fa-plus"></i>
            </button>
        </div>
    </div>
</template>
<script>
import { getDayDate } from '../../utils/dateUtils'
export default {
    props: ['itinerary', 'activeDay', 'startDate'],
    methods: {
        formatDate(idx) {
            return getDayDate(this.startDate, idx)
        }
    }
}
</script>
