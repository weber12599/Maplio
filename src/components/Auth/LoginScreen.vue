<template>
    <div
        class="flex-grow flex flex-col items-center justify-center p-8 text-center bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-slate-800 via-slate-900 to-slate-900"
    >
        <div class="w-full max-w-sm space-y-10 animate-fade">
            <div>
                <div
                    class="inline-flex items-center justify-center w-24 h-24 bg-blue-600 rounded-[2.5rem] mb-6 shadow-2xl"
                >
                    <i class="fa-solid fa-plane-departure text-4xl text-white"></i>
                </div>
                <h1 class="text-4xl font-black text-white tracking-tight italic">Maplio</h1>
            </div>
            <div class="space-y-4">
                <button
                    @click="$emit('login')"
                    class="w-full py-4 bg-white text-slate-900 rounded-2xl font-bold flex items-center justify-center gap-3"
                >
                    <img
                        src="https://www.gstatic.com/images/branding/googleg/1x/googleg_standard_color_128dp.png"
                        width="20"
                    />
                    使用 Google 帳號登入
                </button>
                <button
                    @click="$emit('demo')"
                    class="w-full py-4 bg-slate-800 text-slate-300 rounded-2xl font-bold border border-slate-700 group"
                >
                    直接試用 (不需登入)
                    <p class="text-[10px] text-slate-600 uppercase mt-1">資料將儲存於瀏覽器</p>
                </button>
            </div>
        </div>
    </div>
</template>
