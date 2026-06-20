# Cloudflare AI Security Visual Demo

Unofficial educational demo for explaining where Cloudflare AI security, Zero Trust, and Developer Platform controls fit across common AI usage paths.

The site is a static-first Cloudflare Workers project with vanilla HTML, CSS, and JavaScript. It includes an interactive decision map plus 17 step-through use-case walkthroughs.

## Pages

- `/decision-map` — interactive guide for choosing the right Cloudflare control by AI traffic path, including a full customer architecture route map.
- `/` — landing page with the decision map, featured reference architecture, and category links.
- `/ai-security` — AI Security use cases UC1-UC7.
- `/ai-builder` — AI Builder use cases UC8-UC16.
- `/use-cases/uc0-internal-stack.html` — featured reference architecture for Cloudflare's internal AI engineering stack.

## Decision Map

The decision map answers when to use each major control:

- **AI Gateway** — LLM/API traffic from CLIs, coding agents, apps, Workers, or gateways that can set a provider endpoint.
- **Secure Web Gateway** — employee Internet-bound traffic to web AI tools such as ChatGPT, Claude, Gemini, and Perplexity.
- **MCP Server Portal** — MCP-capable clients and agents that need approved tools, identity, audit, and optional Gateway routing.
- **CASB** — out-of-band API checks of SaaS provider posture and stored AI content.
- **AI Security for Apps** — public-facing AI application hostnames protected through Cloudflare's reverse proxy.
- **Developer Platform** — custom AI apps, Workers, Agents SDK, Remote MCP Servers, Durable Objects, and related primitives.
- **Workers VPC** — Worker and agent access to private networks, Cloudflare Mesh, and governed public egress.

The bottom of `/decision-map` includes route lanes for request, response, and out-of-band flows:

- Web AI: employee device -> Secure Web Gateway -> DLP / AI Prompt Protection -> web AI SaaS.
- LLM/API: CLI, app, or agent -> AI Gateway -> Workers AI or external LLM providers.
- MCP tools: MCP client -> Access + MCP Server Portal -> optional Gateway routing + DLP -> Remote MCP Servers.
- Public hostname: public user or attacker -> WAF + AI Security for Apps -> Workers + Agents SDK -> models and tools.
- Private access: Worker agent -> Workers VPC -> Gateway policies -> private and public services.
- CASB: security team / CASB -> provider API integration -> SaaS tenant findings.

## Use Cases

| UC | Title | Category | Primary products |
| --- | --- | --- | --- |
| UC0 | Cloudflare's Internal AI Engineering Stack | Reference Architecture | Access, Workers, AI Gateway, Workers AI, MCP Server Portal, Code Mode, Agents SDK, Logpush |
| UC1 | Secure Workforce Use of GenAI | AI Security | Gateway, Access, DLP, RBI, CASB, AI Gateway |
| UC2 | Govern AI Agents & MCP | AI Security | MCP Server Portal, Access, Gateway routing, DLP, Dynamic Workers, Remote MCP Servers |
| UC3 | Build Securely with AI | AI Security | AI Gateway, Guardrails, DLP, Dynamic Routing, Workers |
| UC4 | Protect AI-Powered Apps | AI Security | DDoS, Bot Management, WAF, Rate Limiting, AI Security for Apps, API Shield |
| UC5 | Secure Self-Hosted AI Agents | AI Security | Access, Sandbox SDK, AI Gateway, Secrets Store, Browser Run, R2, Workers |
| UC6 | Secure AI Code Execution | AI Security | Dynamic Workers, Codemode, Workers RPC, Tail Workers, AI Gateway |
| UC7 | Secure AI-to-AI Communication | AI Security | Agents SDK, Access, mTLS, MCP Server Portal, Workflows, Queues, AI Search |
| UC8 | API Key Management & Unified Billing | AI Builder | AI Gateway, BYOK, Unified Billing, Spend Limits, ZDR, Logpush |
| UC9 | Dynamic Routing | AI Builder | AI Gateway Dynamic Routing, BYOK, provider fallback, analytics |
| UC10 | RAG Knowledge Base | AI Builder | AI Search, Vectorize, Workers AI, Workers, AI Gateway |
| UC11 | Voice AI Agent | AI Builder | Agents SDK voice APIs, Workers AI STT/TTS, Durable Objects, Twilio |
| UC12 | Persistent AI Chat Agent | AI Builder | AIChatAgent, Durable Objects SQLite, resumable streams, Workers AI |
| UC13 | Scheduled AI Agent | AI Builder | Agents SDK scheduling, Durable Object alarms, Workers AI, Queues |
| UC14 | Browser AI Agent | AI Builder | Browser Run, Codemode browser tools, Agents SDK, R2 |
| UC15 | Private Networking for Agents | AI Builder | Cloudflare Mesh, Cloudflare One Client, Workers VPC, Gateway, Access, DLP |
| UC16 | Durable Long-Running Agents | AI Builder | Project Think, Durable Objects, fibers, Sessions API, sub-agents, Sandbox SDK |

Each use case is data-driven: nodes, edges, and step copy live in `src/data/ucN-steps.js`; the shared `FlowEngine` renders the walkthrough.

## Project Structure

```text
src/
  index.html                         Landing page
  decision-map/index.html            Interactive product decision map
  ai-security.html                   UC1-UC7 category landing
  ai-builder.html                    UC8-UC16 category landing
  use-cases/                         One HTML page per use case
  components/
    flow-engine.js                   Shared step-through animation engine
    tooltip.js                       Node tooltip behavior
    legend.js                        Product legend renderer
  data/
    uc0-stack-steps.js
    uc1-steps.js ... uc16-steps.js   Nodes, edges, steps, OWASP labels
  styles/
    base.css                         Reset, typography, utilities
    theme.css                        Design tokens
    diagram.css                      Flow diagram layout and styling
  sitemap.xml
  robots.txt
  site.webmanifest
  favicon.*
  og-image.png
worker/
  index.js                           Asset fallback + Markdown responses for selected pages
wrangler.jsonc                       Workers Static Assets config
package.json
```

## Architecture

- **Frontend:** Vanilla HTML/CSS/JS with ES modules. No bundler and no framework runtime.
- **Data model:** Each walkthrough exports `{ id, title, subtitle, nodes, edges, steps }` from `src/data/`.
- **Renderer:** `src/components/flow-engine.js` renders all use cases from the shared data model.
- **Deployment:** Cloudflare Workers Static Assets serves files from `src/`.
- **Worker script:** `worker/index.js` uses the `ASSETS` binding and selectively runs first for landing/category/use-case routes so it can add Markdown alternates and respond to `.md`, `?format=markdown`, or Markdown-oriented `Accept` headers.

## Workers Static Assets And Vite

This project intentionally does **not** use Vite today. The current site is hand-authored static HTML/CSS/JS, so Workers Static Assets plus Wrangler is the simplest deployment path.

Relevant Cloudflare docs notes:

- Workers Static Assets deploy static files and Worker code together as one Worker deployment.
- `assets.directory` is the source directory Wrangler uploads.
- `assets.binding` lets Worker code fetch from the asset collection via `env.ASSETS.fetch(request)`.
- `assets.run_worker_first` is useful when some routes need Worker logic before static asset serving.
- The Cloudflare Vite plugin is the recommended path if this project later moves to Vite, React, Vue, a framework build, or wants Vite HMR/build integration. It is not necessary for the current no-build static site.

## Development

```bash
npm install
npm run dev
```

Local dev runs Wrangler and serves the Worker at `http://localhost:8787`.

## Verification

Useful checks before deploying:

```bash
npm audit --omit=optional
npm exec wrangler -- --version
node --check worker/index.js
npm exec wrangler -- deploy --dry-run
```

There is no TypeScript build in this repository, so there is no `tsc --noEmit` typecheck. The Worker is JavaScript; `node --check worker/index.js` validates syntax, and `wrangler deploy --dry-run` validates the Worker + Static Assets deployment package.

## Deployment

```bash
npm run deploy
```

The current `wrangler.jsonc` deploys to Workers using:

- `main: ./worker/index.js`
- `assets.directory: ./src`
- `assets.binding: ASSETS`
- selected `assets.run_worker_first` routes
- `observability.enabled: true`

## Product Accuracy

Product names, statuses, and capabilities should be checked against official Cloudflare Developer Docs before changing diagram copy or data files.

## References

### Cloudflare Workers Deployment

- [Workers Static Assets](https://developers.cloudflare.com/workers/static-assets/)
- [Workers Static Assets routing behavior](https://developers.cloudflare.com/workers/static-assets/#routing-behavior)
- [Wrangler configuration: assets](https://developers.cloudflare.com/workers/wrangler/configuration/#assets)
- [Cloudflare Vite plugin](https://developers.cloudflare.com/workers/vite-plugin/)
- [Workers best practices](https://developers.cloudflare.com/workers/best-practices/workers-best-practices/)
- [Deploy to Workers](https://developers.cloudflare.com/workers/configuration/deployments/)

### AI Security And Governance

- [Cloudflare AI Security](https://www.cloudflare.com/ai-security/)
- [Holistic AI Security Learning Path](https://developers.cloudflare.com/learning-paths/holistic-ai-security/concepts/)
- [Cloudflare One AI Security Analytics](https://developers.cloudflare.com/cloudflare-one/insights/analytics/ai-security/)
- [Cloudflare One DLP](https://developers.cloudflare.com/cloudflare-one/data-loss-prevention/)
- [DLP profiles](https://developers.cloudflare.com/cloudflare-one/data-loss-prevention/dlp-profiles/)
- [Gateway traffic policies](https://developers.cloudflare.com/cloudflare-one/traffic-policies/)
- [Gateway HTTP policies](https://developers.cloudflare.com/cloudflare-one/traffic-policies/http-policies/)
- [Gateway egress policies](https://developers.cloudflare.com/cloudflare-one/traffic-policies/egress-policies/)
- [CASB cloud and SaaS integrations](https://developers.cloudflare.com/cloudflare-one/integrations/cloud-and-saas/)
- [CASB ChatGPT integration](https://developers.cloudflare.com/cloudflare-one/integrations/cloud-and-saas/openai/)
- [CASB Claude integration](https://developers.cloudflare.com/cloudflare-one/integrations/cloud-and-saas/anthropic/)
- [CASB Gemini integration](https://developers.cloudflare.com/cloudflare-one/integrations/cloud-and-saas/google-workspace/gemini/)
- [AI Security for Apps](https://developers.cloudflare.com/waf/detections/ai-security-for-apps/)
- [MCP Server Portals](https://developers.cloudflare.com/cloudflare-one/access-controls/ai-controls/mcp-portals/)
- [Detect MCP traffic in Gateway logs](https://developers.cloudflare.com/cloudflare-one/tutorials/detect-mcp-traffic-gateway-logs/)
- [Ruleset Engine Phases](https://developers.cloudflare.com/ruleset-engine/reference/phases-list/)
- [mTLS on Cloudflare](https://developers.cloudflare.com/learning-paths/mtls/concepts/mtls-cloudflare/)
- [Service Tokens](https://developers.cloudflare.com/cloudflare-one/access-controls/service-credentials/service-tokens/)

### AI Gateway And Agents

- [AI Gateway](https://developers.cloudflare.com/ai-gateway/)
- [AI Gateway coding agents](https://developers.cloudflare.com/ai-gateway/integrations/coding-agents/)
- [AI Gateway Worker Binding Methods](https://developers.cloudflare.com/ai-gateway/usage/worker-binding-methods/)
- [AI Gateway DLP](https://developers.cloudflare.com/ai-gateway/features/dlp/)
- [AI Gateway Dynamic Routing](https://developers.cloudflare.com/ai-gateway/features/dynamic-routing/)
- [AI Gateway Unified Billing](https://developers.cloudflare.com/ai-gateway/features/unified-billing/)
- [AI Gateway BYOK](https://developers.cloudflare.com/ai-gateway/configuration/bring-your-own-keys/)
- [Agents SDK](https://developers.cloudflare.com/agents/)
- [Docs for agents](https://developers.cloudflare.com/docs-for-agents/)
- [MCP servers for Cloudflare](https://developers.cloudflare.com/agents/model-context-protocol/cloudflare/servers-for-cloudflare/)
- [Remote MCP Servers](https://developers.cloudflare.com/agents/model-context-protocol/guides/remote-mcp-server/)
- [Voice Agents](https://developers.cloudflare.com/agents/api-reference/voice/)
- [Chat Agents](https://developers.cloudflare.com/agents/api-reference/chat-agents/)
- [Schedule Tasks](https://developers.cloudflare.com/agents/api-reference/schedule-tasks/)
- [Browse the Web](https://developers.cloudflare.com/agents/api-reference/browse-the-web/)
- [Durable Execution](https://developers.cloudflare.com/agents/api-reference/durable-execution/)
- [Sub-agents](https://developers.cloudflare.com/agents/api-reference/sub-agents/)
- [Sessions API](https://developers.cloudflare.com/agents/api-reference/sessions/)
- [Human-in-the-Loop](https://developers.cloudflare.com/agents/concepts/human-in-the-loop/)

### Developer Platform

- [Dynamic Workers](https://developers.cloudflare.com/dynamic-workers/)
- [Codemode](https://developers.cloudflare.com/agents/api-reference/codemode/)
- [Sandbox SDK](https://developers.cloudflare.com/sandbox/)
- [Sandbox SDK GitHub](https://github.com/cloudflare/sandbox-sdk)
- [Try Sandbox](https://sandbox.cloudflare.com/)
- [Workers AI](https://developers.cloudflare.com/workers-ai/)
- [AI Search](https://developers.cloudflare.com/ai-search/)
- [Vectorize](https://developers.cloudflare.com/vectorize/)
- [Durable Objects](https://developers.cloudflare.com/durable-objects/)
- [Workflows](https://developers.cloudflare.com/workflows/)
- [Queues](https://developers.cloudflare.com/queues/)
- [Browser Run](https://developers.cloudflare.com/browser-run/)
- [Browser Run for AI agents blog](https://blog.cloudflare.com/browser-run-for-ai-agents/)
- [R2 Object Storage](https://developers.cloudflare.com/r2/)
- [Workers VPC](https://developers.cloudflare.com/workers-vpc/)
- [Workers VPC: VPC Networks](https://developers.cloudflare.com/workers-vpc/configuration/vpc-networks/)
- [Connect Workers to Cloudflare Mesh](https://developers.cloudflare.com/workers-vpc/examples/connect-to-cloudflare-mesh/)
- [Cloudflare Mesh](https://developers.cloudflare.com/cloudflare-one/networks/connectors/cloudflare-mesh/)
- [Cloudflare One Client](https://developers.cloudflare.com/cloudflare-one/connections/connect-devices/warp/)
- [Cloudflare Tunnel](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/)
- [Cloudflare WAN](https://developers.cloudflare.com/cloudflare-wan/)
- [Moltworker Blog Post](https://blog.cloudflare.com/moltworker-self-hosted-ai-agent/)

### UC0 Blog Sources

- [Orchestrating AI Code Review at scale](https://blog.cloudflare.com/ai-code-review/)
- [The AI engineering stack we built internally](https://blog.cloudflare.com/internal-ai-engineering-stack/)
- [Project Think](https://blog.cloudflare.com/project-think/)
- [Dynamic Workers](https://blog.cloudflare.com/dynamic-workers/)
- [Sandbox SDK GA](https://blog.cloudflare.com/sandbox-ga/)
- [Dynamic, identity-aware, and secure Sandbox auth](https://blog.cloudflare.com/sandbox-auth/)
- [Scaling MCP adoption — Enterprise MCP reference architecture](https://blog.cloudflare.com/enterprise-mcp/)
- [Safe in the sandbox — V8 + MPK hardening](https://blog.cloudflare.com/safe-in-the-sandbox-security-hardening-for-cloudflare-workers/)
- [Introducing Agent Memory](https://blog.cloudflare.com/introducing-agent-memory/)
- [Securing non-human identities](https://blog.cloudflare.com/improved-developer-security/)
- [Project Glasswing — cyber frontier models](https://blog.cloudflare.com/cyber-frontier-models/)

### OWASP Frameworks

- [OWASP Top 10 for LLM Applications 2025](https://genai.owasp.org/llm-top-10/)
- [OWASP Top 10 for Agentic Applications 2026](https://genai.owasp.org/resource/owasp-top-10-for-agentic-applications-for-2026/)

## Disclaimer

This project is for educational and demonstration purposes only. It is not affiliated with, endorsed by, or officially associated with Cloudflare, Inc. Product capabilities can change; refer to the official Cloudflare documentation for authoritative information.
