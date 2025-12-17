<script setup lang="ts">
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar'
import TallyLogo from '@/components/TallyLogo.vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

<template>
    <SidebarMenu>
        <SidebarMenuItem>
            <SidebarMenuButton size="lg"
                class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">

                <TallyLogo />

                <!-- <div class="grid flex-1 text-left text-sm leading-tight">
                    <span class="truncate font-semibold">Tally</span>
                    <span class="truncate text-xs">{{ t('sidebar.premium') }}</span>
                </div> -->
            </SidebarMenuButton>
        </SidebarMenuItem>
    </SidebarMenu>
</template>
