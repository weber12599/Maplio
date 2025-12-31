<template>
    <div
        :class="[
            'fixed inset-0 z-[200] flex items-center justify-center p-4 transition-colors duration-500',
            themeConfig.dialogOverlayClass
        ]"
    >
        <div
            :class="[
                'w-full max-w-md rounded-[2.5rem] p-8 border transition-all duration-500 space-y-6',
                themeConfig.dialogContainerClass
            ]"
        >
            <h3 :class="['text-xl font-black transition-colors', themeConfig.dialogTitleClass]">
                景點詳細資訊
            </h3>

            <div class="space-y-4">
                <div>
                    <label
                        :class="[
                            'text-[10px] font-black uppercase ml-1 transition-colors',
                            themeConfig.dialogLabelClass
                        ]"
                        >名稱 *</label
                    >
                    <input
                        v-model="localSpot.name"
                        placeholder="請輸入名稱"
                        :class="[
                            'w-full rounded-xl px-4 py-3 outline-none border transition-all',
                            themeConfig.dialogInputClass
                        ]"
                    />
                </div>

                <div class="flex gap-4">
                    <div class="flex-grow">
                        <label
                            :class="[
                                'text-[10px] font-black uppercase ml-1 transition-colors',
                                themeConfig.dialogLabelClass
                            ]"
                            >開始時間</label
                        >
                        <input
                            type="time"
                            v-model="localSpot.timeStart"
                            :class="[
                                'w-full rounded-xl px-3 py-2 text-[11px] outline-none border transition-all',
                                themeConfig.dialogInputClass
                            ]"
                        />
                    </div>
                    <div class="flex-grow">
                        <label
                            :class="[
                                'text-[10px] font-black uppercase ml-1 transition-colors',
                                themeConfig.dialogLabelClass
                            ]"
                            >結束時間</label
                        >
                        <input
                            type="time"
                            v-model="localSpot.timeEnd"
                            :class="[
                                'w-full rounded-xl px-3 py-2 text-[11px] outline-none border transition-all',
                                themeConfig.dialogInputClass
                            ]"
                        />
                    </div>
                </div>

                <div>
                    <label
                        :class="[
                            'text-[10px] font-black uppercase ml-1 transition-colors',
                            themeConfig.dialogLabelClass
                        ]"
                        >備註</label
                    >
                    <textarea
                        v-model="localSpot.notes"
                        placeholder="在此輸入備註資訊..."
                        :class="[
                            'w-full rounded-xl px-4 py-3 text-xs outline-none resize-none h-20 border transition-all',
                            themeConfig.dialogInputClass
                        ]"
                    ></textarea>
                </div>

                <div>
                    <label
                        :class="[
                            'text-[10px] font-black uppercase ml-1 transition-colors',
                            themeConfig.dialogLabelClass
                        ]"
                        >Google Map 網址</label
                    >
                    <input
                        v-model="localSpot.url"
                        placeholder="https://maps.google.com/..."
                        :class="[
                            'w-full rounded-xl px-4 py-3 text-[10px] outline-none truncate border transition-all',
                            themeConfig.dialogInputClass
                        ]"
                    />
                </div>

                <div class="space-y-2">
                    <div class="flex justify-between items-center px-1">
                        <label
                            :class="[
                                'text-[10px] font-black uppercase transition-colors',
                                themeConfig.dialogLabelClass
                            ]"
                            >座標位置</label
                        >
                        <button
                            @click="handlePaste"
                            :class="[
                                'text-[10px] px-2 py-1 rounded-lg transition-all',
                                themeConfig.dialogSecondaryBtnClass
                            ]"
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
                            :class="[
                                'w-full rounded-xl px-4 py-3 outline-none border transition-all',
                                themeConfig.dialogInputClass
                            ]"
                        />
                        <input
                            v-model.number="localSpot.lng"
                            type="number"
                            step="any"
                            placeholder="經度 (Lng)"
                            :class="[
                                'w-full rounded-xl px-4 py-3 outline-none border transition-all',
                                themeConfig.dialogInputClass
                            ]"
                        />
                    </div>
                </div>
            </div>

            <div class="flex gap-4 pt-2">
                <button
                    @click="$emit('cancel')"
                    :class="[
                        'flex-grow py-3 font-bold transition-colors',
                        themeConfig.dialogCancelBtnClass
                    ]"
                >
                    取消
                </button>
                <button
                    @click="$emit('confirm', localSpot)"
                    :class="[
                        'flex-grow py-3 rounded-xl font-bold transition-all shadow-lg active:scale-95',
                        themeConfig.primaryBtnClass
                    ]"
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
        modelValue: Object,
        themeConfig: Object
    },
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
                }
            } catch (err) {
                console.error('無法讀取剪貼簿', err)
            }
        }
    }
}
</script>
