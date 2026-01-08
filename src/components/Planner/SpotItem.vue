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
                            v-model="spot.showOnMap"
                            :disabled="!spot.lat"
                            @change="$emit('update-data')"
                            class="w-4 h-4 rounded border-stone-300 bg-white text-stone-800 focus:ring-stone-500 disabled:opacity-20 cursor-pointer"
                        />

                        <div class="flex items-center gap-2 truncate">
                            <p class="font-bold opacity-90 tracking-tight truncate">
                                {{ spot.name || '未命名景點' }}
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
                            title="複製此景點到其他天"
                        >
                            <i class="fa-regular fa-copy text-[11px]"></i>
                        </button>

                        <button
                            @click="$emit('edit', spot)"
                            class="opacity-30 hover:opacity-100 transition-opacity"
                            title="編輯"
                        >
                            <i class="fa-solid fa-pen-to-square text-[11px]"></i>
                        </button>
                    </div>

                    <div v-if="spot.notes" class="w-full mt-2">
                        <div v-for="(note, index) in spot.notes.split('\n')" :key="index">
                            <a
                                v-if="note.startsWith('http')"
                                class="text-xs opacity-50 leading-relaxed overflow-hidden text-ellipsis block hover:underline hover:opacity-100"
                                :href="note"
                                target="_blank"
                                rel="noopener noreferrer"
                                @click.stop
                            >
                                {{ note }}
                            </a>
                            <div
                                v-else
                                class="text-xs opacity-50 leading-relaxed overflow-hidden text-ellipsis"
                            >
                                {{ note }}
                            </div>
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
                        @click="$emit('remove')"
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
                    v-model="spot.travelMode"
                    @change="$emit('update-data')"
                    :class="[
                        'text-[10px] border rounded-xl px-2 py-1 outline-none font-bold shadow-sm transition-all cursor-pointer w-11 md:w-auto',
                        themeConfig.transportSelectClass
                    ]"
                >
                    <option value="auto">✨ 自動模式</option>
                    <option value="driving">🚗 點對點開車</option>
                    <option value="transit">🚌 大眾運輸</option>
                    <option value="walking">🚶 徒步前往</option>
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
                            <div
                                v-for="(note, index) in spot.transportNotes.split('\n')"
                                :key="index"
                            >
                                <a
                                    v-if="note.startsWith('http')"
                                    class="opacity-80 leading-relaxed overflow-hidden text-ellipsis block hover:underline hover:opacity-100"
                                    :href="note"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    @click.stop
                                >
                                    {{ note }}
                                </a>
                                <div
                                    v-else
                                    class="opacity-80 leading-relaxed overflow-hidden text-wrap"
                                >
                                    {{ note }}
                                </div>
                            </div>
                        </div>

                        <div v-if="!spot.transportNotes && !spot.transStart && !spot.transEnd">
                            <div>
                                <div
                                    class="opacity-80 italic leading-relaxed overflow-hidden text-ellipsis"
                                >
                                    ＋ 交通備註與時間
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
                    :title="canNavigate ? '開啟導航' : '缺少經緯度，無法導航'"
                >
                    <i class="fa-solid fa-route text-xs"></i>
                </button>
            </div>
            <div :class="['w-[2px] h-4 transition-colors', themeConfig.lineClass]"></div>
        </div>
    </div>
</template>

<script>
export default {
    props: {
        spot: Object,
        nextSpot: Object,
        isLast: Boolean,
        themeConfig: Object
    },
    computed: {
        canNavigate() {
            if (this.isLast || !this.nextSpot) return false
            const hasStartCoord = this.spot.lat && this.spot.lng
            const hasEndCoord = this.nextSpot.lat && this.nextSpot.lng
            return hasStartCoord && hasEndCoord
        }
    }
}
</script>
