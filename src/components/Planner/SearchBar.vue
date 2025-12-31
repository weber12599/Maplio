<template>
    <div class="relative">
        <div class="relative">
            <i
                v-if="!loading"
                class="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-slate-600"
            ></i>
            <i
                v-else
                class="fa-solid fa-circle-notch fa-spin absolute left-4 top-1/2 -translate-y-1/2 text-blue-500"
            ></i>
            <input
                v-model="query"
                @keydown.enter="$emit('search', query)"
                placeholder="搜尋地點或貼上 Google Map 網址..."
                class="w-full pl-12 pr-4 py-4 bg-slate-800/50 rounded-2xl text-sm outline-none border border-transparent focus:border-blue-500/50 text-white shadow-inner"
            />
        </div>
        <div
            v-if="results.length > 0"
            class="absolute w-full mt-2 bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl z-[100] overflow-hidden"
        >
            <button
                v-for="res in results"
                :key="res.place_id"
                @click="$emit('select', res)"
                class="w-full text-left px-4 py-4 hover:bg-slate-700 border-b border-slate-700/50 last:border-none"
            >
                <div class="font-bold text-sm text-slate-200">
                    {{ res.display_name.split(',')[0] }}
                </div>
                <div class="text-[10px] text-slate-500 truncate">{{ res.display_name }}</div>
            </button>
        </div>
    </div>
</template>

<script>
export default {
    props: ['results', 'loading'],
    data() {
        return { query: '' }
    },
    methods: {
        clear() {
            this.query = ''
        }
    }
}
</script>
