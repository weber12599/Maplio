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
                建立新旅程 {{ isDemo ? '(本地儲存)' : '' }}
            </h3>

            <div class="space-y-4">
                <div>
                    <label
                        :class="[
                            'text-[10px] font-black uppercase ml-1 transition-colors',
                            themeConfig.dialogLabelClass
                        ]"
                        >旅程名稱</label
                    >
                    <input
                        v-model="newTrip.name"
                        placeholder="例如：東京跨年五日遊..."
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
                            >起始日期</label
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
                            >天數</label
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
                    取消
                </button>
                <button
                    @click="handleCreate"
                    :disabled="isSubmitting"
                    :class="[
                        'flex-grow py-3 rounded-xl font-bold transition-all shadow-lg active:scale-95 disabled:opacity-50',
                        themeConfig.primaryBtnClass
                    ]"
                >
                    {{ isSubmitting ? '建立中...' : '建立行程' }}
                </button>
            </div>
        </div>
    </div>
</template>

<script>
import { db } from '../../firebase'
import { collection, addDoc } from 'firebase/firestore'

export default {
    props: {
        isDemo: Boolean,
        user: Object,
        themeConfig: Object // 接收全域主題配置
    },
    emits: ['cancel', 'created'],
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
                return alert('請填寫完整資訊')
            }

            this.isSubmitting = true
            try {
                const itinerary = Array.from({ length: this.newTrip.duration }, () => ({
                    spots: []
                }))

                const tripData = {
                    name: this.newTrip.name,
                    startDate: this.newTrip.startDate,
                    members: [this.user.uid],
                    itinerary,
                    createdAt: this.isDemo ? new Date().toISOString() : new Date()
                }

                if (this.isDemo) {
                    const data = localStorage.getItem('maplio_demo_data')
                    const trips = data ? JSON.parse(data) : []
                    tripData.id = 'demo_' + Date.now()
                    trips.unshift(tripData)
                    localStorage.setItem('maplio_demo_data', JSON.stringify(trips))
                } else {
                    await addDoc(collection(db, 'trips'), tripData)
                }

                this.$emit('created')
                this.resetForm()
            } catch (error) {
                console.error('建立旅程失敗:', error)
                alert('建立失敗，請稍後再試')
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

<style scoped>
/* 日期選擇器的圖示樣式 */
input[type='date']::-webkit-calendar-picker-indicator {
    filter: v-bind('themeConfig.name === "深色" ? "invert(1)" : "none"');
    opacity: 0.5;
    cursor: pointer;
}
</style>
