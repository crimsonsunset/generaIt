# Future Improvements

This document tracks planned improvements and refactoring opportunities for the codebase.

## Executive Summary

**[URL & Thread ID Deep Linking State Management](#url--thread-id-deep-linking-state-management):** Refactor complex state synchronization between URL params, Zustand store, and localStorage to eliminate race conditions and state fighting using a unified state machine or single source of truth pattern.

**[Chat Interface UI Enhancements](#chat-interface-ui-enhancements):** Improve visual polish with custom scrollbar styling, consistent padding, and enhanced shadows for better depth and separation of chat interface elements.

**[Message Deduplication Logic Cleanup](#message-deduplication-logic-cleanup):** Centralize duplicated message deduplication logic (currently in 4 locations) into a single utility function to improve maintainability and consistency.

**[Robust Error Handling in Chat Interface](#robust-error-handling-in-chat-interface):** Implement comprehensive error handling with user-visible error displays, error categorization, retry mechanisms, and React error boundaries since errors are currently only logged to console and never shown to users.

**[Testing Infrastructure](#testing-infrastructure):** Establish complete testing suite with Vitest for unit tests, React Testing Library for component tests, Playwright for E2E tests, and MSW for mocking AI responses to enable safe refactoring and catch regressions.

**[Remaining UX Enhancements](#remaining-ux-enhancements):** Complete Phase 6 items including auto-scroll refactoring, additional keyboard shortcuts (Escape to clear, focus management), visual polish (message animations, hover states, timestamps), and improved scroll detection.

**[Edge Cases & Input Validation](#edge-cases--input-validation):** Handle rapid message sending, long message wrapping, special character handling, maximum message length validation, and other edge cases for production readiness.

**[Accessibility Improvements](#accessibility-improvements):** Add ARIA labels, aria-live regions for streaming messages, aria-busy states, keyboard navigation support, and screen reader compatibility.

**[Code Quality & Documentation](#code-quality--documentation):** Add JSDoc comments to all functions, remove console.logs, fix linter warnings, extract magic numbers to constants, and complete documentation including SSE implementation details, infrastructure architecture, and deployment guides.

## URL & Thread ID Deep Linking State Management

### Problem Statement

The current implementation in `useThreadInitialization` hook (`src/hooks/chat.hooks.ts`) has complex state synchronization logic between multiple sources of truth:

1. **URL search params** (`threadId` from TanStack Router)
2. **Zustand store** (`currentThreadId` from thread store)
3. **localStorage** (threads array loaded asynchronously)
4. **Component refs** (`initializedRef`, `lastThreadIdRef`) used to prevent loops

### Current Issues

#### 1. Multiple Competing State Sources
- URL threadId and store currentThreadId can get out of sync
- Three separate `useEffect` hooks trying to keep them synchronized:
  - Effect 1: Loads threads from localStorage when userId changes
  - Effect 2: Reads URL threadId → updates store (lines 37-99)
  - Effect 3: Reads store currentThreadId → updates URL (lines 103-120)

#### 2. Complex Loop Prevention Logic
- Uses refs (`initializedRef`, `lastThreadIdRef`) to track initialization state
- Conditional guards like `threadId === lastThreadIdRef.current && initializedRef.current` to prevent re-processing
- Guard in Effect 3: `currentThreadId === threadId` to prevent URL updates when already in sync
- This creates fragile state where edge cases can cause desynchronization

#### 3. Race Conditions
- Threads load asynchronously from localStorage
- URL threadId might be processed before threads are loaded
- Logic waits for `threads.length > 0` but doesn't handle partial loads or errors gracefully

#### 4. Duplicated Logic
- "Use most recent thread" logic appears in multiple places:
  - When invalid threadId in URL (lines 74-79)
  - When no threadId in URL (lines 86-93)
  - In thread store `deleteThread` (lines 178-179)

#### 5. Edge Cases Not Handled Well
- Thread deleted while it's the current thread → store updates but URL might not sync properly
- User navigates directly to `/chat?threadId=invalid` → multiple navigation calls possible
- Threads cleared (logout) → initialization refs might not reset properly

### Proposed Solution

#### Option 1: Single Source of Truth (URL-First)
- **URL is the single source of truth** for thread selection
- Store `currentThreadId` becomes derived from URL, not independent
- Remove Effect 3 (URL sync) entirely
- Store only updates when URL changes, never the reverse
- Components read threadId from URL, not from store

**Pros:**
- Eliminates state fighting
- Simpler mental model
- Better for deep linking (URL always reflects state)

**Cons:**
- Requires URL updates for all thread changes (even programmatic ones)
- Might feel less "reactive" for some interactions

#### Option 2: Store-First with Controlled URL Sync
- **Store is the single source of truth**
- URL becomes a "view" of store state
- Use a single effect that reads store → updates URL (one direction only)
- Thread selection always goes through store actions
- URL changes trigger store updates, but store never reads URL directly

**Pros:**
- More React-like (state-driven)
- Easier to reason about programmatic changes
- Store actions can handle all thread logic

**Cons:**
- URL might lag behind store updates
- Deep linking requires store initialization first

#### Option 3: Unified State Machine (Recommended)
- Use a state machine pattern (e.g., XState or custom) to manage:
  - `loading` → threads loading from localStorage
  - `ready` → threads loaded, can select thread
  - `syncing` → URL and store syncing (prevent loops)
- Single effect that handles all state transitions
- Clear state transitions prevent race conditions
- URL and store always in sync through state machine

**Pros:**
- Eliminates race conditions
- Clear state transitions
- Easy to debug (can log state machine transitions)
- Handles all edge cases explicitly

**Cons:**
- Requires additional dependency or custom implementation
- More upfront complexity, but simpler long-term

### Implementation Notes

- Consider using TanStack Router's built-in search param validation and sync features
- Evaluate if Zustand middleware could help with URL synchronization
- Add comprehensive tests for edge cases before refactoring
- Document the chosen approach clearly in code comments

### Related Files
- `src/hooks/chat.hooks.ts` - Main hook with state fighting logic
- `src/stores/thread.store.ts` - Store that manages thread state
- `src/routes/chat.tsx` - Route component that uses the hook

## Chat Interface UI Enhancements

### Scrollbar Styling and Padding Improvements

#### Current State
- The `ChatConversation` component (`src/components/chat/ChatConversation.component.tsx`) uses default browser scrollbar styling via `overflow-y-auto` (line 86)
- Padding is minimal: `pl-4 pr-0 py-6` - left padding only, no right padding
- No custom scrollbar styling for better visual integration with the design system
- Scrollbar appears on the far right edge with default browser appearance

#### Proposed Improvements
1. **Custom Scrollbar Styling**
   - Add Tailwind CSS scrollbar utilities or custom CSS for styled scrollbar
   - Match scrollbar colors to theme (light/dark mode support)
   - Consider thinner, more subtle scrollbar design
   - Add hover states for better UX

2. **Improved Padding**
   - Add consistent right padding (`pr-4` or `pr-6`) to match left padding
   - Ensure messages don't touch the scrollbar edge
   - Consider responsive padding adjustments for different screen sizes
   - Add horizontal padding to `ChatInput` component for visual alignment

#### Related Files
- `src/components/chat/ChatConversation.component.tsx` - Scrollable message container (line 86)
- `src/components/chat/ChatInput.component.tsx` - Input component padding (line 36)
- `src/index.css` or `src/styles/` - Where scrollbar styling would be added

### Shadows Around Chat Interface Elements

#### Current State
- `Message` component (`src/components/chat/Message.component.tsx`) uses HeroUI Card with `shadow="sm"` (line 29)
- `ChatInput` component has no shadow - just a border-top divider (line 36)
- Overall chat interface lacks visual depth and separation from background
- Message bubbles could benefit from more prominent elevation

#### Proposed Improvements
1. **Enhanced Message Shadows**
   - Increase shadow intensity for message cards (`shadow="md"` or `shadow="lg"`)
   - Consider different shadow styles for user vs assistant messages
   - Add subtle hover effects on messages for interactivity

2. **Chat Input Shadow**
   - Add shadow to `ChatInput` container to create floating effect
   - Use `shadow-lg` or custom shadow for elevated appearance
   - Ensure shadow works well in both light and dark themes

3. **Overall Chat Container**
   - Consider adding subtle shadow to `ChatWorkspace` or `ChatPanel` containers
   - Create layered depth effect with multiple shadow levels
   - Ensure shadows don't conflict with existing HeroUI component shadows

#### Related Files
- `src/components/chat/Message.component.tsx` - Message card shadow (line 29)
- `src/components/chat/ChatInput.component.tsx` - Input container (line 36)
- `src/components/chat/ChatWorkspace.component.tsx` - Main chat container (line 22)
- `src/components/chat/ChatPanel.component.tsx` - Panel container (line 14)

## Message Deduplication Logic Cleanup

### Problem Statement

Message deduplication logic is currently duplicated across multiple locations in the codebase, making it harder to maintain and potentially inconsistent.

#### Current Duplication

1. **ChatConversation Component** (`src/components/chat/ChatConversation.component.tsx`, lines 26-37)
   - Filters messages by ID using `useMemo` hook
   - Creates a `Set` to track seen message IDs
   - Logs warnings for duplicate messages
   - Runs on every render when `currentThread?.messages` changes

2. **Thread Store - addMessage** (`src/stores/thread.store.ts`, lines 112-117)
   - Checks if message with same ID already exists before adding
   - Uses `thread.messages.some()` to check for duplicates
   - Skips adding if duplicate found, logs warning
   - Prevents duplicates at the source (when adding new messages)

3. **Thread Store - loadThreads** (`src/stores/thread.store.ts`, lines 208-222)
   - Deduplicates messages when loading from localStorage
   - Uses `Set` to track seen message IDs
   - Filters out duplicates, keeping first occurrence
   - Handles date conversion and deduplication in same pass

4. **Thread Store - saveThreads** (`src/stores/thread.store.ts`, lines 252-261)
   - Deduplicates messages before saving to localStorage
   - Uses same `Set` pattern as `loadThreads`
   - Ensures clean data before persistence

### Issues with Current Approach

1. **Code Duplication**
   - Same deduplication logic (Set-based filtering) appears in 4 different places
   - Slight variations in implementation could lead to inconsistencies
   - Changes to deduplication logic require updates in multiple files

2. **Performance Concerns**
   - `ChatConversation` deduplicates on every render (even if messages haven't changed)
   - Multiple passes over message arrays in store operations
   - Could be optimized with a single utility function

3. **Maintenance Burden**
   - Bug fixes or improvements need to be applied in multiple locations
   - Harder to ensure consistent behavior across all deduplication points
   - Testing requires checking multiple code paths

### Proposed Solution

#### Create Centralized Deduplication Utility

Create a utility function in `src/utils/thread.utils.ts`:

```typescript
/**
 * Deduplicates messages by ID, keeping the first occurrence of each ID
 * @param messages - Array of messages to deduplicate
 * @param context - Optional context string for logging (e.g., 'loadThreads', 'addMessage')
 * @returns Deduplicated array of messages
 */
export function deduplicateMessages(
  messages: ChatMessage[], 
  context?: string
): ChatMessage[]
```

#### Refactor All Locations

1. **ChatConversation Component**
   - Replace inline deduplication with utility function call
   - Keep `useMemo` for performance, but use utility inside

2. **Thread Store - addMessage**
   - Remove inline duplicate check
   - Rely on utility function if needed, or keep simple `some()` check for performance
   - Consider: is this check even necessary if we prevent duplicates at creation?

3. **Thread Store - loadThreads**
   - Replace inline deduplication with utility function
   - Pass context string for better logging

4. **Thread Store - saveThreads**
   - Replace inline deduplication with utility function
   - Pass context string for better logging

#### Additional Considerations

- **Root Cause Analysis**: Investigate why duplicates are occurring in the first place
  - Are message IDs being reused incorrectly?
  - Is there a race condition in message creation?
  - Are there issues with the streaming update logic?

- **Prevention vs. Cleanup**: Focus on preventing duplicates rather than cleaning them up
  - Ensure `generateMessageId()` always produces unique IDs
  - Add validation in `addMessage` to prevent duplicate additions
  - Consider using a Set-based data structure for messages if order isn't critical

- **Performance Optimization**: 
  - Consider if `ChatConversation` deduplication is necessary if store already prevents duplicates
  - May be able to remove component-level deduplication entirely if store is reliable

### Related Files
- `src/components/chat/ChatConversation.component.tsx` - Component-level deduplication (lines 26-37)
- `src/stores/thread.store.ts` - Store-level deduplication in 3 locations:
  - `addMessage` (lines 112-117)
  - `loadThreads` (lines 208-222)
  - `saveThreads` (lines 252-261)
- `src/utils/thread.utils.ts` - Where new utility function should be added
- `src/utils/thread.utils.ts` - `generateMessageId()` function to verify uniqueness

## Robust Error Handling in Chat Interface

### Problem Statement

The current chat interface has minimal error handling that doesn't provide a good user experience:

1. **Errors are captured but never displayed**
   - `useChatStream` hook returns `error` state, but it's never destructured or used in `ChatWorkspace`
   - All errors are only logged to console (`console.error`)
   - Users have no visibility into what went wrong

2. **No error recovery mechanisms**
   - When a stream fails, the user has no way to retry
   - Partial messages (from interrupted streams) are left in an incomplete state
   - No option to cancel and retry failed requests

3. **No error categorization**
   - All errors are treated the same (network, API, parsing, etc.)
   - No user-friendly error messages based on error type
   - No distinction between recoverable and non-recoverable errors

4. **No error boundaries**
   - No React error boundaries to catch component-level errors
   - Unhandled errors could crash the entire chat interface
   - No graceful degradation when components fail

5. **Limited error context**
   - Errors don't include context about what operation failed
   - No error metadata (timestamp, retry count, etc.)
   - Difficult to debug production issues

### Current Error Handling Gaps

#### In `useChatStream` Hook (`src/hooks/chat.hooks.ts`)
- Line 133: `error` state exists but never consumed by components
- Lines 232-247: Errors are set but only logged
- Line 242: Generic error handling doesn't categorize error types
- No retry mechanism for failed streams
- No cleanup of partial messages on error

#### In `ChatWorkspace` Component (`src/components/chat/ChatWorkspace.component.tsx`)
- Line 12: Only destructures `sendMessage` and `isStreaming`, ignores `error`
- No error display component
- No error recovery UI

#### In `chat.service.ts` (`src/services/chat.service.ts`)
- Lines 97-101: Parse errors are logged but don't notify user
- Lines 103-108: Generic error callback doesn't provide error context
- No error type classification (network vs API vs parsing)
- No retry logic for transient failures

### Proposed Improvements

#### 1. Error Display Components

Create error UI components to show errors to users:

**`ErrorBanner.component.tsx`** - Dismissible error banner at top of chat
- Shows error message with user-friendly text
- Categorizes errors (network, API, parsing)
- Includes retry button for recoverable errors
- Auto-dismisses after timeout or manual dismiss
- Uses HeroUI Alert/Card components for consistent styling

**`ErrorMessage.component.tsx`** - Inline error message in message list
- Shows error state for failed assistant messages
- Displays partial content if stream was interrupted
- Includes retry button to resend the request
- Shows error details in expandable section

**`ErrorBoundary.component.tsx`** - React error boundary wrapper
- Catches component-level errors
- Shows fallback UI instead of crashing
- Logs errors for debugging
- Provides "Reload" button to recover

#### 2. Error Type Classification

Create error type system in `src/types/chat.types.ts`:

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

#### 3. Enhanced Error Handling in Service Layer

**`chat.service.ts` improvements:**
- Classify errors by type (network, API, parsing)
- Provide error context (request details, response status)
- Return structured error objects instead of generic Error
- Add retry logic for transient failures (network errors)
- Handle partial stream completion gracefully

#### 4. Error Recovery Mechanisms

**Retry functionality:**
- Add `retry()` function to `useChatStream` hook
- Store failed message context for retry
- Implement exponential backoff for retries
- Limit retry attempts (max 3 retries)

**Partial message handling:**
- Save partial content when stream fails
- Mark messages as "failed" or "partial"
- Allow user to retry from last successful chunk
- Option to discard partial message

#### 5. User-Friendly Error Messages

Create error message mapping:

```typescript
const ERROR_MESSAGES = {
  network: "Connection error. Please check your internet connection and try again.",
  api: "The AI service is temporarily unavailable. Please try again in a moment.",
  parsing: "Received an unexpected response. Please try again.",
  aborted: "Request cancelled.",
  unknown: "An unexpected error occurred. Please try again.",
}
```

#### 6. Error Logging and Monitoring

- Log errors with context to console (development)
- Include error metadata (timestamp, error type, user action)
- Consider error tracking service integration (Sentry, etc.) for production
- Track error rates and patterns

### Implementation Plan

1. **Phase 1: Error Display**
   - Create `ErrorBanner` component
   - Update `ChatWorkspace` to display errors
   - Add error prop passing through component tree

2. **Phase 2: Error Classification**
   - Add error types to `chat.types.ts`
   - Update service layer to classify errors
   - Create error message mapping

3. **Phase 3: Error Recovery**
   - Add retry functionality to hook
   - Create retry UI components
   - Implement partial message handling

4. **Phase 4: Error Boundaries**
   - Add React error boundary wrapper
   - Wrap chat components in error boundary
   - Add fallback UI for component errors

5. **Phase 5: Enhanced Error Handling**
   - Add retry logic with exponential backoff
   - Improve error context and logging
   - Add error analytics/tracking

### Related Files
- `src/hooks/chat.hooks.ts` - Hook with error state (line 133) that's never used
- `src/components/chat/ChatWorkspace.component.tsx` - Component that ignores error state (line 12)
- `src/services/chat.service.ts` - Service layer with minimal error handling
- `src/types/chat.types.ts` - Where error types should be added
- `src/components/chat/` - Where error display components should be created

## Testing Infrastructure

### Problem Statement

The codebase currently has no automated testing infrastructure:

1. **No unit tests**
   - Hooks, stores, services, and utilities have no test coverage
   - No validation of business logic
   - Refactoring is risky without tests

2. **No integration tests**
   - No tests for component interactions
   - No tests for state management flows
   - No tests for API integration

3. **No E2E tests**
   - No browser-based testing
   - No validation of user flows
   - No testing of real user interactions

4. **No test mocking**
   - No MSW (Mock Service Worker) setup for API mocking
   - No way to test error scenarios
   - No deterministic testing of streaming responses

### Proposed Testing Strategy

#### 1. Unit Tests

**Testing Framework:** Vitest (Vite-native, fast, compatible with Vite config)

**Test Coverage Areas:**

**Hooks (`src/hooks/`):**
- `chat.hooks.ts` - Test `useChatStream` and `useThreadInitialization`
  - Message sending flow
  - Error handling
  - Stream cancellation
  - Thread initialization logic
- `dashboard.hooks.ts` - Test dashboard data hooks
  - Stats calculation
  - Chart data generation
  - Navigation handlers
- `app.hooks.ts` - Test theme and responsive hooks

**Stores (`src/stores/`):**
- `thread.store.ts` - Test thread management
  - Thread CRUD operations
  - Message management
  - localStorage persistence
  - Deduplication logic
- `auth.store.ts` - Test authentication
  - Login/logout flow
  - Auth state management
- `app.store.ts` - Test UI state

**Services (`src/services/`):**
- `chat.service.ts` - Test API communication
  - SSE streaming
  - Error handling
  - Message format conversion
  - API status checks

**Utils (`src/utils/`):**
- `thread.utils.ts` - Test utility functions
- `avatar.utils.ts` - Test avatar generation
- `auth-guard.utils.ts` - Test auth utilities

**Example Test Structure:**
```typescript
// src/hooks/__tests__/chat.hooks.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useChatStream } from '../chat.hooks'

describe('useChatStream', () => {
  it('should send message and handle streaming response', async () => {
    // Test implementation
  })
  
  it('should handle stream errors gracefully', async () => {
    // Test error handling
  })
  
  it('should allow stream cancellation', async () => {
    // Test abort functionality
  })
})
```

#### 2. Component Tests

**Testing Library:** React Testing Library (user-centric testing)

**Test Coverage Areas:**

**Chat Components:**
- `ChatWorkspace` - Test message sending, error display
- `ChatConversation` - Test message rendering, auto-scroll
- `ChatInput` - Test input handling, send button
- `Message` - Test message rendering, streaming state
- `ThreadSidebar` - Test thread selection, CRUD operations

**Layout Components:**
- `AppLayout` - Test layout structure
- `Sidebar` - Test navigation, responsive behavior
- `Header` - Test theme toggle, user menu

**Example Test Structure:**
```typescript
// src/components/chat/__tests__/ChatInput.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ChatInput } from '../ChatInput.component'

describe('ChatInput', () => {
  it('should send message on button click', () => {
    // Test implementation
  })
  
  it('should disable input during streaming', () => {
    // Test disabled state
  })
})
```

#### 3. E2E Tests

**Testing Framework:** Playwright (cross-browser, reliable, fast)

**MSW Integration:** Mock Service Worker for API mocking

**Test Coverage Areas:**

**User Flows:**
- Complete chat flow: login → create thread → send message → receive response
- Error scenarios: network errors, API failures, stream interruptions
- Thread management: create, rename, delete threads
- Theme switching: light/dark mode toggle
- Responsive behavior: mobile vs desktop layouts

**MSW Setup:**
```typescript
// src/mocks/handlers.ts
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

export const handlers = [
  http.post('*/v1/chat/completions', async ({ request }) => {
    const body = await request.json()
    // Return mocked SSE stream response
    return HttpResponse.text(
      'data: {"choices":[{"delta":{"content":"Hello"}}]}\n\n' +
      'data: {"choices":[{"delta":{"content":"!"}}]}\n\n' +
      'data: [DONE]\n\n',
      { headers: { 'Content-Type': 'text/event-stream' } }
    )
  }),
]

export const server = setupServer(...handlers)
```

**Example E2E Test:**
```typescript
// e2e/chat-flow.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Chat Flow', () => {
  test('should send message and receive AI response', async ({ page }) => {
    await page.goto('/login')
    await page.fill('[name="username"]', 'testuser')
    await page.fill('[name="password"]', 'password')
    await page.click('button[type="submit"]')
    
    await page.waitForURL('/dashboard')
    await page.click('text=Go to Chat')
    
    await page.fill('[placeholder*="message"]', 'Hello, AI!')
    await page.click('button[aria-label="Send message"]')
    
    // Wait for AI response (mocked via MSW)
    await expect(page.locator('.message')).toContainText('Hello')
  })
  
  test('should handle network errors gracefully', async ({ page }) => {
    // Test error handling with MSW error response
  })
})
```

#### 4. Test Infrastructure Setup

**Required Dependencies:**
```json
{
  "devDependencies": {
    "vitest": "^2.0.0",
    "@testing-library/react": "^16.0.0",
    "@testing-library/jest-dom": "^6.0.0",
    "@testing-library/user-event": "^14.0.0",
    "@playwright/test": "^1.40.0",
    "msw": "^2.0.0",
    "@mswjs/data": "^2.0.0"
  }
}
```

**Vitest Configuration (`vitest.config.ts`):**
```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
  },
})
```

**Playwright Configuration (`playwright.config.ts`):**
```typescript
import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  use: {
    baseURL: 'http://localhost:5173',
  },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
})
```

### Implementation Plan

1. **Phase 1: Unit Test Setup**
   - Install Vitest and testing libraries
   - Set up test configuration
   - Write tests for utilities and stores (easiest to start)

2. **Phase 2: Component Tests**
   - Set up React Testing Library
   - Write tests for chat components
   - Test user interactions

3. **Phase 3: MSW Setup**
   - Install and configure MSW
   - Create mock handlers for API endpoints
   - Set up mock SSE streaming responses

4. **Phase 4: E2E Tests**
   - Install Playwright
   - Set up E2E test configuration
   - Write critical user flow tests

5. **Phase 5: CI/CD Integration**
   - Add test scripts to package.json
   - Configure GitHub Actions or similar
   - Set up test coverage reporting

### Test Coverage Goals

- **Unit Tests:** 80%+ coverage for hooks, stores, services, utils
- **Component Tests:** 70%+ coverage for UI components
- **E2E Tests:** 100% coverage of critical user flows
- **MSW Mocks:** Mock all API endpoints, including error scenarios

### Related Files
- `package.json` - Where test dependencies should be added
- `vitest.config.ts` - Vitest configuration (to be created)
- `playwright.config.ts` - Playwright configuration (to be created)
- `src/mocks/` - MSW handlers directory (to be created)
- `src/test/` - Test utilities and setup (to be created)
- `e2e/` - E2E test directory (to be created)

## Remaining UX Enhancements

### Overview

Phase 6 from the roadmap includes several UX enhancements that are partially complete. The following items remain to be implemented:

### Auto-Scroll Improvements

**Current State:**
- Auto-scroll is implemented inline in `ChatConversation.component.tsx`
- Scrolls to bottom on new messages and during streaming
- Uses smooth scroll behavior

**Remaining Work:**
- [ ] Refactor auto-scroll logic into dedicated `use-auto-scroll.hook.ts` hook
- [ ] Detect manual scroll (don't force scroll if user has scrolled up)
- [ ] Add scroll position tracking to prevent interrupting user's reading

**Related Files:**
- `src/components/chat/ChatConversation.component.tsx` - Current inline implementation (lines 38-69)
- `src/hooks/` - Where new hook should be created

### Additional Keyboard Shortcuts

**Current State:**
- Enter to send message: ✅ Implemented
- Shift+Enter for newline: ✅ Implemented

**Remaining Work:**
- [ ] Escape key to clear input field
- [ ] Focus management after sending (auto-focus input after send)
- [ ] Tab navigation support for thread list and messages
- [ ] Cmd/Ctrl+K to focus input (optional enhancement)

**Related Files:**
- `src/components/chat/ChatInput.component.tsx` - Current keyboard handling (lines 33-38)

### Visual Polish

**Current State:**
- Typing indicator animation: ✅ Implemented with Framer Motion

**Remaining Work:**
- [ ] Message fade-in animations when messages appear
- [ ] Hover states on messages (subtle highlight on hover)
- [ ] Timestamps display (relative format: "Just now", "2m ago") - optional
- [ ] Message copy functionality (copy message text to clipboard)

**Related Files:**
- `src/components/chat/Message.component.tsx` - Where animations and hover states would be added
- `src/utils/thread.utils.ts` - `formatThreadDate()` function exists but not used in Message component

## Edge Cases & Input Validation

### Overview

Phase 7.1 from the roadmap includes edge case handling. Some items are complete, others remain:

### Current State

- ✅ Empty message prevention: Implemented in `ChatInput.component.tsx` (line 25)

### Remaining Edge Cases

**Rapid Message Sending:**
- [ ] Prevent sending multiple messages in quick succession
- [ ] Options: Queue messages or disable send button during streaming
- [ ] Consider debouncing send button clicks

**Long Message Handling:**
- [ ] Ensure long messages wrap properly
- [ ] Verify scrolling works correctly for very long messages
- [ ] Test with messages exceeding viewport height

**Input Validation:**
- [ ] Special character handling (ensure all Unicode characters work correctly)
- [ ] Maximum message length validation (e.g., 10,000 characters)
- [ ] Show character count indicator (optional)
- [ ] Handle extremely long single-line messages

**Related Files:**
- `src/components/chat/ChatInput.component.tsx` - Where validation would be added
- `src/components/chat/Message.component.tsx` - Where wrapping/scrolling would be tested

## Accessibility Improvements

### Overview

Phase 7.3 from the roadmap focuses on accessibility features for screen readers and keyboard navigation.

### Current State

- Basic keyboard support exists (Enter to send)
- Some ARIA labels may be present but not comprehensive

### Remaining Accessibility Work

**ARIA Labels:**
- [ ] Add `aria-label` to all interactive elements (buttons, inputs, thread items)
- [ ] Add `aria-describedby` for form inputs with help text
- [ ] Ensure all icons have accessible labels

**Streaming Messages:**
- [ ] Add `aria-live="polite"` region for streaming messages
- [ ] Add `aria-busy="true"` during streaming
- [ ] Announce when streaming starts/completes

**Keyboard Navigation:**
- [ ] Full keyboard navigation support for thread list
- [ ] Tab order optimization
- [ ] Escape key handling for modals and drawers
- [ ] Arrow key navigation in thread list

**Screen Reader Support:**
- [ ] Test with screen readers (NVDA, JAWS, VoiceOver)
- [ ] Ensure all dynamic content is announced
- [ ] Add skip links for main content
- [ ] Ensure proper heading hierarchy

**Related Files:**
- `src/components/chat/ChatInput.component.tsx` - Add ARIA attributes
- `src/components/chat/ChatConversation.component.tsx` - Add aria-live region
- `src/components/chat/ThreadSidebar.component.tsx` - Add keyboard navigation
- All chat components - Add ARIA labels

## Code Quality & Documentation

### Overview

Phase 8 from the roadmap focuses on code quality improvements and comprehensive documentation.

### Code Quality (Phase 8.1)

**Current State:**
- Some JSDoc comments exist but not comprehensive
- Console.logs present throughout codebase (for debugging)
- Linter warnings may exist

**Remaining Work:**
- [ ] Add JSDoc comments to all functions and components
- [ ] Remove or replace console.logs with proper logging solution
- [ ] Fix all linter warnings
- [ ] Ensure strict TypeScript compliance (verify no `any` types)
- [ ] Extract magic numbers to constants (timeouts, limits, etc.)
- [ ] Add prop validation where appropriate

**Related Files:**
- All source files in `src/` - Need JSDoc additions
- `src/hooks/chat.hooks.ts` - Has console.logs for debugging
- `src/stores/thread.store.ts` - Has console.logs for debugging
- `src/services/chat.service.ts` - Has console.logs for debugging

### Documentation (Phase 8.2)

**Current State:**
- README.md exists and is mostly up to date
- Architecture documentation exists
- API integration guide exists

**Remaining Documentation:**
- [ ] Document SSE implementation details (how streaming works internally)
- [ ] Explain secure tunnel + Netlify proxy architecture (diagrams)
- [ ] Add local development instructions (setup steps, environment variables)
- [ ] Add production deployment guide (Netlify deployment steps)
- [ ] Document design decisions (why certain patterns were chosen)
- [ ] Add troubleshooting guide (common issues and solutions)

**Related Files:**
- `docs/system/api-integration.md` - Add SSE implementation details
- `docs/system/architecture.md` - Add infrastructure diagrams
- `README.md` - Add development/deployment sections
- `docs/` - Create new documentation files as needed

