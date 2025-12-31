<template>
    <div
        class="max-w-md mx-auto p-8 bg-slate-800 rounded-[2.5rem] border border-blue-500/30 animate-fade space-y-6 mb-10 shadow-2xl"
    >
        <h3 class="font-bold text-xl text-blue-400">建立新旅程 {{ isDemo ? '(本地儲存)' : '' }}</h3>
        <div class="space-y-4">
            <div>
                <label class="text-[10px] text-slate-500 font-black uppercase ml-1">旅程名稱</label>
                <input
                    v-model="newTrip.name"
                    placeholder="例如：東京跨年五日遊..."
                    class="w-full bg-slate-900 border-none rounded-xl px-4 py-3 outline-none focus:ring-1 focus:ring-blue-500 text-white"
                />
            </div>

            <div class="flex gap-4">
                <div class="flex-grow">
                    <label class="text-[10px] text-slate-500 font-black uppercase ml-1"
                        >起始日期</label
                    >
                    <input
                        type="date"
                        v-model="newTrip.startDate"
                        class="w-full bg-slate-900 border-none rounded-xl px-4 py-3 outline-none text-white"
                    />
                </div>
                <div class="w-24">
                    <label class="text-[10px] text-slate-500 font-black uppercase ml-1">天數</label>
                    <input
                        type="number"
                        v-model="newTrip.duration"
                        min="1"
                        class="w-full bg-slate-900 border-none rounded-xl px-4 py-3 outline-none text-white"
                    />
                </div>
            </div>
        </div>

        <div class="flex gap-4 pt-4">
            <button
                @click="$emit('cancel')"
                class="flex-grow py-3 text-slate-500 font-bold hover:text-slate-300 transition-colors"
            >
                取消
            </button>
            <button
                @click="handleCreate"
                :disabled="isSubmitting"
                class="flex-grow py-3 bg-blue-600 rounded-xl font-bold shadow-lg shadow-blue-600/20 active:scale-95 transition-all disabled:opacity-50"
            >
                {{ isSubmitting ? '建立中...' : '建立行程' }}
            </button>
        </div>
    </div>
</template>

<script>
import { db } from '../../firebase'
import { collection, addDoc } from 'firebase/firestore'

export default {
    props: {
        isDemo: Boolean,
        user: Object
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
                    // Demo 模式：儲存至 LocalStorage
                    const data = localStorage.getItem('maplio_demo_data')
                    const trips = data ? JSON.parse(data) : []
                    tripData.id = 'demo_' + Date.now()
                    trips.unshift(tripData)
                    localStorage.setItem('maplio_demo_data', JSON.stringify(trips))
                } else {
                    // 線上模式：儲存至 Firebase
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
input[type='date']::-webkit-calendar-picker-indicator {
    filter: invert(1);
    opacity: 0.5;
    cursor: pointer;
}
</style>
