# Chatbot Interface

A modern, type-safe chatbot interface built with React, TypeScript, and TanStack Router. Features character-by-character SSE streaming, real Ollama LLM integration, and production-ready architecture patterns.

## 🚀 Tech Stack

### Core Framework
- **React 19** - Latest React with modern features
- **TypeScript 5.8** - Strict type safety throughout
- **Vite 7** - Lightning-fast build tool and dev server
- **TanStack Router 1.x** - Type-safe file-based routing

### UI & Styling
- **HeroUI 2.x** - Beautiful React component library (formerly NextUI)
- **Tailwind CSS 4.x** - Utility-first CSS framework
- **Heroicons** - Icon library for React (official Tailwind CSS icons)
- **Framer Motion** - Animation library (required by HeroUI)
- **Recharts** - Charting library for data visualization (dashboard usage chart)

### State & Data Management
- **Zustand 5.x** - Lightweight state management for chat state and UI preferences
- **TanStack Query 5.x** - Powerful data fetching and caching (ready to use)
- **Axios 1.x** - HTTP client for API calls (ready to use)

### Streaming & Infrastructure
- **Real Ollama API** - Self-hosted LLM at `api.joesangiorgio.com/llm/*`
- **OpenAI-Compatible Endpoint** - `/v1/chat/completions` with SSE streaming
- **@microsoft/fetch-event-source** - SSE streaming library with POST support
- **Secure Tunnel** - External access to local server
- **Netlify Proxy** - Hides internal infrastructure behind `api.joesangiorgio.com`
- **Model:** qwen2.5:0.5b (tiny, resource-efficient LLM)

### Development Tools
- **ESLint 9** - Code quality and consistency
- **TypeScript ESLint** - TypeScript-specific linting rules
- **Vite Plugin React** - Fast refresh and HMR

## ✨ Features

### Implemented
✅ **Authentication System** - Login/logout with route guards and user sessions  
✅ **Dashboard Layout** - Sidebar navigation with theme toggle and user avatar  
✅ **Full Routing System** - File-based routing with TanStack Router  
✅ **Dark/Light Theme** - Seamless theme switching with HeroUI provider  
✅ **Responsive Layout** - Mobile-friendly design with drawer sidebar on small screens  
✅ **Type-Safe Navigation** - Full TypeScript inference for routes and navigation  
✅ **Path Aliases** - Clean imports using `@stores`, `@components`, etc.  
✅ **Production API** - Real Ollama LLM API deployed and working  
✅ **Font Loading** - Self-hosted fonts via npm (@fontsource)  
✅ **Chatbot Components** - Complete chat interface with thread management, message display, and input  
✅ **SSE Streaming** - Character-by-character streaming with @microsoft/fetch-event-source  
✅ **Thread Management** - Multi-thread support with localStorage persistence and URL deep linking  
✅ **Chat UI** - User and AI message bubbles with typing indicators and empty states  
✅ **Auto-Scroll** - Automatic scrolling to bottom on new messages  
✅ **Keyboard Shortcuts** - Enter to send message, Shift+Enter for newline  
✅ **Empty Message Prevention** - Validation to prevent sending empty messages  
✅ **Typing Indicator** - Animated dots during streaming (Framer Motion)

## 📁 Project Structure

```
test-starter/
├── src/
│   ├── routes/              # File-based routing (TanStack Router)
│   ├── components/          # Reusable React components
│   │   ├── chat/          # Chat interface components
│   │   ├── dashboard/     # Dashboard widgets
│   │   ├── layout/        # App layout components
│   │   └── auth/          # Authentication components
│   ├── hooks/              # Custom React hooks
│   ├── stores/             # Zustand state management
│   ├── types/              # TypeScript type definitions
│   ├── assets/             # Static assets
│   └── utils/              # Helper functions
├── docs/                   # Project documentation
└── public/                 # Public static files
```

### Path Aliases
All top-level `src` directories use path aliases for clean imports:

```typescript
import { useAppStore } from '@stores/app.store'
import { ChatPanel } from '@components/chat/ChatPanel.component'
import { ChatMessage } from '@types/chat.types'
```

### File Naming Convention
- **Components**: `PascalCase.component.tsx` (e.g., `ChatPanel.component.tsx`)
- **Hooks**: `kebab-case.hooks.ts` (e.g., `chat.hooks.ts`)
- **Stores**: `kebab-case.store.ts` (e.g., `app.store.ts`)
- **Types**: `kebab-case.types.ts` (e.g., `chat.types.ts`)
- **Routes**: `kebab-case.tsx` (TanStack Router convention)

## 🛠️ Getting Started

### Prerequisites
- Node.js 18+ and npm

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint
```

### Development Server
The app runs at `http://localhost:5173` with hot module replacement enabled.

## 🏗️ Architecture Decisions

### State Management Strategy
- **Zustand** for private global state (chat messages, UI preferences)
- **Component State** for temporary UI state (input, loading states)
- **React Query** for server state (API calls, caching)

### Why TanStack Router?
- **Type-safe routing** with full TypeScript inference
- **File-based routing** for intuitive project structure
- **Built-in code splitting** for optimal performance

### Why Zustand?
- **Minimal boilerplate** compared to Redux
- **No context provider** needed
- **Great TypeScript support** with full type inference
- **Tiny bundle size** (~1KB)

## 🔄 Data Flow

1. **User Input** → User types message and clicks send
2. **Chat Hook** → Adds user message to Zustand store
3. **Streaming Hook** → Fetches from `api.joesangiorgio.com/llm/v1/chat/completions`
4. **SSE Parsing** → Parses streaming chunks character-by-character
5. **UI Update** → React re-renders with streaming text
6. **Completion** → Stream ends, message finalized in store

## 🎨 Theming

The app uses HeroUI's theming system with full support for:
- Light and dark color schemes via CSS classes on html element
- Consistent component styling across themes
- Persistent theme preference in Zustand store

Toggle theme via the theme toggle button in the header.

## 📝 Documentation

Additional documentation can be found in the `docs/` directory:
- **[roadmap.md](./docs/roadmap.md)** - Feature roadmap and implementation phases
- **[INDEX.md](./docs/INDEX.md)** - Documentation directory and navigation
- **[system/architecture.md](./docs/system/architecture.md)** - Technical architecture and design decisions
- **[system/api-integration.md](./docs/system/api-integration.md)** - Ollama API integration guide with examples

## 🔮 Roadmap

See [docs/roadmap.md](./docs/roadmap.md) for the full feature roadmap and implementation phases.

**Current Status**: Phases 0-5 complete! ✅ Auth, Dashboard, API, Chat Route, Thread Management, SSE Streaming, and Chat UI Components all implemented. Phase 6 partially complete (auto-scroll, Enter key, typing animation, empty message prevention).  
**Next Phase**: Complete remaining UX enhancements, edge cases, error handling, accessibility, and documentation  
**Timeline**: ~2-3 hours remaining for polish and edge cases

## 📄 License

This project is private and not licensed for public use.
