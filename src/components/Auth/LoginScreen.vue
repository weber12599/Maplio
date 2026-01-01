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
                        'inline-flex items-center justify-center w-24 h-24 rounded-[2.5rem] mb-6 shadow-2xl transition-all duration-500',
                        themeConfig.primaryBtnClass
                    ]"
                >
                    <i class="fa-solid fa-plane-departure text-4xl text-white"></i>
                </div>
                <h1 class="text-4xl font-black tracking-tight italic">Maplio</h1>

                <p
                    v-if="appVersion"
                    class="text-[10px] font-mono opacity-20 mt-2 uppercase tracking-[0.2em]"
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
                    使用 Google 帳號登入
                </button>

                <button
                    @click="$emit('demo')"
                    :class="[
                        'w-full py-4 rounded-2xl font-bold border transition-all active:scale-95 group',
                        themeConfig.googleBtnClass
                    ]"
                >
                    直接試用 (不需登入)
                    <p class="text-[10px] uppercase mt-1 opacity-50">資料將儲存於瀏覽器</p>
                </button>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    props: {
        themeConfig: {
            type: Object,
            required: true
        },
        appVersion: String
    },
    emits: ['login', 'demo']
}
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
