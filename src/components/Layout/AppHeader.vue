<template>
    <header
        class="p-4 md:p-6 md:px-10 flex justify-between items-center bg-slate-900/80 backdrop-blur-md border-b border-slate-800 z-30 shrink-0"
    >
        <div class="flex items-center gap-4">
            <h1
                class="text-xl md:text-2xl font-black text-white cursor-pointer hover:text-blue-400 transition-colors"
                @click="$emit('back')"
            >
                我的旅程
            </h1>
            <span
                v-if="isDemo"
                class="text-[9px] bg-amber-500/10 text-amber-500 px-1.5 py-0.5 rounded border border-amber-500/20 font-black uppercase"
            >
                Demo Mode
            </span>
            <span v-if="currentTrip" class="hidden md:block text-slate-700">/</span>
            <span
                v-if="currentTrip"
                class="hidden md:block text-slate-400 font-bold truncate max-w-[200px]"
                >{{ currentTrip.name }}</span
            >
        </div>
        <div class="flex items-center gap-3 md:gap-4">
            <button
                @click="$emit('logout')"
                class="text-slate-500 hover:text-red-400 transition-colors px-2"
                title="登出並重置"
            >
                <i class="fa-solid fa-right-from-bracket"></i>
            </button>
            <button
                v-if="showAddButton"
                @click="$emit('create')"
                class="px-4 py-2 bg-blue-600 rounded-xl text-white font-bold text-xs md:text-sm shadow-lg shadow-blue-600/30 hover:scale-105 transition-transform"
            >
                <i class="fa-solid fa-plus mr-1"></i> 新增旅程
            </button>
        </div>
    </header>
</template>

<script>
export default {
    props: {
        user: Object,
        currentTrip: Object,
        isDemo: Boolean,
        showAddButton: Boolean
    }
}
</script>
