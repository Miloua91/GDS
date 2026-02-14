import { Zap } from 'lucide-react'
import { Link, useMatch } from 'react-router'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { usePendingCommands } from '@/hooks/usePendingCommands'
import { Badge } from '@/components/ui/badge'

export function PendingCommandsMenuItem({ onClick }: { onClick?: () => void }) {
  const { pendingCount, isLoading } = usePendingCommands(30000)
  const match = useMatch({ path: '/commandes', end: false })

  if (!isLoading && pendingCount === 0) {
    return null
  }

  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={!!match}>
        <Link to="/commandes" state={{ _scrollToTop: true }} onClick={onClick}>
          <Zap className="!size-4" />
          <span>Commandes</span>
          {pendingCount > 0 && (
            <Badge variant="destructive" className="ml-auto h-5 min-w-5 px-1">
              {pendingCount > 99 ? '99+' : pendingCount}
            </Badge>
          )}
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}
