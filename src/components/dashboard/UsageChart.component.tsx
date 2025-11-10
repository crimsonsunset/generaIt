import { Card, CardBody, CardHeader } from '@heroui/card'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface UsageChartProps {
  data?: Array<{ date: string; messages: number }>
}

/**
 * UsageChart component - displays message usage trends over time
 * Empty state: Shows empty chart with message when no data
 */
export function UsageChart({ data }: UsageChartProps) {
  const chartData = data || []
  const isEmpty = chartData.length === 0

  return (
    <Card className="w-full bg-success-100" shadow="sm" radius="lg">
      <CardHeader className="pb-2">
        <h3 className="text-lg font-semibold">Usage Chart</h3>
      </CardHeader>
      <CardBody className="pt-0">
        {isEmpty ? (
          <div className="h-48 flex items-center justify-center">
            <p className="text-sm text-foreground-500">
              Start chatting to see your activity
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} />
              <XAxis
                dataKey="date"
                stroke="currentColor"
                style={{ fontSize: '12px' }}
                tick={{ fill: 'currentColor', opacity: 0.6 }}
              />
              <YAxis
                stroke="currentColor"
                style={{ fontSize: '12px' }}
                tick={{ fill: 'currentColor', opacity: 0.6 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--heroui-content1)',
                  border: '1px solid var(--heroui-divider)',
                  borderRadius: '8px',
                }}
              />
              <Line
                type="monotone"
                dataKey="messages"
                stroke="#66cc8a"
                strokeWidth={3}
                dot={{ fill: '#66cc8a', r: 5 }}
                activeDot={{ r: 6 }}
                connectNulls={false}
                isAnimationActive={true}
                animationDuration={1000}
                animationEasing="ease-out"
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardBody>
    </Card>
  )
}

