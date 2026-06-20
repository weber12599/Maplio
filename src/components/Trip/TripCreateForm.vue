<template>
    <div
        :class="[
            'fixed inset-0 z-[30000] flex items-center justify-center p-4 transition-colors duration-500',
            themeConfig.dialogOverlayClass
        ]"
    >
        <div
            :class="[
                'w-full max-w-md rounded-[2.5rem] p-8 border transition-all duration-500 space-y-6 shadow-2xl',
                themeConfig.dialogContainerClass
            ]"
        >
            <h3 :class="['font-bold text-xl transition-colors', themeConfig.dialogTitleClass]">
                {{ isDemo ? $t('trip_form.title_local') : $t('trip_form.title') }}
            </h3>

            <div class="space-y-4">
                <div>
                    <label
                        :class="[
                            'text-[10px] font-black uppercase ml-1 transition-colors',
                            themeConfig.dialogLabelClass
                        ]"
                        >{{ $t('trip_form.label_name') }}</label
                    >
                    <input
                        v-model="newTrip.name"
                        :placeholder="$t('trip_form.placeholder_name')"
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
                            >{{ $t('trip_form.label_date') }}</label
                        >
                        <input
                            type="date"
                            v-model="newTrip.startDate"
                            :class="[
                                'w-full rounded-xl px-4 py-3 outline-none border transition-all',
                                themeConfig.dialogInputClass
                            ]"
                        />
                    </div>
                    <div class="w-24">
                        <label
                            :class="[
                                'text-[10px] font-black uppercase ml-1 transition-colors',
                                themeConfig.dialogLabelClass
                            ]"
                            >{{ $t('trip_form.label_duration') }}</label
                        >
                        <input
                            type="number"
                            v-model.number="newTrip.duration"
                            min="1"
                            :class="[
                                'w-full rounded-xl px-4 py-3 outline-none border transition-all',
                                themeConfig.dialogInputClass
                            ]"
                        />
                    </div>
                </div>
            </div>

            <div class="flex gap-4 pt-4">
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
                    @click="handleCreate"
                    :disabled="isSubmitting"
                    :class="[
                        'flex-grow py-3 rounded-xl font-bold transition-all shadow-lg active:scale-95 disabled:opacity-50',
                        themeConfig.primaryBtnClass
                    ]"
                >
                    {{ isSubmitting ? $t('trip_form.btn_creating') : $t('trip_form.btn_create') }}
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useTripStore } from '../../stores/trip'
import { createTrip } from '../../services/tripService'

const props = defineProps({
    isDemo: Boolean,
    user: Object,
    themeConfig: {
        type: Object,
        required: true
    }
})

const emit = defineEmits(['cancel', 'created'])

const { t } = useI18n()
const tripStore = useTripStore()

const isSubmitting = ref(false)
const newTrip = ref({
    name: '',
    startDate: '',
    duration: 1
})

const resetForm = () => {
    newTrip.value = { name: '', startDate: '', duration: 1 }
}

const handleCreate = async () => {
    if (!newTrip.value.name || !newTrip.value.startDate) {
        return alert(t('trip_form.error_incomplete'))
    }

    if (!newTrip.value.duration || newTrip.value.duration < 1) {
        return alert(t('trip_form.error_invalid_duration'))
    }

    isSubmitting.value = true
    try {
        const itinerary = Array.from({ length: newTrip.value.duration }, () => ({
            plans: [
                {
                    id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
                    name: '',
                    spots: []
                }
            ]
        }))

        const uid = props.user ? props.user.uid : 'demo-user'
        const tripData = {
            name: newTrip.value.name,
            startDate: newTrip.value.startDate,
            members: [uid],
            permissions: { [uid]: 'owner' },
            memberProfiles: {
                [uid]: {
                    displayName: props.user?.displayName || 'Demo User',
                    photoURL: props.user?.photoURL || null
                }
            },
            itinerary,
            createdAt: props.isDemo ? new Date().toISOString() : new Date()
        }

        if (props.isDemo) {
            tripData.id = 'demo_' + Date.now()
            tripStore.addLocalTrip(tripData)
        } else {
            await createTrip(tripData)
        }

        emit('created')
        resetForm()
    } catch (error) {
        console.error('Fail to create a trip:', error)
        alert(t('trip_form.error_failed'))
    } finally {
        isSubmitting.value = false
    }
}
</script>
