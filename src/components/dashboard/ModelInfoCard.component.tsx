import { Card, CardBody, CardHeader } from '@heroui/card'
import { StatusIndicator } from '@/components/dashboard/StatusIndicator.component'
import { API_ENDPOINT_DISPLAY } from '@/config/axios.config'

/**
 * ModelInfoCard component - displays model and API information
 */
export function ModelInfoCard() {
  return (
    <Card className="w-full bg-success-100" shadow="sm" radius="lg">
      <CardHeader className="pb-2">
        <h3 className="text-lg font-semibold">Model Info</h3>
      </CardHeader>
      <CardBody className="pt-0 space-y-2">
        <div>
          <p className="text-sm text-foreground-500">Model</p>
          <p className="text-base font-medium text-foreground">qwen2.5:0.5b</p>
        </div>
        <div>
          <p className="text-sm text-foreground-500">API Endpoint</p>
          <p className="text-sm text-foreground-600">{API_ENDPOINT_DISPLAY}</p>
        </div>
        <div className="pt-2">
          <p className="text-sm text-foreground-500 mb-1">Status</p>
          <StatusIndicator />
        </div>
      </CardBody>
    </Card>
  )
}

