<template>
    <div
        class="bg-slate-900 text-slate-100 font-sans h-screen flex flex-col no-scrollbar selection:bg-blue-500/30 overflow-hidden"
    >
        <div
            v-if="!user"
            class="flex-grow flex flex-col items-center justify-center p-8 text-center bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-slate-800 via-slate-900 to-slate-900"
        >
            <div class="w-full max-w-sm space-y-10 animate-fade">
                <div>
                    <div
                        class="inline-flex items-center justify-center w-24 h-24 bg-blue-600 rounded-[2.5rem] mb-6 shadow-2xl shadow-blue-500/20"
                    >
                        <i class="fa-solid fa-plane-departure text-4xl text-white"></i>
                    </div>
                    <h1 class="text-4xl font-black text-white tracking-tight italic">Maplio</h1>
                </div>
                <div class="space-y-4">
                    <button
                        @click="handleGoogleLogin"
                        class="w-full py-4 bg-white text-slate-900 rounded-2xl font-bold flex items-center justify-center gap-3 shadow-xl active:scale-95 transition-all hover:bg-slate-100"
                    >
                        <img
                            src="https://www.gstatic.com/images/branding/googleg/1x/googleg_standard_color_128dp.png"
                            width="20"
                            alt="Google"
                        />
                        使用 Google 帳號登入
                    </button>
                    <button
                        @click="enterDemoMode"
                        class="w-full py-4 bg-slate-800 text-slate-300 rounded-2xl font-bold border border-slate-700 hover:bg-slate-700 transition-all active:scale-95 group"
                    >
                        直接試用 (不需登入)
                        <p
                            class="text-[10px] text-slate-600 uppercase tracking-widest mt-1 group-hover:text-slate-500 transition-colors"
                        >
                            資料將儲存於您的瀏覽器中
                        </p>
                    </button>
                </div>
            </div>
            <div
                class="absolute bottom-8 text-[10px] font-bold text-slate-600 tracking-widest uppercase"
            >
                Version {{ appVersion }}
            </div>
        </div>

        <div v-else class="flex flex-col h-full overflow-hidden">
            <header
                class="p-4 md:p-6 md:px-10 flex justify-between items-center bg-slate-900/80 backdrop-blur-md border-b border-slate-800 z-30 shrink-0"
            >
                <div class="flex items-center gap-4">
                    <h1
                        class="text-xl md:text-2xl font-black text-white cursor-pointer hover:text-blue-400 transition-colors"
                        @click="backToList"
                    >
                        我的旅程
                    </h1>
                    <span
                        v-if="isDemoMode"
                        class="text-[9px] bg-amber-500/10 text-amber-500 px-1.5 py-0.5 rounded border border-amber-500/20 font-black uppercase"
                    >
                        Demo Mode
                    </span>
                    <span
                        class="hidden sm:block text-[9px] font-bold px-1.5 py-0.5 bg-slate-800 text-slate-500 rounded-md border border-slate-700"
                    >
                        {{ appVersion }}
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
                        @click="logout"
                        class="text-slate-500 hover:text-red-400 transition-colors px-2"
                        title="登出並重置"
                    >
                        <i class="fa-solid fa-right-from-bracket"></i>
                    </button>
                    <button
                        v-if="!currentTrip && !showCreateForm"
                        @click="showCreateForm = true"
                        class="px-4 py-2 bg-blue-600 rounded-xl text-white font-bold text-xs md:text-sm shadow-lg shadow-blue-600/30 hover:scale-105 transition-transform"
                    >
                        <i class="fa-solid fa-plus mr-1"></i> 新增旅程
                    </button>
                </div>
            </header>

            <main class="flex-grow flex flex-col md:flex-row overflow-hidden relative">
                <div v-if="!currentTrip" class="flex-grow overflow-y-auto p-6 md:p-10 no-scrollbar">
                    <div
                        v-if="showCreateForm"
                        class="max-w-md mx-auto p-8 bg-slate-800 rounded-[2.5rem] border border-blue-500/30 animate-fade space-y-6 mb-10 shadow-2xl"
                    >
                        <h3 class="font-bold text-xl text-blue-400">建立新旅程</h3>
                        <div class="space-y-4">
                            <div>
                                <label class="text-[10px] text-slate-500 font-black uppercase ml-1"
                                    >旅程名稱</label
                                >
                                <input
                                    v-model="newTrip.name"
                                    placeholder="例如：東京五日遊..."
                                    class="w-full bg-slate-900 border-none rounded-xl px-4 py-3 text-white outline-none"
                                />
                            </div>
                            <div class="flex gap-4">
                                <div class="flex-grow">
                                    <label
                                        class="text-[10px] text-slate-500 font-black uppercase ml-1"
                                        >起始日期</label
                                    >
                                    <input
                                        type="date"
                                        v-model="newTrip.startDate"
                                        class="w-full bg-slate-900 border-none rounded-xl px-4 py-3 text-white outline-none"
                                    />
                                </div>
                                <div class="w-24">
                                    <label
                                        class="text-[10px] text-slate-500 font-black uppercase ml-1"
                                        >天數</label
                                    >
                                    <input
                                        type="number"
                                        v-model="newTrip.duration"
                                        min="1"
                                        class="w-full bg-slate-900 border-none rounded-xl px-4 py-3 text-white outline-none"
                                    />
                                </div>
                            </div>
                        </div>
                        <div class="flex gap-4 pt-4">
                            <button
                                @click="showCreateForm = false"
                                class="flex-grow py-3 text-slate-500 font-bold"
                            >
                                取消
                            </button>
                            <button
                                @click="createNewTrip"
                                class="flex-grow py-3 bg-blue-600 rounded-xl font-bold"
                            >
                                建立行程
                            </button>
                        </div>
                    </div>

                    <div
                        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto"
                    >
                        <div
                            v-for="trip in trips"
                            :key="trip.id"
                            @click="selectTrip(trip)"
                            class="p-8 bg-slate-800 rounded-[2.5rem] border border-slate-700/50 hover:border-blue-500 transition-all cursor-pointer group shadow-lg"
                        >
                            <div class="flex flex-col h-full justify-between">
                                <div>
                                    <h3
                                        class="font-black text-2xl group-hover:text-blue-400 transition-colors"
                                    >
                                        {{ trip.name }}
                                    </h3>
                                    <div
                                        class="mt-4 flex items-center gap-3 text-slate-500 text-sm"
                                    >
                                        <span
                                            ><i class="fa-solid fa-calendar-day"></i>
                                            {{ trip.startDate }}</span
                                        >
                                        <span>·</span>
                                        <span>{{ trip.itinerary.length }} 天</span>
                                    </div>
                                </div>
                                <div class="mt-8 flex justify-between items-center">
                                    <button
                                        @click.stop="deleteTrip(trip.id)"
                                        class="text-slate-700 hover:text-red-500"
                                    >
                                        <i class="fa-solid fa-trash-can"></i>
                                    </button>
                                    <div
                                        class="w-10 h-10 bg-slate-900 rounded-full flex items-center justify-center group-hover:bg-blue-600"
                                    >
                                        <i
                                            class="fa-solid fa-arrow-right text-slate-700 group-hover:text-white"
                                        ></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <template v-else>
                    <aside
                        class="w-full md:w-[450px] lg:w-[500px] flex flex-col h-full bg-slate-900 md:border-r border-slate-800 z-20 shrink-0"
                    >
                        <div
                            id="mobile-map"
                            class="block md:hidden h-[220px] w-full shrink-0 bg-slate-900 border-b border-slate-800"
                        ></div>

                        <div
                            class="flex items-center bg-slate-900 border-b border-slate-800 shrink-0"
                        >
                            <div class="flex overflow-x-auto no-scrollbar px-6 py-4 gap-3">
                                <button
                                    v-for="(day, index) in currentTrip.itinerary"
                                    :key="index"
                                    @click="activeDay = index"
                                    :class="
                                        activeDay === index
                                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                                            : 'bg-slate-800 text-slate-500 hover:text-slate-300'
                                    "
                                    class="px-5 py-2 rounded-2xl text-sm font-black whitespace-nowrap transition-all flex flex-col items-center min-w-[85px]"
                                >
                                    Day {{ index + 1 }}
                                    <span class="text-[9px] font-bold opacity-60">{{
                                        getDayDate(index)
                                    }}</span>
                                </button>
                                <button
                                    @click="addDay"
                                    class="px-4 py-2 bg-slate-800 text-slate-600 rounded-2xl hover:text-white"
                                >
                                    <i class="fa-solid fa-plus text-xs"></i>
                                </button>
                            </div>
                        </div>

                        <div class="flex-grow overflow-y-auto no-scrollbar p-6 space-y-8 pb-32">
                            <div class="flex justify-between items-start gap-4">
                                <div class="flex-grow min-w-0">
                                    <h2
                                        class="text-2xl font-black text-white truncate flex items-center gap-2"
                                    >
                                        <template v-if="!isEditingTripName">
                                            {{ currentTrip.name }}
                                            <button
                                                @click="startEditTripName"
                                                class="text-slate-700 hover:text-blue-500"
                                            >
                                                <i class="fa-solid fa-pen text-sm"></i>
                                            </button>
                                        </template>
                                        <template v-else>
                                            <input
                                                v-model="tempTripName"
                                                @keyup.enter="saveTripName"
                                                @blur="saveTripName"
                                                ref="tripNameInput"
                                                class="bg-transparent border-b-2 border-blue-500 text-2xl font-black text-white outline-none w-full"
                                            />
                                        </template>
                                    </h2>
                                    <div class="flex items-center gap-3 mt-2">
                                        <p
                                            class="text-[10px] font-bold text-blue-500 uppercase tracking-[0.2em]"
                                        >
                                            Day {{ activeDay + 1 }} Timeline
                                        </p>
                                        <button
                                            v-if="currentTrip.itinerary.length > 1"
                                            @click="deleteDay"
                                            class="text-[10px] text-red-900 hover:text-red-500 font-bold"
                                        >
                                            刪除此天
                                        </button>
                                    </div>
                                </div>
                                <button
                                    v-if="!isDemoMode"
                                    @click="copyShareLink"
                                    class="shrink-0 bg-slate-800 text-slate-400 p-3 rounded-2xl hover:text-blue-500 transition-colors"
                                    title="分享行程"
                                >
                                    <i class="fa-solid fa-share-nodes"></i>
                                </button>
                            </div>

                            <div class="flex gap-2">
                                <div class="relative group flex-grow">
                                    <div class="relative">
                                        <i
                                            v-if="!isSearching"
                                            class="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-slate-600"
                                        ></i>
                                        <i
                                            v-else
                                            class="fa-solid fa-circle-notch fa-spin absolute left-4 top-1/2 -translate-y-1/2 text-blue-500"
                                        ></i>
                                        <input
                                            v-model="searchQuery"
                                            @compositionstart="isComposing = true"
                                            @compositionend="isComposing = false"
                                            @keydown.enter="handleEnter"
                                            @blur="setTimeout(() => (showDropdown = false), 250)"
                                            placeholder="搜尋地點或貼上 Google Map 網址..."
                                            class="w-full pl-12 pr-4 py-4 bg-slate-800/50 rounded-2xl text-sm outline-none border border-transparent focus:border-blue-500/50 transition-all shadow-inner text-white"
                                        />
                                    </div>
                                    <div
                                        v-if="showDropdown && searchResults.length > 0"
                                        class="absolute w-full mt-2 bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl z-[100] overflow-hidden max-h-60 overflow-y-auto no-scrollbar"
                                    >
                                        <button
                                            v-for="(result, index) in searchResults"
                                            :key="index"
                                            @click="selectLocation(result)"
                                            class="w-full text-left px-4 py-4 hover:bg-slate-700 border-b border-slate-700/50 last:border-none transition-colors"
                                        >
                                            <div class="font-bold text-sm text-slate-200">
                                                {{ result.display_name.split(',')[0] }}
                                            </div>
                                            <div class="text-[10px] text-slate-500 truncate">
                                                {{ result.display_name }}
                                            </div>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <draggable
                                v-model="currentDaySpots"
                                group="spots"
                                item-key="id"
                                handle=".drag-handle"
                                @change="saveData"
                                class="space-y-0"
                            >
                                <template #item="{ element, index }">
                                    <div class="flex flex-col items-center">
                                        <div
                                            class="w-full p-5 bg-slate-800/40 rounded-[2rem] border border-slate-700/20 hover:bg-slate-800/60 transition-all relative"
                                        >
                                            <div class="flex items-start gap-4">
                                                <div
                                                    class="drag-handle text-slate-700 cursor-grab px-1 pt-1 opacity-50 hover:opacity-100"
                                                >
                                                    <i class="fa-solid fa-grip-vertical"></i>
                                                </div>
                                                <div class="flex-grow min-w-0">
                                                    <div v-if="editingSpotId !== element.id">
                                                        <div
                                                            class="flex items-center gap-2 flex-wrap"
                                                        >
                                                            <span
                                                                v-if="element.timeStart"
                                                                class="text-[9px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-md font-black italic"
                                                                >{{ element.timeStart }} -
                                                                {{ element.timeEnd }}</span
                                                            >
                                                            <p
                                                                class="font-bold text-slate-200 truncate"
                                                            >
                                                                {{ element.name }}
                                                            </p>
                                                            <button
                                                                @click="startEditSpot(element)"
                                                                class="text-slate-700 hover:text-blue-400"
                                                            >
                                                                <i
                                                                    class="fa-solid fa-pen-to-square text-[11px]"
                                                                ></i>
                                                            </button>
                                                        </div>
                                                        <p
                                                            v-if="element.notes"
                                                            class="text-xs text-slate-500 mt-2 leading-relaxed italic"
                                                        >
                                                            {{ element.notes }}
                                                        </p>
                                                    </div>
                                                    <div v-else class="space-y-4 pr-1">
                                                        <div class="flex items-center gap-2">
                                                            <input
                                                                type="time"
                                                                v-model="tempSpotTimeStart"
                                                                class="bg-slate-900 rounded-xl px-3 py-2 text-[11px] text-blue-400 outline-none"
                                                            />
                                                            <span class="text-slate-700 text-xs"
                                                                >至</span
                                                            >
                                                            <input
                                                                type="time"
                                                                v-model="tempSpotTimeEnd"
                                                                class="bg-slate-900 rounded-xl px-3 py-2 text-[11px] text-blue-400 outline-none"
                                                            />
                                                        </div>
                                                        <input
                                                            v-model="tempSpotName"
                                                            class="w-full bg-slate-900 rounded-xl px-4 py-2 text-sm text-white outline-none focus:ring-1 focus:ring-blue-500"
                                                        />
                                                        <textarea
                                                            v-model="tempSpotNotes"
                                                            rows="2"
                                                            placeholder="景點備註..."
                                                            class="w-full bg-slate-900 rounded-xl px-4 py-3 text-xs text-slate-300 outline-none resize-none"
                                                        ></textarea>
                                                        <div class="flex justify-end gap-3 pt-1">
                                                            <button
                                                                @click="editingSpotId = null"
                                                                class="text-[10px] text-slate-500 font-bold uppercase tracking-widest"
                                                            >
                                                                取消
                                                            </button>
                                                            <button
                                                                @click="saveSpotChanges(index)"
                                                                class="text-[10px] bg-blue-600 text-white rounded-xl px-5 py-2 font-bold shadow-lg shadow-blue-600/30"
                                                            >
                                                                完成
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div
                                                    v-if="editingSpotId !== element.id"
                                                    class="flex flex-col gap-3"
                                                >
                                                    <button
                                                        @click="openSpotOnMaps(element)"
                                                        title="開啟地圖網址"
                                                        class="w-10 h-10 flex items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg active:scale-90 transition-all"
                                                    >
                                                        <i
                                                            class="fa-solid fa-location-dot text-xs"
                                                        ></i>
                                                    </button>
                                                    <button
                                                        @click="removeSpot(index)"
                                                        class="w-10 h-10 flex items-center justify-center rounded-2xl bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors"
                                                    >
                                                        <i class="fa-solid fa-xmark text-sm"></i>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        <div
                                            v-if="index < currentDaySpots.length - 1"
                                            class="w-full flex flex-col items-center py-2"
                                        >
                                            <div class="w-[2px] h-4 bg-slate-800"></div>
                                            <div class="flex items-center gap-3 w-full px-8">
                                                <select
                                                    v-model="element.travelMode"
                                                    @change="saveData"
                                                    class="bg-slate-800 text-[10px] text-blue-400 border border-slate-700 rounded-xl px-2 py-1 outline-none appearance-none font-black shadow-sm"
                                                >
                                                    <option value="auto">✨ 自動模式</option>
                                                    <option value="driving">🚗 點對點開車</option>
                                                    <option value="transit">🚌 大眾運輸</option>
                                                    <option value="walking">🚶 徒步前往</option>
                                                </select>
                                                <div class="flex-grow text-center overflow-hidden">
                                                    <template
                                                        v-if="editingTransportId !== element.id"
                                                    >
                                                        <div
                                                            @click="startEditTransport(element)"
                                                            class="text-[10px] text-slate-500 hover:text-blue-400 cursor-pointer py-1 truncate transition-colors"
                                                        >
                                                            <span
                                                                v-if="element.transStart"
                                                                class="font-black text-slate-400 mr-2 italic"
                                                                >{{ element.transStart }}-{{
                                                                    element.transEnd
                                                                }}</span
                                                            >
                                                            {{
                                                                element.transportNotes ||
                                                                '＋ 交通備註與時間'
                                                            }}
                                                        </div>
                                                    </template>
                                                    <template v-else>
                                                        <div
                                                            class="flex flex-col gap-2 items-center animate-fade"
                                                        >
                                                            <div class="flex gap-2">
                                                                <input
                                                                    type="time"
                                                                    v-model="tempTransStart"
                                                                    class="bg-slate-800 text-[10px] text-blue-400 outline-none px-2 py-1 rounded-lg"
                                                                />
                                                                <input
                                                                    type="time"
                                                                    v-model="tempTransEnd"
                                                                    class="bg-slate-800 text-[10px] text-blue-400 outline-none px-2 py-1 rounded-lg"
                                                                />
                                                            </div>
                                                            <input
                                                                v-model="tempTransportNotes"
                                                                @keyup.enter="
                                                                    saveTransportNotes(index)
                                                                "
                                                                @blur="saveTransportNotes(index)"
                                                                ref="transportInput"
                                                                placeholder="輸入交通備註..."
                                                                class="w-full bg-slate-800 border-b border-blue-500 text-[10px] text-center text-blue-400 outline-none py-1"
                                                            />
                                                        </div>
                                                    </template>
                                                </div>
                                                <button
                                                    @click="
                                                        navBetweenSpots(
                                                            element,
                                                            currentDaySpots[index + 1],
                                                            element.travelMode
                                                        )
                                                    "
                                                    class="w-9 h-9 flex items-center justify-center rounded-full bg-slate-800 border border-slate-700 text-slate-500 hover:border-blue-500 hover:text-blue-400 transition-all shadow-sm"
                                                >
                                                    <i class="fa-solid fa-route text-xs"></i>
                                                </button>
                                            </div>
                                            <div class="w-[2px] h-4 bg-slate-800"></div>
                                        </div>
                                    </div>
                                </template>
                            </draggable>

                            <div
                                v-if="currentDaySpots.length === 0"
                                class="text-center py-20 text-slate-700 border-2 border-dashed border-slate-800 rounded-[3rem]"
                            >
                                <p class="text-sm font-bold tracking-tight">
                                    今天還沒安排行程，試試搜尋景點吧！
                                </p>
                            </div>
                        </div>
                    </aside>
                    <div
                        id="desktop-map"
                        class="hidden md:block flex-grow h-full bg-slate-900"
                    ></div>
                </template>

                <div
                    v-if="showManualSpotForm"
                    class="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
                >
                    <div
                        class="w-full max-w-md bg-slate-800 rounded-[2.5rem] p-8 border border-blue-500/30 shadow-2xl space-y-6"
                    >
                        <h3 class="text-xl font-black text-blue-400">景點詳細資訊</h3>
                        <div class="space-y-4">
                            <div>
                                <label class="text-[10px] text-slate-500 font-black uppercase ml-1"
                                    >名稱 *</label
                                >
                                <input
                                    v-model="manualSpot.name"
                                    placeholder="請輸入名稱"
                                    class="w-full bg-slate-900 border-none rounded-xl px-4 py-3 text-white outline-none focus:ring-1 focus:ring-blue-500"
                                />
                            </div>
                            <div class="flex gap-4">
                                <div class="flex-grow">
                                    <label
                                        class="text-[10px] text-slate-500 font-black uppercase ml-1"
                                        >行程時間</label
                                    >
                                    <div class="flex items-center gap-2">
                                        <input
                                            type="time"
                                            v-model="manualSpot.timeStart"
                                            class="w-full bg-slate-900 rounded-xl px-3 py-2 text-[11px] text-blue-400 outline-none"
                                        />
                                        <span class="text-slate-700">-</span>
                                        <input
                                            type="time"
                                            v-model="manualSpot.timeEnd"
                                            class="w-full bg-slate-900 rounded-xl px-3 py-2 text-[11px] text-blue-400 outline-none"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label class="text-[10px] text-slate-500 font-black uppercase ml-1"
                                    >景點備註</label
                                >
                                <textarea
                                    v-model="manualSpot.notes"
                                    rows="2"
                                    placeholder="備註..."
                                    class="w-full bg-slate-900 rounded-xl px-4 py-3 text-xs text-slate-300 outline-none resize-none"
                                ></textarea>
                            </div>
                            <div>
                                <label class="text-[10px] text-slate-500 font-black uppercase ml-1"
                                    >Google Map 網址</label
                                >
                                <input
                                    v-model="manualSpot.url"
                                    placeholder="http://..."
                                    class="w-full bg-slate-900 border-none rounded-xl px-4 py-3 text-slate-500 text-[10px] outline-none"
                                />
                            </div>
                            <div class="space-y-2">
                                <div class="flex justify-between items-center px-1">
                                    <label class="text-[10px] text-slate-500 font-black uppercase"
                                        >經緯度座標</label
                                    >
                                    <button
                                        @click="pasteCoordinates"
                                        class="text-[10px] bg-slate-700 text-blue-400 px-2 py-1 rounded-lg hover:bg-slate-600 transition-colors"
                                    >
                                        <i class="fa-solid fa-paste mr-1"></i> 從剪貼簿貼上 (Lat,
                                        Lng)
                                    </button>
                                </div>
                                <div class="flex gap-4">
                                    <div class="flex-grow">
                                        <input
                                            v-model.number="manualSpot.lat"
                                            type="number"
                                            step="any"
                                            placeholder="緯度 (Lat)"
                                            class="w-full bg-slate-900 border-none rounded-xl px-4 py-3 text-white outline-none"
                                        />
                                    </div>
                                    <div class="flex-grow">
                                        <input
                                            v-model.number="manualSpot.lng"
                                            type="number"
                                            step="any"
                                            placeholder="經度 (Lng)"
                                            class="w-full bg-slate-900 border-none rounded-xl px-4 py-3 text-white outline-none"
                                        />
                                    </div>
                                </div>
                            </div>
                            <p class="text-[10px] text-amber-500/80 italic ml-1">
                                提示：若未填入經緯度座標，此景點將不會出現在左側地圖上。
                            </p>
                        </div>
                        <div class="flex gap-4 pt-2">
                            <button
                                @click="showManualSpotForm = false"
                                class="flex-grow py-3 text-slate-500 font-bold"
                            >
                                取消
                            </button>
                            <button
                                @click="addManualSpot"
                                class="flex-grow py-3 bg-blue-600 rounded-xl font-bold text-white shadow-lg"
                            >
                                加入行程
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    </div>
</template>

<script>
import { auth, db, googleProvider } from './firebase'
import { signInWithPopup, onAuthStateChanged, signOut } from 'firebase/auth'
import {
    doc,
    setDoc,
    onSnapshot,
    collection,
    addDoc,
    query,
    where,
    orderBy,
    deleteDoc
} from 'firebase/firestore'
import draggable from 'vuedraggable'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
})

export default {
    components: { draggable },
    data() {
        return {
            isDemoMode: false,
            user: null,
            trips: [],
            currentTrip: null,
            activeDay: 0,
            map: null,
            markers: [],
            showCreateForm: false,
            newTrip: { name: '', startDate: '', duration: 1 },
            searchQuery: '',
            searchResults: [],
            showDropdown: false,
            isSearching: false,
            isComposing: false,
            isEditingTripName: false,
            tempTripName: '',
            editingSpotId: null,
            tempSpotName: '',
            tempSpotNotes: '',
            tempSpotTimeStart: '',
            tempSpotTimeEnd: '',
            editingTransportId: null,
            tempTransportNotes: '',
            tempTransStart: '',
            tempTransEnd: '',
            resizeTimer: null,
            appVersion: import.meta.env.VITE_APP_VERSION || 'v0.0.0-dev',
            showManualSpotForm: false,
            manualSpot: {
                name: '',
                lat: null,
                lng: null,
                url: '',
                notes: '',
                timeStart: '',
                timeEnd: ''
            }
        }
    },
    computed: {
        currentDaySpots: {
            get() {
                return this.currentTrip?.itinerary[this.activeDay]?.spots || []
            },
            set(val) {
                this.currentTrip.itinerary[this.activeDay].spots = val
            }
        }
    },
    watch: {
        activeDay() {
            this.renderMarkers()
            this.editingSpotId = null
            this.editingTransportId = null
        },
        currentDaySpots: {
            handler() {
                if (this.map) this.renderMarkers()
            },
            deep: true
        }
    },
    mounted() {
        onAuthStateChanged(auth, (user) => {
            if (user && !this.isDemoMode) {
                this.user = user
                this.fetchTrips()
                this.checkUrlParams()
            }
        })

        window.addEventListener('resize', () => {
            clearTimeout(this.resizeTimer)
            this.resizeTimer = setTimeout(() => {
                if (this.map) {
                    const targetId = window.innerWidth >= 768 ? 'desktop-map' : 'mobile-map'
                    if (this.map.getContainer().id !== targetId) {
                        this.initMap()
                    } else {
                        this.map.invalidateSize({ animate: true })
                    }
                }
            }, 250)
        })
    },
    methods: {
        enterDemoMode() {
            this.isDemoMode = true
            this.user = { uid: 'demo-user', displayName: 'Demo Visitor' }
            this.fetchTrips()
        },
        async handleGoogleLogin() {
            try {
                await signInWithPopup(auth, googleProvider)
            } catch (e) {
                console.error(e)
            }
        },
        logout() {
            if (confirm('確定登出？')) {
                if (!this.isDemoMode) signOut(auth)
                this.user = null
                this.isDemoMode = false
                this.currentTrip = null
            }
        },
        getDayDate(dayIndex) {
            if (!this.currentTrip || !this.currentTrip.startDate) return ''
            const date = new Date(this.currentTrip.startDate)
            date.setDate(date.getDate() + dayIndex)
            const weekDays = ['日', '一', '二', '三', '四', '五', '六']
            const dayName = weekDays[date.getDay()]
            return `${date.getMonth() + 1}/${date.getDate()} (${dayName})`
        },
        fetchTrips() {
            if (this.isDemoMode) {
                const data = localStorage.getItem('maplio_demo_data')
                this.trips = data ? JSON.parse(data) : []
            } else {
                const q = query(
                    collection(db, 'trips'),
                    where('members', 'array-contains', this.user.uid),
                    orderBy('createdAt', 'desc')
                )
                onSnapshot(q, (snap) => {
                    this.trips = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
                })
            }
        },
        bindTrip(tripId) {
            onSnapshot(doc(db, 'trips', tripId), (docSnap) => {
                if (docSnap.exists()) {
                    this.currentTrip = { id: docSnap.id, ...docSnap.data() }
                    this.initMap()
                }
            })
        },
        async createNewTrip() {
            if (!this.newTrip.name || !this.newTrip.startDate) return alert('請填寫完整資訊')
            const itinerary = Array.from({ length: this.newTrip.duration }, () => ({ spots: [] }))

            if (this.isDemoMode) {
                const trip = {
                    id: 'demo_' + Date.now(),
                    name: this.newTrip.name,
                    startDate: this.newTrip.startDate,
                    members: ['demo-user'],
                    itinerary,
                    createdAt: new Date().toISOString()
                }
                this.trips.unshift(trip)
                localStorage.setItem('maplio_demo_data', JSON.stringify(this.trips))
                this.showCreateForm = false
            } else {
                await addDoc(collection(db, 'trips'), {
                    name: this.newTrip.name,
                    startDate: this.newTrip.startDate,
                    members: [this.user.uid],
                    itinerary,
                    createdAt: new Date()
                })
                this.showCreateForm = false
            }
            this.newTrip = { name: '', startDate: '', duration: 1 }
        },
        initMap() {
            this.$nextTick(() => {
                const isMobile = window.innerWidth < 768
                const targetId = isMobile ? 'mobile-map' : 'desktop-map'
                if (this.map) {
                    try {
                        this.map.off()
                        this.map.remove()
                    } catch (e) {
                        console.warn(e)
                    }
                    this.map = null
                }
                this.map = L.map(targetId, {
                    zoomControl: false,
                    attributionControl: false,
                    preferCanvas: true,
                    tap: false,
                    fadeAnimation: true,
                    zoomAnimation: true
                }).setView([25.03, 121.56], 13)

                L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
                    updateWhenIdle: true,
                    keepBuffer: 2
                }).addTo(this.map)

                this.map.whenReady(() => {
                    this.renderMarkers()
                    setTimeout(() => {
                        if (this.map) this.map.invalidateSize()
                        this.renderMarkers()
                    }, 300)
                })
            })
        },
        renderMarkers() {
            if (!this.map || !this.currentTrip) return
            const isMobile = window.innerWidth < 768
            const spotList = this.currentDaySpots || []
            this.markers.forEach((m) => this.map.removeLayer(m))
            this.markers = []

            const latlngs = []
            spotList.forEach((s) => {
                if (s.lat && s.lng) {
                    const m = L.marker([s.lat, s.lng])
                        .addTo(this.map)
                        .bindPopup(`<b style="color:#1e1b4b">${s.name}</b>`)
                    this.markers.push(m)
                    latlngs.push([s.lat, s.lng])
                }
            })

            if (latlngs.length > 0) {
                this.map.flyToBounds(L.latLngBounds(latlngs), {
                    padding: isMobile ? [30, 30] : [60, 60],
                    duration: 0.6,
                    maxZoom: 15
                })
            }
        },
        selectTrip(trip) {
            if (this.isDemoMode) {
                this.currentTrip = JSON.parse(JSON.stringify(trip))
                this.initMap()
            } else {
                this.bindTrip(trip.id)
            }
        },
        backToList() {
            this.currentTrip = null
            if (this.map) {
                this.map.remove()
                this.map = null
            }
            window.history.pushState({}, '', window.location.pathname)
        },
        handleEnter() {
            if (this.isComposing || !this.searchQuery) return

            const input = this.searchQuery.trim()
            const isUrl =
                input.includes('http://') ||
                input.includes('https://') ||
                input.includes('googleusercontent.com')

            if (isUrl) {
                const urlCoordsMatch = input.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/)
                let parsedName = ''
                let lat = null
                let lng = null

                if (urlCoordsMatch) {
                    lat = parseFloat(urlCoordsMatch[1])
                    lng = parseFloat(urlCoordsMatch[2])
                    const nameMatch = input.match(/\/place\/([^\/]+)\//)
                    if (nameMatch) {
                        parsedName = decodeURIComponent(nameMatch[1].replace(/\+/g, ' '))
                    }
                }

                this.manualSpot = {
                    name: parsedName || '',
                    lat: lat,
                    lng: lng,
                    url: input,
                    notes: '',
                    timeStart: '',
                    timeEnd: ''
                }
                this.showManualSpotForm = true
                this.searchQuery = ''
                return
            }

            this.performSearch()
        },
        async performSearch() {
            this.isSearching = true
            try {
                const res = await fetch(
                    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(this.searchQuery)}&limit=5`
                )
                this.searchResults = await res.json()
                this.showDropdown = true
            } catch (e) {
                console.error(e)
            } finally {
                this.isSearching = false
            }
        },
        selectLocation(result) {
            const lat = parseFloat(result.lat)
            const lng = parseFloat(result.lon)
            const name = result.display_name.split(',')[0]

            this.manualSpot = {
                name: name,
                lat: lat,
                lng: lng,
                url: `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`,
                notes: '',
                timeStart: '',
                timeEnd: ''
            }
            this.showManualSpotForm = true
            this.showDropdown = false
            this.searchQuery = ''
        },
        // 新增：從剪貼簿貼上座標的邏輯
        async pasteCoordinates() {
            try {
                const text = await navigator.clipboard.readText()
                // 正規表達式匹配: (lat, lng) 或 lat, lng
                const regex = /\(?\s*(-?\d+\.\d+)\s*,\s*(-?\d+\.\d+)\s*\)?/
                const match = text.match(regex)
                if (match) {
                    this.manualSpot.lat = parseFloat(match[1])
                    this.manualSpot.lng = parseFloat(match[2])
                } else {
                    alert('剪貼簿格式不正確，請確保格式為 (緯度, 經度)')
                }
            } catch (err) {
                console.error('無法讀取剪貼簿: ', err)
                alert('無法讀取剪貼簿，請檢查瀏覽器權限或手動輸入')
            }
        },
        async saveData() {
            if (!this.currentTrip) return
            if (this.isDemoMode) {
                const idx = this.trips.findIndex((t) => t.id === this.currentTrip.id)
                if (idx !== -1) this.trips[idx] = JSON.parse(JSON.stringify(this.currentTrip))
                localStorage.setItem('maplio_demo_data', JSON.stringify(this.trips))
                this.renderMarkers()
            } else {
                await setDoc(doc(db, 'trips', this.currentTrip.id), this.currentTrip)
                this.renderMarkers()
            }
        },
        startEditTripName() {
            this.tempTripName = this.currentTrip.name
            this.isEditingTripName = true
            this.$nextTick(() => this.$refs.tripNameInput.focus())
        },
        async saveTripName() {
            if (this.tempTripName && this.tempTripName !== this.currentTrip.name) {
                this.currentTrip.name = this.tempTripName
                await this.saveData()
            }
            this.isEditingTripName = false
        },
        startEditSpot(spot) {
            this.editingSpotId = spot.id
            this.tempSpotName = spot.name
            this.tempSpotNotes = spot.notes || ''
            this.tempSpotTimeStart = spot.timeStart || ''
            this.tempSpotTimeEnd = spot.timeEnd || ''
        },
        async saveSpotChanges(index) {
            const s = this.currentDaySpots[index]
            s.name = this.tempSpotName
            s.notes = this.tempSpotNotes
            s.timeStart = this.tempSpotTimeStart
            s.timeEnd = this.tempSpotTimeEnd
            this.editingSpotId = null
            await this.saveData()
        },
        startEditTransport(spot) {
            this.editingTransportId = spot.id
            this.tempTransportNotes = spot.transportNotes || ''
            this.tempTransStart = spot.transStart || ''
            this.tempTransEnd = spot.transEnd || ''
            this.$nextTick(() => {
                if (this.$refs.transportInput) this.$refs.transportInput[0].focus()
            })
        },
        async saveTransportNotes(index) {
            const s = this.currentDaySpots[index]
            s.transportNotes = this.tempTransportNotes
            s.transStart = this.tempTransStart
            s.transEnd = this.tempTransEnd
            this.editingTransportId = null
            await this.saveData()
        },
        async deleteTrip(tripId) {
            if (confirm('確定刪除整份行程？')) {
                if (this.isDemoMode) {
                    this.trips = this.trips.filter((t) => t.id !== tripId)
                    localStorage.setItem('maplio_demo_data', JSON.stringify(this.trips))
                } else {
                    await deleteDoc(doc(db, 'trips', tripId))
                }
            }
        },
        addDay() {
            this.currentTrip.itinerary.push({ spots: [] })
            this.activeDay = this.currentTrip.itinerary.length - 1
            this.saveData()
        },
        async deleteDay() {
            if (this.currentTrip.itinerary.length <= 1) return
            if (confirm(`刪除 Day ${this.activeDay + 1}？`)) {
                this.currentTrip.itinerary.splice(this.activeDay, 1)
                if (this.activeDay > 0) this.activeDay--
                await this.saveData()
            }
        },
        openSpotOnMaps(spot) {
            if (spot.url) {
                window.open(spot.url, '_blank')
            } else if (spot.lat && spot.lng) {
                window.open(
                    `https://www.google.com/maps/search/?api=1&query=${spot.lat},${spot.lng}`,
                    '_blank'
                )
            }
        },
        navBetweenSpots(start, end, mode) {
            let url = `https://www.google.com/maps/dir/?api=1&origin=${start.lat},${start.lng}&destination=${end.lat},${end.lng}`
            if (mode === 'driving') url += '&travelmode=driving'
            else if (mode === 'transit') url += '&travelmode=transit'
            else if (mode === 'walking') url += '&travelmode=walking'
            window.open(url, '_blank')
        },
        copyShareLink() {
            navigator.clipboard.writeText(
                `${window.location.origin}${window.location.pathname}?tripId=${this.currentTrip.id}`
            )
            alert('共享連結已複製！')
        },
        checkUrlParams() {
            const id = new URLSearchParams(window.location.search).get('tripId')
            if (id) this.bindTrip(id)
        },
        removeSpot(idx) {
            this.currentDaySpots.splice(idx, 1)
            this.saveData()
        },
        addManualSpot() {
            if (!this.manualSpot.name) return alert('請輸入名稱')
            const spot = {
                id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
                name: this.manualSpot.name,
                lat: this.manualSpot.lat,
                lng: this.manualSpot.lng,
                url: this.manualSpot.url,
                notes: this.manualSpot.notes,
                timeStart: this.manualSpot.timeStart,
                timeEnd: this.manualSpot.timeEnd,
                travelMode: 'auto',
                transportNotes: '',
                transStart: '',
                transEnd: ''
            }
            this.currentDaySpots.push(spot)
            this.showManualSpotForm = false
            this.manualSpot = {
                name: '',
                lat: null,
                lng: null,
                url: '',
                notes: '',
                timeStart: '',
                timeEnd: ''
            }
            this.saveData()
        }
    }
}
</script>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
    display: none;
}
.animate-fade {
    animation: fadeIn 0.4s ease-out forwards;
}
@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}
#desktop-map,
#mobile-map {
    background: #0f172a;
    will-change: transform;
}
input[type='time']::-webkit-calendar-picker-indicator,
input[type='date']::-webkit-calendar-picker-indicator {
    filter: invert(1);
    opacity: 0.5;
    cursor: pointer;
}
.sortable-ghost {
    opacity: 0.2;
    background: #3b82f6 !important;
    border-radius: 2rem;
}
select {
    -webkit-appearance: none;
    appearance: none;
}
aside,
main > div {
    -webkit-overflow-scrolling: touch;
}
</style>
