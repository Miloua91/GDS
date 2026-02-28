import { X, Minus, Square } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getCurrentWindow } from '@tauri-apps/api/window'
import { useAuthProvider } from 'ra-core'
import { UserMenu } from '@/components/admin/user-menu'

export function Titlebar() {
  const authProvider = useAuthProvider()

  const isAuthenticated = !!authProvider

  const isTauri = typeof window !== 'undefined' && !!window.__TAURI_INTERNALS__

  const handleMinimize = async () => {
    if (!isTauri) return
    const window = getCurrentWindow()
    await window.minimize()
  }

  const handleMaximize = async () => {
    if (!isTauri) return
    const window = getCurrentWindow()
    await window.toggleMaximize()
  }

  const handleClose = async () => {
    if (!isTauri) return
    const window = getCurrentWindow()
    await window.close()
  }

  return (
    <div
      data-tauri-drag-region
      className="h-10 bg-stone-800 text-white border-b flex items-center justify-between select-none"
    >
      {/* Left: Navigation */}
      <div className="flex items-center h-full m-2 gap-2"></div>

      {/* Center: App Name */}
      <div
        className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2"
        data-tauri-drag-region
      >
        <span className="text-sm font-semibold text-muted-foreground">KMS</span>
      </div>

      {/* Right: User Menu + Window Controls */}
      <div className="flex items-center h-full">
        {isAuthenticated && <UserMenu />}

        {/* Window Controls */}
        <div className="flex items-center border-l h-full">
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-12 rounded-none hover:bg-accent"
            onClick={handleMinimize}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-12 rounded-none hover:bg-accent"
            onClick={handleMaximize}
          >
            <Square className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-12 rounded-none hover:bg-destructive hover:text-destructive-foreground"
            onClick={handleClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
