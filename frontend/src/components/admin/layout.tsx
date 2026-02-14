import type { ErrorInfo } from "react";
import { Suspense, useState } from "react";
import { cn } from "@/lib/utils";
import type { CoreLayoutProps } from "ra-core";
import { ErrorBoundary } from "react-error-boundary";
import { SidebarProvider, SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { UserMenu } from "@/components/admin/user-menu";
import { ThemeModeToggle } from "@/components/admin/theme-mode-toggle";
import { Notification } from "@/components/admin/notification";
import { AppSidebar } from "@/components/admin/app-sidebar";
import { RefreshButton } from "@/components/admin/refresh-button";
import { Error } from "@/components/admin/error";
import { Loading } from "@/components/admin/loading";
import { usePendingCommands } from "@/hooks/usePendingCommands";
import { PanelLeftClose, PanelLeft } from "lucide-react";

function SidebarToggle() {
  const { state, toggleSidebar } = useSidebar();
  
  return (
    <button
      onClick={toggleSidebar}
      className="flex items-center justify-center w-8 h-8 rounded-md hover:bg-muted dark:hover:bg-white/10 transition-colors"
    >
      {state === "expanded" ? (
        <PanelLeftClose className="h-4 w-4" />
      ) : (
        <PanelLeft className="h-4 w-4" />
      )}
    </button>
  );
}

export const Layout = (props: CoreLayoutProps) => {
  const [errorInfo, setErrorInfo] = useState<ErrorInfo | undefined>(undefined);
  const handleError = (_: unknown, info: ErrorInfo) => {
    setErrorInfo(info);
  };
  const { pendingCount, isLoading: commandsLoading } = usePendingCommands();
  
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex flex-col h-screen w-screen overflow-hidden">
        <div className="flex flex-1 min-h-0">
          <AppSidebar />
          <div className="flex flex-1 flex-col min-w-0 bg-white dark:bg-gray-900 transition-all duration-200">
            <header className="h-12 shrink-0 px-3 border-b border-border flex items-center gap-2 bg-white dark:bg-gray-900">
              <SidebarToggle />
              <div className="flex-1 flex items-center" id="breadcrumb" />
              <RefreshButton />
              <ThemeModeToggle />
              <UserMenu />
            </header>
            <ErrorBoundary
              onError={handleError}
              fallbackRender={({ error, resetErrorBoundary }) => (
                <Error
                  error={error}
                  errorInfo={errorInfo}
                  resetErrorBoundary={resetErrorBoundary}
                />
              )}
            >
              <Suspense fallback={<Loading />}>
                <div className="flex-1 overflow-auto p-4">{props.children}</div>
              </Suspense>
            </ErrorBoundary>
          </div>
        </div>
        <footer className="h-7 shrink-0 px-4 border-t border-border flex items-center text-xs text-muted-foreground bg-gray-50 dark:bg-gray-950">
          <span>Prêt</span>
          {pendingCount > 0 && (
            <span className="ml-4">
              {pendingCount} commande{pendingCount > 1 ? 's' : ''} en attente{commandsLoading ? '' : ''}
            </span>
          )}
          <span className="ml-auto">
            {new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
          </span>
        </footer>
        <Notification />
      </div>
    </SidebarProvider>
  );
};
