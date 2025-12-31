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
                    <div class="flex items-center gap-2 flex-wrap">
                        <input
                            type="checkbox"
                            v-model="spot.showOnMap"
                            :disabled="!spot.lat"
                            @change="$emit('update-data')"
                            class="w-4 h-4 rounded border-stone-300 bg-white text-stone-800 focus:ring-stone-500 disabled:opacity-20 cursor-pointer"
                        />

                        <span
                            v-if="spot.timeStart"
                            :class="[
                                'text-[9px] px-2 py-0.5 rounded-md font-bold italic',
                                themeConfig.badgeClass
                            ]"
                        >
                            {{ spot.timeStart }} - {{ spot.timeEnd }}
                        </span>

                        <p class="font-bold truncate opacity-90 tracking-tight">{{ spot.name }}</p>
                        <button
                            @click="$emit('edit', spot)"
                            class="opacity-30 hover:opacity-100 transition-opacity"
                        >
                            <i class="fa-solid fa-pen-to-square text-[11px]"></i>
                        </button>
                    </div>
                    <p v-if="spot.notes" class="text-xs opacity-50 mt-2 leading-relaxed italic">
                        {{ spot.notes }}
                    </p>
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
                        'text-[10px] border rounded-xl px-2 py-1 outline-none font-bold shadow-sm transition-all cursor-pointer',
                        themeConfig.transportSelectClass
                    ]"
                >
                    <option value="auto">✨ 自動模式</option>
                    <option value="driving">🚗 點對點開車</option>
                    <option value="transit">🚌 大眾運輸</option>
                    <option value="walking">🚶 徒步前往</option>
                </select>

                <div class="flex-grow text-center overflow-hidden">
                    <div
                        @click="$emit('edit-transport', spot)"
                        class="text-[10px] opacity-50 hover:opacity-100 cursor-pointer py-1 truncate transition-opacity"
                    >
                        <span v-if="spot.transStart" class="font-bold mr-2 italic opacity-80">
                            {{ spot.transStart }}-{{ spot.transEnd }}
                        </span>
                        {{ spot.transportNotes || '＋ 交通備註與時間' }}
                    </div>
                </div>

                <button
                    @click="$emit('navigate')"
                    :class="[
                        'w-9 h-9 flex items-center justify-center rounded-full border transition-all shadow-sm',
                        themeConfig.navBtnClass
                    ]"
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
        isLast: Boolean,
        themeConfig: Object
    }
}
</script>
