<template>
    <div class="flex flex-col items-center">
        <div
            class="w-full p-5 bg-slate-800/40 rounded-[2rem] border border-slate-700/20 hover:bg-slate-800/60 transition-all relative"
        >
            <div class="flex items-start gap-4">
                <div
                    class="drag-handle text-slate-700 cursor-grab px-1 pt-1 opacity-50 hover:opacity-100"
                >
                    <i class="fa-solid fa-grip-vertical"></i>
                </div>

                <div class="flex-grow min-w-0">
                    <div class="flex items-center gap-2 flex-wrap">
                        <input
                            type="checkbox"
                            v-model="spot.showOnMap"
                            :disabled="!spot.lat || !spot.lng"
                            @change="$emit('update-data')"
                            class="w-4 h-4 rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-blue-500 disabled:opacity-30"
                            title="是否在地圖上顯示座標"
                        />

                        <span
                            v-if="spot.timeStart"
                            class="text-[9px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-md font-black italic"
                        >
                            {{ spot.timeStart }} - {{ spot.timeEnd }}
                        </span>
                        <p class="font-bold text-slate-200 truncate">{{ spot.name }}</p>
                        <button
                            @click="$emit('edit', spot)"
                            class="text-slate-700 hover:text-blue-400"
                        >
                            <i class="fa-solid fa-pen-to-square text-[11px]"></i>
                        </button>
                    </div>
                    <p v-if="spot.notes" class="text-xs text-slate-500 mt-2 leading-relaxed italic">
                        {{ spot.notes }}
                    </p>
                </div>

                <div class="flex flex-col gap-3">
                    <button
                        @click="$emit('open-map', spot)"
                        class="w-10 h-10 flex items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg active:scale-90 transition-all"
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
            <div class="w-[2px] h-4 bg-slate-800"></div>
            <div class="flex items-center gap-3 w-full px-8">
                <select
                    v-model="spot.travelMode"
                    @change="$emit('update-data')"
                    class="bg-slate-800 text-[10px] text-blue-400 border border-slate-700 rounded-xl px-2 py-1 outline-none font-black shadow-sm"
                >
                    <option value="auto">✨ 自動模式</option>
                    <option value="driving">🚗 點對點開車</option>
                    <option value="transit">🚌 大眾運輸</option>
                    <option value="walking">🚶 徒步前往</option>
                </select>
                <div class="flex-grow text-center overflow-hidden">
                    <div
                        @click="$emit('edit-transport', spot)"
                        class="text-[10px] text-slate-500 hover:text-blue-400 cursor-pointer py-1 truncate transition-colors"
                    >
                        <span v-if="spot.transStart" class="font-black text-slate-400 mr-2 italic"
                            >{{ spot.transStart }}-{{ spot.transEnd }}</span
                        >
                        {{ spot.transportNotes || '＋ 交通備註與時間' }}
                    </div>
                </div>
                <button
                    @click="$emit('navigate')"
                    class="w-9 h-9 flex items-center justify-center rounded-full bg-slate-800 border border-slate-700 text-slate-500 hover:border-blue-500 hover:text-blue-400 transition-all shadow-sm"
                >
                    <i class="fa-solid fa-route text-xs"></i>
                </button>
            </div>
            <div class="w-[2px] h-4 bg-slate-800"></div>
        </div>
    </div>
</template>

<script>
export default {
    props: {
        spot: Object,
        isLast: Boolean
    }
}
</script>
