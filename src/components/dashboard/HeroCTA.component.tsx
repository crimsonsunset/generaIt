import { useNavigate } from '@tanstack/react-router'
import { Card, CardBody } from '@heroui/card'
import { Button } from '@heroui/button'
import { ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline'

/**
 * HeroCTA component - large prominent "Go to Chat" button
 * Empty state: Generic welcome message (always shown)
 */
export function HeroCTA() {
  const navigate = useNavigate()

  const handleGoToChat = () => {
    navigate({ to: '/chat' })
  }

  return (
    <Card className="w-full bg-warning-100" shadow="sm" radius="lg">
      <CardBody className="p-8 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-2">
            <ChatBubbleLeftRightIcon className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Ready to Chat?</h2>
            <p className="text-foreground-600 mb-6">
              Start a conversation with the AI assistant
            </p>
          </div>
          <Button
            color="primary"
            size="lg"
            radius="lg"
            className="px-8 font-semibold"
            onPress={handleGoToChat}
            startContent={<ChatBubbleLeftRightIcon className="w-5 h-5" />}
          >
            Go to Chat
          </Button>
        </div>
      </CardBody>
    </Card>
  )
}

