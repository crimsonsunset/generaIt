import { ThreadSidebar } from './ThreadSidebar.component'
import { ThreadDrawer } from './ThreadDrawer.component'
import { ChatWorkspace } from './ChatWorkspace.component'

/**
 * ChatPanel component - Main container for chat interface
 * Provides sidebar (thread list) and main chat area layout
 *
 * Phase 2.2: Basic structure with sidebar and main area
 * Phase 5.3: Enhanced with ThreadSidebar component
 * Phase 5.4: Integrated ChatWorkspace component
 */
export function ChatPanel() {
  return (
    <div className="flex flex-1 w-full -m-6 min-h-0 relative">
      {/* Left Sidebar - Thread List (desktop only) */}
      <ThreadSidebar />

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col min-w-0 min-h-0 bg-background">
        <ChatWorkspace />
      </main>

      {/* Mobile Thread Drawer */}
      <ThreadDrawer />
    </div>
  )
}

