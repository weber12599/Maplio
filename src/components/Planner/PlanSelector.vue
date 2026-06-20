<template>
    <div
        :class="[
            'flex items-center gap-2 px-6 py-2 border-b shrink-0 transition-colors duration-500',
            themeConfig.secondaryBorderClass
        ]"
    >
        <!-- Plan chips (only shown when there is more than one plan) -->
        <div
            v-if="plans.length > 1"
            class="flex-grow flex items-center gap-2 overflow-x-auto no-scrollbar"
        >
            <div v-for="(plan, index) in plans" :key="plan.id" class="relative shrink-0">
                <button
                    @click="$emit('set-active', plan.id)"
                    :class="[
                        'pl-3 pr-2 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all duration-300',
                        plan.id === activePlanId
                            ? themeConfig.tabActiveClass
                            : themeConfig.tabInactiveClass
                    ]"
                >
                    <i
                        v-if="plan.id === activePlanId"
                        class="fa-solid fa-circle-check text-[10px]"
                    ></i>
                    {{ planName(plan, index) }}
                    <span class="opacity-50">{{ plan.spots ? plan.spots.length : 0 }}</span>
                    <i
                        v-if="canEdit"
                        @click.stop="toggleMenu($event, plan, index)"
                        class="fa-solid fa-ellipsis-vertical ml-0.5 px-1 opacity-60 hover:opacity-100"
                    ></i>
                </button>
            </div>
        </div>
        <div v-else class="flex-grow"></div>

        <button
            v-if="canEdit"
            @click="$emit('add')"
            :title="$t('planner.plan_add')"
            :class="[
                'shrink-0 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5',
                themeConfig.tabInactiveClass
            ]"
        >
            <i class="fa-solid fa-plus"></i>
            <span v-if="plans.length <= 1">{{ $t('planner.plan_add') }}</span>
        </button>

        <button
            @click="$emit('open-pool')"
            :title="$t('planner.pool_open')"
            :class="[
                'shrink-0 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5',
                themeConfig.tabInactiveClass
            ]"
        >
            <i class="fa-solid fa-layer-group"></i>
            <span v-if="plans.length <= 1">{{ $t('planner.pool_open') }}</span>
        </button>

        <!-- Plan action menu, teleported to body so it isn't clipped by the
             chips' overflow-x-auto container -->
        <Teleport to="body">
            <template v-if="openMenu">
                <div class="fixed inset-0 z-[19000]" @click="openMenu = null"></div>
                <div
                    :class="[themeConfig.menuBtnClass, 'z-[20000]']"
                    :style="{
                        position: 'fixed',
                        top: openMenu.top + 'px',
                        left: openMenu.left + 'px'
                    }"
                >
                    <button
                        :class="themeConfig.menuItemClass"
                        @click="renamePlan(openMenu.plan, openMenu.index)"
                    >
                        <i class="fa-solid fa-pen w-4"></i>{{ $t('planner.plan_rename') }}
                    </button>
                    <button
                        :class="themeConfig.menuItemClass"
                        @click="emitAndClose('duplicate', openMenu.plan.id)"
                    >
                        <i class="fa-solid fa-copy w-4"></i>{{ $t('planner.plan_duplicate') }}
                    </button>
                    <button
                        :class="themeConfig.menuItemClass"
                        @click="emitAndClose('save-to-pool', openMenu.plan.id)"
                    >
                        <i class="fa-solid fa-layer-group w-4"></i
                        >{{ $t('planner.plan_save_to_pool') }}
                    </button>
                    <button
                        v-if="plans.length > 1"
                        :class="[themeConfig.menuItemClass, 'text-red-500']"
                        @click="deletePlan(openMenu.plan)"
                    >
                        <i class="fa-solid fa-trash-can w-4"></i>{{ $t('planner.plan_delete') }}
                    </button>
                </div>
            </template>
        </Teleport>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

defineProps({
    plans: { type: Array, default: () => [] },
    activePlanId: { type: String, default: null },
    canEdit: { type: Boolean, default: true },
    themeConfig: Object
})

const emit = defineEmits([
    'set-active',
    'add',
    'rename',
    'duplicate',
    'remove',
    'save-to-pool',
    'open-pool'
])

const { t } = useI18n()

// openMenu = { id, plan, index, top, left } | null
const openMenu = ref(null)

const planName = (plan, index) => plan.name || t('planner.plan_default_name', { n: index + 1 })

const toggleMenu = (e, plan, index) => {
    if (openMenu.value && openMenu.value.id === plan.id) {
        openMenu.value = null
        return
    }
    const rect = e.currentTarget.getBoundingClientRect()
    const menuWidth = 224
    const left = Math.max(8, Math.min(rect.left, window.innerWidth - menuWidth - 8))
    openMenu.value = { id: plan.id, plan, index, top: rect.bottom + 4, left }
}

const emitAndClose = (event, id) => {
    emit(event, id)
    openMenu.value = null
}

const renamePlan = (plan, index) => {
    openMenu.value = null
    const next = prompt(t('planner.plan_rename'), planName(plan, index))
    if (next !== null) emit('rename', plan.id, next.trim())
}

const deletePlan = (plan) => {
    openMenu.value = null
    if (confirm(t('planner.plan_delete_confirm'))) emit('remove', plan.id)
}
</script>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
    display: none;
}
.no-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
}
</style>
