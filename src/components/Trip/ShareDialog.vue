<template>
    <div class="fixed inset-0 z-[30000] flex items-center justify-center p-4">
        <div
            class="absolute inset-0 transition-opacity duration-300"
            :class="themeConfig.dialogOverlayClass"
            @click="$emit('cancel')"
        ></div>

        <div
            class="relative w-full max-w-sm overflow-hidden rounded-[2.5rem] p-8 shadow-2xl transition-all animate-fade"
            :class="themeConfig.dialogContainerClass"
        >
            <div class="mb-6 text-center">
                <h3 class="text-xl font-bold mb-2" :class="themeConfig.dialogTitleClass">
                    {{ $t('planner.share_dialog.title') }}
                </h3>
                <p class="text-sm opacity-60">{{ $t('planner.share_dialog.subtitle') }}</p>
            </div>

            <div class="space-y-3">
                <button
                    @click="$emit('choice', 'url')"
                    class="w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all hover:scale-[1.02] active:scale-95"
                    :class="[themeConfig.secondaryBorderClass, 'hover:border-blue-500/50 group']"
                >
                    <div class="flex items-center gap-3">
                        <div
                            class="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500"
                        >
                            <i class="fa-solid fa-link"></i>
                        </div>
                        <div class="text-left">
                            <div class="font-bold text-sm">
                                {{ $t('planner.share_dialog.link_title') }}
                            </div>
                            <div class="text-[10px] opacity-40">
                                {{ $t('planner.share_dialog.link_desc') }}
                            </div>
                        </div>
                    </div>
                    <i
                        class="fa-solid fa-chevron-right text-xs opacity-20 group-hover:opacity-100"
                    ></i>
                </button>

                <button
                    @click="$emit('choice', 'json')"
                    class="w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all hover:scale-[1.02] active:scale-95"
                    :class="[themeConfig.secondaryBorderClass, 'hover:border-indigo-500/50 group']"
                >
                    <div class="flex items-center gap-3">
                        <div
                            class="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500"
                        >
                            <i class="fa-solid fa-code"></i>
                        </div>
                        <div class="text-left">
                            <div class="font-bold text-sm">
                                {{ $t('planner.share_dialog.json_title') }}
                            </div>
                            <div class="text-[10px] opacity-40">
                                {{ $t('planner.share_dialog.json_desc') }}
                            </div>
                        </div>
                    </div>
                    <i
                        class="fa-solid fa-chevron-right text-xs opacity-20 group-hover:opacity-100"
                    ></i>
                </button>
            </div>

            <button
                @click="$emit('cancel')"
                class="w-full mt-6 py-3 text-sm font-bold opacity-40 hover:opacity-100 transition-opacity"
            >
                {{ $t('common.cancel') }}
            </button>
        </div>
    </div>
</template>

<script setup>
defineProps({
    themeConfig: {
        type: Object,
        required: true
    }
})

defineEmits(['cancel', 'choice'])
</script>

<style scoped>
.animate-fade {
    animation: fadeIn 0.3s ease-out forwards;
}
@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(20px) scale(0.95);
    }
    to {
        opacity: 1;
        transform: translateY(0) scale(1);
    }
}
</style>
