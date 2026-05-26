<template>
    <div class="flex flex-col items-center">
        <div
            :class="[
                'w-full p-5 rounded-[2rem] border transition-all duration-500 relative',
                themeConfig.cardClass
            ]"
        >
            <div class="flex items-start gap-4">
                <div
                    class="drag-handle opacity-30 cursor-grab px-1 pt-1 hover:opacity-100 transition-opacity"
                >
                    <i class="fa-solid fa-grip-vertical"></i>
                </div>

                <div class="flex-grow min-w-0">
                    <div class="flex items-center gap-2">
                        <input
                            type="checkbox"
                            :checked="spot.showOnMap"
                            :disabled="!spot.lat"
                            @change="handleShowOnMapChange"
                            class="w-4 h-4 rounded border-stone-300 bg-white text-stone-800 focus:ring-stone-500 disabled:opacity-20 cursor-pointer"
                        />

                        <div class="flex items-center gap-2 truncate">
                            <p class="font-bold opacity-90 tracking-tight truncate">
                                {{ spot.name || $t('planner.unnamed_spot') }}
                            </p>

                            <span
                                v-if="spot.source === 'google_parsed'"
                                class="text-[8px] px-1.2 py-0.2 border border-emerald-500/50 text-emerald-500 rounded font-bold uppercase shrink-0"
                                >Map</span
                            >
                            <span
                                v-else-if="spot.source === 'url_only'"
                                class="text-[8px] px-1.2 py-0.2 border border-amber-500/50 text-amber-500 rounded font-bold uppercase shrink-0"
                                >Link</span
                            >
                            <span
                                v-else-if="spot.source === 'search'"
                                class="text-[8px] px-1.2 py-0.2 border border-blue-500/50 text-blue-500 rounded font-bold uppercase shrink-0"
                                >Web</span
                            >
                        </div>
                    </div>

                    <div class="flex items-center gap-2 flex-wrap">
                        <span
                            v-if="spot.timeStart || spot.timeEnd"
                            :class="[
                                'text-[9px] px-2 py-0.5 rounded-md font-bold italic',
                                themeConfig.badgeClass
                            ]"
                        >
                            {{ spot.timeStart }} - {{ spot.timeEnd }}
                        </span>

                        <button
                            @click="$emit('copy', spot)"
                            class="opacity-30 hover:opacity-100 transition-opacity w-5 h-5 flex items-center justify-center"
                            :title="$t('planner.copy_spot_tooltip')"
                        >
                            <i class="fa-regular fa-copy text-[11px]"></i>
                        </button>

                        <button
                            @click="$emit('edit', spot)"
                            class="opacity-30 hover:opacity-100 transition-opacity"
                            :title="$t('planner.edit_spot_tooltip')"
                        >
                            <i class="fa-solid fa-pen-to-square text-[11px]"></i>
                        </button>
                    </div>

                    <div
                        v-if="spot.notes"
                        class="flex items-start gap-2 mt-1 px-2 text-xs text-stone-500 group/notes"
                    >
                        <div
                            class="flex-grow min-w-0"
                            @click="showExpandBtn && toggleExpand()"
                            :class="{ 'cursor-pointer': showExpandBtn }"
                        >
                            <span
                                ref="noteRef"
                                class="block whitespace-pre-wrap break-words transition-all"
                                :class="{ 'line-clamp-2': !isExpanded }"
                                v-html="formatNote(spot.notes)"
                            >
                            </span>

                            <button
                                v-if="showExpandBtn"
                                @click.stop="toggleExpand"
                                class="w-full mt-1 font-bold opacity-60 hover:opacity-100 transition-opacity flex items-center justify-center gap-1 text-[10px]"
                                :class="'text-stone-400 hover:text-stone-600'"
                            >
                                <i
                                    class="fa-solid transition-transform duration-300"
                                    :class="isExpanded ? 'fa-chevron-up' : 'fa-chevron-down'"
                                ></i>
                            </button>
                        </div>
                    </div>
                </div>

                <div class="flex flex-col gap-3">
                    <button
                        @click="$emit('open-map', spot)"
                        :class="[
                            'w-10 h-10 flex items-center justify-center rounded-2xl shadow-sm active:scale-90 transition-all',
                            themeConfig.accentBtnClass
                        ]"
                    >
                        <i class="fa-solid fa-location-dot text-xs"></i>
                    </button>
                    <button
                        @click="confirmRemove"
                        class="w-10 h-10 flex items-center justify-center rounded-2xl bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors"
                    >
                        <i class="fa-solid fa-xmark text-sm"></i>
                    </button>
                </div>
            </div>
        </div>

        <div v-if="!isLast" class="w-full flex flex-col items-center py-2">
            <div :class="['w-[2px] h-4 transition-colors', themeConfig.lineClass]"></div>

            <div class="flex items-center gap-3 w-full px-8">
                <select
                    :value="spot.travelMode"
                    @change="handleTravelModeChange"
                    :class="[
                        'text-[10px] border rounded-xl px-2 py-1 outline-none font-bold shadow-sm transition-all cursor-pointer w-11 md:w-auto',
                        themeConfig.transportSelectClass
                    ]"
                >
                    <option value="auto">{{ $t('planner.transport.auto') }}</option>
                    <option value="driving">{{ $t('planner.transport.driving') }}</option>
                    <option value="transit">{{ $t('planner.transport.transit') }}</option>
                    <option value="walking">{{ $t('planner.transport.walking') }}</option>
                </select>

                <div class="flex-grow overflow-hidden">
                    <div
                        @click="$emit('edit-transport', spot)"
                        class="flex-col justify-start font-bold text-[10px] opacity-50 hover:opacity-100 cursor-pointer py-1 truncate transition-opacity"
                    >
                        <div v-if="spot.transStart || spot.transEnd">
                            <div>
                                <div
                                    class="opacity-80 leading-relaxed overflow-hidden text-ellipsis"
                                >
                                    {{ spot.transStart }}-{{ spot.transEnd }}
                                </div>
                            </div>
                        </div>

                        <div v-if="spot.transportNotes">
                            <span
                                class="whitespace-pre-wrap break-words transition-all"
                                v-html="formatNote(spot.transportNotes)"
                            >
                            </span>
                        </div>

                        <div v-if="!spot.transportNotes && !spot.transStart && !spot.transEnd">
                            <div>
                                <div
                                    class="opacity-80 italic leading-relaxed overflow-hidden text-ellipsis"
                                >
                                    {{ $t('planner.transport_note_placeholder') }}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <button
                    v-if="!isLast"
                    :disabled="!canNavigate"
                    @click="canNavigate && $emit('navigate')"
                    :class="[
                        'w-8 h-8 rounded-full flex items-center justify-center transition-all shrink-0',
                        themeConfig.navBtnClass,
                        !canNavigate
                            ? 'opacity-20 cursor-not-allowed grayscale'
                            : 'hover:scale-110 active:scale-90'
                    ]"
                    :title="canNavigate ? $t('planner.nav_tooltip') : $t('planner.nav_disabled')"
                >
                    <i class="fa-solid fa-route text-xs"></i>
                </button>
            </div>
            <div :class="['w-[2px] h-4 transition-colors', themeConfig.lineClass]"></div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import { formatNote } from '@/utils/stringUtils'

const props = defineProps({
    spot: Object,
    nextSpot: Object,
    isLast: Boolean,
    themeConfig: Object
})

const emit = defineEmits([
    'edit',
    'copy',
    'remove',
    'open-map',
    'update:showOnMap',
    'update:travelMode',
    'edit-transport',
    'navigate'
])

const { t } = useI18n()

const isExpanded = ref(false)
const showExpandBtn = ref(false)
const noteRef = ref(null)
let resizeObserver = null

const canNavigate = computed(() => {
    if (props.isLast || !props.nextSpot) return false
    const hasStartCoord = props.spot.lat && props.spot.lng
    const hasEndCoord = props.nextSpot.lat && props.nextSpot.lng
    return !!(hasStartCoord && hasEndCoord)
})

const confirmRemove = () => {
    if (confirm(t('planner.delete_spot_confirm'))) {
        emit('remove')
    }
}

const handleShowOnMapChange = (event) => {
    emit('update:showOnMap', event.target.checked)
}

const handleTravelModeChange = (event) => {
    emit('update:travelMode', event.target.value)
}

const toggleExpand = () => {
    isExpanded.value = !isExpanded.value
}

const checkOverflow = () => {
    const el = noteRef.value
    if (!el) return

    if (!isExpanded.value) {
        showExpandBtn.value = el.scrollHeight > el.clientHeight + 1
    } else {
        const style = window.getComputedStyle(el)
        let lineHeight = parseFloat(style.lineHeight)
        if (isNaN(lineHeight)) {
            const fontSize = parseFloat(style.fontSize) || 16
            lineHeight = fontSize * 1.2
        }

        const maxAllowedHeight = lineHeight * 2
        showExpandBtn.value = el.scrollHeight > maxAllowedHeight + 1
    }
}

watch(
    () => props.spot.notes,
    () => {
        isExpanded.value = false
        nextTick(() => {
            checkOverflow()
            if (showExpandBtn.value) {
                isExpanded.value = true
            }
        })
    },
    { flush: 'post' }
)

onMounted(() => {
    nextTick(() => {
        setTimeout(() => {
            checkOverflow()
            isExpanded.value = true
        }, 50)
    })

    if (noteRef.value) {
        resizeObserver = new ResizeObserver(() => {
            requestAnimationFrame(() => checkOverflow())
        })
        resizeObserver.observe(noteRef.value)
    }
})

onUnmounted(() => {
    if (resizeObserver) {
        resizeObserver.disconnect()
        resizeObserver = null
    }
})
</script>

<style scoped>
.line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}
</style>
