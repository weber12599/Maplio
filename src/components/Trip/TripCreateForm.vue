<template>
    <div
        :class="[
            'fixed inset-0 z-[9999] flex items-center justify-center p-4 transition-colors duration-500',
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
                            v-model="newTrip.duration"
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

<script>
import { db } from '../../firebase'
import { collection, addDoc } from 'firebase/firestore'
import { useTripStore } from '../../stores/trip'
import { useI18n } from 'vue-i18n'

export default {
    props: {
        isDemo: Boolean,
        user: Object,
        themeConfig: Object
    },
    emits: ['cancel', 'created'],
    setup() {
        const tripStore = useTripStore()
        const { t } = useI18n()
        return { tripStore, t }
    },
    data() {
        return {
            newTrip: {
                name: '',
                startDate: '',
                duration: 1
            },
            isSubmitting: false
        }
    },
    methods: {
        async handleCreate() {
            if (!this.newTrip.name || !this.newTrip.startDate) {
                return alert(this.t('trip_form.error_incomplete'))
            }

            this.isSubmitting = true
            try {
                const itinerary = Array.from({ length: this.newTrip.duration }, () => ({
                    spots: []
                }))

                const tripData = {
                    name: this.newTrip.name,
                    startDate: this.newTrip.startDate,
                    members: [this.user ? this.user.uid : 'demo-user'],
                    itinerary,
                    createdAt: this.isDemo ? new Date().toISOString() : new Date()
                }

                if (this.isDemo) {
                    tripData.id = 'demo_' + Date.now()
                    this.tripStore.addLocalTrip(tripData)
                } else {
                    await addDoc(collection(db, 'trips'), tripData)
                }

                this.$emit('created')
                this.resetForm()
            } catch (error) {
                console.error('Fail to create a trip:', error)
                alert(this.t('trip_form.error_failed'))
            } finally {
                this.isSubmitting = false
            }
        },
        resetForm() {
            this.newTrip = { name: '', startDate: '', duration: 1 }
        }
    }
}
</script>
