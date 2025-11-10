import { useQuery } from '@tanstack/react-query'
import { checkChatApiStatus } from '@/services/chat.service'

type ApiStatus = 'connected' | 'checking' | 'disconnected'

/**
 * StatusIndicator component - shows API connection status
 * Uses TanStack Query for automatic polling and caching
 */
export function StatusIndicator() {
    const { data: isConnected, isLoading, isError } = useQuery({
        queryKey: ['api', 'status'],
        queryFn: checkChatApiStatus,
        refetchInterval: 30000, // Check every 30 seconds
        refetchIntervalInBackground: true, // Keep checking when tab is inactive
    })

    // Map query state to component status
    const status: ApiStatus = isLoading ? 'checking' : isError || !isConnected ? 'disconnected' : 'connected'

    const getStatusConfig = () => {
        switch (status) {
            case 'connected':
                return {
                    label: 'Connected',
                    color: 'text-success',
                    bgColor: 'bg-success/10',
                    dotColor: 'bg-success',
                }
            case 'checking':
                return {
                    label: 'Checking...',
                    color: 'text-warning',
                    bgColor: 'bg-warning/10',
                    dotColor: 'bg-warning',
                }
            case 'disconnected':
                return {
                    label: 'Disconnected',
                    color: 'text-danger',
                    bgColor: 'bg-danger/10',
                    dotColor: 'bg-danger',
                }
        }
    }

    const config = getStatusConfig()

    return (
        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg ${config.bgColor}`}>
            <span className={`w-2 h-2 rounded-full ${config.dotColor}`}/>
            <span className={`text-sm font-medium ${config.color}`}>{config.label}</span>
        </div>
    )
}

