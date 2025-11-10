# API Integration Guide

*How to integrate with the Ollama LLM API*

## API Endpoint

```
https://api.joesangiorgio.com/llm/v1/chat/completions
```

## Authentication

Currently: None required (self-hosted, no API keys needed)

Future: Could add API key authentication if needed for team access

## Request Format

### Non-Streaming Request

```typescript
const response = await fetch('https://api.joesangiorgio.com/llm/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    model: 'qwen2.5:0.5b',
    messages: [
      { role: 'user', content: 'Hello!' }
    ],
  }),
});
```

### Streaming Request

```typescript
const response = await fetch('https://api.joesangiorgio.com/llm/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    model: 'qwen2.5:0.5b',
    messages: [
      { role: 'user', content: 'Hello!' }
    ],
    stream: true,
  }),
});
```

## Response Format

### Non-Streaming Response

```json
{
  "id": "chatcmpl-123",
  "object": "chat.completion",
  "created": 1762574922,
  "model": "qwen2.5:0.5b",
  "choices": [{
    "index": 0,
    "message": {
      "role": "assistant",
      "content": "Hello! How can I help you today?"
    },
    "finish_reason": "stop"
  }],
  "usage": {
    "prompt_tokens": 34,
    "completion_tokens": 10,
    "total_tokens": 44
  }
}
```

### Streaming Response (SSE)

```
data: {"id":"chatcmpl-123","object":"chat.completion.chunk","created":1762574922,"model":"qwen2.5:0.5b","choices":[{"index":0,"delta":{"role":"assistant","content":"Hello"},"finish_reason":null}]}

data: {"id":"chatcmpl-123","object":"chat.completion.chunk","created":1762574922,"model":"qwen2.5:0.5b","choices":[{"index":0,"delta":{"content":"!"},"finish_reason":null}]}

data: [DONE]
```

## TypeScript Types

```typescript
interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface ChatRequest {
  model: string;
  messages: ChatMessage[];
  stream?: boolean;
  temperature?: number;
  max_tokens?: number;
}

interface ChatCompletionChunk {
  id: string;
  object: 'chat.completion.chunk';
  created: number;
  model: string;
  choices: Array<{
    index: number;
    delta: {
      role?: 'assistant';
      content?: string;
    };
    finish_reason: string | null;
  }>;
}
```

## Example: Streaming Hook Implementation

```typescript
export function useStreamingMessage() {
  const [streamedContent, setStreamedContent] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const streamMessage = async (messages: ChatMessage[]) => {
    abortControllerRef.current = new AbortController();
    setIsStreaming(true);
    setStreamedContent('');

    try {
      const response = await fetch(
        'https://api.joesangiorgio.com/llm/v1/chat/completions',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: 'qwen2.5:0.5b',
            messages,
            stream: true,
          }),
          signal: abortControllerRef.current.signal,
        }
      );

      const reader = response.body!.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') {
              setIsStreaming(false);
              break;
            }

            const parsed: ChatCompletionChunk = JSON.parse(data);
            const content = parsed.choices[0]?.delta?.content;
            if (content) {
              setStreamedContent(prev => prev + content);
            }
          }
        }
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Streaming error:', error);
      }
      setIsStreaming(false);
    }
  };

  const abort = () => {
    abortControllerRef.current?.abort();
    setIsStreaming(false);
  };

  return { streamedContent, isStreaming, streamMessage, abort };
}
```

## Error Handling

### Network Errors
- Connection timeout
- Network unavailable

### API Errors
- Model not found
- Invalid request format
- Rate limiting (if implemented)

### Streaming Errors
- Stream interruption
- Malformed SSE data
- Abort signal

## Rate Limiting

**Current:** No rate limiting (self-hosted)

**Considerations:**
- Home server has resource constraints
- Model is tiny (qwen2.5:0.5b) - fast responses
- Mention in README, no programmatic limits needed

## Cost

- **API calls:** Free (self-hosted)
- **Compute:** Existing home server
- **Storage:** ~400MB for model
- **Network:** Included in home internet

## Testing

### Manual Testing
```bash
# Test model endpoint
curl https://api.joesangiorgio.com/llm/api/tags

# Test chat endpoint (non-streaming)
curl -X POST https://api.joesangiorgio.com/llm/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{"model":"qwen2.5:0.5b","messages":[{"role":"user","content":"Hello!"}]}'

# Test streaming
curl -X POST https://api.joesangiorgio.com/llm/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{"model":"qwen2.5:0.5b","messages":[{"role":"user","content":"Hello!"}],"stream":true}'
```

### Future: E2E Testing
- Use Playwright for browser testing
- MSW for CI/CD deterministic tests
- Record/replay for staging environment

---

**Last Updated:** November 8, 2025  
**Status:** Active documentation  
**Related:** `docs/OLLAMA-API-SETUP.md`, `docs/system/architecture.md`

