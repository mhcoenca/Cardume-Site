import type { ReactNode } from 'react'

interface AppShellProps {
  toolbar: ReactNode
  sidebar: ReactNode
  canvas: ReactNode
}

export function AppShell({ toolbar, sidebar, canvas }: AppShellProps) {
  return (
    <div className="grid h-screen grid-rows-[auto_1fr] bg-background text-foreground">
      <header className="border-b border-border">{toolbar}</header>
      <div className="grid grid-cols-[340px_1fr] overflow-hidden">
        <aside className="overflow-y-auto border-r border-border">{sidebar}</aside>
        <main className="overflow-y-auto">{canvas}</main>
      </div>
    </div>
  )
}
