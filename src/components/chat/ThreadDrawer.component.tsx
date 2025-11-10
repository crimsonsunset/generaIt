import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
} from '@heroui/drawer'
import { useAppStore } from '@/stores/app.store'
import { useResponsiveSidebar } from '@/hooks/app.hooks'
import { ThreadListContent } from './ThreadListContent.component'
import { NewThreadButton } from './NewThreadButton.component'

/**
 * ThreadDrawer component - Bottom drawer for thread list on mobile screens
 * Only renders on small screens (< 820px)
 * Uses ThreadListContent for reusable thread list logic
 */
export function ThreadDrawer() {
  const { threadDrawerOpen, setThreadDrawerOpen } = useAppStore()
  const { isSmallScreen } = useResponsiveSidebar()

  // Don't render on large screens
  if (!isSmallScreen) {
    return null
  }

  return (
    <Drawer
      isOpen={threadDrawerOpen}
      onOpenChange={(open) => setThreadDrawerOpen(open)}
      placement="bottom"
      size="lg"
    >
      <DrawerContent>
        <DrawerHeader className="px-3 py-2 pb-2 flex items-center justify-between gap-2">
          <div className="flex-1">
              <div className='mt-10'></div>
            <NewThreadButton />
          </div>
        </DrawerHeader>
        <DrawerBody className="p-0 flex flex-col max-h-[80vh]">
          <ThreadListContent
            onThreadSelect={() => setThreadDrawerOpen(false)}
            hideNewThreadButton
          />
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  )
}

