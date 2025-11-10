import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from '@heroui/modal'
import { Button } from '@heroui/button'
import { useThreadStore } from '@/stores/thread.store'
import { useNavigate } from '@tanstack/react-router'

interface DeleteThreadModalProps {
  isOpen: boolean
  onClose: () => void
  threadId: string
  threadTitle: string
  userId?: string
}

/**
 * DeleteThreadModal component - Confirmation modal for thread deletion
 * Shows thread title in confirmation message
 * Calls thread.store.deleteThread() on confirm
 */
export function DeleteThreadModal({
  isOpen,
  onClose,
  threadId,
  threadTitle,
  userId,
}: DeleteThreadModalProps) {
  const navigate = useNavigate()
  const { deleteThread, currentThreadId } = useThreadStore()

  const handleDelete = () => {
    const wasCurrentThread = currentThreadId === threadId
    deleteThread(threadId)

    // Save threads to localStorage
    if (userId) {
      useThreadStore.getState().saveThreads(userId)
    }

    // If deleted thread was current, navigate to new current thread or chat root
    if (wasCurrentThread) {
      const newCurrentThreadId = useThreadStore.getState().currentThreadId
      if (newCurrentThreadId) {
        navigate({
          to: '/chat',
          search: { threadId: newCurrentThreadId },
          replace: true,
        })
      } else {
        navigate({
          to: '/chat',
          replace: true,
        })
      }
    }

    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">Delete Thread</ModalHeader>
            <ModalBody>
              <p className="text-sm text-foreground-600">
                Are you sure you want to delete &quot;{threadTitle}&quot;? This action cannot be undone.
              </p>
            </ModalBody>
            <ModalFooter>
              <Button variant="light" onPress={onClose}>
                Cancel
              </Button>
              <Button color="danger" onPress={handleDelete}>
                Delete
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  )
}

