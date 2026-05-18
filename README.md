# Cloudflare AI - Interactive Visual Demos

An interactive, modular frontend web application that visualizes Cloudflare's AI platform across two categories — **AI Security** (UC1–UC7) and **AI Builder** (UC8–UC16) — plus a featured **Reference Architecture (UC0)** that combines every layer into one end-to-end walkthrough of how Cloudflare runs AI Code Review and its full internal AI engineering stack on its own products.

Each use case features a step-through request-flow diagram showing how requests travel through Cloudflare's stack, with per-step explanations of which product acts and why.

The site has a three-tier landing model:

- `/` — top-level page; features the **UC0 Reference Architecture** hero card above the two category cards
- `/ai-security` — 7 AI security use cases (UC1–UC7)
- `/ai-builder` — 9 AI builder use cases (UC8–UC16), grouped into **Developing with AI** (UC8–UC9) and **Building AI Applications** (UC10–UC16)

## UC0 Reference Architecture (Featured)

**Cloudflare's Internal AI Engineering Stack** — the comprehensive end-to-end walkthrough that combines elements from every other UC into a single coherent reference architecture. Mirrors the two Agents Week blog posts and integrates the Project Think Execution Ladder, Sandbox SDK GA, Outbound Workers, MCP Server Portals with Code Mode, and Agent Memory.

- Page: `/use-cases/uc0-internal-stack`
- 16 steps · 17 nodes · 20 edges
- Stats valid for: 30-day window, March 10 – April 9, 2026 (as of April 2026)
- Sources: [AI Code Review](https://blog.cloudflare.com/ai-code-review/) · [Internal AI Engineering Stack](https://blog.cloudflare.com/internal-ai-engineering-stack/) · [Project Think](https://blog.cloudflare.com/project-think/) · [Sandbox GA](https://blog.cloudflare.com/sandbox-ga/) · [Dynamic Workers](https://blog.cloudflare.com/dynamic-workers/) · [Enterprise MCP](https://blog.cloudflare.com/enterprise-mcp/) · [Agent Memory](https://blog.cloudflare.com/introducing-agent-memory/) · [Project Glasswing](https://blog.cloudflare.com/cyber-frontier-models/)

### Headline numbers (verified against the source blog posts)

| Metric | Value |
|--------|-------|
| Internal users | **3,683** (60% company-wide, 93% of R&D) |
| AI Code Review runs (30 days) | 131,246 across 48,095 MRs in 5,169 repos |
| Avg cost per review | **$1.19** ($0.98 median · $4.45 P99) |
| Cache hit rate | **85.7%** |
| MR velocity | **+58%** weekly (~5,600 → 8,700+; peak 10,952) |
| Tokens through AI Gateway | 241.37B (30 days) |
| Tokens on Workers AI | 51.83B (30 days) |
| Code Mode token reduction | 52 tools → 2 portal tools = **94% fewer tokens** |
| Break-glass override rate | 0.6% (288 / 48,095 MRs) |

## AI Security Use Cases

### Secure AI Usage & Applications

| # | Use Case | Cloudflare Products |
|---|----------|-------------------|
| 1 | **Secure Workforce Use of GenAI** | Gateway, Access, DLP (AI Prompt Protection), RBI, CASB, AI Gateway (Secrets Store, Unified Billing) |
| 2 | **Govern AI Agents** | Access (OAuth 2.1, MCP Server Portals), DLP for MCP, Agents SDK (McpAgent), Workers |
| 3 | **Build Securely with AI** | AI Gateway (Caching, Rate Limiting, Guardrails, DLP, Dynamic Routing, Secrets Store, Unified Billing), Workers |
| 4 | **Protect AI-Powered Apps** | DDoS Protection, Bot Management, WAF (Sensitive Data Detection), Rate Limiting, AI Security for Apps, API Shield |

### Secure AI Infrastructure & Agents

| # | Use Case | Cloudflare Products |
|---|----------|-------------------|
| 5 | **Secure Self-Hosted AI Agents** | Access, Sandbox SDK, AI Gateway, Secrets Store, Browser Run, R2, Workers |
| 6 | **Secure AI Code Execution** | Dynamic Workers (Worker Loader), Codemode, Workers RPC, AI Gateway, Agents SDK |
| 7 | **Secure AI-to-AI Communication** | Agents SDK (Durable Objects), Access + mTLS, MCP Server Portals, Workflows, AI Search, Queues |

## AI Builder Use Cases

### Developing with AI

| # | Use Case | Cloudflare Products |
|---|----------|-------------------|
| 8 | **API Key Management & Unified Billing** | AI Gateway (BYOK, Unified Billing, Spend Limits, Zero Data Retention), Secrets Store, Logpush |
| 9 | **Dynamic Routing** | AI Gateway (Dynamic Routing, Conditional / Percentage / Rate / Budget nodes, BYOK fallback chains, Analytics) |

### Building AI Applications

| # | Use Case | Cloudflare Products |
|---|----------|-------------------|
| 10 | **RAG Knowledge Base** | AI Search (AutoRAG), Vectorize, Workers AI, Workers, AI Gateway |
| 11 | **Voice AI Agent** | Agents SDK (`@cloudflare/voice`, `withVoice`), Workers AI (Deepgram Flux STT, Aura-1 TTS), Durable Objects, Twilio adapter |
| 12 | **Persistent AI Chat Agent** | Agents SDK (`AIChatAgent`, `useAgentChat`), Durable Objects (SQLite state, resumable streams), Workers AI |
| 13 | **Scheduled AI Agent** | Agents SDK (`this.schedule()`, cron / datetime / interval), Durable Object alarms, Workers AI |
| 14 | **Browser AI Agent** | Agents SDK (`createBrowserTools()`), Browser Run (Chrome DevTools Protocol), R2, Workers AI |
| 15 | **Private Networking for Agents** | Cloudflare Mesh (formerly WARP Connector), Cloudflare One Client, Workers VPC binding, Gateway / Access / DLP / device posture |
| 16 | **Durable Long-Running Agents** | Project Think (`@cloudflare/think`), Durable Objects + fibers, Sessions API, Sub-agents (Facets), Execution Ladder (Workspace · Isolate · npm · Browser Run · Sandbox SDK), Self-authored extensions |

## How It Works

Each use case presents an interactive diagram with three spatial columns:

- **Left** — Origin actors (human users, AI agents, devices)
- **Center** — Cloudflare control plane (product-specific nodes)
- **Right** — Destination resources (AI services, APIs, internal apps)

Users can:
- **Play** through the flow automatically or step manually with arrow keys
- **Click any node** to see a tooltip with product description and documentation link
- **Read the side panel** for each step's title, acting product, description, "why it matters" context, and OWASP risk mappings

Flow archetypes visualized across the 17 walkthroughs:

1. **Human → AI** — User-initiated requests flowing through Cloudflare controls to AI services (UC1, UC4, UC10, UC11, UC12)
2. **Agentic AI → Resources** — AI-agent-initiated calls flowing through Cloudflare to downstream APIs, data, or tools (UC2, UC5, UC13, UC14, UC15)
3. **Agent → Agent** — AI-to-AI orchestration with identity, durable execution, and shared infrastructure (UC6, UC7, UC16)
4. **App / Developer → AI Provider** — Application code and developer tooling calling AI providers through a managed gateway (UC3, UC8, UC9)
5. **Reference architecture** — Engineer → CI → entire AI Engineering Stack → MR comment (UC0)

## Project Structure

```
src/
  index.html                          Top-level page (UC0 hero + 2 category cards)
  ai-security.html                    AI Security category landing (UC1–UC7)
  ai-builder.html                     AI Builder category landing (UC8–UC16)
  use-cases/
    uc0-internal-stack.html           UC0: Cloudflare's Internal AI Engineering Stack
    uc1-genai-workforce.html          UC1: Secure Workforce Use of GenAI
    uc2-govern-agents.html            UC2: Govern AI Agents (MCP)
    uc3-build-with-ai.html            UC3: Build Securely with AI
    uc4-protect-ai-apps.html          UC4: Protect AI-Powered Apps
    uc5-self-hosted-agents.html       UC5: Secure Self-Hosted AI Agents
    uc6-code-execution.html           UC6: Secure AI Code Execution
    uc7-multi-agent.html              UC7: Secure AI-to-AI Communication
    uc8-unified-billing.html          UC8: API Key Management & Unified Billing
    uc9-dynamic-routing.html          UC9: Dynamic Routing
    uc10-rag.html                     UC10: RAG Knowledge Base
    uc11-voice-agent.html             UC11: Voice AI Agent
    uc12-ai-chat.html                 UC12: Persistent AI Chat Agent
    uc13-scheduled-agent.html         UC13: Scheduled AI Agent
    uc14-browser-agent.html           UC14: Browser AI Agent
    uc15-private-networking.html      UC15: Private Networking for Agents
    uc16-durable-agents.html          UC16: Durable Long-Running Agents
  components/
    flow-engine.js                    Shared step-through animation controller
    tooltip.js                        Per-node contextual overlay
    legend.js                         Product legend renderer
  styles/
    base.css                          Reset, typography, utilities
    theme.css                         Design tokens (Cloudflare orange #F38020)
    diagram.css                       Diagram layout, nodes, edges, panel
  data/
    uc0-stack-steps.js  …  uc16-steps.js
                                      Nodes, edges, and step definitions for each UC
  sitemap.xml, robots.txt, site.webmanifest, favicon.*, og-image.png
wrangler.jsonc                        Cloudflare Workers Static Assets config
package.json
```

## Architecture

- **Vanilla JS** — No frameworks, no build step. ES modules loaded natively in the browser.
- **Modular** — Adding a new use case requires only a new `ucN-steps.js` data file, a new HTML page, and a card on the appropriate category landing page. Zero changes to the shared engine.
- **FlowEngine** is fully reusable: feed it `{ steps, nodes, edges }` and it renders the complete interactive diagram with SVG edge paths, animated packet dots, and step-through controls.
- **Clean URLs** — Internal navigation links use extensionless paths (e.g. `/ai-security`, `/use-cases/uc0-internal-stack`). Cloudflare Workers Static Assets `html_handling: "auto-trailing-slash"` (default) serves `src/foo.html` directly at `/foo` — canonical URLs, sitemap entries, and back-links all point to the non-redirecting form.

## Deployment

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/DavidJKTofan/cf-ai-security-visual-demo)

This project deploys as a purely static site via [Cloudflare Workers Static Assets](https://developers.cloudflare.com/workers/static-assets/). No Worker script is needed — Wrangler serves the `src/` directory directly from Cloudflare's edge network.

```jsonc
// wrangler.jsonc
{
  "name": "cf-ai-security-visual-demo",
  "compatibility_date": "2026-03-01",
  "assets": {
    "directory": "./src"
  }
}
```

### Commands

```bash
npm install         # Install dependencies (wrangler)
npm run dev         # Start local development server
npm run deploy      # Deploy to Cloudflare Workers
```

## Design System

| Token | Value | Usage |
|-------|-------|-------|
| Primary | `#F38020` | Cloudflare-like orange — active elements, CTAs, featured hero |
| Background | `#0d1117` | Dark theme background |
| User nodes | `#3B82F6` | Users, devices |
| Cloudflare nodes | `#F38020` | Cloudflare products |
| AI Service nodes | `#10B981` | External AI providers |
| Resource nodes | `#8B5CF6` | APIs, databases, internal services |
| Coming Soon | `#EAB308` | Features in development |
| Font | Inter / system-sans | |

## OWASP Framework Mappings

Each use case step includes OWASP risk labels in the step info panel, mapping Cloudflare products to the specific threats they mitigate. Two frameworks are referenced:

### OWASP Top 10 for LLMs 2025

The industry-standard risk taxonomy for Large Language Model applications. Labels use the format `LLM01:2025 Prompt Injection`.

- Official page: https://genai.owasp.org/llm-top-10/
- Full document: https://genai.owasp.org/resource/owasp-top-10-for-llm-applications-2025/

### OWASP Top 10 for Agentic Applications 2026

Covers risks specific to autonomous AI agent systems — tool misuse, identity abuse, supply chain attacks, and cascading failures. Labels use the format `ASI01 Agent Goal Hijack`.

- Official page: https://genai.owasp.org/resource/owasp-top-10-for-agentic-applications-for-2026/

UC2 and UC7 carry the most ASI labels as the primary agentic use cases. UC5, UC6, UC14, and UC16 map sandbox / browser / execution-ladder primitives to ASI05 (Unexpected Code Execution). UC13 and UC11 surface ASI10 (Rogue Agents) for autonomous and long-lived agent behavior. UC15 maps Mesh + Cloudflare One controls to ASI02 (Tool Misuse) and ASI03 (Identity & Privilege Abuse). UC0 inherits the most comprehensive set of mappings across both frameworks.

## References

> Use [Cloudflare MCP Servers](https://developers.cloudflare.com/agents/model-context-protocol/mcp-servers-for-cloudflare/) for better LLM research and accuracy.

**Agents Week — UC0 sources**
- [Orchestrating AI Code Review at scale](https://blog.cloudflare.com/ai-code-review/)
- [The AI engineering stack we built internally](https://blog.cloudflare.com/internal-ai-engineering-stack/)
- [Project Think: building the next generation of AI agents](https://blog.cloudflare.com/project-think/)
- [Agents have their own computers with Sandboxes GA](https://blog.cloudflare.com/sandbox-ga/)
- [Sandboxing AI agents, 100x faster (Dynamic Workers)](https://blog.cloudflare.com/dynamic-workers/)
- [Dynamic, identity-aware, and secure Sandbox auth](https://blog.cloudflare.com/sandbox-auth/)
- [Scaling MCP adoption — Enterprise MCP reference architecture](https://blog.cloudflare.com/enterprise-mcp/)
- [Safe in the sandbox — V8 + MPK hardening](https://blog.cloudflare.com/safe-in-the-sandbox-security-hardening-for-cloudflare-workers/)
- [Introducing Agent Memory](https://blog.cloudflare.com/introducing-agent-memory/)
- [Securing non-human identities — scannable tokens, OAuth, scoped RBAC](https://blog.cloudflare.com/improved-developer-security/)
- [Project Glasswing — what Mythos showed us (cyber frontier models)](https://blog.cloudflare.com/cyber-frontier-models/) — sibling harness pattern applied to deep vulnerability research

**AI Security**
- [Cloudflare AI Security](https://www.cloudflare.com/ai-security/)
- [Holistic AI Security Learning Path](https://developers.cloudflare.com/learning-paths/holistic-ai-security/concepts/)
- [AI Security for Apps](https://developers.cloudflare.com/waf/detections/ai-security-for-apps/)
- [Cloudflare One AI Security Analytics](https://developers.cloudflare.com/cloudflare-one/insights/analytics/ai-security/)

**AI Gateway & Agents**
- [AI Gateway Documentation](https://developers.cloudflare.com/ai-gateway/)
- [AI Gateway Worker Binding Methods](https://developers.cloudflare.com/ai-gateway/integrations/worker-binding-methods/)
- [AI Gateway Unified Billing](https://developers.cloudflare.com/ai-gateway/features/unified-billing/)
- [AI Gateway BYOK (Secrets Store)](https://developers.cloudflare.com/ai-gateway/configuration/bring-your-own-keys/)
- [AI Gateway Dynamic Routing](https://developers.cloudflare.com/ai-gateway/features/dynamic-routing/)
- [Agents SDK](https://developers.cloudflare.com/agents/)
- [MCP Server Portals](https://developers.cloudflare.com/cloudflare-one/access-controls/ai-controls/mcp-portals/)

**Developer Platform**
- [Dynamic Workers](https://developers.cloudflare.com/dynamic-workers/)
- [Codemode](https://developers.cloudflare.com/agents/api-reference/codemode/)
- [Sandbox SDK](https://developers.cloudflare.com/sandbox/) · [GitHub](https://github.com/cloudflare/sandbox-sdk) · [Try it](https://sandbox.cloudflare.com/)
- [Workflows](https://developers.cloudflare.com/workflows/)
- [AI Search](https://developers.cloudflare.com/ai-search/)
- [Vectorize](https://developers.cloudflare.com/vectorize/)
- [Workers AI](https://developers.cloudflare.com/workers-ai/)
- [Durable Objects](https://developers.cloudflare.com/durable-objects/)
- [Browser Run (CDP)](https://developers.cloudflare.com/browser-rendering/)
- [R2 Object Storage](https://developers.cloudflare.com/r2/)
- [Workers VPC + Cloudflare Mesh](https://developers.cloudflare.com/workers-vpc/)

**Agents SDK — UC8–UC16 primitives**
- [Voice Agents (`@cloudflare/voice`)](https://developers.cloudflare.com/agents/api-reference/voice/)
- [Chat Agents (`AIChatAgent`, `useAgentChat`)](https://developers.cloudflare.com/agents/api-reference/chat-agents/)
- [Schedule Tasks](https://developers.cloudflare.com/agents/api-reference/schedule-tasks/)
- [Browse the Web](https://developers.cloudflare.com/agents/api-reference/browse-the-web/)
- [Durable Execution (fibers)](https://developers.cloudflare.com/agents/api-reference/durable-execution/)
- [Sub-agents (Facets)](https://developers.cloudflare.com/agents/api-reference/sub-agents/)
- [Sessions API](https://developers.cloudflare.com/agents/api-reference/sessions/)
- [Human-in-the-Loop](https://developers.cloudflare.com/agents/concepts/human-in-the-loop/)

**Infrastructure**
- [Workers Static Assets](https://developers.cloudflare.com/workers/static-assets/)
- [Ruleset Engine Phases](https://developers.cloudflare.com/ruleset-engine/reference/phases-list/)
- [mTLS on Cloudflare](https://developers.cloudflare.com/learning-paths/mtls/concepts/mtls-cloudflare/)
- [Service Tokens](https://developers.cloudflare.com/cloudflare-one/access-controls/service-credentials/service-tokens/)
- [Moltworker Blog Post](https://blog.cloudflare.com/moltworker-self-hosted-ai-agent/)

**OWASP Frameworks**
- [OWASP Top 10 for LLMs 2025](https://genai.owasp.org/llm-top-10/)
- [OWASP Top 10 for Agentic Applications 2026](https://genai.owasp.org/resource/owasp-top-10-for-agentic-applications-for-2026/)

* * *

## Disclaimer

**This project is for educational and demonstration purposes only.**

It is not affiliated with, endorsed by, or officially associated with Cloudflare, Inc. All product names, logos, and brands referenced are property of their respective owners. The information presented in the diagrams is based on publicly available documentation and may not reflect the most current product capabilities or configurations. Always refer to the [official Cloudflare documentation](https://developers.cloudflare.com/) for authoritative and up-to-date information.
