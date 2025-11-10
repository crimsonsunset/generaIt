import { useState, useEffect, useRef } from 'react'
import { Input } from '@heroui/input'
import { useThreadStore } from '@/stores/thread.store'
import { useAuthStore } from '@/stores/auth.store'

interface ThreadRenameInputProps {
  threadId: string
  currentTitle: string
  onComplete: () => void
  onCancel: () => void
}

/**
 * ThreadRenameInput component - Inline input for renaming thread
 * Appears when thread is in edit mode
 * Enter to save, Escape to cancel
 */
export function ThreadRenameInput({
  threadId,
  currentTitle,
  onComplete,
  onCancel,
}: ThreadRenameInputProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const { renameThread } = useThreadStore()
  const user = useAuthStore((state) => state.user)
  const [value, setValue] = useState(currentTitle)

  useEffect(() => {
    // Auto-focus on mount
    inputRef.current?.focus()
    inputRef.current?.select()
  }, [])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSave()
    } else if (e.key === 'Escape') {
      handleCancel()
    }
  }

  const handleSave = () => {
    if (value.trim()) {
      renameThread(threadId, value.trim())
      
      // Save threads to localStorage
      if (user?.id) {
        useThreadStore.getState().saveThreads(user.id)
      }
    }
    onComplete()
  }

  const handleCancel = () => {
    setValue(currentTitle)
    onCancel()
  }

  const handleBlur = () => {
    handleSave()
  }

  return (
    <Input
      ref={inputRef}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onKeyDown={handleKeyDown}
      onBlur={handleBlur}
      size="sm"
      className="w-full"
      classNames={{
        input: 'text-sm',
      }}
    />
  )
}

