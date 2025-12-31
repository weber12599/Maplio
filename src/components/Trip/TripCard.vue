<template>
    <div
        @click="$emit('select', trip)"
        class="p-8 bg-slate-800 rounded-[2.5rem] border border-slate-700/50 hover:border-blue-500 transition-all cursor-pointer group shadow-lg"
    >
        <div class="flex flex-col h-full justify-between">
            <div>
                <h3 class="font-black text-2xl group-hover:text-blue-400 transition-colors">
                    {{ trip.name }}
                </h3>
                <div class="mt-4 flex items-center gap-3 text-slate-500 text-sm font-medium">
                    <span class="flex items-center gap-1">
                        <i class="fa-solid fa-calendar-day"></i> {{ trip.startDate }}
                    </span>
                    <span>·</span>
                    <span>{{ trip.itinerary.length }} 天</span>
                </div>
            </div>
            <div class="mt-8 flex justify-between items-center">
                <button
                    @click.stop="$emit('delete', trip.id)"
                    class="text-slate-700 hover:text-red-500 transition-colors"
                >
                    <i class="fa-solid fa-trash-can"></i>
                </button>
                <div
                    class="w-10 h-10 bg-slate-900 rounded-full flex items-center justify-center group-hover:bg-blue-600 transition-all"
                >
                    <i class="fa-solid fa-arrow-right text-slate-700 group-hover:text-white"></i>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    props: {
        trip: Object
    }
}
</script>
