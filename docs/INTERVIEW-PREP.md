# Interview Prep - JSG Chatbox

*45-minute technical deep-dive reference guide*  
*Created: November 10, 2025*

---

## Quick Reference Card

**Tech Stack:**
- React 19 + TypeScript 5.8 (strict mode)
- TanStack Router (type-safe routing) + TanStack Query (server state)
- Zustand (global state, 1KB) + HeroUI (component library)
- @microsoft/fetch-event-source (SSE streaming)
- Framer Motion (animations) + Tailwind CSS

**Key Metrics:**
- Time invested: 6-7 hours
- Completion: 85% (Phases 0-5 complete, 6 partial, 7-8 pending)
- Total phases: 8
- Lines of code: ~3,500+
- Files created: 40+

**Architecture:**
```
React App → Netlify Proxy → Cloudflare Tunnel → Ollama Container
```

**LLM Details:**
- Model: qwen2.5:0.5b (~400MB, resource-efficient)
- Format: OpenAI-compatible SSE streaming
- Endpoint: `api.joesangiorgio.com/llm/v1/chat/completions`
- Infrastructure: Self-hosted on Home Assistant Docker

---

## Demo Flow Script (15-20 min)

### 1. Login/Auth (2 min)
**Show:** Login page  
**Say:** "Simple localStorage-based auth with route guards. Any credentials work for demo purposes. TanStack Router's `beforeLoad` guards protect routes. Auth state managed with Zustand store, persists in localStorage."

**If asked:** "Production would use JWT tokens, httpOnly cookies, or OAuth. Chose simple auth to focus on the chat functionality."

### 2. Dashboard (3 min)
**Show:** Dashboard with stats, model info, API status  
**Say:** "Navigation hub with real-time API status monitoring. Uses TanStack Query with 30-second polling to check `/api/tags` endpoint. Stats cards show thread count, message count, last chat time - all pulled from localStorage."

**If asked about design:** "HeroUI component library for consistent design system. Cards use shadow-sm, responsive grid layout, mobile-first approach."

### 3. Chat Interface (3 min)
**Show:** Chat route, thread sidebar, empty state  
**Say:** "Multi-thread architecture. Threads stored in localStorage, user-specific. Each thread has messages array, metadata (createdAt, updatedAt). Thread list shows most recent first."

**Show:** Create new thread button  
**Say:** "Manual thread creation via button. Auto-generates unique ID with lodash uniqueId. Supports rename and delete with confirmation modal."

**If asked about URL deep linking:** "URL syncs with current thread: `/chat?threadId=xyz`. Can share links to specific conversations. State synchronization handled in `useThreadInitialization` hook."

### 4. Send Message - SSE STREAMING DEMO (8-10 min) ⭐ MAIN EVENT

**Show:** Type message and send  
**Say:** "This is where it gets interesting. Watch the character-by-character streaming."

**As it streams, explain:**
1. "Message sent via POST to `/v1/chat/completions` with `stream: true`"
2. "Using @microsoft/fetch-event-source library - native EventSource doesn't support POST"
3. "Server responds with SSE chunks in OpenAI format"
4. "Each chunk parsed, content extracted, accumulated character-by-character"
5. "Zustand store updates in real-time, React re-renders smoothly"
6. "When complete, saves entire thread to localStorage"

**Show code if asked:**
- `src/services/chat.service.ts` - Service layer handles API communication
- `src/hooks/chat.hooks.ts` - React hook manages state
- `src/config/axios.config.ts` - Centralized config

**Key points to emphasize:**
- Service layer separation (API calls isolated from React logic)
- AbortController for cancellation
- Error handling with callbacks
- OpenAI-compatible format for portability

### 5. Thread Management (2 min)
**Show:** Rename thread, delete thread  
**Say:** "Full CRUD operations. Rename uses inline input with auto-focus. Delete requires confirmation modal to prevent accidents. All changes persisted to localStorage immediately."

---

## SSE Streaming Deep-Dive (10-15 min) 🔥

### Why @microsoft/fetch-event-source?

**Native EventSource limitations:**
- Only supports GET requests
- No custom headers (can't add auth tokens)
- No request body

**@microsoft/fetch-event-source advantages:**
- ✅ POST support (required for chat completions)
- ✅ Custom headers (future auth token support)
- ✅ Request body with full chat history
- ✅ Built-in reconnection logic
- ✅ Better error handling

### Service Layer Architecture

**Pattern: Separation of Concerns**

```typescript
// SERVICE LAYER (chat.service.ts) - API Communication
export function streamChatCompletion(messages, callbacks) {
  // Handles: API calls, SSE parsing, error handling
  // No React dependencies - pure JavaScript
}

// HOOK LAYER (chat.hooks.ts) - React State Management  
export function useChatStream() {
  // Handles: React state, Zustand store updates, lifecycle
  // Calls service layer functions
}
```

**Benefits:**
- Testability: Service layer can be unit tested without React
- Reusability: Could use same service in different contexts
- Clarity: Clear separation of API logic vs React logic

### Character-by-Character Streaming Implementation

**Core Logic:**
```typescript
let accumulatedContent = ''

onmessage: (event) => {
  if (event.data === '[DONE]') return
  
  const parsed = JSON.parse(event.data)
  const content = parsed.choices?.[0]?.delta?.content
  
  if (content) {
    accumulatedContent += content  // Accumulate
    callbacks.onChunk(accumulatedContent)  // Update UI
  }
}
```

**Why accumulate instead of append?**
- Simpler state management (single source of truth)
- Easier to handle errors (can reset from accumulated state)
- Matches OpenAI SDK patterns

### AbortController for Cleanup

```typescript
const abortController = new AbortController()

fetchEventSource(url, {
  signal: abortController.signal,
  // ...
})

return {
  abort: () => abortController.abort()
}
```

**When abort is needed:**
- User cancels message mid-stream
- User navigates away from chat
- Component unmounts
- Network timeout

**Error handling for aborted requests:**
```typescript
if (err.name === 'AbortError') {
  // Expected - user cancelled, don't show error
} else {
  // Unexpected - show error to user
}
```

### OpenAI-Compatible Format

**Request:**
```json
{
  "model": "qwen2.5:0.5b",
  "messages": [
    {"role": "user", "content": "Hello!"}
  ],
  "stream": true
}
```

**SSE Response Chunks:**
```
data: {"choices":[{"delta":{"content":"Hello"}}]}
data: {"choices":[{"delta":{"content":"!"}}]}
data: [DONE]
```

**Why OpenAI format?**
- Industry standard
- Easy to swap models (Ollama today, OpenAI/Anthropic tomorrow)
- Well-documented
- TypeScript types available

### Race Conditions & Edge Cases

**Challenge:** URL state vs Zustand state vs localStorage

**Current approach:**
- Three separate `useEffect` hooks managing synchronization
- Refs to track initialization state
- Guards to prevent infinite loops

**Acknowledged in `future-improvements.md`:**
- Complex state synchronization
- Potential for race conditions
- Refactor plan: Unified state machine pattern

**Why it works for now:**
- Careful ordering of effects
- Ref-based loop prevention
- Extensive testing of edge cases

---

## LLM Integration Best Practices (5-10 min)

### Real API vs Mocks

**Decision: Real self-hosted Ollama API**

**Why this was the right choice:**
1. **Demonstrates infrastructure knowledge**
   - Docker container management
   - Cloudflare Tunnel setup
   - Netlify proxy configuration
   - Production-like architecture

2. **Saves development time**
   - No MSW mock server to build
   - Real streaming behavior (not simulated)
   - Can test actual LLM responses

3. **More impressive for demos**
   - Shows real working system
   - Proves you can integrate with APIs
   - Infrastructure matches existing Home Assistant patterns

**Trade-off acknowledged:**
- No deterministic testing (mention MSW for CI/CD as future enhancement)

### Model Selection

**qwen2.5:0.5b - Why this model?**

**Pros:**
- Tiny: ~400MB (fits on constrained hardware)
- Fast: Sub-second response times
- Resource-efficient: Low memory/CPU usage
- Good enough: Coherent responses for demo

**Cons:**
- Not production-quality (GPT-4 level)
- Limited reasoning capability
- Small context window

**Interview talking point:**
"Model is easily swappable. Ollama supports 100+ models. Change one line: `DEFAULT_MODEL = 'llama2'`. That's the beauty of OpenAI-compatible format."

### Self-Hosted vs Cloud

**Self-hosted (current):**
- ✅ No API costs
- ✅ Data privacy (nothing leaves network)
- ✅ Full control over infrastructure
- ❌ Scaling limitations (single server)
- ❌ Uptime dependency (home network)

**Cloud (future):**
- ✅ Scalability (auto-scaling, load balancing)
- ✅ High availability (SLAs)
- ❌ API costs (per token pricing)
- ❌ Data privacy concerns

**When to use what:**
- Self-hosted: Development, personal use, sensitive data
- Cloud: Production, high traffic, team access

### Streaming vs Non-Streaming

**Why streaming for chat?**
1. **Perceived performance** - User sees response immediately, not waiting 5-10s
2. **Better UX** - Feels conversational, like typing
3. **Token efficiency** - Can start rendering before generation completes
4. **Cancellation** - User can stop bad responses early

**When non-streaming is better:**
- Batch processing
- Background tasks
- When you need complete response before proceeding
- Analytics/logging scenarios

### Rate Limiting Considerations

**Current:** No rate limiting (self-hosted, single user)

**Production considerations:**
- Per-user rate limits (prevent abuse)
- Per-IP rate limits (DDoS protection)
- Token bucket algorithm
- Queue-based throttling for fair usage

**Implementation approaches:**
- Client-side: Disable send button during cooldown
- Server-side: Redis-based rate limiter
- API gateway: Cloudflare Workers, AWS API Gateway

### Error Handling for LLMs

**Types of errors:**
1. **Network errors** - Connection timeout, DNS failure
2. **API errors** - 429 rate limit, 503 service unavailable
3. **Streaming errors** - Malformed SSE, connection interrupted
4. **Model errors** - Context length exceeded, content filtering

**Current error handling:**
- Captured in service layer
- Logged to console
- **Gap:** Not displayed to users

**Future improvements (documented in `future-improvements.md`):**
- Error categorization
- User-visible error messages
- Retry mechanisms (exponential backoff)
- Partial response preservation

### Context Management

**Current:** Full history sent with each request

**Production considerations:**
1. **Token limits** - Models have max context (e.g., 4K tokens)
2. **Cost optimization** - Fewer tokens = lower cost
3. **Sliding window** - Keep recent N messages
4. **Summarization** - Compress old context

**Strategies:**
- Truncate old messages
- Summarize conversation history
- Use embeddings for semantic search (RAG)

### Prompt Engineering

**Not implemented, but would discuss:**
- System prompts for personality/behavior
- Few-shot examples for consistency
- Temperature/top-p tuning for creativity
- Stop sequences for structured output

---

## Technical Decisions Cheat Sheet

| Decision | Rationale |
|----------|-----------|
| **TanStack Router** | Type-safe routing with full TypeScript inference, file-based structure |
| **TanStack Query** | Automatic caching, background refetching, request deduplication (5min stale time) |
| **Zustand** | Minimal boilerplate, no context provider, 1KB bundle, excellent TypeScript support |
| **HeroUI** | Beautiful component library, Framer Motion animations, dark mode support |
| **@microsoft/fetch-event-source** | POST support for SSE, custom headers for auth, better error handling |
| **Service layer pattern** | Separation of concerns, testability, reusability (no React in services) |
| **Real API** | Infrastructure knowledge, saves time, production patterns |
| **localStorage** | Simple persistence, no backend needed, user-specific data |
| **OpenAI format** | Industry standard, model portability, well-documented |
| **Character-by-character** | Better UX, perceived performance, streaming feel |
| **qwen2.5:0.5b** | Resource-efficient, fast, good enough for demo, easily swappable |
| **Netlify proxy** | Hides internal infrastructure, SSL, professional deployment |

---

## What I'd Do With More Time (5 min buffer)

### High Priority

**Testing Infrastructure (2-3 hours)**
- Vitest for unit tests (hooks, stores, utils)
- React Testing Library for component tests
- Playwright + MSW for E2E tests
- **Why:** Safe refactoring, catch regressions, CI/CD

**Error Handling UI (1-2 hours)**
- ErrorBanner component for user-visible errors
- Error categorization (network, API, parsing)
- Retry mechanisms with exponential backoff
- React error boundaries
- **Why:** Current errors only logged to console (poor UX)

**State Management Refactor (1-2 hours)**
- Unified state machine for thread initialization
- Eliminate race conditions
- Single source of truth (URL or store, not both)
- **Why:** Current implementation has complex synchronization logic

### Medium Priority

**Accessibility (2-3 hours)**
- ARIA labels on all interactive elements
- aria-live regions for streaming messages
- Keyboard navigation (arrow keys for threads)
- Screen reader support
- **Why:** Production apps must be accessible

**Performance Optimization (2-3 hours)**
- IndexedDB for large thread history (survives refresh)
- Virtual scrolling for 10K+ messages
- Web Workers for background processing
- Memoization of expensive computations
- **Why:** Scale to power users with extensive chat history

### Nice-to-Have

**Advanced Features**
- Markdown support in messages (code blocks, lists, bold)
- Message editing/regeneration
- Export chat history (JSON, Markdown)
- Voice input (Web Speech API)
- Keyboard shortcuts (Cmd+K for quick actions)

---

## Gotchas and Talking Points

### "Why no tests?"

**Answer:** "Time-boxed MVP focused on core functionality. Tests are next priority. Would add:
- Unit tests with Vitest (hooks, stores, utils)
- Component tests with React Testing Library
- E2E tests with Playwright + MSW for CI/CD deterministic testing

MSW particularly valuable for LLM testing - can mock SSE streams with predictable responses."

### "This state management looks complex"

**Answer:** "Great observation! You're seeing the thread initialization logic - it synchronizes URL params, Zustand store, and localStorage. Works reliably but has complexity.

Documented in `future-improvements.md` with refactor plan: unified state machine pattern (like XState) would eliminate race conditions and make state transitions explicit.

Chose to ship working code first, refactor second. Classic 'make it work, make it right, make it fast' philosophy."

### "Why aren't errors shown to users?"

**Answer:** "Another great catch! Errors are captured and logged but not displayed. Acknowledged technical debt.

Have detailed improvement plan in docs:
- Error categorization (network, API, parsing)
- User-visible error messages
- Retry mechanisms
- React error boundaries

Prioritized streaming functionality first, UX polish second."

### "Why qwen2.5:0.5b instead of GPT-4?"

**Answer:** "Three reasons:
1. **Resource constraints** - Home server, not cloud. This model runs on CPU.
2. **Demo purposes** - Proves I can integrate with LLMs. Model quality not the focus.
3. **Easily swappable** - OpenAI-compatible format. Change one config line: `DEFAULT_MODEL = 'gpt-4'`. Could point to OpenAI API tomorrow.

Would use GPT-4 or Claude in production. But architecture patterns are identical."

### "How would you scale this?"

**Answer:** "Current: localStorage, single-user, client-side only.

**Multi-user scaling path:**
1. **Backend API** - Node.js/Express or TanStack Start server functions
2. **Database** - PostgreSQL for threads/messages, Redis for caching
3. **Auth** - JWT tokens, httpOnly cookies, OAuth
4. **API Gateway** - Rate limiting, load balancing
5. **Message queue** - Redis/RabbitMQ for async processing
6. **Horizontal scaling** - Multiple API servers, shared database

Architecture already supports this - service layer would call backend API instead of Ollama directly."

### "What about security?"

**Answer:** "Current security layers:
1. **Netlify proxy** - Hides internal infrastructure
2. **Cloudflare Tunnel** - Encrypted connection, no open ports
3. **No direct exposure** - Ollama not exposed to internet
4. **HTTPS only** - All external traffic encrypted

**Production additions:**
- Authentication (JWT, OAuth)
- Rate limiting (prevent abuse)
- Input validation (prevent injection attacks)
- Content filtering (prevent harmful content)
- CORS configuration (restrict origins)"

### "Show me how you'd add a feature"

**Example: Message editing**

"1. **Types** - Add `editMessage` to `thread.store.ts` actions
2. **Service** - No API changes needed (edit is client-only)
3. **Hook** - Add `editMessage` function to `useChatStream` hook
4. **UI** - Add edit button to `Message` component, inline input like thread rename
5. **Persistence** - Already handled by existing `saveThreads` call

Estimated time: 30-45 minutes. Clean architecture makes features easy to add."

---

## Key Talking Points Summary

**What went well:**
- ✅ Service layer separation (clean architecture)
- ✅ Real API integration (infrastructure knowledge)
- ✅ SSE streaming (character-by-character UX)
- ✅ Documentation (comprehensive planning)
- ✅ Type safety (strict TypeScript throughout)

**What I'd improve:**
- Testing infrastructure (Vitest + Playwright)
- Error handling UI (user-visible errors)
- State management refactor (eliminate complexity)
- Accessibility (ARIA labels, keyboard navigation)
- Performance optimization (IndexedDB, virtual scrolling)

**What makes this impressive:**
- Production-like infrastructure (not just frontend)
- OpenAI-compatible format (industry standard)
- Thoughtful architecture (service layer, separation of concerns)
- Honest about trade-offs (documented in future-improvements.md)
- Forward-thinking (roadmap for scale)

---

**Remember:**
- Be confident about what works
- Be honest about gaps
- Have a plan for improvements
- Show you understand production patterns
- Demonstrate you can prioritize (MVP first, polish second)

**Good luck! 🚀**





