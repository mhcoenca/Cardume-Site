import { useState } from 'react'
import '@/clauses/plugins'
import { CanvasArea } from '@/components/layout/CanvasArea'
import { AppShell } from '@/components/layout/AppShell'
import { Sidebar } from '@/components/layout/Sidebar'
import { Toolbar } from '@/components/layout/Toolbar'
import { Toaster, ToastProvider } from '@/components/ui/toast'
import { UrlLookupBootstrap } from '@/components/UrlLookupBootstrap'
import { CopyboardProvider } from '@/store/useCopyboard'
import { QueryStoreProvider } from '@/store/useQueryStore'

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <ToastProvider>
      <CopyboardProvider>
        <QueryStoreProvider>
          <UrlLookupBootstrap />
          <AppShell
            toolbar={<Toolbar onOpenSidebar={() => setSidebarOpen(true)} />}
            sidebar={<Sidebar onSelectClause={() => setSidebarOpen(false)} />}
            canvas={<CanvasArea />}
            sidebarOpen={sidebarOpen}
            onCloseSidebar={() => setSidebarOpen(false)}
          />
        </QueryStoreProvider>
      </CopyboardProvider>
      <Toaster />
    </ToastProvider>
  )
}

export default App
