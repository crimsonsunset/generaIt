import { Card, CardBody } from '@heroui/card'

interface StatCardProps {
  label: string
  value: string | number
  icon?: React.ReactNode
  emptyMessage?: string
  isEmpty?: boolean
  bgColor?: string
  onPress?: () => void
  clickable?: boolean
}

/**
 * StatCard component - displays a statistic with label and value
 * Shows empty state when isEmpty is true or value is 0/null
 * Supports clickable behavior when onPress is provided
 */
export function StatCard({ label, value, icon, emptyMessage, isEmpty, bgColor = 'bg-secondary-100', onPress, clickable }: StatCardProps) {
  const isActuallyEmpty = isEmpty || value === 0 || value === null || value === undefined || value === ''
  const isClickable = clickable && onPress && !isActuallyEmpty

  return (
    <Card 
      className={`w-full ${bgColor}`} 
      shadow="sm" 
      radius="lg"
      isPressable={isClickable}
      onPress={isClickable ? onPress : undefined}
    >
      <CardBody className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm text-foreground-500 mb-1">{label}</p>
            {isActuallyEmpty ? (
              <p className="text-2xl font-bold text-foreground-400">
                {emptyMessage || 'No data'}
              </p>
            ) : (
              <p className="text-2xl font-bold text-foreground">
                {value}
              </p>
            )}
          </div>
          {icon && <div className="text-foreground-400">{icon}</div>}
        </div>
      </CardBody>
    </Card>
  )
}

