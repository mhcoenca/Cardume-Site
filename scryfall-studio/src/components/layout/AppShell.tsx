import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface AppShellProps {
  toolbar: ReactNode
  sidebar: ReactNode
  canvas: ReactNode
  sidebarOpen: boolean
  onCloseSidebar: () => void
}

export function AppShell({ toolbar, sidebar, canvas, sidebarOpen, onCloseSidebar }: AppShellProps) {
  return (
    <div className="grid h-screen grid-rows-[auto_1fr] bg-background text-foreground">
      <header className="border-b border-border">{toolbar}</header>
      <div className="relative grid overflow-hidden lg:grid-cols-[340px_1fr]">
        {sidebarOpen && (
          <div
            className="absolute inset-0 z-40 bg-black/50 lg:hidden"
            onClick={onCloseSidebar}
            aria-hidden="true"
          />
        )}
        <aside
          className={cn(
            'absolute inset-y-0 left-0 z-50 flex w-[85vw] max-w-[340px] -translate-x-full flex-col overflow-hidden border-r border-border bg-background transition-transform duration-200',
            'lg:static lg:z-auto lg:w-auto lg:max-w-none lg:translate-x-0',
            sidebarOpen && 'translate-x-0',
          )}
        >
          {sidebar}
        </aside>
        <main className="overflow-y-auto">{canvas}</main>
      </div>
    </div>
  )
}
