<template>
    <div class="fixed inset-0 z-[30000] flex items-center justify-center p-4">
        <div
            class="absolute inset-0 transition-opacity duration-300"
            :class="themeConfig.dialogOverlayClass"
            @click="$emit('close')"
        ></div>

        <div
            class="relative w-full max-w-sm overflow-hidden rounded-[2.5rem] p-8 shadow-2xl transition-all animate-fade"
            :class="themeConfig.dialogContainerClass"
        >
            <div class="mb-6 text-center">
                <h3 class="text-xl font-bold mb-2" :class="themeConfig.dialogTitleClass">
                    {{ $t('members.title') }}
                </h3>
                <p class="text-sm opacity-60">{{ trip.name }}</p>
            </div>

            <!-- Member List -->
            <div class="space-y-3 mb-6 max-h-64 overflow-y-auto">
                <div
                    v-for="uid in trip.members"
                    :key="uid"
                    class="flex items-center justify-between p-3 rounded-xl border"
                    :class="themeConfig.secondaryBorderClass"
                >
                    <div class="flex items-center gap-2 flex-grow min-w-0">
                        <div
                            class="w-8 h-8 rounded-full overflow-hidden bg-blue-500/10 flex items-center justify-center text-sm font-bold text-blue-500 flex-shrink-0"
                        >
                            <img
                                v-if="getMemberProfile(uid)?.photoURL"
                                :src="getMemberProfile(uid).photoURL"
                                class="w-full h-full object-cover"
                            />
                            <template v-else>{{ getMemberInitials(uid) }}</template>
                        </div>
                        <div class="min-w-0">
                            <div class="text-xs truncate">{{ getMemberName(uid) }}</div>
                            <div
                                :class="[
                                    'text-[10px] font-bold uppercase opacity-60',
                                    getMemberRole(uid) === 'owner'
                                        ? 'text-amber-500'
                                        : getMemberRole(uid) === 'editor'
                                          ? 'text-blue-500'
                                          : 'text-stone-400'
                                ]"
                            >
                                {{ $t(`members.role_${getMemberRole(uid)}`) }}
                            </div>
                        </div>
                    </div>

                    <div class="flex items-center gap-2 flex-shrink-0">
                        <!-- Role dropdown - only for owner to change non-owner members -->
                        <select
                            v-if="currentUserRole === 'owner' && getMemberRole(uid) !== 'owner'"
                            :value="getMemberRole(uid)"
                            @change="handleRoleChange(uid, $event.target.value)"
                            :disabled="isUpdating"
                            :class="[
                                'text-xs px-2 py-1 rounded border font-bold transition-all',
                                themeConfig.dialogInputClass
                            ]"
                        >
                            <option value="viewer">{{ $t('members.role_viewer') }}</option>
                            <option value="editor">{{ $t('members.role_editor') }}</option>
                        </select>

                        <!-- Remove button - only for owner to remove non-owner members -->
                        <button
                            v-if="currentUserRole === 'owner' && getMemberRole(uid) !== 'owner'"
                            @click="handleRemoveMember(uid)"
                            :disabled="isUpdating"
                            :class="[
                                'w-7 h-7 flex items-center justify-center rounded text-xs transition-all',
                                isUpdating
                                    ? 'opacity-50 cursor-not-allowed'
                                    : 'opacity-30 hover:opacity-100 hover:bg-red-500/10 text-red-500'
                            ]"
                        >
                            <i class="fa-solid fa-xmark"></i>
                        </button>
                    </div>
                </div>
            </div>

            <button
                @click="$emit('close')"
                class="w-full py-3 text-sm font-bold opacity-40 hover:opacity-100 transition-opacity"
            >
                {{ $t('common.close') }}
            </button>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { updateMemberRole, removeMember } from '../../services/tripService'

const props = defineProps({
    themeConfig: {
        type: Object,
        required: true
    },
    trip: {
        type: Object,
        required: true
    },
    currentUserRole: {
        type: String,
        required: true
    }
})

defineEmits(['close'])

const { t } = useI18n()
const isUpdating = ref(false)

const getMemberProfile = (uid) => props.trip.memberProfiles?.[uid] || null

const getMemberName = (uid) => {
    const name = getMemberProfile(uid)?.displayName
    return name || `${uid.slice(0, 12)}...`
}

const getMemberInitials = (uid) => {
    const name = getMemberProfile(uid)?.displayName
    return (name || uid).slice(0, 2).toUpperCase()
}

const getMemberRole = (uid) => {
    if (!props.trip.permissions) return 'owner'
    return props.trip.permissions[uid] || 'viewer'
}

const handleRoleChange = async (uid, newRole) => {
    isUpdating.value = true
    try {
        await updateMemberRole(props.trip.id, uid, newRole)
    } catch (err) {
        console.error('Failed to update member role:', err)
    } finally {
        isUpdating.value = false
    }
}

const handleRemoveMember = async (uid) => {
    if (!confirm(t('members.confirm_remove'))) return
    isUpdating.value = true
    try {
        await removeMember(props.trip.id, uid)
    } catch (err) {
        console.error('Failed to remove member:', err)
    } finally {
        isUpdating.value = false
    }
}
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
