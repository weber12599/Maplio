<template>
    <div
        :class="[
            'flex-grow flex flex-col items-center justify-center p-8 text-center transition-colors duration-500',
            themeConfig.appClass
        ]"
    >
        <div class="w-full max-w-sm space-y-10 animate-fade">
            <div>
                <div
                    :class="[
                        'inline-flex items-center justify-center w-24 h-24 mb-6 transition-all duration-500'
                    ]"
                >
                    <div
                        class="inline-flex items-center justify-center w-24 h-24 mb-4 transition-all duration-500"
                    >
                        <img
                            src="/logos/favicon.svg"
                            alt="Maplio Logo"
                            class="w-full h-full object-contain drop-shadow-2xl"
                        />
                    </div>
                </div>
                <h1 class="text-4xl font-black tracking-tight italic">Maplio</h1>

                <p
                    v-if="appVersion"
                    class="text-[10px] font-mono opacity-50 mt-2 uppercase tracking-[0.2em]"
                >
                    {{ appVersion }}
                </p>
            </div>

            <div class="space-y-4">
                <button
                    @click="$emit('login')"
                    :class="[
                        'w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all shadow-sm active:scale-95',
                        themeConfig.googleBtnClass
                    ]"
                >
                    <img
                        src="https://www.gstatic.com/images/branding/googleg/1x/googleg_standard_color_128dp.png"
                        width="20"
                    />
                    <span>{{ $t('login.google_login') }}</span>
                </button>

                <button
                    @click="$emit('demo')"
                    :class="[
                        'w-full py-4 rounded-2xl font-bold transition-all shadow-sm active:scale-95 group',
                        themeConfig.googleBtnClass
                    ]"
                >
                    <div class="flex flex-col items-center leading-tight">
                        <span>{{ $t('login.demo_login') }}</span>
                        <span
                            class="text-[10px] opacity-50 font-normal mt-0.5 group-hover:opacity-80"
                            >{{ $t('login.demo_desc') }}</span
                        >
                    </div>
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
defineProps({
    themeConfig: {
        type: Object,
        required: true
    },
    appVersion: String
})

defineEmits(['login', 'demo'])
</script>

<style scoped>
.animate-fade {
    animation: fadeIn 0.6s ease-out forwards;
}
@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}
</style>
