import type { ReactNode } from 'react'

interface AppShellProps {
  toolbar: ReactNode
  sidebar: ReactNode
  canvas: ReactNode
  workspace: ReactNode
}

export function AppShell({ toolbar, sidebar, canvas, workspace }: AppShellProps) {
  return (
    <div className="grid h-screen grid-rows-[auto_1fr] bg-background text-foreground">
      <header className="border-b border-border">{toolbar}</header>
      <div className="grid grid-cols-[280px_1fr_360px] overflow-hidden">
        <aside className="overflow-y-auto border-r border-border">{sidebar}</aside>
        <main className="overflow-y-auto">{canvas}</main>
        <aside className="overflow-y-auto border-l border-border">{workspace}</aside>
      </div>
    </div>
  )
}
