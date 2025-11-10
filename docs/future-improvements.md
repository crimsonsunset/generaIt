# Future Improvements

This document tracks planned improvements and refactoring opportunities for the codebase, organized by category and priority.

## Executive Summary

### CODE/BUGFIXES/INFRA (Technical Debt & Foundation)

**Priority Tier 1 - CRITICAL:**
- **[Robust Error Handling in Chat Interface](#1-robust-error-handling-in-chat-interface):** Implement comprehensive error handling with user-visible error displays, error categorization, retry mechanisms, and React error boundaries.
- **[URL & Thread ID Deep Linking State Management](#2-url--thread-id-deep-linking-state-management):** Refactor complex state synchronization between URL params, Zustand store, and localStorage to eliminate race conditions and state fighting.
- **[Message Deduplication Logic Cleanup](#3-message-deduplication-logic-cleanup):** Centralize duplicated message deduplication logic (currently in 4 locations) into a single utility function.

**Priority Tier 2 - HIGH:**
- **[Testing Infrastructure](#4-testing-infrastructure):** Establish complete testing suite with Vitest, React Testing Library, Playwright, and MSW.
- **[Edge Cases & Input Validation](#5-edge-cases--input-validation):** Handle rapid message sending, long message wrapping, special character handling, and maximum message length validation.
- **[Accessibility Improvements](#6-accessibility-improvements):** Add ARIA labels, aria-live regions, keyboard navigation support, and screen reader compatibility.

**Priority Tier 3 - MEDIUM:**
- **[Code Quality & Documentation](#7-code-quality--documentation):** Add JSDoc comments, remove console.logs, fix linter warnings, and complete documentation.
- **[Chat Interface UI Enhancements](#8-chat-interface-ui-enhancements):** Improve visual polish with custom scrollbar styling, consistent padding, and enhanced shadows.

### NEW FEATURES (User-Facing)

**Priority Tier 1 - ESSENTIAL:**
- **[Markdown Rendering & Code Highlighting](#1-markdown-rendering--code-highlighting-):** Render Markdown in messages with syntax highlighting for code blocks, copy buttons, and math equation support.
- **[Smart Context Window Management](#2-smart-context-window-management-):** Display token count, warn when approaching limit, auto-summarize old messages, and smart context pruning.
- **[Conversation Templates & Prompts Library](#3-conversation-templates--prompts-library-):** Pre-defined prompt templates, user-created custom templates, prompt variables, and import/export functionality.
- **[Stop Generation Button (AbortController UI)](#4-stop-generation-button-abortcontroller-ui-):** Let users stop AI mid-response using AbortController with visual feedback and partial response handling.

**Priority Tier 2 - POWER USER:**
- **[Multi-Model Support](#5-multi-model-support-):** Dropdown to select model, compare mode for side-by-side responses, model info cards, and per-thread model preferences.
- **[Message Search & Filtering System](#6-message-search--filtering-system-):** Full-text search across all messages, filter by date/thread/type, keyboard shortcuts, and search history.

**Priority Tier 3 - UX ENHANCEMENTS:**
- **[AI Response Regeneration & Alternatives](#7-ai-response-regeneration--alternatives-):** Regenerate button, show multiple response alternatives, rate responses, and track user preferences.
- **[Remaining UX Enhancements](#8-remaining-ux-enhancements):** Auto-scroll improvements, additional keyboard shortcuts, and visual polish (animations, hover states, timestamps).

---

## CODE/BUGFIXES/INFRA (Technical Debt & Foundation)

### Priority Tier 1 - CRITICAL (Do First)

#### 1. Robust Error Handling in Chat Interface

**Problem:** Errors are captured but never displayed to users. No error recovery mechanisms, categorization, or boundaries.

**Current Issues:**
- `useChatStream` hook returns `error` state but it's never used in `ChatWorkspace`
- All errors only logged to console
- No retry mechanisms for failed streams
- No error boundaries to catch component-level errors
- No distinction between recoverable and non-recoverable errors

**Proposed Solution:**

**Error Display Components:**
- `ErrorBanner.component.tsx` - Dismissible error banner at top
- `ErrorMessage.component.tsx` - Inline error in message list
- `ErrorBoundary.component.tsx` - React error boundary wrapper

**Error Type System:**
```typescript
export type ChatErrorType = 
  | 'network'      // Connection issues, timeouts
  | 'api'          // API errors (4xx, 5xx)
  | 'parsing'      // SSE parsing errors
  | 'aborted'      // User cancelled
  | 'unknown'      // Unexpected errors

export interface ChatError {
  type: ChatErrorType
  message: string
  originalError?: Error
  timestamp: Date
  retryable: boolean
  retryCount?: number
}
```

**User-Friendly Error Messages:**
```typescript
const ERROR_MESSAGES = {
  network: "Connection error. Please check your internet connection and try again.",
  api: "The AI service is temporarily unavailable. Please try again in a moment.",
  parsing: "Received an unexpected response. Please try again.",
  aborted: "Request cancelled.",
  unknown: "An unexpected error occurred. Please try again.",
}
```

**Implementation Phases:**
1. Create error display components
2. Add error type classification
3. Implement retry functionality
4. Add error boundaries
5. Enhanced logging and monitoring

**Related Files:**
- `src/hooks/chat.hooks.ts` - Hook with unused error state (line 133)
- `src/components/chat/ChatWorkspace.component.tsx` - Component ignoring error (line 12)
- `src/services/chat.service.ts` - Minimal error handling
- `src/types/chat.types.ts` - Add error types here

---

#### 2. URL & Thread ID Deep Linking State Management

**Problem:** Complex state synchronization between URL params, Zustand store, and localStorage creates race conditions and state fighting.

**Current Issues:**
- Three competing sources of truth: URL, Zustand, localStorage
- Three separate useEffect hooks trying to sync state
- Uses refs for loop prevention (fragile pattern)
- Race conditions when threads load asynchronously
- Edge cases not handled well (deleted thread, invalid threadId, etc.)

**Proposed Solutions:**

**Option 1: URL-First (Single Source of Truth)**
- URL is the single source of truth for thread selection
- Store `currentThreadId` becomes derived from URL
- Eliminates state fighting

**Option 2: Store-First with Controlled URL Sync**
- Store is the single source of truth
- URL becomes a "view" of store state
- One-direction sync: store → URL

**Option 3: Unified State Machine (Recommended)**
- Use state machine pattern (XState or custom)
- States: `loading` → `ready` → `syncing`
- Clear state transitions prevent race conditions
- Eliminates state fighting completely

**Related Files:**
- `src/hooks/chat.hooks.ts` - Main hook with state fighting logic
- `src/stores/thread.store.ts` - Thread state management
- `src/routes/chat.tsx` - Route component using the hook

---

#### 3. Message Deduplication Logic Cleanup

**Problem:** Message deduplication logic duplicated in 4 locations, making maintenance difficult.

**Current Duplication:**
1. `ChatConversation.component.tsx` (lines 26-37) - Component-level deduplication
2. `thread.store.ts` - `addMessage()` (lines 112-117)
3. `thread.store.ts` - `loadThreads()` (lines 208-222)
4. `thread.store.ts` - `saveThreads()` (lines 252-261)

**Proposed Solution:**

Create centralized utility in `src/utils/thread.utils.ts`:
```typescript
/**
 * Deduplicates messages by ID, keeping the first occurrence of each ID
 * @param messages - Array of messages to deduplicate
 * @param context - Optional context string for logging
 * @returns Deduplicated array of messages
 */
export function deduplicateMessages(
  messages: ChatMessage[], 
  context?: string
): ChatMessage[]
```

**Root Cause Analysis:**
- Investigate why duplicates occur in the first place
- Verify `generateMessageId()` produces unique IDs
- Check for race conditions in streaming updates

**Related Files:**
- `src/components/chat/ChatConversation.component.tsx` - Component deduplication
- `src/stores/thread.store.ts` - Store deduplication (3 locations)
- `src/utils/thread.utils.ts` - Add utility function here

---

### Priority Tier 2 - HIGH (Do Soon)

#### 4. Testing Infrastructure

**Problem:** No automated testing infrastructure. Refactoring is risky without tests.

**Proposed Strategy:**

**Unit Tests (Vitest):**
- Hooks: `useChatStream`, `useThreadInitialization`
- Stores: Thread management, auth, app state
- Services: API communication, SSE streaming
- Utils: Thread utilities, avatar generation

**Component Tests (React Testing Library):**
- Chat components: workspace, conversation, input, messages
- Layout components: sidebar, header
- Dashboard components

**E2E Tests (Playwright + MSW):**
- Complete chat flow
- Error scenarios
- Thread management
- Theme switching

**Test Coverage Goals:**
- Unit tests: 80%+ for hooks, stores, services, utils
- Component tests: 70%+ for UI components
- E2E tests: 100% of critical user flows

**Related Files:**
- `package.json` - Add test dependencies
- `vitest.config.ts` - To be created
- `playwright.config.ts` - To be created
- `src/mocks/` - MSW handlers (to be created)

---

#### 5. Edge Cases & Input Validation

**Current State:**
- ✅ Empty message prevention implemented

**Remaining Work:**

**Rapid Message Sending:**
- Prevent multiple messages in quick succession
- Queue messages or disable button during streaming
- Consider debouncing send button

**Long Message Handling:**
- Ensure long messages wrap properly
- Verify scrolling for very long messages
- Test messages exceeding viewport height

**Input Validation:**
- Special character handling (Unicode support)
- Maximum message length validation (e.g., 10,000 chars)
- Character count indicator (optional)
- Handle extremely long single-line messages

**Related Files:**
- `src/components/chat/ChatInput.component.tsx` - Add validation
- `src/components/chat/Message.component.tsx` - Test wrapping/scrolling

---

#### 6. Accessibility Improvements

**Current State:**
- Basic keyboard support (Enter to send)
- Some ARIA labels present

**Remaining Work:**

**ARIA Labels:**
- Add `aria-label` to all interactive elements
- Add `aria-describedby` for form inputs
- Ensure all icons have accessible labels

**Streaming Messages:**
- Add `aria-live="polite"` for streaming region
- Add `aria-busy="true"` during streaming
- Announce when streaming starts/completes

**Keyboard Navigation:**
- Full keyboard navigation for thread list
- Tab order optimization
- Escape key handling for modals
- Arrow key navigation

**Screen Reader Support:**
- Test with NVDA, JAWS, VoiceOver
- Ensure dynamic content is announced
- Add skip links
- Proper heading hierarchy

**Related Files:**
- `src/components/chat/ChatInput.component.tsx` - Add ARIA
- `src/components/chat/ChatConversation.component.tsx` - aria-live region
- `src/components/chat/ThreadSidebar.component.tsx` - Keyboard nav

---

### Priority Tier 3 - MEDIUM (Polish)

#### 7. Code Quality & Documentation

**Code Quality:**
- [ ] Add JSDoc comments to all functions
- [ ] Remove/replace console.logs with proper logging
- [ ] Fix all linter warnings
- [ ] Ensure strict TypeScript compliance (no `any` types)
- [ ] Extract magic numbers to constants
- [ ] Add prop validation

**Documentation:**
- [ ] Document SSE implementation details
- [ ] Explain secure tunnel + Netlify proxy architecture
- [ ] Add local development instructions
- [ ] Add production deployment guide
- [ ] Document design decisions
- [ ] Add troubleshooting guide

**Related Files:**
- All `src/` files - Add JSDoc
- `src/hooks/chat.hooks.ts` - Remove console.logs
- `src/stores/thread.store.ts` - Remove console.logs
- `docs/system/api-integration.md` - Add SSE details
- `README.md` - Add dev/deployment sections

---

#### 8. Chat Interface UI Enhancements

**Scrollbar Styling:**
- Custom scrollbar styling (match theme)
- Thinner, more subtle design
- Add hover states

**Padding Improvements:**
- Consistent right padding to match left
- Ensure messages don't touch scrollbar
- Responsive padding adjustments

**Shadow Enhancements:**
- Increase message shadow intensity (`shadow="md"` or `shadow="lg"`)
- Add shadow to ChatInput for floating effect
- Create layered depth effect

**Related Files:**
- `src/components/chat/ChatConversation.component.tsx` - Scrollbar styling
- `src/components/chat/ChatInput.component.tsx` - Input shadow
- `src/components/chat/Message.component.tsx` - Message shadows

---

## NEW FEATURES (User-Facing)

### Priority Tier 1 - ESSENTIAL (High Impact, User-Facing)

#### 1. Markdown Rendering & Code Highlighting ⭐

**Why:** AI responses often include code blocks, lists, and formatted text.

**Features:**
- Render Markdown in messages (bold, italic, lists, links, headings)
- Syntax highlighting for code blocks with language detection
- Copy button for code blocks
- Math equation rendering (KaTeX)
- Tables and blockquotes support

**Libraries:**
- `react-markdown` or `marked` for Markdown parsing
- `prism-react-renderer` or `highlight.js` for syntax highlighting
- `katex` for math equations

**Implementation:**
```typescript
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'

// In Message component
<ReactMarkdown
  components={{
    code({node, inline, className, children, ...props}) {
      const match = /language-(\w+)/.exec(className || '')
      return !inline && match ? (
        <SyntaxHighlighter language={match[1]}>
          {String(children).replace(/\n$/, '')}
        </SyntaxHighlighter>
      ) : (
        <code className={className} {...props}>
          {children}
        </code>
      )
    }
  }}
>
  {message.content}
</ReactMarkdown>
```

**Time Estimate:** 2-3 hours  
**Impact:** High - Essential for technical conversations

**Related Files:**
- `src/components/chat/Message.component.tsx` - Update to render Markdown
- `package.json` - Add markdown/syntax highlighting libraries

---

#### 2. Smart Context Window Management ⭐

**Why:** LLMs have token limits. Long conversations exceed context window.

**Features:**
- Display token count for current conversation
- Visual progress bar showing context usage
- Warn when approaching limit (e.g., 80%)
- Auto-summarize old messages (lossy compression)
- Smart context pruning (keep first/last N, summarize middle)
- Manual message selection (checkboxes to include/exclude)

**UI Design:**
```
┌─────────────────────────────────┐
│ Context: 2,345 / 8,192 tokens   │
│ [████████░░░░░░░░░░░] 29%      │
│                                  │
│ ⚠️ Approaching limit (85%)      │
│ [Auto-Summarize] [Prune Old]   │
└─────────────────────────────────┘
```

**Implementation:**
- Token counting library (e.g., `tiktoken` or approximation)
- Summarization: Call LLM with "summarize these messages" prompt
- Pruning strategy: Keep system message, first 2, last 5, summarize rest

**Time Estimate:** 4-5 hours  
**Impact:** High - Essential for long conversations

**Related Files:**
- `src/components/chat/ChatWorkspace.component.tsx` - Add token counter UI
- `src/hooks/chat.hooks.ts` - Add token counting logic
- `src/services/chat.service.ts` - Add summarization function

---

#### 3. Conversation Templates & Prompts Library ⭐

**Why:** Save and reuse effective prompts. Power user favorite.

**Features:**
- Pre-defined prompt templates ("Code Review", "Explain Concept", "Debug Help")
- User can create and save custom templates
- Prompt variables (e.g., "Explain {topic} in {style}")
- Quick access dropdown in chat input
- Import/export prompt library
- Template categories

**UI Concept:**
```
┌─────────────────────────────────┐
│ [💾] Saved Prompts         [+]  │
│                                  │
│ 📝 Writing                      │
│  • Explain Like I'm 5           │
│  • Create Blog Post Outline     │
│                                  │
│ 💻 Coding                       │
│  • Code Review Template         │
│  • Debug JavaScript Error       │
│  • Explain Code                 │
│                                  │
│ 🎓 Learning                     │
│  • Study Guide Creator          │
│  • Quiz Me On {topic}           │
└─────────────────────────────────┘
```

**Data Structure:**
```typescript
interface PromptTemplate {
  id: string
  name: string
  category: string
  content: string
  variables: string[] // ["topic", "style"]
  createdAt: Date
  usageCount: number
}
```

**Storage:**
- localStorage for personal templates
- Future: Backend storage for team sharing

**Time Estimate:** 3-4 hours  
**Impact:** High - Great for power users and demos

**Related Files:**
- `src/components/chat/PromptLibrary.component.tsx` - New component
- `src/stores/prompt.store.ts` - New Zustand store
- `src/types/prompt.types.ts` - New types

---

#### 4. Stop Generation Button (AbortController UI) ⭐ 🆕

**Why:** Users need ability to stop AI mid-response.

**How AbortController Works:**
```typescript
// Already implemented in useChatStream hook
const abortController = new AbortController()

// Pass signal to fetch
fetch(url, { signal: abortController.signal })

// Stop the stream
abortController.abort()  // Immediately stops request
```

**Features:**
- Stop button visible during streaming
- Partial response stays in chat
- UI feedback: "Stopped by user"
- Input re-enabled after stop
- Option to regenerate or continue

**UI Design:**
```
AI is typing... [⏹️ Stop]  ← During streaming

Response stopped.          ← After abort
[🔄 Regenerate] [✓ OK]    ← Options
```

**Implementation:**
- Button in ChatInput or ChatWorkspace
- Call existing `abort()` from `useChatStream`
- Update UI to show stopped state
- Mark message as "partial" or "stopped"

**Time Estimate:** 1-2 hours  
**Impact:** High - Essential UX feature

**Related Files:**
- `src/components/chat/ChatInput.component.tsx` - Add stop button
- `src/components/chat/ChatWorkspace.component.tsx` - Or add here
- `src/hooks/chat.hooks.ts` - Already has abort() function

---

### Priority Tier 2 - POWER USER (High Value, Differentiation)

#### 5. Multi-Model Support ⭐

**Why:** Different models for different tasks. Great showcase feature.

**Current State:** Hardcoded to `qwen2.5:0.5b`

**Features:**
- Dropdown to select model before sending
- Save model preference per thread
- Compare mode: Same prompt to multiple models side-by-side
- Model info cards (size, speed, strengths, weaknesses)
- Auto-suggest model based on prompt type

**Models to Support:**
- `qwen2.5:0.5b` (current - fast, resource-efficient)
- `qwen2.5:1.5b` (better quality)
- `llama3.2:1b` (Meta's model)
- `phi-4` (Microsoft's small model)
- `deepseek-r1:1.5b` (reasoning model)

**UI Mockup:**
```
┌─────────────────────────────────┐
│ [🤖] Model: qwen2.5:0.5b ▼     │
│      Speed: ⚡⚡⚡ | Quality: ⭐⭐  │
│                                  │
│ Other models:                   │
│  • qwen2.5:1.5b (Better)        │
│  • llama3.2:1b (Fast)           │
│  • phi-4 (Balanced)             │
└─────────────────────────────────┘
```

**Implementation:**
- Add model selector dropdown
- Store selected model in thread metadata
- Pass model to API request
- Display model badge on messages

**Time Estimate:** 2-3 hours  
**Impact:** High - Great demo feature

**Related Files:**
- `src/components/chat/ModelSelector.component.tsx` - New component
- `src/stores/thread.store.ts` - Add model to thread metadata
- `src/services/chat.service.ts` - Pass model parameter
- `src/config/axios.config.ts` - Remove hardcoded DEFAULT_MODEL

---

#### 6. Message Search & Filtering System ⭐

**Why:** As chat history grows, users need to find past conversations.

**Features:**
- Full-text search across all messages in all threads
- Filter by date range, thread, or message type (user/assistant)
- Highlight search matches in context
- Search history with recent searches
- Keyboard shortcut (Cmd/Ctrl+F) for quick access
- Search suggestions

**UI Concept:**
```
┌─────────────────────────────────┐
│ [🔍] Search messages...         │
│                                  │
│ Filters: [Date ▼] [Thread ▼]   │
│                                  │
│ Results (12):                   │
│ ───────────────────────────────│
│ Thread: "React Help"            │
│ User: How do I use **useEffect**? │
│ 2 days ago                      │
│ ───────────────────────────────│
│ Thread: "Python Basics"         │
│ AI: **useEffect** is a React hook... │
│ 5 days ago                      │
└─────────────────────────────────┘
```

**Implementation:**
- Use Fuse.js for fuzzy search (client-side)
- Or: Build search index in localStorage/IndexedDB
- Or: Full-text search if backend added later

**Time Estimate:** 2-3 hours  
**Impact:** High - Essential for power users

**Related Files:**
- `src/components/chat/SearchPanel.component.tsx` - New component
- `src/hooks/search.hooks.ts` - Search logic
- `src/stores/thread.store.ts` - Add search methods

---

### Priority Tier 3 - UX ENHANCEMENTS (Nice-to-Have)

#### 7. AI Response Regeneration & Alternatives ⭐

**Why:** Get better responses. Try different variations.

**Features:**
- Regenerate button for AI responses
- Show multiple alternative responses (A/B/C options)
- Rate responses (thumbs up/down)
- Provide feedback for bad responses
- Track which responses users prefer
- Continue generation if response was cut off

**UI Design:**
```
┌─────────────────────────────────┐
│ AI: [Response content...]        │
│                                  │
│ [👍] [👎] [🔄 Regenerate]       │
│                                  │
│ Alternatives: [1] [2] 3         │
│ (showing option 3 of 3)         │
└─────────────────────────────────┘
```

**Implementation:**
- Add regenerate button to Message component
- Store multiple response variants in thread
- Track which variant is currently displayed
- Save rating data to thread metadata

**Time Estimate:** 2-3 hours  
**Impact:** Medium-High - Improves UX significantly

**Related Files:**
- `src/components/chat/Message.component.tsx` - Add regenerate button
- `src/stores/thread.store.ts` - Store response variants
- `src/hooks/chat.hooks.ts` - Add regeneration logic

---

#### 8. Remaining UX Enhancements

**Auto-Scroll Improvements:**
- [ ] Refactor to dedicated `use-auto-scroll.hook.ts`
- [ ] Detect manual scroll (don't force scroll if user scrolled up)
- [ ] Scroll position tracking

**Additional Keyboard Shortcuts:**
- [x] Enter to send (done)
- [x] Shift+Enter for newline (done)
- [ ] Escape to clear input
- [ ] Focus management after sending
- [ ] Tab navigation for thread list
- [ ] Cmd/Ctrl+K to focus input

**Visual Polish:**
- [x] Typing indicator animation (done)
- [ ] Message fade-in animations
- [ ] Hover states on messages
- [ ] Timestamps (relative format)
- [ ] Message copy functionality

**Related Files:**
- `src/components/chat/ChatConversation.component.tsx` - Auto-scroll
- `src/components/chat/ChatInput.component.tsx` - Keyboard shortcuts
- `src/components/chat/Message.component.tsx` - Visual polish

---

## Implementation Sprints

### Sprint 1: Critical Fixes (Week 1)
**CODE/BUGFIXES/INFRA - Priority Tier 1**
- Robust Error Handling in Chat Interface
- URL & Thread ID Deep Linking State Management
- Message Deduplication Logic Cleanup

**Goal:** Eliminate critical bugs and technical debt

---

### Sprint 2: Foundation + Essential Features (Week 2)
**CODE/BUGFIXES/INFRA - Priority Tier 2**
- Testing Infrastructure setup

**NEW FEATURES - Priority Tier 1**
- Markdown Rendering & Code Highlighting
- Stop Generation Button (AbortController UI)

**Goal:** Build testing foundation and essential user-facing features

---

### Sprint 3: Essential Features (Week 3)
**NEW FEATURES - Priority Tier 1**
- Smart Context Window Management
- Conversation Templates & Prompts Library

**Goal:** Power user features that differentiate the app

---

### Sprint 4: Power User Features (Week 4)
**NEW FEATURES - Priority Tier 2**
- Multi-Model Support
- Message Search & Filtering System

**Goal:** Advanced features for sophisticated users

---

### Sprint 5: Polish & Remaining (Week 5+)
**CODE/BUGFIXES/INFRA - Priority Tier 2 & 3**
- Edge Cases & Input Validation
- Accessibility Improvements
- Code Quality & Documentation
- Chat Interface UI Enhancements

**NEW FEATURES - Priority Tier 3**
- AI Response Regeneration & Alternatives
- Remaining UX Enhancements

**Goal:** Production-ready polish and final touches

---

## Summary

**Total Items:**
- **CODE/BUGFIXES/INFRA:** 8 items (3 critical, 3 high, 2 medium)
- **NEW FEATURES:** 8 items (4 essential, 2 power user, 2 UX enhancements)

**Estimated Timeline:**
- Sprint 1 (Week 1): Critical fixes - 15-20 hours
- Sprint 2 (Week 2): Foundation + essentials - 12-15 hours
- Sprint 3 (Week 3): Essential features - 10-12 hours
- Sprint 4 (Week 4): Power user features - 8-10 hours
- Sprint 5+ (Week 5+): Polish - 15-20 hours

**Total Estimated Effort:** 60-77 hours (8-10 weeks at 8 hours/week)

---

*Last Updated: November 10, 2025*  
*Next Review: After Sprint 1 completion*
