import '@/clauses/plugins'
import { CanvasArea } from '@/components/layout/CanvasArea'
import { AppShell } from '@/components/layout/AppShell'
import { Sidebar } from '@/components/layout/Sidebar'
import { Toolbar } from '@/components/layout/Toolbar'
import { QueryStoreProvider } from '@/store/useQueryStore'

function App() {
  return (
    <QueryStoreProvider>
      <AppShell toolbar={<Toolbar />} sidebar={<Sidebar />} canvas={<CanvasArea />} />
    </QueryStoreProvider>
  )
}

export default App
