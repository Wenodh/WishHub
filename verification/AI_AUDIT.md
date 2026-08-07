# AI Audit

## 1. Provider Abstraction & Pipeline
The AI package (`packages/ai`) uses a provider abstraction interface `AIProvider` to isolate vendor-specific code from core business logic.

```
packages/ai/src/
├── index.ts
├── types.ts          # Zod contract schemas & interfaces
├── prompts.ts        # System prompts & structures
├── providers.ts      # MockAIProvider & OpenAIProvider
└── similarity.ts     # Title distance calculations
```

### Strengths
- **Clean Interface Decoupling**: Business logic interacts with AI through a generic wrapper, making it easy to swap model providers (e.g. OpenAI to Anthropic or Gemini) without modifying upstream services.
- **Cost & Token Logging**: The `OpenAIProvider` tracks token consumption and estimated request costs, persisting these metrics inside the `AIJob` table.

---

## 2. Vulnerability & Risk Analysis

### Risk 1: Prompt Validation Flaws
- **Observation**: The product extraction payload is injected directly into system prompts. This presents a risk of **Prompt Injection** if a product contains malicious title or description data designed to alter the model's output.
- **Remediation**: Sanitize the title and metadata strings before formatting system prompts, and use OpenAI's Structured Outputs or developer prompt blocks to enforce output schemas.

### Risk 2: Missing Rate Limit & Concurrency Backoff
- **Observation**: High-concurrency operations (such as bulk-categorizing a user's collection) could exceed upstream API rate limits, leading to failed requests.
- **Remediation**: Implement exponential backoff retry logic using packages like `p-retry` or `p-queue` to safely throttle concurrent AI operations.

---

## 3. Alternative Providers Roadmap
The `packages/ai` architecture can be easily extended to support other providers:
- **Anthropic**: Implement an `AnthropicProvider` that maps the structured JSON request schema to Claude's Tool Use API.
- **Gemini**: Implement a `GeminiProvider` using Google's generative AI client library.
- **Local Models**: Implement a local fallback provider using `Ollama` or `ONNX` runtimes for offline or privacy-focused environments.
