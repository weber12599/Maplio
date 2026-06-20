<template>
    <Transition name="pool-fade">
        <div
            v-if="isOpen"
            :class="['fixed inset-0 z-[25000] flex justify-end', themeConfig.dialogOverlayClass]"
            @click.self="$emit('close')"
        >
            <Transition name="pool-slide" appear>
                <aside
                    v-if="isOpen"
                    :class="[
                        'w-full max-w-md h-full flex flex-col border-l shadow-2xl',
                        themeConfig.dialogContainerClass
                    ]"
                >
                    <header
                        :class="[
                            'flex items-center justify-between px-6 py-4 border-b shrink-0',
                            themeConfig.secondaryBorderClass
                        ]"
                    >
                        <h3 class="text-lg font-bold flex items-center gap-2">
                            <i class="fa-solid fa-layer-group"></i>
                            {{ $t('planner.pool_title') }}
                        </h3>
                        <div class="flex items-center gap-2">
                            <button
                                v-if="canEdit"
                                @click="$emit('save-current')"
                                :class="[
                                    'px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5',
                                    themeConfig.primaryBtnClass
                                ]"
                            >
                                <i class="fa-solid fa-plus"></i>
                                {{ $t('planner.pool_save_current') }}
                            </button>
                            <button
                                @click="$emit('close')"
                                class="w-8 h-8 rounded-full flex items-center justify-center opacity-60 hover:opacity-100"
                            >
                                <i class="fa-solid fa-xmark"></i>
                            </button>
                        </div>
                    </header>

                    <div class="flex-grow overflow-y-auto p-6 space-y-4 custom-scroll">
                        <div
                            v-if="planPool.length === 0"
                            :class="[
                                'text-center py-16 border-2 border-dashed rounded-3xl opacity-40',
                                themeConfig.secondaryBorderClass
                            ]"
                        >
                            <i class="fa-solid fa-layer-group text-2xl mb-3 block"></i>
                            <p class="text-sm font-bold px-6">{{ $t('planner.pool_empty') }}</p>
                        </div>

                        <div
                            v-for="(plan, index) in planPool"
                            :key="plan.id"
                            :class="['rounded-2xl border p-4', themeConfig.cardClass]"
                        >
                            <div class="flex items-center justify-between gap-2">
                                <button
                                    @click="toggleExpand(plan.id)"
                                    class="flex items-center gap-2 min-w-0 flex-grow text-left"
                                >
                                    <i
                                        :class="[
                                            'fa-solid text-xs opacity-50 transition-transform',
                                            expandedId === plan.id
                                                ? 'fa-chevron-down'
                                                : 'fa-chevron-right'
                                        ]"
                                    ></i>
                                    <span class="font-bold text-sm truncate">{{
                                        poolName(plan, index)
                                    }}</span>
                                    <span class="text-xs opacity-50 shrink-0">
                                        {{ plan.spots ? plan.spots.length : 0 }}
                                    </span>
                                </button>
                                <div class="flex items-center gap-1 shrink-0">
                                    <button
                                        v-if="canEdit"
                                        @click="openCopy(plan.id)"
                                        :title="$t('planner.pool_copy_to_days')"
                                        :class="[
                                            'w-8 h-8 rounded-lg text-xs',
                                            themeConfig.tabInactiveClass
                                        ]"
                                    >
                                        <i class="fa-solid fa-calendar-plus"></i>
                                    </button>
                                    <button
                                        v-if="canEdit"
                                        @click="renamePlan(plan, index)"
                                        :title="$t('planner.plan_rename')"
                                        :class="[
                                            'w-8 h-8 rounded-lg text-xs',
                                            themeConfig.tabInactiveClass
                                        ]"
                                    >
                                        <i class="fa-solid fa-pen"></i>
                                    </button>
                                    <button
                                        v-if="canEdit"
                                        @click="removePlan(plan.id)"
                                        :title="$t('planner.pool_remove')"
                                        class="w-8 h-8 rounded-lg text-xs text-red-500 hover:bg-red-500/10"
                                    >
                                        <i class="fa-solid fa-trash-can"></i>
                                    </button>
                                </div>
                            </div>

                            <ul
                                v-if="expandedId === plan.id"
                                class="mt-3 pl-5 space-y-1 text-xs opacity-70"
                            >
                                <li
                                    v-if="!plan.spots || plan.spots.length === 0"
                                    class="opacity-50"
                                >
                                    {{ $t('planner.empty_day_hint') }}
                                </li>
                                <li
                                    v-for="spot in plan.spots"
                                    :key="spot.id"
                                    class="flex items-center gap-2 truncate"
                                >
                                    <i class="fa-solid fa-location-dot text-[9px] opacity-50"></i>
                                    {{ spot.name || $t('planner.unnamed_spot') }}
                                </li>
                            </ul>
                        </div>
                    </div>
                </aside>
            </Transition>

            <CopySpotDialog
                :isOpen="showCopyDialog"
                :totalDays="totalDays"
                :currentDay="-1"
                :themeConfig="themeConfig"
                @close="showCopyDialog = false"
                @confirm="confirmCopy"
            />
        </div>
    </Transition>
</template>

<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import CopySpotDialog from './CopySpotDialog.vue'

defineProps({
    isOpen: Boolean,
    planPool: { type: Array, default: () => [] },
    totalDays: { type: Number, default: 0 },
    canEdit: { type: Boolean, default: true },
    themeConfig: Object
})

const emit = defineEmits(['close', 'save-current', 'copy-to-days', 'rename', 'remove'])

const { t } = useI18n()

const expandedId = ref(null)
const showCopyDialog = ref(false)
const copyingPlanId = ref(null)

const poolName = (plan, index) => plan.name || t('planner.plan_default_name', { n: index + 1 })

const toggleExpand = (id) => {
    expandedId.value = expandedId.value === id ? null : id
}

const openCopy = (id) => {
    copyingPlanId.value = id
    showCopyDialog.value = true
}

const confirmCopy = (dayIndexes) => {
    if (copyingPlanId.value) emit('copy-to-days', copyingPlanId.value, dayIndexes)
    showCopyDialog.value = false
    copyingPlanId.value = null
}

const renamePlan = (plan, index) => {
    const next = prompt(t('planner.plan_rename'), poolName(plan, index))
    if (next !== null) emit('rename', plan.id, next.trim())
}

const removePlan = (id) => {
    if (confirm(t('planner.pool_remove_confirm'))) emit('remove', id)
}
</script>

<style scoped>
.pool-fade-enter-active,
.pool-fade-leave-active {
    transition: opacity 0.3s ease;
}
.pool-fade-enter-from,
.pool-fade-leave-to {
    opacity: 0;
}
.pool-slide-enter-active,
.pool-slide-leave-active {
    transition: transform 0.3s ease-out;
}
.pool-slide-enter-from,
.pool-slide-leave-to {
    transform: translateX(100%);
}
.custom-scroll::-webkit-scrollbar {
    width: 4px;
}
.custom-scroll::-webkit-scrollbar-track {
    background: transparent;
}
.custom-scroll::-webkit-scrollbar-thumb {
    background-color: rgba(156, 163, 175, 0.3);
    border-radius: 20px;
}
</style>
