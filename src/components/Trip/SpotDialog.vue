<template>
    <div
        :class="[
            'fixed inset-0 z-[30000] flex items-center justify-center p-4 transition-colors duration-500',
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
                {{ $t('planner.spot_dialog.title') }}
            </h3>

            <div class="space-y-4">
                <div>
                    <label
                        :class="[
                            'text-[10px] font-black uppercase ml-1 transition-colors',
                            themeConfig.dialogLabelClass
                        ]"
                        >{{ $t('planner.spot_dialog.label_name') }}</label
                    >
                    <input
                        v-model="localSpot.name"
                        :placeholder="$t('planner.spot_dialog.placeholder_name')"
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
                            >{{ $t('planner.spot_dialog.label_start_time') }}</label
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
                            >{{ $t('planner.spot_dialog.label_end_time') }}</label
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
                        >{{ $t('planner.spot_dialog.label_notes') }}</label
                    >
                    <textarea
                        v-model="localSpot.notes"
                        :placeholder="$t('planner.spot_dialog.placeholder_notes')"
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
                        >{{ $t('planner.spot_dialog.label_url') }}</label
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
                            >{{ $t('planner.spot_dialog.label_coords') }}</label
                        >
                        <button
                            @click="handlePaste"
                            :class="[
                                'text-[10px] px-2 py-1 rounded-lg transition-all',
                                themeConfig.dialogSecondaryBtnClass
                            ]"
                        >
                            <i class="fa-solid fa-paste mr-1"></i>
                            {{ $t('planner.spot_dialog.btn_paste') }}
                        </button>
                    </div>
                    <div class="flex gap-4">
                        <input
                            v-model.number="localSpot.lat"
                            type="number"
                            step="any"
                            :placeholder="$t('planner.spot_dialog.placeholder_lat')"
                            :class="[
                                'w-full rounded-xl px-4 py-3 outline-none border transition-all',
                                themeConfig.dialogInputClass
                            ]"
                        />
                        <input
                            v-model.number="localSpot.lng"
                            type="number"
                            step="any"
                            :placeholder="$t('planner.spot_dialog.placeholder_lng')"
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
                    {{ $t('common.cancel') }}
                </button>
                <button
                    @click="$emit('confirm', localSpot)"
                    :class="[
                        'flex-grow py-3 rounded-xl font-bold transition-all shadow-lg active:scale-95',
                        themeConfig.primaryBtnClass
                    ]"
                >
                    {{ $t('common.confirm') }}
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { parseClipboardCoords } from '../../utils/mapUtils'

const props = defineProps({
    modelValue: Object,
    themeConfig: Object
})

const emit = defineEmits(['cancel', 'confirm'])

const { t } = useI18n()

const localSpot = ref(JSON.parse(JSON.stringify(props.modelValue)))

const handlePaste = async () => {
    try {
        const text = await navigator.clipboard.readText()
        const coords = parseClipboardCoords(text)
        if (coords) {
            localSpot.value.lat = coords.lat
            localSpot.value.lng = coords.lng
        }
    } catch (err) {
        console.error('Fail to read a valid JSON from clipboard ', err)
    }
}
</script>
