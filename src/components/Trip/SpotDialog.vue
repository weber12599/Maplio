<template>
    <div
        class="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
    >
        <div
            class="w-full max-w-md bg-slate-800 rounded-[2.5rem] p-8 border border-blue-500/30 shadow-2xl space-y-6"
        >
            <h3 class="text-xl font-black text-blue-400">景點詳細資訊</h3>
            <div class="space-y-4">
                <div>
                    <label class="text-[10px] text-slate-500 font-black uppercase ml-1"
                        >名稱 *</label
                    >
                    <input
                        v-model="localSpot.name"
                        placeholder="請輸入名稱"
                        class="w-full bg-slate-900 border-none rounded-xl px-4 py-3 text-white outline-none focus:ring-1 focus:ring-blue-500"
                    />
                </div>

                <div class="flex gap-4">
                    <div class="flex-grow">
                        <label class="text-[10px] text-slate-500 font-black uppercase ml-1"
                            >開始時間</label
                        >
                        <input
                            type="time"
                            v-model="localSpot.timeStart"
                            class="w-full bg-slate-900 rounded-xl px-3 py-2 text-[11px] text-blue-400 outline-none"
                        />
                    </div>
                    <div class="flex-grow">
                        <label class="text-[10px] text-slate-500 font-black uppercase ml-1"
                            >結束時間</label
                        >
                        <input
                            type="time"
                            v-model="localSpot.timeEnd"
                            class="w-full bg-slate-900 rounded-xl px-3 py-2 text-[11px] text-blue-400 outline-none"
                        />
                    </div>
                </div>

                <div>
                    <label class="text-[10px] text-slate-500 font-black uppercase ml-1">備註</label>
                    <textarea
                        v-model="localSpot.notes"
                        placeholder="在此輸入備註資訊..."
                        class="w-full bg-slate-900 rounded-xl px-4 py-3 text-xs text-slate-300 outline-none resize-none h-20"
                    ></textarea>
                </div>

                <div>
                    <label class="text-[10px] text-slate-500 font-black uppercase ml-1"
                        >Google Map 網址</label
                    >
                    <input
                        v-model="localSpot.url"
                        placeholder="https://www.google.com/maps/search/?api=1&query=35.6894875,139.69170645.."
                        class="w-full bg-slate-900 border-none rounded-xl px-4 py-3 text-slate-400 text-[10px] outline-none truncate"
                    />
                </div>

                <div class="space-y-2">
                    <div class="flex justify-between items-center px-1">
                        <label class="text-[10px] text-slate-500 font-black uppercase"
                            >座標位置</label
                        >
                        <button
                            @click="handlePaste"
                            class="text-[10px] bg-slate-700 text-blue-400 px-2 py-1 rounded-lg hover:bg-slate-600 transition-colors"
                        >
                            <i class="fa-solid fa-paste mr-1"></i> 從剪貼簿貼上
                        </button>
                    </div>
                    <div class="flex gap-4">
                        <input
                            v-model.number="localSpot.lat"
                            type="number"
                            step="any"
                            placeholder="緯度 (Lat)"
                            class="w-full bg-slate-900 border-none rounded-xl px-4 py-3 text-white outline-none"
                        />
                        <input
                            v-model.number="localSpot.lng"
                            type="number"
                            step="any"
                            placeholder="經度 (Lng)"
                            class="w-full bg-slate-900 border-none rounded-xl px-4 py-3 text-white outline-none"
                        />
                    </div>
                </div>

                <p class="text-[10px] text-amber-500/80 italic ml-1">
                    提示：若未填入座標，此景點將不會出現在地圖上。
                </p>
            </div>

            <div class="flex gap-4 pt-2">
                <button
                    @click="$emit('cancel')"
                    class="flex-grow py-3 text-slate-500 font-bold hover:text-slate-300 transition-colors"
                >
                    取消
                </button>
                <button
                    @click="$emit('confirm', localSpot)"
                    class="flex-grow py-3 bg-blue-600 rounded-xl font-bold text-white shadow-lg shadow-blue-600/20 active:scale-95 transition-all"
                >
                    確認
                </button>
            </div>
        </div>
    </div>
</template>

<script>
import { parseClipboardCoords } from '../../utils/mapUtils'

export default {
    props: {
        modelValue: {
            type: Object,
            default: () => ({})
        }
    },
    emits: ['cancel', 'confirm'],
    data() {
        return {
            localSpot: JSON.parse(JSON.stringify(this.modelValue))
        }
    },
    methods: {
        async handlePaste() {
            try {
                const text = await navigator.clipboard.readText()
                const coords = parseClipboardCoords(text)
                if (coords) {
                    this.localSpot.lat = coords.lat
                    this.localSpot.lng = coords.lng
                } else {
                    alert('剪貼簿內容不符合座標格式 (緯度, 經度)')
                }
            } catch (err) {
                console.error('無法存取剪貼簿:', err)
                alert('請確認已授權瀏覽器讀取剪貼簿')
            }
        }
    }
}
</script>

<style scoped>
/* 針對日期/時間輸入框的時鐘圖示進行反色處理，符合深色主題 */
input[type='time']::-webkit-calendar-picker-indicator {
    filter: invert(1);
    opacity: 0.5;
}
</style>
