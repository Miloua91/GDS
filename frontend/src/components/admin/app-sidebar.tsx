import { createElement } from 'react'
import {
  useCanAccess,
  useCreatePath,
  useGetResourceLabel,
  useHasDashboard,
  useResourceDefinitions,
  useTranslate,
} from 'ra-core'
import { Link, useMatch } from 'react-router'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'
import { Skeleton } from '@/components/ui/skeleton'
import {
  House,
  List,
  Shell,
  Zap,
  PackagePlus,
  LayoutDashboard,
  BookOpen,
  Warehouse,
  ShoppingCart,
} from 'lucide-react'
import { usePermissions, type Permission } from './can'
import { usePendingCommands } from '@/hooks/usePendingCommands'
import { Badge } from '@/components/ui/badge'

/**
 * Navigation sidebar displaying menu items, allowing users to navigate between different sections of the application.
 *
 * The sidebar can collapse to an icon-only view and renders as a collapsible drawer on mobile devices.
 * It automatically includes links to the dashboard (if defined) and all list views defined in Resource components.
 *
 * Included in the default Layout component
 *
 * @see {@link https://marmelab.com/shadcn-admin-kit/docs/appsidebar AppSidebar documentation}
 * @see {@link https://ui.shadcn.com/docs/components/sidebar shadcn/ui Sidebar component}
 * @see layout.tsx
 */
export function AppSidebar() {
  const hasDashboard = useHasDashboard()
  const resources = useResourceDefinitions()
  const { openMobile, setOpenMobile } = useSidebar()
  const permissions = usePermissions()
  const { pendingCount } = usePendingCommands(30000)

  const handleClick = () => {
    if (openMobile) {
      setOpenMobile(false)
    }
  }
  return (
    <Sidebar
      variant="sidebar"
      collapsible="icon"
      className="border-r border-border bg-white dark:bg-gray-900 h-full"
    >
      <SidebarHeader className="border-b border-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Link to="/">
                <Shell className="!size-5" />
                <span className="text-base font-semibold">Pharma</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {permissions.can_view_dashboard && (
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={false}>
                    <Link to="/dashboard" onClick={handleClick}>
                      <LayoutDashboard className="!size-4" />
                      Dashboard
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
              {hasDashboard ? (
                <DashboardMenuItem onClick={handleClick} />
              ) : null}
              {permissions.can_add_commandes && (
                <FastOrderMenuItem onClick={handleClick} />
              )}

              {permissions.can_add_lots && (
                <StockReceptionMenuItem onClick={handleClick} />
              )}
              {(permissions.can_view_lots || permissions.can_view_produits) && (
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link
                      to="/stock"
                      state={{ _scrollToTop: true }}
                      onClick={handleClick}
                    >
                      <Warehouse className="!size-4" />
                      <span>Stock</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
              {permissions.can_view_journals && (
                <JournalsMenuItem onClick={handleClick} />
              )}
              {Object.keys(resources)
                .filter((name) => resources[name].hasList)
                .filter((name) => {
                  const viewPermission = `can_view_${name}` as Permission
                  return permissions[viewPermission] === true
                })
                .map((name) => (
                  <ResourceMenuItem
                    key={name}
                    name={name}
                    onClick={handleClick}
                  />
                ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter />
    </Sidebar>
  )
}

/**
 * Menu item for the dashboard link in the sidebar.
 *
 * This component renders a sidebar menu item that links to the dashboard page.
 * It displays as active when the user is on the dashboard route.
 *
 * @example
 * <DashboardMenuItem onClick={handleClick} />
 */
export const DashboardMenuItem = ({ onClick }: { onClick?: () => void }) => {
  const translate = useTranslate()
  const label = translate('ra.page.dashboard', {
    _: 'Dashboard',
  })
  const match = useMatch({ path: '/', end: true })
  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={!!match}>
        <Link to="/" onClick={onClick}>
          <House />
          {label}
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}

/**
 * Menu item for the fast order page in the sidebar.
 *
 * This component renders a sidebar menu item that links to the fast order page.
 * It displays as active when the user is on the /commandes-rapides route.
 *
 * @example
 * <FastOrderMenuItem onClick={handleClick} />
 */
export const FastOrderMenuItem = ({ onClick }: { onClick?: () => void }) => {
  const match = useMatch({ path: '/commandes-rapides', end: true })
  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={!!match}>
        <Link
          to="/commandes-rapides"
          state={{ _scrollToTop: true }}
          onClick={onClick}
        >
          <Zap />
          Nouvelle Commande
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}

/**
 * Menu item for the stock reception page in the sidebar.
 *
 * This component renders a sidebar menu item that links to the stock reception page.
 * It displays as active when the user is on the /stock-reception route.
 *
 * @example
 * <StockReceptionMenuItem onClick={handleClick} />
 */
export const StockReceptionMenuItem = ({
  onClick,
}: {
  onClick?: () => void
}) => {
  const match = useMatch({ path: '/stock-reception', end: true })
  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={!!match}>
        <Link
          to="/stock-reception"
          state={{ _scrollToTop: true }}
          onClick={onClick}
        >
          <PackagePlus />
          Réception Stock
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}

/**
 * Menu item for the journals page in the sidebar.
 *
 * @example
 * <JournalsMenuItem onClick={handleClick} />
 */
export const JournalsMenuItem = ({ onClick }: { onClick?: () => void }) => {
  const match = useMatch({ path: '/journals', end: true })
  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={!!match}>
        <Link to="/journals" state={{ _scrollToTop: true }} onClick={onClick}>
          <BookOpen />
          Journaux
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}

/**
 * Menu item for a resource link in the sidebar.
 *
 * This component renders a sidebar menu item that links to a resource's list view.
 * It checks permissions using canAccess and displays as active when the user is viewing that resource.
 * The component icon and label are derived from the resource definition.
 *
 * @example
 * <ResourceMenuItem key={name} name="posts" onClick={handleClick} />
 */
export const ResourceMenuItem = ({
  name,
  onClick,
}: {
  name: string
  onClick?: () => void
}) => {
  const { canAccess, isPending } = useCanAccess({
    resource: name,
    action: 'list',
  })
  const resources = useResourceDefinitions()
  const getResourceLabel = useGetResourceLabel()
  const createPath = useCreatePath()
  const to = createPath({
    resource: name,
    type: 'list',
  })
  const match = useMatch({ path: to, end: false })

  if (isPending) {
    return <Skeleton className="h-8 w-full" />
  }

  if (!resources || !resources[name] || !canAccess) return null

  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={!!match}>
        <Link to={to} state={{ _scrollToTop: true }} onClick={onClick}>
          {resources[name].icon ? (
            createElement(resources[name].icon)
          ) : (
            <List />
          )}
          {getResourceLabel(name, 2)}
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}
