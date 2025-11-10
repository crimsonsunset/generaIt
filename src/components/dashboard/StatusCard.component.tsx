import { Card, CardBody, CardHeader } from '@heroui/card'
import { StatusIndicator } from '@/components/dashboard/StatusIndicator.component'

/**
 * StatusCard component - displays API status in a card format
 * For use in the visual section of the dashboard
 */
export function StatusCard() {
  return (
    <Card className="w-full bg-secondary-100" shadow="sm" radius="lg">
      <CardHeader className="pb-2">
        <h3 className="text-lg font-semibold">API Status</h3>
      </CardHeader>
      <CardBody className="pt-0">
        <div className="flex flex-col gap-4">
          <StatusIndicator />
          <div className="text-sm text-foreground-600">
            <p>Monitoring connection to Ollama API</p>
          </div>
        </div>
      </CardBody>
    </Card>
  )
}

