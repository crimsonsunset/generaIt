# Chatbot Interface - Project Roadmap

## 🎯 Vision
Build a modern, type-safe chatbot application with character-by-character SSE streaming that demonstrates technical excellence, production-ready patterns, and attention to detail. The application includes authentication, a dashboard hub, and a chat interface that integrates with a **real, self-hosted Ollama LLM API** to showcase production API integration and infrastructure knowledge.

## 🛠 Tech Stack

### Core Framework
- **TanStack Router** - Type-safe routing with file-based routing
- **Vite** - Build tool and dev server
- **TypeScript** - Strict type safety throughout
- **React 19** - Latest React with hooks

### UI & Styling
- **HeroUI** - Beautiful React component library (formerly NextUI)
- **Tailwind CSS** - Utility-first CSS framework
- **Heroicons** - Icon library for React
- **Framer Motion** - Animation library (required by HeroUI)
- **Recharts** - Charting library for data visualization (dashboard usage chart)

### State Management
- **Zustand** - Private global state (chat state, UI preferences)
- **React Query** - Server state (API status checks, caching)
- **Component State** - Temporary UI state (input, loading states)

### Streaming & Infrastructure
- **Real Ollama API** - Self-hosted LLM at `api.joesangiorgio.com/llm/*`
- **OpenAI-Compatible Endpoint** - `/v1/chat/completions` with SSE streaming
- **@microsoft/fetch-event-source** - SSE streaming library with POST support
- **Secure Tunnel** - External access to local server
- **Netlify Proxy** - Hides internal infrastructure behind `api.joesangiorgio.com`
- **Docker/Container Management** - Ollama container running locally
- **Model:** qwen2.5:0.5b (tiny, resource-efficient LLM)

### Type Safety
- **OpenAI Types** - TypeScript types matching OpenAI SSE format exactly
- **Custom Types** - Chat message types, streaming types

## 🏗 Architecture Overview

### Client-Server Architecture
```
React App (test-starter)
    ↓ POST to /llm/v1/chat/completions
api.joesangiorgio.com (Netlify Proxy)
    ↓ proxies to
[SECURE_TUNNEL_URL] (Secure Tunnel)
    ↓ routes to
Ollama Container (Local Docker, port 11434)
    ↓ SSE stream (OpenAI format)
Real LLM streaming response (qwen2.5:0.5b)
```

### State Management
```
┌─ Zustand Store (Chat State) ───────────┐
│ • Messages array                        │
│ • Streaming state                       │
│ • Error state                           │
└─────────────────────────────────────────┘

┌─ Component State (UI) ──────────────────┐
│ • Input value                           │
│ • Loading states                        │
│ • Scroll position                       │
└─────────────────────────────────────────┘
```

## 📊 Implementation Phases

### Phase 0: Authentication & Dashboard Foundation ✅ COMPLETE

**Status:** Completed - Authentication system and dashboard layout implemented

**What Was Built:**
- ✅ Authentication system with localStorage
- ✅ Login page with username/password (any input accepted)
- ✅ Auth store (Zustand) with login/logout/checkAuth
- ✅ Route protection using TanStack Router `beforeLoad` guards
- ✅ Dashboard layout with sidebar, header, theme toggle
- ✅ Avatar component with user initials and color generation
- ✅ User session persistence (localStorage)
- ✅ Logout functionality
- ✅ Protected routes: `/dashboard` requires auth, `/login` redirects if authenticated
- ✅ Index route redirects to appropriate page based on auth status

**Key Files:**
- `src/stores/auth.store.ts` - Auth state management
- `src/components/auth/Login.component.tsx` - Login UI
- `src/components/layout/app.layout.tsx` - App layout (used everywhere)
- `src/utils/auth-guard.utils.ts` - Route protection helpers
- `src/utils/avatar.utils.ts` - Avatar utilities
- `src/types/auth.types.ts` - Auth type definitions
- `src/routes/login.tsx` - Login route with guard
- `src/routes/dashboard.tsx` - Dashboard route with guard
- `src/routes/index.tsx` - Index redirect based on auth

### Phase 1: API Infrastructure ✅ COMPLETE

**Status:** Completed - Using real Ollama API instead of MSW mocks

**What Changed:**
- ✅ Ollama container deployed locally (port 11434)
- ✅ Model pulled: `qwen2.5:0.5b` (~400MB, resource-efficient)
- ✅ Secure tunnel configured: [SECURE_TUNNEL_URL]
- ✅ Netlify proxy configured: `api.joesangiorgio.com/llm/*`
- ✅ API tested and working with OpenAI-compatible SSE streaming

**Verification Steps (Quick Check):**
- [x] Test model endpoint: `curl https://api.joesangiorgio.com/llm/api/tags`
- [x] Test chat endpoint: `curl https://api.joesangiorgio.com/llm/v1/chat/completions`
- [x] Verify streaming works with real responses
- [x] Confirm OpenAI format compliance

### Phase 2: Chatbot Structure Setup ✅ COMPLETE

**Status:** Completed - Chat route, thread management, and dashboard all implemented

**Note:** Dashboard serves as navigation hub. Chat interface is the primary feature.

#### 2.1 Thread Management & Chat Structure Setup ✅ COMPLETE

**Status:** Completed - Thread store, utilities, and persistence fully implemented

**Overview:** Multi-thread chatbot interface with sidebar navigation, localStorage persistence, and URL deep linking. Components organized in `src/components/chat/` folder (not `chatbot/`).

**Key Features:**
- Multiple chat threads per user with sidebar navigation
- Thread management: create, rename, delete with confirmation
- Manual thread creation via "New Thread" button
- URL deep linking: `/chat?threadId=${id}`
- Thread persistence in localStorage (user-specific)
- SSE streaming with axios (no fetch API)
- Single hook file: `chat.hooks.ts`

#### 2.2 Create Chat Route ✅ COMPLETE

**Status:** Completed - Chat route created with route protection and navigation

**What Was Built:**
- ✅ Created `src/routes/chat.tsx` with route protection (requires auth)
- ✅ Placeholder chat page component with AppLayout
- ✅ Navigation from dashboard to chat (HeroCTA button + sidebar menu item)
- ✅ Chat icon added to sidebar navigation (centered when collapsed)
- ✅ Route tree automatically regenerated with `/chat` route

**Key Files:**
- `src/routes/chat.tsx` - Chat route with auth guard
- `src/components/layout/Sidebar.component.tsx` - Sidebar with chat navigation (extracted from app.layout)
- `src/components/layout/Header.component.tsx` - Header component (extracted from app.layout)
- `src/components/dashboard/HeroCTA.component.tsx` - "Go to Chat" button
- `src/services/chat.service.ts` - Chat API service with `checkChatApiStatus()` function

**Architecture Improvements:**
- ✅ Extracted Sidebar and Header into separate components (better separation of concerns)
- ✅ Created chat service layer using apiClient (follows repo patterns)
- ✅ Refactored API status check to use TanStack Query with automatic polling
- ✅ Fixed axios config: centralized API endpoint configuration
- ✅ Fixed deprecated heroicons: replaced `ArrowRightOnRectangleIcon` with `ArrowRightStartOnRectangleIcon`

**Technical Details:**
- Route uses same auth guard pattern as dashboard
- Placeholder component ready for Phase 4 chat UI components
- Sidebar icons properly centered when collapsed
- API status check uses TanStack Query with 30-second polling
- All API calls now use apiClient from axios.config.ts (no hardcoded fetch)

#### 2.3 Update Dashboard Content ✅ COMPLETE

**Status:** Completed - Full dashboard with stats, info cards, charts, and hero CTA

**What Was Built:**
- ✅ Comprehensive dashboard component with multiple sections
- ✅ Info section: Welcome card (first-time vs returning user detection) + Model info card
- ✅ Stats grid: Total Messages, Active Conversations, Last Chat (all with empty states)
- ✅ Visual section: Usage chart (recharts) + API Status card
- ✅ Hero CTA: Large "Go to Chat" button with navigation
- ✅ All components include empty states for when no data exists
- ✅ Responsive grid layout (mobile-first)
- ✅ Consistent styling with HeroUI components
- ✅ Real-time API status checking

**Components Created:**
- `src/components/pages/dashboard.page.tsx` - Main dashboard page container
- `src/components/dashboard/StatCard.component.tsx` - Reusable stat display card
- `src/components/dashboard/WelcomeSection.component.tsx` - Personalized greeting
- `src/components/dashboard/ModelInfoCard.component.tsx` - Model and API information
- `src/components/dashboard/StatusIndicator.component.tsx` - API connection status
- `src/components/dashboard/StatusCard.component.tsx` - Status card wrapper
- `src/components/dashboard/UsageChart.component.tsx` - Message usage trends chart
- `src/components/dashboard/HeroCTA.component.tsx` - Prominent "Go to Chat" button

**Layout Structure:**
```
┌─────────────────────────────────────┐
│  Info Section (2 cards side-by-side) │
│  ┌──────────┐ ┌──────────┐        │
│  │ Welcome  │ │  Model   │        │
│  └──────────┘ └──────────┘        │
├─────────────────────────────────────┤
│  Stats Grid (3 cards)               │
│  ┌─────┐ ┌─────┐ ┌─────┐          │
│  │Total│ │Active│ │Last │          │
│  └─────┘ └─────┘ └─────┘          │
├─────────────────────────────────────┤
│  Visual Section (2 cards side-by-side)│
│  ┌──────────┐ ┌──────────┐        │
│  │  Chart   │ │  Status  │        │
│  └──────────┘ └──────────┘        │
├─────────────────────────────────────┤
│  Hero CTA Section (full width)      │
│  ┌──────────────────────────────┐  │
│  │   Large "Go to Chat" Button   │  │
│  └──────────────────────────────┘  │
└─────────────────────────────────────┘
```

**Key Features:**
- **Welcome Message Logic:** Detects first-time users vs returning users by checking localStorage for chat history
- **Empty States:** All components gracefully handle empty data (shows "No messages yet", "No chats yet", etc.)
- **API Status:** Real-time checking of API connection status
- **Usage Chart:** Recharts integration with animated line chart (shows empty state when no data)
- **Consistent Shadows:** All cards use `shadow="sm"` for uniform appearance
- **Fake Data:** Currently uses placeholder data (all zeros/null) - will be replaced with real chat data when chat functionality is implemented

**Dependencies Added:**
- `recharts` - Charting library for usage visualization

**Technical Details:**
- Stats use fake data structure that will be replaced when chat store is implemented
- Welcome section checks `localStorage.getItem('chat_threads_${userId}')` to detect first-time users
- Status indicator attempts API check but defaults to "connected" if network errors occur (since API is self-hosted and working)
- Chart shows empty state message when data array is empty
- All components follow HeroUI design patterns and use Card components consistently

**Future Enhancements (Deferred):**
- Chat history preview section (will be added when chat functionality exists)
- Real data integration (currently using placeholder stats)
- Additional dashboard widgets as needed

### Phase 2.1: Thread Management Setup

#### 2.1.1 Types for Threads
**Create:** `src/types/chat.types.ts`
- `ChatThread` interface: `{ id: string, title: string, messages: ChatMessage[], createdAt: Date, updatedAt: Date }`
- `ChatMessage` interface: `{ id: string, role: 'user' | 'assistant', content: string, timestamp: Date }`
- `StreamingState` type: `{ isStreaming: boolean, currentContent: string, threadId: string | null }`

#### 2.1.2 Thread Store
**Create:** `src/stores/thread.store.ts`
- State: `threads: ChatThread[]`, `currentThreadId: string | null`
- Actions:
  - `createThread(title?)`: Creates new thread using `uniqueId('thread_')` from lodash-es, sets as current, saves to localStorage, updates URL
  - `getThread(id)`: Returns thread by ID
  - `getCurrentThread()`: Returns current active thread
  - `setCurrentThread(id)`: Switches active thread, updates URL with `?threadId=${id}` for deep linking
  - `addMessage(threadId, message)`: Adds message to thread, updates `updatedAt`
  - `updateMessage(threadId, messageId, content)`: Updates message content (for streaming)
  - `renameThread(threadId, newTitle)`: Renames thread, saves to localStorage
  - `deleteThread(threadId)`: Deletes thread, handles current thread switching
  - `loadThreads(userId)`: Loads threads from localStorage on init
  - `saveThreads(userId)`: Persists threads to localStorage after changes
- localStorage key: `'chat_threads_${userId}'` (user-specific)
- Auto-save: Save to localStorage whenever threads change
- Thread ordering: Most recently updated first (sort by `updatedAt` desc)
- URL sync: Update TanStack Router search params when thread changes

#### 2.1.3 Thread Utilities
**Create:** `src/utils/thread.utils.ts`
- `generateMessageId()`: Creates unique message ID (use `uniqueId('msg_')` from lodash-es)
- `generateThreadTitle(messages)`: Generates title from first user message (or "New Chat" if no messages)
- `formatThreadDate(date)`: Formats date for display (relative: "2m ago", "1h ago", etc.)

### Phase 2.2: Route Updates with Deep Linking

#### 2.2.1 Chat Route Update
**Modify:** `src/routes/chat.tsx`
- Add search param validation: `threadId?: string`
- Load threads on mount using `thread.store.loadThreads(userId)`
- If `threadId` in URL, set as current thread (validate it exists)
- If no `threadId` but threads exist, use most recent thread
- If no threads exist, show empty state (user can create thread manually)
- Render `ChatContainer` component (sidebar + main area)
- Sync URL when thread changes via `setCurrentThread`

### Phase 3: Store Reorganization

#### 3.1 App Store Cleanup
**Modify:** `src/stores/app.store.ts`
- Keep UI state only: `sidebarCollapsed`, `isLoading`
- Remove any chat-related state (if exists)

### Phase 4: SSE Streaming ✅ COMPLETE

**Status:** Completed - SSE streaming implemented with @microsoft/fetch-event-source and service layer architecture

**What Was Built:**
- ✅ `streamChatCompletion()` function in `src/services/chat.service.ts` - handles all API communication
- ✅ `useChatStream()` hook in `src/hooks/chat.hooks.ts` - React state management only
- ✅ SSE streaming using `@microsoft/fetch-event-source` library
- ✅ OpenAI-compatible API format (POST to `/v1/chat/completions`)
- ✅ Character-by-character content accumulation
- ✅ AbortController for stream cancellation
- ✅ Automatic message creation and updating in thread store
- ✅ localStorage persistence after streaming completes
- ✅ Error handling and streaming state management
- ✅ Cleanup on component unmount
- ✅ Config values: `CHAT_COMPLETIONS_URL`, `DEFAULT_MODEL` in `axios.config.ts`

**Key Features:**
- Service layer handles all API calls (separation of concerns)
- Hook focuses on React state management only
- Sends user message immediately to thread
- Creates assistant message placeholder
- Streams response chunks in real-time
- Updates thread store as content arrives
- Handles API errors gracefully
- Supports cancellation via `abort()`

**Hook API:**
```typescript
const { sendMessage, abort, isStreaming, error } = useChatStream()
```

**Technical Details:**
- Uses `@microsoft/fetch-event-source` for SSE streaming (POST support)
- Service layer (`chat.service.ts`) handles all API communication
- Hook (`chat.hooks.ts`) manages React state and calls service functions
- Parses SSE format: `data: {...}` lines
- Extracts content from `choices[0].delta.content`
- Accumulates content character-by-character
- Updates Zustand store in real-time
- Saves to localStorage on completion

#### 4.1 Implementation Details
**Files:**
- `src/services/chat.service.ts` - `streamChatCompletion()` function with SSE logic
- `src/hooks/chat.hooks.ts` - `useChatStream()` hook with React state management
- `src/config/axios.config.ts` - API config (`CHAT_COMPLETIONS_URL`, `DEFAULT_MODEL`)

### Phase 5: Chat UI Components ✅ COMPLETE

#### 5.1 Install Additional HeroUI Components ✅ COMPLETE
**Status:** Completed - HeroUI packages installed
- ✅ `@heroui/listbox` installed for thread list display
- ✅ `@heroui/modal` installed for delete confirmation

#### 5.2 Container Component ✅ COMPLETE
**Status:** Completed - ChatPanel component created
- ✅ `ChatPanel.component.tsx` - Main container with sidebar + chat area layout
- ✅ Responsive flex layout
- ✅ Sidebar + main area structure

#### 5.3 Sidebar Components ✅ COMPLETE
**Status:** Completed - All sidebar components implemented
- ✅ `ThreadSidebar.component.tsx` - Thread list using HeroUI Listbox
- ✅ `ThreadItem.component.tsx` - Individual thread items with rename/delete
- ✅ `NewThreadButton.component.tsx` - Create new thread button
- ✅ `ThreadRenameInput.component.tsx` - Inline rename input
- ✅ `DeleteThreadModal.component.tsx` - Confirmation modal

#### 5.4 Chat Display Components ✅ COMPLETE
**Status:** Completed - All chat display components implemented

**What Was Built:**
- ✅ `ChatPanel.component.tsx` - Main container (sidebar + chat area)
- ✅ `ChatWorkspace.component.tsx` - Orchestrates conversation + input
- ✅ `ChatConversation.component.tsx` - Scrollable message list (replaces MessageList)
- ✅ `Message.component.tsx` - Individual message bubbles with streaming support
- ✅ `ChatInput.component.tsx` - Input field + send button
- ✅ `TypingIndicator.component.tsx` - Animated dots during streaming (Framer Motion)
- ✅ `EmptyState.component.tsx` - Welcome message component

**Key Features:**
- Full-height flex layout with sticky input
- Auto-scroll to bottom on new messages
- Empty state handling (no thread selected, empty thread)
- Typing indicator shows when streaming active
- Message bubbles with user/assistant styling
- Streaming content updates in real-time

#### 5.5 Header Components
**Create:** `src/components/chat/ChatHeader.component.tsx`
- Header bar above chat
- Shows current thread title
- Logout button (calls `auth.store.logout()`)
- User info display (optional, shows username)
- Uses HeroUI `Button` for logout

### Phase 6: UX Enhancements

#### 6.1 Auto-Scroll
- [ ] Create `src/hooks/use-auto-scroll.hook.ts`
- [ ] Scroll to bottom on new messages
- [ ] Smooth scroll animation
- [ ] Detect manual scroll (don't force scroll if user scrolled up)

#### 6.2 Keyboard Shortcuts
- [ ] Enter to send message
- [ ] Escape to clear input
- [ ] Focus management after sending
- [ ] Tab navigation support

#### 6.3 Visual Polish
- [ ] Message fade-in animations
- [ ] Typing indicator animation (bouncing dots)
- [ ] Hover states on messages
- [ ] Timestamps (relative format: "Just now", "2m ago") - optional

### Phase 7: Edge Cases & Quality

#### 7.1 Edge Case Handling
- [ ] Prevent empty message submission
- [ ] Handle rapid message sending (queue or disable)
- [ ] Long message wrapping and scrolling
- [ ] Special character handling
- [ ] Maximum message length validation

#### 7.2 Error Handling
- [ ] Network error display
- [ ] Stream interruption handling
- [ ] Retry functionality (optional)
- [ ] Graceful degradation

#### 7.3 Accessibility
- [ ] ARIA labels on interactive elements
- [ ] `aria-live="polite"` for streaming messages
- [ ] `aria-busy` during streaming
- [ ] Keyboard navigation support
- [ ] Screen reader support

### Phase 8: Documentation & Polish

#### 8.1 Code Quality
- [ ] JSDoc comments on all functions
- [ ] Remove console.logs
- [ ] Fix linter warnings
- [ ] Ensure strict TypeScript compliance
- [ ] Extract magic numbers to constants

#### 8.2 Documentation
- [ ] Update README.md with project description
- [ ] Document SSE implementation (MSW server-side)
- [ ] Explain secure tunnel + Netlify proxy architecture
- [ ] Local development instructions
- [ ] Production deployment guide
- [ ] Design decisions documentation

## 🗂 Project Structure

### File Naming Convention
- **PascalCase** component names with `.component.tsx` suffix (e.g., `Chatbot.component.tsx`)
- **Kebab-case** for hooks, stores, types (e.g., `use-chatbot.hook.ts`, `chat.types.ts`)
- **Routes remain `.tsx`** (TanStack Router convention)
- **Avoid duplication** in names (e.g., `app.store.ts` not `app-store.store.ts`)

### Path Aliases
All top-level src directories have TypeScript path aliases configured:
- `@assets/*` → `src/assets/*`
- `@components/*` → `src/components/*`
- `@hooks/*` → `src/hooks/*`
- `@routes/*` → `src/routes/*`
- `@stores/*` → `src/stores/*`
- `@types/*` → `src/types/*`
- `@utils/*` → `src/utils/*`

Example: `import { ChatContainer } from '@components/chat/ChatContainer.component'`

### Client Project Structure (test-starter)
```
test-starter/
├── src/
│   ├── routes/
│   │   ├── __root.tsx                   # Root layout
│   │   ├── index.tsx                    # Redirect based on auth
│   │   ├── login.tsx                    # Login route
│   │   └── dashboard.tsx                # Dashboard route
│   ├── components/
│   │   ├── auth/
│   │   │   └── Login.component.tsx
│   │   ├── dashboard/
│   │   │   ├── StatCard.component.tsx
│   │   │   ├── WelcomeSection.component.tsx
│   │   │   ├── ModelInfoCard.component.tsx
│   │   │   ├── StatusIndicator.component.tsx
│   │   │   ├── StatusCard.component.tsx
│   │   │   ├── UsageChart.component.tsx
│   │   │   └── HeroCTA.component.tsx
│   │   ├── pages/
│   │   │   └── dashboard.page.tsx
│   │   ├── chat/                       # (to be created)
│   │   │   ├── ChatContainer.component.tsx
│   │   │   ├── ThreadSidebar.component.tsx
│   │   │   ├── ThreadItem.component.tsx
│   │   │   ├── NewThreadButton.component.tsx
│   │   │   ├── ThreadRenameInput.component.tsx
│   │   │   ├── DeleteThreadModal.component.tsx
│   │   │   ├── ChatView.component.tsx
│   │   │   ├── MessageList.component.tsx
│   │   │   ├── Message.component.tsx
│   │   │   ├── ChatInput.component.tsx
│   │   │   ├── TypingIndicator.component.tsx
│   │   │   ├── EmptyState.component.tsx
│   │   │   └── ChatHeader.component.tsx
│   │   └── layout/
│   │       └── app.layout.tsx
│   ├── hooks/
│   │   └── chat.hooks.ts               # (to be created - single file)
│   ├── types/
│   │   ├── auth.types.ts
│   │   └── chat.types.ts               # (to be created)
│   ├── stores/
│   │   ├── auth.store.ts
│   │   ├── thread.store.ts             # (to be created)
│   │   └── app.store.ts                # UI state only
│   └── utils/
│       ├── auth-guard.utils.ts
│       ├── avatar.utils.ts
│       └── thread.utils.ts             # (to be created)
├── public/
├── netlify.toml                          # Proxy configuration
├── vite.config.ts
└── package.json
```

### ~~MSW Server Project Structure~~ ✅ NOT NEEDED - Using Real API

**No separate server repository needed!** The Ollama API is already deployed and accessible at `api.joesangiorgio.com/llm/*`

**Infrastructure Details:**
- **Container:** ollama-api (local Docker)
- **Model:** qwen2.5:0.5b
- **Endpoint:** `https://api.joesangiorgio.com/llm/v1/chat/completions`
- **Format:** OpenAI-compatible SSE streaming

## 🔄 Data Flow

1. **User Input** → User types message and clicks send
2. **Chat Hook** → `useChatbot` adds user message to current thread in thread store
3. **Streaming Function** → `streamMessage` uses axios to call `https://api.joesangiorgio.com/llm/v1/chat/completions`
4. **Netlify Proxy** → Routes request to secure tunnel
5. **Ollama API** → Real LLM (qwen2.5:0.5b) generates response, streams via SSE (OpenAI format)
6. **Client Parsing** → Parse SSE chunks manually (axios doesn't support SSE natively), update message content character-by-character
7. **Thread Store Update** → Update streaming content in thread store as chunks arrive
8. **UI Update** → React re-renders with streaming text
9. **Completion** → Stream ends, message finalized in thread store, saved to localStorage
10. **URL Sync** → URL updates with `?threadId=${id}` for deep linking

## 🎨 UI/UX Approach

### Design Principles
- **Conversation-First** - Messages are the hero, clean and readable
- **Realistic Streaming** - Character-by-character feels natural
- **Responsive** - Works beautifully on mobile and desktop
- **Accessible** - Screen reader friendly, keyboard navigable
- **Polished** - Smooth animations, thoughtful interactions

### Layout Strategy
- **Sidebar + Main Area** - Left sidebar with thread list (Listbox), right main area with active thread
- **Fixed Sidebar** - ~260px width, hidden on mobile
- **Sticky Input** - Input always visible at bottom
- **Auto-Scroll** - New messages scroll into view smoothly
- **Message Bubbles** - User (right) vs AI (left) styling
- **Thread Navigation** - Click thread in sidebar to switch, URL updates for deep linking

## 🚀 Development Workflow

1. **~~API Setup~~** ✅ - Already deployed and working!
2. **Client Integration** - Build React components
3. **Streaming Hook** - Connect client to real Ollama API
4. **UI Polish** - Animations, edge cases, accessibility
5. **Testing** - Manual testing with real API responses
6. **Documentation** - Explain infrastructure decisions

## 📈 Success Metrics

- **Technical Excellence** - Clean TypeScript, proper types, well-structured
- **User Experience** - Smooth streaming, responsive, accessible
- **Code Quality** - Well-documented, maintainable, production-ready
- **Infrastructure** - Matches existing HA pattern, scalable setup

## 🔮 Optional Enhancements (If Time Permits)

- **SessionStorage Persistence** - Survives refresh, clears on tab close
- **Dark Mode Toggle** - Theme switching
- **Message Actions** - Copy, delete individual messages
- **Markdown Support** - Format messages with bold, italic, code
- **Export Chat History** - Download conversation as JSON
- **Voice Input** - Web Speech API integration
- **Keyboard Shortcuts** - Cmd+K to focus input
- **Double-Click to Rename Threads** - Double-click thread item to enter edit mode (NTH - HeroUI ListboxItem doesn't support onDoubleClick natively)
- **MSW for CI/CD** - Add MSW mocks for deterministic testing (great interview answer for "what would you add with more time?")

## 🎯 Key Decisions

1. **~~SSE Implementation~~** ✅ **Real Ollama API** - Self-hosted LLM with OpenAI-compatible SSE streaming
2. **~~Infrastructure~~** ✅ **Production Setup** - Docker locally + Secure Tunnel + Netlify proxy (already deployed!)
3. **Component Naming:** PascalCase + `.component.tsx` (e.g., `ChatContainer.component.tsx`)
4. **State Management:** Zustand for thread state (already installed), separate thread.store.ts
5. **Streaming Format:** OpenAI SSE format (industry standard, real implementation)
6. **Streaming Implementation:** @microsoft/fetch-event-source library for SSE streaming with POST support
7. **Service Layer Architecture:** All API calls (axios and SSE) handled in service layer, hooks only manage React state
8. **Hook Organization:** Single file `chat.hooks.ts` containing streaming + chat logic
9. **Component Folder:** `src/components/chat/` (not `chatbot/`)
10. **Thread Management:** Multiple threads per user, localStorage persistence, URL deep linking
11. **Sidebar Component:** HeroUI Listbox (not Accordion) for thread list
12. **Thread Features:** Manual thread creation via button, rename (double-click), delete (with modal), most recent first
13. **~~Server Location~~** ✅ **No Separate Repo** - Using existing production Ollama API
14. **Model Choice:** `qwen2.5:0.5b` (tiny, resource-efficient, runs on constrained hardware)
15. **Development Flow:** Direct integration with production API (simpler, more impressive)
16. **Rate Limiting:** Self-hosted, no API costs, just mention in README
17. **Testing Strategy:** Skip E2E for now, mention MSW CI/CD testing as "future enhancement" (great interview talking point)

## 📝 Timeline Estimate (Updated)

| Phase | Time | Total |
|-------|------|-------|
| Phase 0: Auth & Dashboard | ~~2-3 hours~~ | ✅ **DONE** |
| Phase 1: API Infrastructure | ~~60-90 min~~ | ✅ **DONE** (API already deployed!) |
| Phase 2.3: Dashboard Content | ~~60-90 min~~ | ✅ **DONE** |
| Phase 2.2: Chat Route | ~~20-30 min~~ | ✅ **DONE** |
| Phase 2.1: Thread Management | ~~45 min~~ | ✅ **DONE** (pre-existing) |
| Phase 2.2: Route Updates | 15 min | 15 min |
| Phase 3: Store Reorganization | 10 min | 25 min |
| Phase 4: SSE Streaming Hook | ~~45 min~~ | ✅ **DONE** |
| Phase 5: Chat UI Components | 90 min | 205 min |
| Phase 6: UX Enhancements | 30-45 min | 235-250 min |
| Phase 7: Polish & Edge Cases | 30-45 min | 265-295 min |
| Phase 8: Documentation | 15-30 min | 280-325 min |

**Remaining: 2.5-3.5 hours** for chat UI components and polish
**Completed: 5-6 hours** (auth + dashboard + API + chat route + thread management + SSE streaming)

---

**Current Status**: Phases 0-5 complete! ✅ Auth, Dashboard, API, Chat Route, Thread Management, SSE Streaming, and Chat UI Components all implemented. Ready for UX enhancements (Phase 6).  
**Last Updated**: November 9, 2025  
**Next Steps**: Begin Phase 6 - UX Enhancements (auto-scroll improvements, keyboard shortcuts, visual polish)

**Major Updates:**
- **Nov 8, 2025:** Switched from MSW mocks to real production Ollama API! Saves time, demonstrates infrastructure knowledge. API deployed, tested, and working with OpenAI-compatible SSE streaming.
- **Nov 9, 2025 (Morning):** Documented Phase 0 (Authentication & Dashboard) which was completed but not previously in roadmap. Fixed Phase 2 status and clarified project structure: chat app with dashboard hub.
- **Nov 9, 2025 (Afternoon):** Completed Phase 2.3 - Full dashboard implementation with stats cards, welcome section, model info, usage chart (recharts), API status indicator, and hero CTA. All components include empty states. Dashboard serves as navigation hub with prominent "Go to Chat" button. Layout: Info section → Hero CTA → Stats grid → Usage Chart.
- **Nov 9, 2025 (Evening):** Completed Phase 2.2 - Created chat route with route protection. Refactored code quality: extracted Sidebar and Header components, created chat service with TanStack Query, fixed API status to reflect actual connection, fixed axios config, fixed deprecated icons, improved layout structure. Chat navigation added to sidebar (centered icons when collapsed).
- **Nov 9, 2025 (Night):** Created detailed implementation plan for multi-thread chatbot interface. Features include: thread management with sidebar (Listbox), localStorage persistence, URL deep linking (`/chat?threadId=${id}`), SSE streaming with axios (no fetch), single hook file (`chat.hooks.ts`), components in `chat/` folder. Manual thread creation via button. Thread features: create, rename (double-click), delete (with confirmation modal), most recent first ordering.
- **Nov 10, 2025:** Completed Phase 4 - SSE Streaming! Refactored to use `@microsoft/fetch-event-source` library (instead of react-use). Moved all API communication to service layer (`streamChatCompletion()` in `chat.service.ts`). Hook (`useChatStream()`) now only handles React state. Added config values (`CHAT_COMPLETIONS_URL`, `DEFAULT_MODEL`) to `axios.config.ts`. Updated app title to "JSG Chatbox" and favicon.
- **Nov 9, 2025 (Night):** Completed Phase 5.4 - Chat UI Components! Created `TypingIndicator.component.tsx` with Framer Motion animated dots. Created `EmptyState.component.tsx` with welcome message. Updated `ChatConversation.component.tsx` to use new components. All Phase 5 components now complete. Chat interface fully functional with streaming support!
