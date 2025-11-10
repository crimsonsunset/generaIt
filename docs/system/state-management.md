# State Management Strategy

*How state is organized and managed in the chatbot application*

## Overview

The application uses a hybrid state management approach:
- **Zustand** for global application state
- **TanStack Query** for server state and caching
- **React State** for component-local UI state

## State Architecture

```
┌─────────────────────────────────────────────────────────┐
│  Zustand Stores (Global App State)                      │
│  - app.store.ts: UI preferences (sidebar, loading)     │
│  - thread.store.ts: Chat threads and messages          │
│  - auth.store.ts: User authentication state             │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  TanStack Query (Server State)                          │
│  - API responses                                        │
│  - Caching                                              │
│  - Background refetching                                │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  Component State (Local UI State)                       │
│  - Input value                                          │
│  - Loading states                                       │
│  - Scroll position                                      │
│  - Modal open/close                                     │
└─────────────────────────────────────────────────────────┘
```

## Zustand Store Structure

### App Store (`app.store.ts`)
UI preferences and application-level state:

```typescript
interface AppStore {
  sidebarCollapsed: boolean;
  isLoading: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setLoading: (loading: boolean) => void;
}
```

### Thread Store (`thread.store.ts`)
Chat threads, messages, and thread management:

```typescript
interface ThreadStore {
  threads: ChatThread[];
  currentThreadId: string | null;
  createThread: (title?: string) => string;
  getThread: (id: string) => ChatThread | undefined;
  getCurrentThread: () => ChatThread | undefined;
  setCurrentThread: (id: string) => void;
  addMessage: (threadId: string, message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  updateMessage: (threadId: string, messageId: string, content: string) => void;
  renameThread: (threadId: string, newTitle: string) => void;
  deleteThread: (threadId: string) => void;
  loadThreads: (userId: string) => void;
  saveThreads: (userId: string) => void;
}
```

### Auth Store (`auth.store.ts`)
User authentication state:

```typescript
interface AuthStore {
  user: User | null;
  login: (username: string) => void;
  logout: () => void;
}
```

## TanStack Query Configuration

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});
```

### Query Keys

```typescript
// Chat-related queries
['chat', 'messages'] // All messages
['chat', 'message', messageId] // Single message

// Future: User preferences, etc.
['user', 'preferences']
```

## State Flow Examples

### Sending a Message

1. User types in input (component state)
2. User clicks send → `handleSend()` called
3. Add user message to Zustand store
4. Call streaming hook → Updates Zustand store as chunks arrive
5. On completion → Finalize message in Zustand store

### Loading Chat History

1. Component mounts → `useQuery(['chat', 'messages'])`
2. TanStack Query checks cache
3. Cache miss → Fetch from API
4. Store in cache + update Zustand store
5. Component re-renders with data

## Persistence Strategy

### Current: No Persistence
- Messages cleared on refresh
- UI preferences could use localStorage (future)

### Future Options

**SessionStorage:**
- Survives refresh
- Clears on tab close
- Good for demo/interview context

**IndexedDB:**
- Large datasets
- Survives browser restart
- Offline capability

**Backend API:**
- Multi-user support
- Cross-device sync
- Team collaboration

## Best Practices

### When to Use Zustand
- ✅ Chat threads and messages (thread.store.ts)
- ✅ UI preferences (app.store.ts - sidebar, loading)
- ✅ User authentication (auth.store.ts)
- ✅ Streaming state (will be in thread.store.ts or separate hook)
- ❌ Form inputs (use component state)
- ❌ Modal open/close (use component state)

### When to Use TanStack Query
- ✅ API calls (automatic caching, refetching)
- ✅ Server state (data that comes from backend)
- ✅ Background updates (stale-while-revalidate)
- ❌ UI state (use component state or Zustand)
- ❌ Computed values (use useMemo)

### When to Use Component State
- ✅ Form inputs
- ✅ Loading spinners
- ✅ Modal visibility
- ✅ Scroll position
- ❌ Shared state (use Zustand)
- ❌ Server data (use TanStack Query)

## Performance Considerations

### Memoization
```typescript
// Expensive calculations
const processedMessages = useMemo(() => {
  return messages.map(processMessage);
}, [messages]);
```

### Selectors (Zustand)
```typescript
// Only re-render when specific part of state changes
const sidebarCollapsed = useAppStore(state => state.sidebarCollapsed);
const currentThread = useThreadStore(state => state.getCurrentThread());
const threads = useThreadStore(state => state.threads);
```

### Query Invalidation
```typescript
// Invalidate cache when needed
queryClient.invalidateQueries(['chat', 'messages']);
```

## Future Enhancements

- [ ] Zustand persistence middleware (localStorage)
- [ ] Optimistic updates for messages
- [ ] IndexedDB for large message history
- [ ] Real-time updates (WebSocket/SSE)
- [ ] Offline support with service workers

---

**Last Updated:** November 8, 2025  
**Status:** Active documentation  
**Related:** `docs/system/architecture.md`, `docs/caching-performance-strategy.md`

