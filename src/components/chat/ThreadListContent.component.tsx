import { useMemo, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import type { Selection } from '@react-types/shared'
import { Listbox, ListboxItem } from '@heroui/listbox'
import { useThreadStore } from '@/stores/thread.store'
import { useAuthStore } from '@/stores/auth.store'
import { DeleteThreadModal } from './DeleteThreadModal.component'
import { ThreadItem } from './ThreadItem.component'
import { NewThreadButton } from './NewThreadButton.component'

interface ThreadListContentProps {
  onThreadSelect?: () => void
  hideNewThreadButton?: boolean
}

/**
 * ThreadListContent component - Reusable thread list content
 * Used by both ThreadSidebar (desktop) and ThreadDrawer (mobile)
 * Handles all thread operations: selection, editing, deletion
 */
export function ThreadListContent({ onThreadSelect, hideNewThreadButton }: ThreadListContentProps) {
  const navigate = useNavigate()
  const { threads, currentThreadId, setCurrentThread } = useThreadStore()
  const user = useAuthStore((state) => state.user)
  const [editingThreadId, setEditingThreadId] = useState<string | null>(null)
  const [deleteModalState, setDeleteModalState] = useState<{
    isOpen: boolean
    threadId: string | null
    threadTitle: string
  }>({
    isOpen: false,
    threadId: null,
    threadTitle: '',
  })

  const selectedKeys = useMemo(() => {
    return currentThreadId ? new Set([currentThreadId]) : new Set<string>()
  }, [currentThreadId])

  const handleSelectionChange = (keys: Selection) => {
    if (keys === 'all') return
    const selectedId = Array.from(keys)[0] as string | undefined
    if (selectedId) {
      setCurrentThread(selectedId)
      navigate({
        to: '/chat',
        search: { threadId: selectedId },
        replace: true,
      })
      // Call callback to close drawer if provided
      onThreadSelect?.()
    }
  }

  const handleEditClick = (threadId: string) => {
    setEditingThreadId(threadId)
  }

  const handleRenameComplete = () => {
    setEditingThreadId(null)
  }

  const handleRenameCancel = () => {
    setEditingThreadId(null)
  }

  const handleDeleteClick = (threadId: string, threadTitle: string) => {
    setDeleteModalState({
      isOpen: true,
      threadId,
      threadTitle,
    })
  }

  const handleDeleteClose = () => {
    setDeleteModalState({
      isOpen: false,
      threadId: null,
      threadTitle: '',
    })
  }

  return (
    <>
      {!hideNewThreadButton && (
        <>
          <div className="px-3 py-2">
            <NewThreadButton />
          </div>

          <div className="mx-3 border-b border-divider"></div>
        </>
      )}

      <div className="flex-1 overflow-y-auto px-2 py-1 scrollbar-hide">
        {threads.length === 0 ? (
          <div className="p-2 text-center">
            <p className="text-sm text-foreground-500">No threads yet</p>
          </div>
        ) : (
          <div className="w-full px-1 py-1 rounded-small">
            <Listbox
              aria-label="Thread list"
              selectionMode="single"
              variant="flat"
              selectedKeys={selectedKeys}
              onSelectionChange={handleSelectionChange}
              hideSelectedIcon
              itemClasses={{
                base: 'data-[selected=true]:bg-secondary data-[selected=true]:text-white',
                description: 'data-[selected=true]:text-white/90',
              }}
            >
              {threads.map((thread) => {
                const itemProps = ThreadItem({
                  thread,
                  isEditing: editingThreadId === thread.id,
                  onEdit: () => handleEditClick(thread.id),
                  onDelete: () => handleDeleteClick(thread.id, thread.title),
                  onRenameComplete: handleRenameComplete,
                  onRenameCancel: handleRenameCancel,
                })

                return (
                  <ListboxItem key={thread.id} {...itemProps} />
                )
              })}
            </Listbox>
          </div>
        )}
      </div>

      {deleteModalState.threadId && (
        <DeleteThreadModal
          isOpen={deleteModalState.isOpen}
          onClose={handleDeleteClose}
          threadId={deleteModalState.threadId}
          threadTitle={deleteModalState.threadTitle}
          userId={user?.id}
        />
      )}
    </>
  )
}

