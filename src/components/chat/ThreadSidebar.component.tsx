import { ThreadListContent } from './ThreadListContent.component'

/**
 * ThreadSidebar component - Left sidebar with thread list
 * Desktop-only component (hidden on small screens)
 * Uses ThreadListContent for reusable thread list logic
 */
export function ThreadSidebar() {
  return (
    <aside className="hidden md:flex flex-[0_0_33.333%] min-w-[240px] border-r border-divider bg-background flex flex-col">
      <ThreadListContent />
    </aside>
  )
}

