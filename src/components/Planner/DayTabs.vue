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
                @click="$emit('add-day')"
                :class="['px-4 py-2 rounded-2xl transition-colors', themeConfig.tabInactiveClass]"
            >
                <i class="fa-solid fa-plus"></i>
            </button>
        </div>
    </div>
</template>

<script>
import { getDayDate } from '../../utils/dateUtils'

export default {
    props: {
        itinerary: Array,
        activeDay: Number,
        startDate: String,
        themeConfig: Object
    },
    emits: ['update:activeDay', 'add-day'],
    methods: {
        formatDate(idx) {
            return getDayDate(this.startDate, idx)
        }
    },
    watch: {
        activeDay: {
            async handler(newVal) {
                this.$nextTick(() => {
                    const activeTab = document.getElementById(`day-tab-${newVal}`)
                    if (activeTab) {
                        activeTab.scrollIntoView({
                            behavior: 'smooth',
                            block: 'nearest',
                            inline: 'center'
                        })
                    }
                })
            },
            immediate: true,
            deep: false
        }
    }
}
</script>

<style scoped>
/* 隱藏滾動條但保持功能 */
.no-scrollbar::-webkit-scrollbar {
    display: none;
}
.no-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
}
</style>
