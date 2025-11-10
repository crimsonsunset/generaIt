# System Architecture

*Technical architecture documentation for the chatbot interface project*

## Overview

This document describes the technical architecture, design decisions, and system components.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│  React App (test-starter)                               │
│  - TanStack Router (file-based routing)                  │
│  - HeroUI Components                                     │
│  - Zustand (state management)                            │
│  - TanStack Query (server state)                         │
└──────────────────┬──────────────────────────────────────┘
                    │ POST to /llm/v1/chat/completions
                    ▼
┌─────────────────────────────────────────────────────────┐
│  api.joesangiorgio.com (Netlify Proxy)                  │
│  - Hides internal infrastructure                        │
│  - SSL/HTTPS                                             │
└──────────────────┬──────────────────────────────────────┘
                    │ proxies to
                    ▼
┌─────────────────────────────────────────────────────────┐
│  llm.joe-hassio.com (Cloudflare Tunnel)                 │
│  - Secure encrypted connection                          │
│  - External access to local server                      │
└──────────────────┬──────────────────────────────────────┘
                    │ routes to
                    ▼
┌─────────────────────────────────────────────────────────┐
│  Ollama Container (Home Assistant Docker)               │
│  - Port: 11434                                           │
│  - Model: qwen2.5:0.5b                                   │
│  - OpenAI-compatible API                                 │
└─────────────────────────────────────────────────────────┘
```

## Technology Stack

### Frontend
- **React 19** - Latest React with modern features
- **TypeScript 5.8** - Strict type safety
- **Vite 7** - Build tool and dev server
- **TanStack Router 1.x** - Type-safe file-based routing
- **HeroUI 2.x** - React component library
- **Tailwind CSS 3.x** - Utility-first CSS
- **Zustand 5.x** - Lightweight state management
- **TanStack Query 5.x** - Data fetching and caching

### Infrastructure
- **Docker** - Container management (Home Assistant)
- **Cloudflare Tunnel** - Secure external access
- **Netlify** - Static hosting and proxy
- **Ollama** - Self-hosted LLM runtime

## Design Decisions

### Why Real API Instead of Mocks?
- Demonstrates infrastructure knowledge
- Shows production-ready patterns
- More impressive for demos/interviews
- Saves 60-90 minutes of setup time

### Why TanStack Router?
- Type-safe routing with full TypeScript inference
- File-based routing for intuitive structure
- Built-in code splitting

### Why Zustand?
- Minimal boilerplate
- No context provider needed
- Great TypeScript support
- Tiny bundle size (~1KB)

## Data Flow

1. User Input → User types message and clicks send
2. Chat Hook → Adds user message to Zustand store
3. Streaming Hook → Fetches from `api.joesangiorgio.com/llm/v1/chat/completions`
4. SSE Parsing → Parses streaming chunks character-by-character
5. UI Update → React re-renders with streaming text
6. Completion → Stream ends, message finalized in store

## Security Considerations

- **Layered Access**: Netlify proxy → Cloudflare Tunnel → Docker container
- **No Direct Exposure**: Ollama API not exposed directly to internet
- **HTTPS Only**: All external traffic encrypted
- **Self-Hosted**: No third-party API costs or data sharing

## Performance Considerations

- **Client-Side Caching**: TanStack Query with 5-minute stale time
- **Memoization**: React.useMemo for expensive calculations
- **Virtual Scrolling**: For large message lists (future)
- **Streaming**: Character-by-character for perceived performance

## Future Enhancements

- IndexedDB for persistent local caching
- Web Workers for background processing
- Server-side caching (Redis) for team features
- E2E testing with Playwright + MSW for CI/CD

---

**Last Updated:** November 8, 2025  
**Status:** Active documentation  
**Related:** `docs/roadmap.md`, `docs/OLLAMA-API-SETUP.md`

