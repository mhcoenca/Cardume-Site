import '@/clauses/plugins'
import { BuilderCanvas } from '@/components/clauses/BuilderCanvas'
import { AppShell } from '@/components/layout/AppShell'
import { Sidebar } from '@/components/layout/Sidebar'
import { Toolbar } from '@/components/layout/Toolbar'
import { WorkspacePanel } from '@/components/workspace/WorkspacePanel'
import { QueryStoreProvider } from '@/store/useQueryStore'

function App() {
  return (
    <QueryStoreProvider>
      <AppShell
        toolbar={<Toolbar />}
        sidebar={<Sidebar />}
        canvas={<BuilderCanvas />}
        workspace={<WorkspacePanel />}
      />
    </QueryStoreProvider>
  )
}

export default App
