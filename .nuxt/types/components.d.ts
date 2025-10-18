
import type { DefineComponent, SlotsType } from 'vue'
type IslandComponent<T> = DefineComponent<{}, {refresh: () => Promise<void>}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, SlotsType<{ fallback: { error: unknown } }>> & T

type HydrationStrategies = {
  hydrateOnVisible?: IntersectionObserverInit | true
  hydrateOnIdle?: number | true
  hydrateOnInteraction?: keyof HTMLElementEventMap | Array<keyof HTMLElementEventMap> | true
  hydrateOnMediaQuery?: string
  hydrateAfter?: number
  hydrateWhen?: boolean
  hydrateNever?: true
}
type LazyComponent<T> = DefineComponent<HydrationStrategies, {}, {}, {}, {}, {}, {}, { hydrated: () => void }> & T

interface _GlobalComponents {
  'DashboardMiniAreaChart': typeof import("../../src/components/dashboard/MiniAreaChart.vue")['default']
  'DashboardStatusDistribution': typeof import("../../src/components/dashboard/StatusDistribution.vue")['default']
  'PermissionsPermissionRolesModal': typeof import("../../src/components/permissions/PermissionRolesModal.vue")['default']
  'RolesRolePermissionsModal': typeof import("../../src/components/roles/RolePermissionsModal.vue")['default']
  'SharedSidebarNav': typeof import("../../src/components/shared/SidebarNav.vue")['default']
  'UiBlockingLoader': typeof import("../../src/components/ui/BlockingLoader.vue")['default']
  'UiButton': typeof import("../../src/components/ui/Button.vue")['default']
  'UiCard': typeof import("../../src/components/ui/Card.vue")['default']
  'UiDialogModal': typeof import("../../src/components/ui/DialogModal.vue")['default']
  'UiInput': typeof import("../../src/components/ui/Input.vue")['default']
  'UiLabel': typeof import("../../src/components/ui/Label.vue")['default']
  'UsersInviteUserModal': typeof import("../../src/components/users/InviteUserModal.vue")['default']
  'UsersUpdatePasswordModal': typeof import("../../src/components/users/UpdatePasswordModal.vue")['default']
  'UsersUpdateRolesModal': typeof import("../../src/components/users/UpdateRolesModal.vue")['default']
  'UsersUpdateStatusModal': typeof import("../../src/components/users/UpdateStatusModal.vue")['default']
  'UsersUpdateUserModal': typeof import("../../src/components/users/UpdateUserModal.vue")['default']
  'UsersUserActionsMenu': typeof import("../../src/components/users/UserActionsMenu.vue")['default']
  'NuxtWelcome': typeof import("../../node_modules/.pnpm/nuxt@3.19.3_@parcel+watcher@2.5.1_@types+node@22.18.11_@vue+compiler-sfc@3.5.22_db0@0.3_f47428926494e4791e7e46858a78e443/node_modules/nuxt/dist/app/components/welcome.vue")['default']
  'NuxtLayout': typeof import("../../node_modules/.pnpm/nuxt@3.19.3_@parcel+watcher@2.5.1_@types+node@22.18.11_@vue+compiler-sfc@3.5.22_db0@0.3_f47428926494e4791e7e46858a78e443/node_modules/nuxt/dist/app/components/nuxt-layout")['default']
  'NuxtErrorBoundary': typeof import("../../node_modules/.pnpm/nuxt@3.19.3_@parcel+watcher@2.5.1_@types+node@22.18.11_@vue+compiler-sfc@3.5.22_db0@0.3_f47428926494e4791e7e46858a78e443/node_modules/nuxt/dist/app/components/nuxt-error-boundary.vue")['default']
  'ClientOnly': typeof import("../../node_modules/.pnpm/nuxt@3.19.3_@parcel+watcher@2.5.1_@types+node@22.18.11_@vue+compiler-sfc@3.5.22_db0@0.3_f47428926494e4791e7e46858a78e443/node_modules/nuxt/dist/app/components/client-only")['default']
  'DevOnly': typeof import("../../node_modules/.pnpm/nuxt@3.19.3_@parcel+watcher@2.5.1_@types+node@22.18.11_@vue+compiler-sfc@3.5.22_db0@0.3_f47428926494e4791e7e46858a78e443/node_modules/nuxt/dist/app/components/dev-only")['default']
  'ServerPlaceholder': typeof import("../../node_modules/.pnpm/nuxt@3.19.3_@parcel+watcher@2.5.1_@types+node@22.18.11_@vue+compiler-sfc@3.5.22_db0@0.3_f47428926494e4791e7e46858a78e443/node_modules/nuxt/dist/app/components/server-placeholder")['default']
  'NuxtLink': typeof import("../../node_modules/.pnpm/nuxt@3.19.3_@parcel+watcher@2.5.1_@types+node@22.18.11_@vue+compiler-sfc@3.5.22_db0@0.3_f47428926494e4791e7e46858a78e443/node_modules/nuxt/dist/app/components/nuxt-link")['default']
  'NuxtLoadingIndicator': typeof import("../../node_modules/.pnpm/nuxt@3.19.3_@parcel+watcher@2.5.1_@types+node@22.18.11_@vue+compiler-sfc@3.5.22_db0@0.3_f47428926494e4791e7e46858a78e443/node_modules/nuxt/dist/app/components/nuxt-loading-indicator")['default']
  'NuxtTime': typeof import("../../node_modules/.pnpm/nuxt@3.19.3_@parcel+watcher@2.5.1_@types+node@22.18.11_@vue+compiler-sfc@3.5.22_db0@0.3_f47428926494e4791e7e46858a78e443/node_modules/nuxt/dist/app/components/nuxt-time.vue")['default']
  'NuxtRouteAnnouncer': typeof import("../../node_modules/.pnpm/nuxt@3.19.3_@parcel+watcher@2.5.1_@types+node@22.18.11_@vue+compiler-sfc@3.5.22_db0@0.3_f47428926494e4791e7e46858a78e443/node_modules/nuxt/dist/app/components/nuxt-route-announcer")['default']
  'NuxtImg': typeof import("../../node_modules/.pnpm/nuxt@3.19.3_@parcel+watcher@2.5.1_@types+node@22.18.11_@vue+compiler-sfc@3.5.22_db0@0.3_f47428926494e4791e7e46858a78e443/node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtImg']
  'NuxtPicture': typeof import("../../node_modules/.pnpm/nuxt@3.19.3_@parcel+watcher@2.5.1_@types+node@22.18.11_@vue+compiler-sfc@3.5.22_db0@0.3_f47428926494e4791e7e46858a78e443/node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtPicture']
  'NuxtPage': typeof import("../../node_modules/.pnpm/nuxt@3.19.3_@parcel+watcher@2.5.1_@types+node@22.18.11_@vue+compiler-sfc@3.5.22_db0@0.3_f47428926494e4791e7e46858a78e443/node_modules/nuxt/dist/pages/runtime/page")['default']
  'NoScript': typeof import("../../node_modules/.pnpm/nuxt@3.19.3_@parcel+watcher@2.5.1_@types+node@22.18.11_@vue+compiler-sfc@3.5.22_db0@0.3_f47428926494e4791e7e46858a78e443/node_modules/nuxt/dist/head/runtime/components")['NoScript']
  'Link': typeof import("../../node_modules/.pnpm/nuxt@3.19.3_@parcel+watcher@2.5.1_@types+node@22.18.11_@vue+compiler-sfc@3.5.22_db0@0.3_f47428926494e4791e7e46858a78e443/node_modules/nuxt/dist/head/runtime/components")['Link']
  'Base': typeof import("../../node_modules/.pnpm/nuxt@3.19.3_@parcel+watcher@2.5.1_@types+node@22.18.11_@vue+compiler-sfc@3.5.22_db0@0.3_f47428926494e4791e7e46858a78e443/node_modules/nuxt/dist/head/runtime/components")['Base']
  'Title': typeof import("../../node_modules/.pnpm/nuxt@3.19.3_@parcel+watcher@2.5.1_@types+node@22.18.11_@vue+compiler-sfc@3.5.22_db0@0.3_f47428926494e4791e7e46858a78e443/node_modules/nuxt/dist/head/runtime/components")['Title']
  'Meta': typeof import("../../node_modules/.pnpm/nuxt@3.19.3_@parcel+watcher@2.5.1_@types+node@22.18.11_@vue+compiler-sfc@3.5.22_db0@0.3_f47428926494e4791e7e46858a78e443/node_modules/nuxt/dist/head/runtime/components")['Meta']
  'Style': typeof import("../../node_modules/.pnpm/nuxt@3.19.3_@parcel+watcher@2.5.1_@types+node@22.18.11_@vue+compiler-sfc@3.5.22_db0@0.3_f47428926494e4791e7e46858a78e443/node_modules/nuxt/dist/head/runtime/components")['Style']
  'Head': typeof import("../../node_modules/.pnpm/nuxt@3.19.3_@parcel+watcher@2.5.1_@types+node@22.18.11_@vue+compiler-sfc@3.5.22_db0@0.3_f47428926494e4791e7e46858a78e443/node_modules/nuxt/dist/head/runtime/components")['Head']
  'Html': typeof import("../../node_modules/.pnpm/nuxt@3.19.3_@parcel+watcher@2.5.1_@types+node@22.18.11_@vue+compiler-sfc@3.5.22_db0@0.3_f47428926494e4791e7e46858a78e443/node_modules/nuxt/dist/head/runtime/components")['Html']
  'Body': typeof import("../../node_modules/.pnpm/nuxt@3.19.3_@parcel+watcher@2.5.1_@types+node@22.18.11_@vue+compiler-sfc@3.5.22_db0@0.3_f47428926494e4791e7e46858a78e443/node_modules/nuxt/dist/head/runtime/components")['Body']
  'NuxtIsland': typeof import("../../node_modules/.pnpm/nuxt@3.19.3_@parcel+watcher@2.5.1_@types+node@22.18.11_@vue+compiler-sfc@3.5.22_db0@0.3_f47428926494e4791e7e46858a78e443/node_modules/nuxt/dist/app/components/nuxt-island")['default']
  'LazyDashboardMiniAreaChart': LazyComponent<typeof import("../../src/components/dashboard/MiniAreaChart.vue")['default']>
  'LazyDashboardStatusDistribution': LazyComponent<typeof import("../../src/components/dashboard/StatusDistribution.vue")['default']>
  'LazyPermissionsPermissionRolesModal': LazyComponent<typeof import("../../src/components/permissions/PermissionRolesModal.vue")['default']>
  'LazyRolesRolePermissionsModal': LazyComponent<typeof import("../../src/components/roles/RolePermissionsModal.vue")['default']>
  'LazySharedSidebarNav': LazyComponent<typeof import("../../src/components/shared/SidebarNav.vue")['default']>
  'LazyUiBlockingLoader': LazyComponent<typeof import("../../src/components/ui/BlockingLoader.vue")['default']>
  'LazyUiButton': LazyComponent<typeof import("../../src/components/ui/Button.vue")['default']>
  'LazyUiCard': LazyComponent<typeof import("../../src/components/ui/Card.vue")['default']>
  'LazyUiDialogModal': LazyComponent<typeof import("../../src/components/ui/DialogModal.vue")['default']>
  'LazyUiInput': LazyComponent<typeof import("../../src/components/ui/Input.vue")['default']>
  'LazyUiLabel': LazyComponent<typeof import("../../src/components/ui/Label.vue")['default']>
  'LazyUsersInviteUserModal': LazyComponent<typeof import("../../src/components/users/InviteUserModal.vue")['default']>
  'LazyUsersUpdatePasswordModal': LazyComponent<typeof import("../../src/components/users/UpdatePasswordModal.vue")['default']>
  'LazyUsersUpdateRolesModal': LazyComponent<typeof import("../../src/components/users/UpdateRolesModal.vue")['default']>
  'LazyUsersUpdateStatusModal': LazyComponent<typeof import("../../src/components/users/UpdateStatusModal.vue")['default']>
  'LazyUsersUpdateUserModal': LazyComponent<typeof import("../../src/components/users/UpdateUserModal.vue")['default']>
  'LazyUsersUserActionsMenu': LazyComponent<typeof import("../../src/components/users/UserActionsMenu.vue")['default']>
  'LazyNuxtWelcome': LazyComponent<typeof import("../../node_modules/.pnpm/nuxt@3.19.3_@parcel+watcher@2.5.1_@types+node@22.18.11_@vue+compiler-sfc@3.5.22_db0@0.3_f47428926494e4791e7e46858a78e443/node_modules/nuxt/dist/app/components/welcome.vue")['default']>
  'LazyNuxtLayout': LazyComponent<typeof import("../../node_modules/.pnpm/nuxt@3.19.3_@parcel+watcher@2.5.1_@types+node@22.18.11_@vue+compiler-sfc@3.5.22_db0@0.3_f47428926494e4791e7e46858a78e443/node_modules/nuxt/dist/app/components/nuxt-layout")['default']>
  'LazyNuxtErrorBoundary': LazyComponent<typeof import("../../node_modules/.pnpm/nuxt@3.19.3_@parcel+watcher@2.5.1_@types+node@22.18.11_@vue+compiler-sfc@3.5.22_db0@0.3_f47428926494e4791e7e46858a78e443/node_modules/nuxt/dist/app/components/nuxt-error-boundary.vue")['default']>
  'LazyClientOnly': LazyComponent<typeof import("../../node_modules/.pnpm/nuxt@3.19.3_@parcel+watcher@2.5.1_@types+node@22.18.11_@vue+compiler-sfc@3.5.22_db0@0.3_f47428926494e4791e7e46858a78e443/node_modules/nuxt/dist/app/components/client-only")['default']>
  'LazyDevOnly': LazyComponent<typeof import("../../node_modules/.pnpm/nuxt@3.19.3_@parcel+watcher@2.5.1_@types+node@22.18.11_@vue+compiler-sfc@3.5.22_db0@0.3_f47428926494e4791e7e46858a78e443/node_modules/nuxt/dist/app/components/dev-only")['default']>
  'LazyServerPlaceholder': LazyComponent<typeof import("../../node_modules/.pnpm/nuxt@3.19.3_@parcel+watcher@2.5.1_@types+node@22.18.11_@vue+compiler-sfc@3.5.22_db0@0.3_f47428926494e4791e7e46858a78e443/node_modules/nuxt/dist/app/components/server-placeholder")['default']>
  'LazyNuxtLink': LazyComponent<typeof import("../../node_modules/.pnpm/nuxt@3.19.3_@parcel+watcher@2.5.1_@types+node@22.18.11_@vue+compiler-sfc@3.5.22_db0@0.3_f47428926494e4791e7e46858a78e443/node_modules/nuxt/dist/app/components/nuxt-link")['default']>
  'LazyNuxtLoadingIndicator': LazyComponent<typeof import("../../node_modules/.pnpm/nuxt@3.19.3_@parcel+watcher@2.5.1_@types+node@22.18.11_@vue+compiler-sfc@3.5.22_db0@0.3_f47428926494e4791e7e46858a78e443/node_modules/nuxt/dist/app/components/nuxt-loading-indicator")['default']>
  'LazyNuxtTime': LazyComponent<typeof import("../../node_modules/.pnpm/nuxt@3.19.3_@parcel+watcher@2.5.1_@types+node@22.18.11_@vue+compiler-sfc@3.5.22_db0@0.3_f47428926494e4791e7e46858a78e443/node_modules/nuxt/dist/app/components/nuxt-time.vue")['default']>
  'LazyNuxtRouteAnnouncer': LazyComponent<typeof import("../../node_modules/.pnpm/nuxt@3.19.3_@parcel+watcher@2.5.1_@types+node@22.18.11_@vue+compiler-sfc@3.5.22_db0@0.3_f47428926494e4791e7e46858a78e443/node_modules/nuxt/dist/app/components/nuxt-route-announcer")['default']>
  'LazyNuxtImg': LazyComponent<typeof import("../../node_modules/.pnpm/nuxt@3.19.3_@parcel+watcher@2.5.1_@types+node@22.18.11_@vue+compiler-sfc@3.5.22_db0@0.3_f47428926494e4791e7e46858a78e443/node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtImg']>
  'LazyNuxtPicture': LazyComponent<typeof import("../../node_modules/.pnpm/nuxt@3.19.3_@parcel+watcher@2.5.1_@types+node@22.18.11_@vue+compiler-sfc@3.5.22_db0@0.3_f47428926494e4791e7e46858a78e443/node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtPicture']>
  'LazyNuxtPage': LazyComponent<typeof import("../../node_modules/.pnpm/nuxt@3.19.3_@parcel+watcher@2.5.1_@types+node@22.18.11_@vue+compiler-sfc@3.5.22_db0@0.3_f47428926494e4791e7e46858a78e443/node_modules/nuxt/dist/pages/runtime/page")['default']>
  'LazyNoScript': LazyComponent<typeof import("../../node_modules/.pnpm/nuxt@3.19.3_@parcel+watcher@2.5.1_@types+node@22.18.11_@vue+compiler-sfc@3.5.22_db0@0.3_f47428926494e4791e7e46858a78e443/node_modules/nuxt/dist/head/runtime/components")['NoScript']>
  'LazyLink': LazyComponent<typeof import("../../node_modules/.pnpm/nuxt@3.19.3_@parcel+watcher@2.5.1_@types+node@22.18.11_@vue+compiler-sfc@3.5.22_db0@0.3_f47428926494e4791e7e46858a78e443/node_modules/nuxt/dist/head/runtime/components")['Link']>
  'LazyBase': LazyComponent<typeof import("../../node_modules/.pnpm/nuxt@3.19.3_@parcel+watcher@2.5.1_@types+node@22.18.11_@vue+compiler-sfc@3.5.22_db0@0.3_f47428926494e4791e7e46858a78e443/node_modules/nuxt/dist/head/runtime/components")['Base']>
  'LazyTitle': LazyComponent<typeof import("../../node_modules/.pnpm/nuxt@3.19.3_@parcel+watcher@2.5.1_@types+node@22.18.11_@vue+compiler-sfc@3.5.22_db0@0.3_f47428926494e4791e7e46858a78e443/node_modules/nuxt/dist/head/runtime/components")['Title']>
  'LazyMeta': LazyComponent<typeof import("../../node_modules/.pnpm/nuxt@3.19.3_@parcel+watcher@2.5.1_@types+node@22.18.11_@vue+compiler-sfc@3.5.22_db0@0.3_f47428926494e4791e7e46858a78e443/node_modules/nuxt/dist/head/runtime/components")['Meta']>
  'LazyStyle': LazyComponent<typeof import("../../node_modules/.pnpm/nuxt@3.19.3_@parcel+watcher@2.5.1_@types+node@22.18.11_@vue+compiler-sfc@3.5.22_db0@0.3_f47428926494e4791e7e46858a78e443/node_modules/nuxt/dist/head/runtime/components")['Style']>
  'LazyHead': LazyComponent<typeof import("../../node_modules/.pnpm/nuxt@3.19.3_@parcel+watcher@2.5.1_@types+node@22.18.11_@vue+compiler-sfc@3.5.22_db0@0.3_f47428926494e4791e7e46858a78e443/node_modules/nuxt/dist/head/runtime/components")['Head']>
  'LazyHtml': LazyComponent<typeof import("../../node_modules/.pnpm/nuxt@3.19.3_@parcel+watcher@2.5.1_@types+node@22.18.11_@vue+compiler-sfc@3.5.22_db0@0.3_f47428926494e4791e7e46858a78e443/node_modules/nuxt/dist/head/runtime/components")['Html']>
  'LazyBody': LazyComponent<typeof import("../../node_modules/.pnpm/nuxt@3.19.3_@parcel+watcher@2.5.1_@types+node@22.18.11_@vue+compiler-sfc@3.5.22_db0@0.3_f47428926494e4791e7e46858a78e443/node_modules/nuxt/dist/head/runtime/components")['Body']>
  'LazyNuxtIsland': LazyComponent<typeof import("../../node_modules/.pnpm/nuxt@3.19.3_@parcel+watcher@2.5.1_@types+node@22.18.11_@vue+compiler-sfc@3.5.22_db0@0.3_f47428926494e4791e7e46858a78e443/node_modules/nuxt/dist/app/components/nuxt-island")['default']>
}

declare module 'vue' {
  export interface GlobalComponents extends _GlobalComponents { }
}

export {}
