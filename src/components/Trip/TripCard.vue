<template>
    <div
        @click="$emit('select', trip)"
        :class="[
            'p-8 rounded-[2.5rem] border transition-all duration-500 cursor-pointer group shadow-lg flex flex-col h-full justify-between',
            themeConfig.cardClass
        ]"
    >
        <div class="flex flex-col h-full justify-between">
            <div>
                <h3 class="font-bold text-2xl transition-colors tracking-tight">
                    {{ trip.name }}
                </h3>
                <div class="mt-4 flex items-center gap-3 opacity-50 text-sm font-medium">
                    <span class="flex items-center gap-1.5">
                        <i class="fa-regular fa-calendar"></i> {{ trip.startDate }}
                    </span>
                    <span class="opacity-30">·</span>
                    <span>{{ trip.itinerary.length }} {{ $t('common.days') }}</span>
                </div>
                <div v-if="userRole && userRole !== 'owner'" class="mt-2">
                    <span
                        :class="[
                            'text-[9px] px-2 py-0.5 rounded-full font-bold uppercase border inline-block',
                            userRole === 'editor'
                                ? 'border-blue-500/30 text-blue-500'
                                : 'border-stone-400/30 text-stone-400'
                        ]"
                    >
                        {{ $t(`members.role_${userRole}`) }}
                    </span>
                </div>
            </div>
            <div class="mt-8 flex justify-between items-center">
                <div class="flex items-center gap-4">
                    <button
                        v-if="canManage"
                        @click.stop="editName"
                        :title="$t('trip_card.edit_name')"
                        class="opacity-30 hover:opacity-100 hover:text-blue-500 transition-all"
                    >
                        <i class="fa-solid fa-pen"></i>
                    </button>
                    <button
                        v-if="userRole === 'owner' || userRole === null"
                        @click.stop="confirmDelete"
                        class="opacity-30 hover:opacity-100 hover:text-red-500 transition-all"
                    >
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                </div>

                <div
                    :class="[
                        'w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300',
                        themeConfig.actionBtnClass
                    ]"
                >
                    <i class="fa-solid fa-arrow-right"></i>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps({
    trip: {
        type: Object,
        required: true
    },
    themeConfig: {
        type: Object,
        required: true
    },
    userRole: {
        type: String,
        default: null
    }
})

const emit = defineEmits(['select', 'delete', 'rename'])

const { t } = useI18n()

const canManage = computed(
    () => ['owner', 'editor'].includes(props.userRole) || props.userRole === null
)

const confirmDelete = () => {
    if (confirm(t('trip_card.delete_confirm', { name: props.trip.name }))) {
        emit('delete', props.trip.id)
    }
}

const editName = () => {
    const next = prompt(t('trip_card.rename_prompt'), props.trip.name)
    if (next === null) return
    const trimmed = next.trim()
    if (trimmed && trimmed !== props.trip.name) emit('rename', props.trip.id, trimmed)
}
</script>
