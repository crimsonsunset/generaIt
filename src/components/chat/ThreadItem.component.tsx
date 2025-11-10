import { Button } from '@heroui/button'
import { PencilIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { formatThreadDate } from '@/utils/thread.utils'
import { ThreadRenameInput } from './ThreadRenameInput.component'
import type { ChatThread } from '@/types/chat.types'

interface ThreadItemProps {
  thread: ChatThread
  isEditing: boolean
  onEdit: () => void
  onDelete: () => void
  onRenameComplete: () => void
  onRenameCancel: () => void
}

/**
 * ThreadItem component - Helper component that provides content for ListboxItem
 * Returns the description, endContent, and children for a thread item
 */
export function ThreadItem({
  thread,
  isEditing,
  onEdit,
  onDelete,
  onRenameComplete,
  onRenameCancel,
}: ThreadItemProps) {
  const lastMessage = thread.messages[thread.messages.length - 1]
  const lastMessagePreview = lastMessage
    ? lastMessage.content.slice(0, 50) + (lastMessage.content.length > 50 ? '...' : '')
    : 'No messages yet'

  return {
    description: isEditing ? undefined : lastMessagePreview,
    endContent: isEditing ? undefined : (
      <div className="flex items-center gap-1 flex-shrink-0">
        <span className="text-xs text-default-600 group-data-[selected=true]:text-white">
          {formatThreadDate(thread.updatedAt)}
        </span>
        <Button
          isIconOnly
          size="sm"
          variant="light"
          onPress={onEdit}
          className="min-w-unit-6 w-6 h-6 group-data-[selected=true]:text-white"
          aria-label="Rename thread"
        >
          <PencilIcon className="w-4 h-4" />
        </Button>
        <Button
          isIconOnly
          size="sm"
          variant="light"
          color="danger"
          onPress={onDelete}
          className="min-w-unit-6 w-6 h-6 group-data-[selected=true]:text-white"
          aria-label="Delete thread"
        >
          <XMarkIcon className="w-4 h-4" />
        </Button>
      </div>
    ),
    className: isEditing ? 'p-0' : undefined,
    children: isEditing ? (
      <div className="w-full p-2" onClick={(e) => e.stopPropagation()}>
        <ThreadRenameInput
          threadId={thread.id}
          currentTitle={thread.title}
          onComplete={onRenameComplete}
          onCancel={onRenameCancel}
        />
      </div>
    ) : (
      thread.title
    ),
  }
}

