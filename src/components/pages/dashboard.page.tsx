import { ChatBubbleLeftRightIcon, ChatBubbleBottomCenterTextIcon, ClockIcon } from '@heroicons/react/24/outline'
import { StatCard } from '@/components/dashboard/StatCard.component'
import { WelcomeSection } from '@/components/dashboard/WelcomeSection.component'
import { ModelInfoCard } from '@/components/dashboard/ModelInfoCard.component'
import { UsageChart } from '@/components/dashboard/UsageChart.component'
import { HeroCTA } from '@/components/dashboard/HeroCTA.component'
import {
  useDashboardThreads,
  useDashboardStats,
  useDashboardChart,
  useDashboardNavigation,
} from '@/hooks/dashboard.hooks'

/**
 * Dashboard page - main dashboard container
 * Layout: Info section (Welcome + Model) on top, Hero CTA, Stats grid, Usage Chart at bottom
 */
export function DashboardPage() {
  useDashboardThreads()
  const stats = useDashboardStats()
  const chartData = useDashboardChart()
  const { handleGoToChat } = useDashboardNavigation()

  return (
    <div className="space-y-6 w-full max-w-7xl mx-auto h-full overflow-y-auto scrollbar-hide">
      {/* Info Section - Welcome + Model */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <WelcomeSection />
        <ModelInfoCard />
      </div>

      {/* Hero CTA Section */}
      <HeroCTA />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          label="Total Messages"
          value={stats.totalMessages}
          icon={<ChatBubbleLeftRightIcon className="w-6 h-6" />}
          emptyMessage="No messages yet"
          isEmpty={stats.totalMessages === 0}
          bgColor="bg-warning-100"
          onPress={handleGoToChat}
          clickable={true}
        />
        <StatCard
          label="Active Conversations"
          value={stats.activeConversations}
          icon={<ChatBubbleBottomCenterTextIcon className="w-6 h-6" />}
          emptyMessage="No active chats"
          isEmpty={stats.activeConversations === 0}
          bgColor="bg-secondary-100"
          onPress={handleGoToChat}
          clickable={true}
        />
        <StatCard
          label="Last Chat"
          value={stats.formattedLastChat}
          icon={<ClockIcon className="w-6 h-6" />}
          emptyMessage="No chats yet"
          isEmpty={!stats.lastChatTimestamp}
          bgColor="bg-success-100"
          onPress={() => handleGoToChat(stats.lastChatThreadId)}
          clickable={!!stats.lastChatThreadId}
        />
      </div>

      {/* Visual Section - Chart */}
      <UsageChart data={chartData} />
    </div>
  )
}

