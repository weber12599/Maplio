<template>
    <header
        :class="[
            'p-4 md:p-6 md:px-6 flex justify-between items-center z-[20000] shrink-0 border-b transition-colors duration-500',
            themeClass
        ]"
        :style="{ paddingTop: 'calc(env(safe-area-inset-top) + 1rem)' }"
    >
        <div class="flex items-center gap-4">
            <div class="flex items-center gap-2 select-none hover:opacity-80 transition-opacity">
                <img
                    :src="logoSrc"
                    alt="Maplio"
                    class="h-8 md:h-10 w-auto object-contain"
                    @click="$emit('back')"
                />
            </div>

            <span v-if="currentTrip" class="hidden md:block opacity-20">/</span>
            <input
                v-if="currentTrip && isEditingName"
                ref="nameInput"
                v-model="nameDraft"
                @keyup.enter="commitName"
                @keyup.esc="cancelName"
                @blur="commitName"
                :class="[
                    'hidden md:block font-bold max-w-[200px] bg-transparent border-b outline-none',
                    currentTheme === 'dark' ? 'border-slate-600' : 'border-stone-300'
                ]"
            />
            <span
                v-else-if="currentTrip"
                @click="startEditName"
                :class="[
                    'hidden md:flex items-center gap-1.5 font-bold truncate max-w-[220px] opacity-60',
                    canEdit ? 'cursor-pointer hover:opacity-100 transition-opacity' : ''
                ]"
                :title="canEdit ? $t('trip_card.edit_name') : ''"
            >
                <span class="truncate">{{ currentTrip.name }}</span>
                <i v-if="canEdit" class="fa-solid fa-pen text-[10px] opacity-50"></i>
            </span>
        </div>

        <div class="flex items-center gap-3">
            <button
                v-if="currentTrip"
                @click="$emit('share')"
                :class="[
                    'flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all active:scale-95',
                    themes[currentTheme].headerBtnClass
                ]"
                :title="$t('app.share_trip')"
            >
                <i class="fa-solid fa-share-nodes"></i>
                <span class="hidden md:inline">{{ $t('app.share_trip') }}</span>
            </button>

            <button
                v-if="showAddButton"
                @click="$emit('create')"
                :class="[
                    'flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all active:scale-95',
                    themes[currentTheme].headerBtnClass
                ]"
            >
                <i class="fa-solid fa-plus"></i>
                <span class="hidden md:inline">{{ $t('app.new_trip') }}</span>
            </button>

            <div class="relative" v-if="user || isDemo" ref="menuContainer">
                <button
                    @click="toggleMenu"
                    :class="[
                        'flex items-center gap-2 pl-2 pr-2 py-1.5 rounded-full border transition-all active:scale-95',
                        currentTheme === 'dark'
                            ? 'border-slate-700 hover:bg-slate-800 text-slate-200'
                            : 'border-stone-200 hover:bg-white text-stone-700 bg-stone-50/50'
                    ]"
                >
                    <div
                        class="w-8 h-8 rounded-full overflow-hidden border border-opacity-20 flex items-center justify-center shrink-0"
                        :class="
                            currentTheme === 'dark'
                                ? 'bg-slate-700 border-white'
                                : 'bg-stone-200 border-black'
                        "
                    >
                        <img
                            v-if="user?.photoURL"
                            :src="user.photoURL"
                            class="w-full h-full object-cover"
                        />
                        <i v-else class="fa-solid fa-user text-xs opacity-50"></i>
                    </div>

                    <span class="font-bold text-sm max-w-[100px] truncate hidden md:block">
                        {{ user?.displayName || $t('app.unknown') }}
                    </span>

                    <i
                        class="fa-solid fa-chevron-down text-[10px] opacity-50 ml-1 transition-transform duration-300"
                        :class="{ 'rotate-180': isMenuOpen }"
                    ></i>
                </button>

                <div
                    v-if="isMenuOpen"
                    class="fixed inset-0 z-[20001]"
                    @click="isMenuOpen = false"
                ></div>

                <transition
                    enter-active-class="transition duration-200 ease-out"
                    enter-from-class="transform scale-95 opacity-0"
                    enter-to-class="transform scale-100 opacity-100"
                    leave-active-class="transition duration-75 ease-in"
                    leave-from-class="transform scale-100 opacity-100"
                    leave-to-class="transform scale-95 opacity-0"
                >
                    <div
                        v-if="isMenuOpen"
                        :class="[themes[currentTheme].menuBtnClass, 'z-[20002]']"
                        class="overflow-hidden"
                        @click.stop
                    >
                        <div
                            class="md:hidden px-3 py-2 text-sm font-bold border-b mb-1 opacity-70"
                            :class="
                                currentTheme === 'dark' ? 'border-slate-700' : 'border-stone-100'
                            "
                        >
                            {{ user?.displayName || $t('app.unknown') }}
                        </div>

                        <button
                            v-if="!currentTrip"
                            @click="handleAction('import')"
                            :class="themes[currentTheme].menuItemClass"
                        >
                            <div class="flex items-center gap-3">
                                <i class="fa-solid fa-file-import w-5 text-center"></i>
                                {{ $t('app.import_json') }}
                            </div>
                        </button>

                        <button
                            @click="toggleSubMenu('theme')"
                            :class="themes[currentTheme].menuItemClass"
                            class="justify-between group"
                        >
                            <div class="flex items-center gap-3">
                                <i
                                    :class="[
                                        'w-5 text-center',
                                        currentTheme === 'dark'
                                            ? 'fa-solid fa-moon'
                                            : 'fa-solid fa-sun'
                                    ]"
                                ></i>
                                <span>{{
                                    currentTheme === 'dark' ? $t('theme.dark') : $t('theme.muji')
                                }}</span>
                            </div>
                            <i
                                class="fa-solid fa-chevron-down text-[10px] opacity-50 transition-transform duration-300"
                                :class="{ 'rotate-180': subMenu === 'theme' }"
                            ></i>
                        </button>

                        <div
                            v-if="subMenu === 'theme'"
                            class="pl-10 pr-2 py-1 space-y-1 bg-opacity-50"
                            :class="currentTheme === 'dark' ? 'bg-slate-800' : 'bg-stone-50'"
                        >
                            <button
                                v-for="theme in themes"
                                :key="theme.name"
                                @click="setTheme(theme.name)"
                                :class="[
                                    'w-full text-left px-3 py-2 rounded-lg text-sm flex justify-between items-center transition-colors',
                                    currentTheme === theme.name
                                        ? 'font-bold text-blue-500'
                                        : 'opacity-70 hover:opacity-100'
                                ]"
                            >
                                <span>{{ $t(`theme.${theme.name}`) }}</span>
                                <i v-if="currentTheme === theme.name" class="fa-solid fa-check"></i>
                            </button>
                        </div>

                        <button
                            @click="toggleSubMenu('lang')"
                            :class="themes[currentTheme].menuItemClass"
                            class="justify-between group"
                        >
                            <div class="flex items-center gap-3">
                                <i class="fa-solid fa-language w-5 text-center"></i>
                                {{ $t('app.change_lang') }}
                            </div>
                            <i
                                class="fa-solid fa-chevron-down text-[10px] opacity-50 transition-transform duration-300"
                                :class="{ 'rotate-180': subMenu === 'lang' }"
                            ></i>
                        </button>

                        <div
                            v-if="subMenu === 'lang'"
                            class="pl-10 pr-2 py-1 space-y-1 bg-opacity-50"
                            :class="currentTheme === 'dark' ? 'bg-slate-800' : 'bg-stone-50'"
                        >
                            <button
                                v-for="meta in [
                                    {
                                        value: 'zh-TW',
                                        label: '繁體中文'
                                    },
                                    {
                                        value: 'en-US',
                                        label: 'English'
                                    }
                                ]"
                                :key="meta.value"
                                @click="setLang(meta.value)"
                                :class="[
                                    'w-full text-left px-3 py-2 rounded-lg text-sm flex justify-between items-center transition-colors',
                                    locale === meta.value
                                        ? 'font-bold text-blue-500'
                                        : 'opacity-70 hover:opacity-100'
                                ]"
                            >
                                <span>{{ meta.label }}</span>
                                <i v-if="locale === meta.value" class="fa-solid fa-check"></i>
                            </button>
                        </div>

                        <button
                            @click="toggleSubMenu('search')"
                            :class="themes[currentTheme].menuItemClass"
                            class="justify-between group"
                        >
                            <div class="flex items-center gap-3">
                                <i class="fa-solid fa-magnifying-glass w-5 text-center"></i>
                                {{ $t('app.search_provider') }}
                            </div>
                            <i
                                class="fa-solid fa-chevron-down text-[10px] opacity-50 transition-transform duration-300"
                                :class="{ 'rotate-180': subMenu === 'search' }"
                            ></i>
                        </button>

                        <div
                            v-if="subMenu === 'search'"
                            class="pl-10 pr-2 py-1 space-y-1 bg-opacity-50"
                            :class="currentTheme === 'dark' ? 'bg-slate-800' : 'bg-stone-50'"
                        >
                            <button
                                v-for="meta in [
                                    { value: 'google', label: $t('app.provider_google') },
                                    { value: 'osm', label: $t('app.provider_osm') }
                                ]"
                                :key="meta.value"
                                @click="setSearchProvider(meta.value)"
                                :class="[
                                    'w-full text-left px-3 py-2 rounded-lg text-sm flex justify-between items-center transition-colors',
                                    searchProvider === meta.value
                                        ? 'font-bold text-blue-500'
                                        : 'opacity-70 hover:opacity-100'
                                ]"
                            >
                                <span>{{ meta.label }}</span>
                                <i
                                    v-if="searchProvider === meta.value"
                                    class="fa-solid fa-check"
                                ></i>
                            </button>
                        </div>

                        <div
                            v-if="searchProvider === 'google'"
                            class="h-px my-1 mx-2 opacity-10 bg-current"
                        ></div>

                        <button
                            v-if="searchProvider === 'google'"
                            @click="openBackendConfig"
                            :class="themes[currentTheme].menuItemClass"
                        >
                            <div class="flex items-center gap-3">
                                <i class="fa-solid fa-gear w-5 text-center"></i>
                                {{ $t('app.configure_backend') }}
                            </div>
                        </button>

                        <div class="h-px my-1 mx-2 opacity-10 bg-current"></div>

                        <button
                            @click="handleAction('info')"
                            :class="themes[currentTheme].menuItemClass"
                        >
                            <div class="flex items-center gap-3">
                                <i class="fa-solid fa-circle-info w-5 text-center"></i>
                                {{ $t('app.about') }}
                            </div>
                        </button>

                        <div
                            v-if="!isOfflineBuild"
                            class="h-px my-1 mx-2 opacity-10 bg-current"
                        ></div>

                        <button
                            v-if="!isOfflineBuild"
                            @click="handleAction('logout')"
                            :class="[
                                themes[currentTheme].menuItemClass,
                                'text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400'
                            ]"
                        >
                            <div class="flex items-center gap-3">
                                <i class="fa-solid fa-right-from-bracket w-5 text-center"></i>
                                {{ $t('app.logout') }}
                            </div>
                        </button>
                    </div>
                </transition>
            </div>
        </div>

        <!-- Backend Config Dialog -->
        <div
            v-if="isBackendConfigOpen"
            :class="[
                'fixed inset-0 z-[30000] flex items-center justify-center p-4 transition-colors duration-500',
                currentTheme === 'dark' ? 'bg-black/50' : 'bg-white/30'
            ]"
            @click="closeBackendConfig"
        >
            <div
                :class="[
                    'w-full max-w-md rounded-2xl p-6 border transition-all duration-500 space-y-4',
                    currentTheme === 'dark'
                        ? 'bg-slate-800 border-slate-700 text-slate-100'
                        : 'bg-white border-stone-200 text-stone-900'
                ]"
                @click.stop
            >
                <h3 class="text-lg font-bold">{{ $t('app.configure_backend') }}</h3>

                <div class="space-y-4">
                    <!-- Backend URL -->
                    <div>
                        <label
                            :class="[
                                'text-xs font-bold uppercase ml-1 mb-2 block transition-colors',
                                currentTheme === 'dark' ? 'text-slate-400' : 'text-stone-500'
                            ]"
                        >
                            {{ $t('app.backend_url') }}
                        </label>
                        <input
                            v-model="tempBackendUrl"
                            type="url"
                            placeholder="http://localhost:3000"
                            :class="[
                                'w-full rounded-lg px-3 py-2 outline-none border transition-all text-sm',
                                currentTheme === 'dark'
                                    ? 'bg-slate-700 border-slate-600 text-slate-100 focus:ring-blue-400'
                                    : 'bg-stone-50 border-stone-300 text-stone-900 focus:ring-blue-400'
                            ]"
                            @keyup.enter="saveBackendConfig"
                        />
                    </div>

                    <!-- API Key -->
                    <div>
                        <label
                            :class="[
                                'text-xs font-bold uppercase ml-1 mb-2 block transition-colors',
                                currentTheme === 'dark' ? 'text-slate-400' : 'text-stone-500'
                            ]"
                        >
                            {{ $t('app.backend_key') }}
                        </label>
                        <input
                            v-model="tempBackendApiKey"
                            type="password"
                            placeholder="API Key"
                            :class="[
                                'w-full rounded-lg px-3 py-2 outline-none border transition-all text-sm',
                                currentTheme === 'dark'
                                    ? 'bg-slate-700 border-slate-600 text-slate-100 focus:ring-blue-400'
                                    : 'bg-stone-50 border-stone-300 text-stone-900 focus:ring-blue-400'
                            ]"
                            @keyup.enter="saveBackendConfig"
                        />
                    </div>
                </div>

                <!-- Buttons -->
                <div class="flex gap-3 pt-2">
                    <button
                        @click="closeBackendConfig"
                        :class="[
                            'flex-1 px-4 py-2 rounded-lg font-bold transition-all text-sm',
                            currentTheme === 'dark'
                                ? 'bg-slate-700 text-slate-100 hover:bg-slate-600'
                                : 'bg-stone-200 text-stone-900 hover:bg-stone-300'
                        ]"
                    >
                        {{ $t('common.cancel') }}
                    </button>
                    <button
                        @click="saveBackendConfig"
                        class="flex-1 px-4 py-2 rounded-lg font-bold transition-all text-sm bg-blue-500 text-white hover:bg-blue-600 active:scale-95"
                    >
                        {{ $t('common.confirm') }}
                    </button>
                </div>
            </div>
        </div>
    </header>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import { themes } from '../../utils/themeUtils'
import logoDefault from '@/assets/logos/logo.svg'
import logoDark from '@/assets/logos/logo-dark.svg'

const isOfflineBuild = import.meta.env.VITE_APP_MODE === 'offline'

const props = defineProps({
    user: Object,
    currentTrip: Object,
    isDemo: Boolean,
    showAddButton: Boolean,
    currentTheme: String,
    themeClass: String,
    appVersion: String,
    canEdit: { type: Boolean, default: false }
})

const emit = defineEmits([
    'back',
    'update-theme',
    'logout',
    'import',
    'share',
    'create',
    'change-lang',
    'rename'
])

const { t, locale } = useI18n()

const isEditingName = ref(false)
const nameDraft = ref('')
const nameInput = ref(null)

const startEditName = async () => {
    if (!props.canEdit) return
    nameDraft.value = props.currentTrip?.name || ''
    isEditingName.value = true
    await nextTick()
    nameInput.value?.focus()
    nameInput.value?.select()
}

const commitName = () => {
    if (!isEditingName.value) return
    isEditingName.value = false
    const next = nameDraft.value.trim()
    if (next && next !== props.currentTrip?.name) emit('rename', next)
}

const cancelName = () => {
    isEditingName.value = false
}

const isMenuOpen = ref(false)
const subMenu = ref(null)
const searchProvider = ref(localStorage.getItem('maplio_search_provider') || 'google')
const isBackendConfigOpen = ref(false)
const backendUrl = ref(localStorage.getItem('maplio_backend_url') || '')
const backendApiKey = ref(localStorage.getItem('maplio_backend_key') || '')
const tempBackendUrl = ref('')
const tempBackendApiKey = ref('')

const logoSrc = computed(() => {
    return props.currentTheme === 'muji' ? logoDefault : logoDark
})

const toggleMenu = () => {
    isMenuOpen.value = !isMenuOpen.value
    if (!isMenuOpen.value) {
        subMenu.value = null
    }
}

const toggleSubMenu = (menu) => {
    subMenu.value = subMenu.value === menu ? null : menu
}

const setTheme = (themeName) => {
    emit('update-theme', themeName)
}

const setLang = (langCode) => {
    locale.value = langCode
    localStorage.setItem('maplio_locale', langCode)
}

const setSearchProvider = (provider) => {
    searchProvider.value = provider
    localStorage.setItem('maplio_search_provider', provider)
}

const openBackendConfig = () => {
    tempBackendUrl.value = backendUrl.value
    tempBackendApiKey.value = backendApiKey.value
    isBackendConfigOpen.value = true
}

const saveBackendConfig = () => {
    backendUrl.value = tempBackendUrl.value.trim()
    backendApiKey.value = tempBackendApiKey.value.trim()
    localStorage.setItem('maplio_backend_url', backendUrl.value)
    localStorage.setItem('maplio_backend_key', backendApiKey.value)
    isBackendConfigOpen.value = false
}

const closeBackendConfig = () => {
    isBackendConfigOpen.value = false
}

const showVersionInfo = () => {
    const mode = props.isDemo ? t('app.mode_demo') : t('app.mode_cloud')
    const unknown = t('app.unknown')
    alert(
        `Maplio ${t('app.version_info')}\n${t('app.current_version')}: ${
            props.appVersion || unknown
        }\n${t('app.env')}: ${mode}`
    )
}

const handleAction = (action) => {
    switch (action) {
        case 'import':
            emit('import')
            isMenuOpen.value = false
            break
        case 'info':
            showVersionInfo()
            isMenuOpen.value = false
            break
        case 'logout':
            emit('logout')
            isMenuOpen.value = false
            break
    }
}
</script>
