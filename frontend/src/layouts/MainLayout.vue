<script setup lang="ts">
import { ref, watch, computed, onMounted, type Component } from 'vue'
import { RouterView, useRouter, useRoute } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { useAuthStore } from '@/stores/auth'
import { useStatusBarStore } from '@/stores/statusBar'
import { useSettingsStore } from '@/stores/settings'
import { useI18n } from 'vue-i18n'
import {
    GlobalOutlined,
    BulbOutlined,
    BulbFilled,
    LogoutOutlined,
    SwapOutlined
} from '@vicons/antd'
import { allModules, isModuleEnabled, isModuleIDEnabled, normalizeModuleOverrides } from '@/modules/registry'
import type { ModuleNavItem } from '@/modules/types'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator
} from '@/components/ui/dropdown-menu'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip'
import {
    SidebarProvider,
    Sidebar,
    SidebarContent,
    SidebarHeader,
    SidebarFooter,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
    SidebarGroup,
    SidebarGroupContent,
    SidebarInset,
    SidebarTrigger,
    SidebarRail
} from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'

const router = useRouter()
const route = useRoute()
const appStore = useAppStore()
const authStore = useAuthStore()
const statusBarStore = useStatusBarStore()
const settingsStore = useSettingsStore()
const { t } = useI18n()

// Type definition for our menu items (replacing Naive UI MenuOption)
interface AppMenuItem {
    label: string
    key: string
    icon?: Component
    children?: AppMenuItem[]
}

function isNavItemEnabled(item: ModuleNavItem, overrides: Record<string, boolean> | null): boolean {
    return !item.moduleID || isModuleIDEnabled(item.moduleID, overrides)
}

function toMenuItem(item: ModuleNavItem, overrides: Record<string, boolean> | null): AppMenuItem | null {
    if (!isNavItemEnabled(item, overrides)) return null

    // Recursive mapping
    const menuItem: AppMenuItem = {
        label: t(item.labelKey),
        key: item.key,
        icon: item.icon
    }

    if (item.children && item.children.length > 0) {
        const children = item.children
            .map((c) => toMenuItem(c, overrides))
            .filter((v): v is AppMenuItem => v !== null)
        if (children.length > 0) {
            menuItem.children = children
        }
    }
    return menuItem
}

const menuItems = computed<AppMenuItem[]>(() => {
    const overrides = normalizeModuleOverrides(settingsStore.settings?.moduleOverrides)
    return allModules
        .filter((m) => m.nav)
        .filter((m) => isModuleEnabled(m, { moduleOverrides: overrides }))
        .map((m) => toMenuItem(m.nav!, overrides))
        .filter((v): v is AppMenuItem => v !== null)
})

const activeKey = ref<string>(route.path.substring(1) || 'dashboard')

// Locale Options
const localeOptions = [
    { label: '中文 (简体)', key: 'zh-CN' },
    { label: 'English', key: 'en-US' }
]

function handleLocaleSelect(key: 'zh-CN' | 'en-US') {
    appStore.setLocale(key)
}

function handleUserMenuSelect(key: string) {
    if (key === 'logout') {
        authStore.logout()
        router.push('/splash')
    } else if (key === 'switch') {
        authStore.switchUser()
        router.push('/login')
    }
}

watch(() => route.path, (newPath) => {
    // Update active menu key based on path
    activeKey.value = newPath.substring(1) || 'dashboard'
})

function handleMenuClick(key: string) {
    router.push('/' + key)
}

onMounted(() => {
    statusBarStore.refresh()
})
</script>

<template>
    <SidebarProvider>
        <!-- App Sidebar -->
        <Sidebar collapsible="icon">
            <SidebarHeader>
                <div class="flex items-center gap-2 px-2 py-2">
                    <!-- Brand Logo -->
                    <div class="font-display text-xl font-bold tracking-tight text-primary transition-all duration-300"
                        :class="{ 'scale-0 w-0 opacity-0 overflow-hidden': false /* handled by sidebar state automatically? No, sidebar hides content on collapse */ }">
                        <!-- Shadcn Sidebar automatically handles collapse, we just put content here -->
                        <span class="truncate">FreelanceFlow</span>
                    </div>
                    <!-- When collapsed, we can show a small icon or initial? Shadcn sidebar handles this with group-data-[collapsible=icon] -->
                </div>
            </SidebarHeader>

            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem v-for="item in menuItems" :key="item.key">
                                <SidebarMenuButton
                                    :isActive="activeKey === item.key || activeKey.startsWith(item.key + '/')"
                                    :tooltip="item.label" @click="handleMenuClick(item.key)">
                                    <component :is="item.icon" v-if="item.icon" class="h-4 w-4" />
                                    <span>{{ item.label }}</span>
                                </SidebarMenuButton>
                                <!-- Nested items are not fully implemented here as sidebar usually is flat or utilizes Collapsible. 
                             If deeper nesting is needed, we'd use SidebarMenuSub. 
                             Assuming flat structure or single level for now based on previous simple NMenu usage. -->
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter>
                <!-- User Menu -->
                <SidebarMenu>
                    <SidebarMenuItem>
                        <DropdownMenu>
                            <DropdownMenuTrigger as-child>
                                <SidebarMenuButton size="lg"
                                    class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
                                    <Avatar class="h-8 w-8 rounded-lg">
                                        <AvatarImage
                                            :src="authStore.avatarUrl || `https://api.dicebear.com/9.x/avataaars/svg?seed=${authStore.username}`" />
                                        <AvatarFallback class="rounded-lg">U</AvatarFallback>
                                    </Avatar>
                                    <div class="grid flex-1 text-left text-sm leading-tight">
                                        <span class="truncate font-semibold">{{ authStore.username }}</span>
                                        <span class="truncate text-xs text-muted-foreground">{{ t('common.user')
                                            }}</span>
                                    </div>
                                    <SwapOutlined class="ml-auto size-4" />
                                </SidebarMenuButton>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent class="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                                side="bottom" align="end" :side-offset="4">
                                <DropdownMenuItem @click="handleUserMenuSelect('switch')">
                                    <SwapOutlined class="mr-2 h-4 w-4" />
                                    {{ t('auth.switchUser') }}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem @click="handleUserMenuSelect('logout')">
                                    <LogoutOutlined class="mr-2 h-4 w-4" />
                                    {{ t('auth.logout') }}
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>

        <!-- Main Content Inset -->
        <SidebarInset>
            <!-- Header -->
            <header
                class="flex h-16 shrink-0 items-center gap-2 border-b px-4 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
                <div class="flex items-center gap-2 px-4">
                    <SidebarTrigger class="-ml-1" />
                    <Separator orientation="vertical" class="mr-2 h-4" />
                    <!-- Breadcrumb could go here -->
                </div>

                <div class="ml-auto flex items-center gap-4">
                    <!-- Language Switcher -->
                    <DropdownMenu>
                        <DropdownMenuTrigger as-child>
                            <Button variant="ghost" size="icon" class="rounded-full">
                                <GlobalOutlined class="h-5 w-5" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem v-for="opt in localeOptions" :key="opt.key"
                                @click="handleLocaleSelect(opt.key as 'zh-CN' | 'en-US')">
                                {{ opt.label }}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <!-- Theme Toggle -->
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger as-child>
                                <Button variant="ghost" size="icon" class="rounded-full"
                                    @click="appStore.toggleTheme()">
                                    <BulbFilled v-if="appStore.theme === 'dark'" class="h-5 w-5" />
                                    <BulbOutlined v-else class="h-5 w-5" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>{{ appStore.theme === 'dark' ? t('theme.switchToLight') : t('theme.switchToDark') }}
                                </p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
            </header>

            <!-- Main Scrollable Area -->
            <div class="flex-1 flex flex-col gap-4 p-4 pt-0 overflow-auto">
                <RouterView />
            </div>

            <!-- Footer / Status Bar -->
            <footer class="h-8 border-t flex items-center px-6 text-xs text-muted-foreground bg-muted/40">
                <div class="flex items-center gap-3">
                    <span class="font-medium">{{ t('footer.statusBar') }}</span>
                    <span>{{ t('footer.monthlyHours') }} <strong class="text-primary">{{ statusBarStore.monthHoursLabel
                            }}</strong></span>
                    <span class="text-muted-foreground/40">|</span>
                    <span>{{ t('footer.uninvoiced') }} <strong class="text-primary">{{
                        statusBarStore.uninvoicedTotalLabel }}</strong></span>
                    <span class="text-muted-foreground/40">|</span>
                    <span>{{ t('footer.pendingPayment') }} <strong class="text-primary">{{
                        statusBarStore.unpaidTotalLabel }}</strong></span>
                </div>
            </footer>
        </SidebarInset>
    </SidebarProvider>
</template>

<style scoped>
/* Scoped styles removed in favor of Tailwind classes */
</style>
