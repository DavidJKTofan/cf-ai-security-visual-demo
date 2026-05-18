/**
 * UC0 — Cloudflare's Internal AI Engineering Stack (Reference Architecture)
 *
 * The comprehensive walkthrough showing how Cloudflare runs AI Code Review and the
 * full internal AI engineering stack on its own products. Combines elements from
 * UC1–UC16 into one cohesive end-to-end reference architecture.
 *
 * Sources (verified):
 *   https://blog.cloudflare.com/internal-ai-engineering-stack/
 *   https://blog.cloudflare.com/ai-code-review/
 *
 * The narrative: an engineer opens a merge request, which triggers every layer of
 * the AI engineering stack — Access → Proxy Worker → Coordinator → Sub-reviewers →
 * MCP Portal → Backstage → Codex → AI Gateway → Frontier providers / Workers AI →
 * Cache + Failback → MR comment.
 *
 * Key numbers featured (from the two blog posts):
 *   - 3,683 internal users (60% company-wide, 93% across R&D)
 *   - 131,246 review runs across 48,095 MRs in 5,169 repos (30 days)
 *   - $1.19 average cost per review, P99 $4.45
 *   - 85.7% cache hit rate
 *   - 159,103 total findings (≈8.7K critical, ≈65K warnings)
 *   - 241B tokens through AI Gateway in 30 days; 120B specifically through Code Reviewer
 *   - 58% more MRs/week (4-week rolling average: ~5,600 → 8,700+)
 *   - 13 MCP servers, 182+ tools, OAuth via single Access flow
 *   - Code Mode at portal layer: 34 tool schemas → 2 portal tools (~15K tokens saved/req)
 *   - Kimi K2.5 on Workers AI: ~77% cheaper than mid-tier proprietary
 *   - Built by ONE engineer in ONE afternoon, fine-tuned over 2 weeks
 */

export const uc0 = {
  id: 'uc0',
  title: "Cloudflare's Internal AI Engineering Stack",
  subtitle: 'Reference architecture: how 3,683 engineers ship code with AI Code Review on Cloudflare',

  nodes: [
    // === LEFT COLUMN — Origins ===
    {
      id: 'developer',
      label: 'Cloudflare Engineer',
      sublabel: 'OpenCode + GitLab',
      icon: '\u{1F468}\u{200D}\u{1F4BB}',
      type: 'user',
      column: 'left',
      description: '3,683 active engineers (60% company-wide, 93% of R&D) use OpenCode and other MCP-compatible coding assistants. Onboarding is one command — no API keys, no manual MCP setup, no config files. The same engineers opened 48,095 MRs in 30 days; the 4-week rolling MR average climbed from ~5,600/week to over 8,700/week (+58%) as AI adoption grew.',
    },
    {
      id: 'gitlab-mr',
      label: 'GitLab Merge Request',
      sublabel: 'CI component included in pipeline',
      icon: '\u{1F500}',
      type: 'user',
      column: 'left',
      description: 'Every MR at Cloudflare gets an AI code review. Integration is one line in `.gitlab-ci.yml` (`include: - component: …/ai/opencode@~latest`). The component handles image pull, Vault secrets, running the review, and posting the comment. Teams can drop an AGENTS.md in repo root for project-specific instructions. Runs across 5,169 repositories.',
    },

    // === CENTER COLUMN — The Cloudflare AI Engineering Stack ===
    {
      id: 'access',
      label: 'Cloudflare Access',
      sublabel: 'Zero Trust SSO + JWT',
      icon: '\u{1F510}',
      type: 'cloudflare',
      column: 'center',
      product: 'Cloudflare Access',
      description: 'The entry point for the entire stack. Same SSO every engineer already uses at Cloudflare. cloudflared returns a signed JWT that OpenCode stores locally and attaches to every subsequent provider request — no API keys on user machines. Access also fronts the MCP Server Portal with a single OAuth flow that governs all 13 MCP servers and 182+ tools.',
      docsUrl: 'https://developers.cloudflare.com/cloudflare-one/',
    },
    {
      id: 'proxy-worker',
      label: 'Proxy Worker',
      sublabel: 'Discovery + JWT + anonymization',
      icon: '\u{1F9F1}',
      type: 'cloudflare',
      product: 'Cloudflare Workers',
      column: 'center',
      description: 'A simple Hono app sitting in front of AI Gateway. Serves /.well-known/opencode discovery config (providers, MCP servers, agents, commands, permissions) so a single `opencode auth login <url>` configures everything. Validates the Cloudflare Access JWT on every LLM request, strips client auth headers (authorization, cf-access-token, host), then injects cf-aig-authorization (real API key, server-side only) and cf-aig-metadata with an anonymous UUID (email → UUID via D1 + KV read-cache). AI Gateway and provider logs never see employee identities. An hourly cron also refreshes the OpenAI model catalog from models.dev and injects store: false on every model — new models get Zero Data Retention automatically without a config redeploy.',
      docsUrl: 'https://developers.cloudflare.com/workers/',
    },
    {
      id: 'coordinator',
      label: 'Review Coordinator',
      sublabel: 'OpenCode orchestrator + risk tier',
      icon: '\u{1F3AF}',
      type: 'ai',
      product: 'OpenCode + Cloudflare Workers',
      column: 'center',
      description: 'A CI-native orchestrator that spawns OpenCode as a child process. First classifies the MR into a risk tier (trivial / lite / full) based on lines changed, file count, and whether security-sensitive paths like auth/ or crypto/ are touched. Then spawns 2, 4, or all 7 specialists with model assignments matched to tier. Diff filtering pre-strips lock files, minified assets, and source maps — migrations are explicitly exempted.',
      docsUrl: 'https://opencode.ai/',
    },
    {
      id: 'sub-reviewers',
      label: '7 Specialized Sub-Reviewers',
      sublabel: 'Security · Quality · Perf · Docs · Codex · Release · AGENTS.md',
      icon: '\u{1F50D}',
      type: 'ai',
      product: 'OpenCode Agents',
      column: 'center',
      description: 'Up to 7 concurrent OpenCode sessions, each with a tightly-scoped prompt telling it what to flag AND what NOT to flag (the real prompt-engineering value is in the "what to ignore" list). Each runs in its own session, freely uses read/grep/search tools, and returns findings as structured XML with severity (critical / warning / suggestion). A shared MR-context file is written once and referenced — duplicating across 7 reviewers would 7× the token cost.',
    },
    {
      id: 'execution-ladder',
      label: 'Project Think Execution Ladder',
      sublabel: 'Workspace · Isolate · npm · Browser · Sandbox (GA)',
      icon: '\u{1FA9C}',
      type: 'cloudflare',
      product: 'Project Think + Sandbox SDK',
      column: 'center',
      description: 'A five-tier capability ladder for safe code execution. Every tier starts with zero ambient authority — capabilities are granted explicitly. Each tier exists to unlock something the previous one can\'t do.\n\n• Tier 0 — Workspace · Why: persist files across turns and hibernations. What: durable SQLite + R2 filesystem (read/write/edit/grep/diff).\n• Tier 1 — Dynamic Worker isolate (open beta) · Why: run LLM-written code in milliseconds with no ambient authority. What: fresh V8 isolate, ~100x faster + ~10–100x more memory-efficient than a container; tools exposed as TypeScript via Cap\'n Web RPC; unlimited concurrency.\n• Tier 2 — npm at runtime · Why: the generated code needs a real library. What: @cloudflare/worker-bundler resolves and bundles packages on demand.\n• Tier 3 — Browser Run · Why: the target site has no API or MCP. What: headless Chrome via CDP, driven by the agent.\n• Tier 4 — Sandbox SDK (GA) · Why: the task needs a full computer (git, compilers, test runners, long-lived processes). What: Linux container with R2-backed ~2s snapshot restore; Outbound Workers inject credentials at the network layer so the agent never holds secrets; PTY, persistent Python/JS interpreters, live preview URLs, Active-CPU pricing.\n\nDefense-in-depth across every tier: V8 sandbox + hardware Memory Protection Keys (PKU), custom second-layer Linux sandbox, V8 patches shipped faster than Chrome itself.',
      docsUrl: 'https://blog.cloudflare.com/project-think/',
    },
    {
      id: 'mcp-portal',
      label: 'MCP Server Portal',
      sublabel: '13 servers, 182+ tools, Code Mode',
      icon: '\u{1F500}',
      type: 'cloudflare',
      product: 'Workers + Access + Code Mode',
      column: 'center',
      description: 'Aggregates 13 production MCP servers (Backstage, GitLab, Jira, Sentry, Elasticsearch, Prometheus, Google Workspace, internal Release Manager, …) behind a single Cloudflare Access OAuth flow. Each server runs on the same McpAgent + workers-oauth-provider stack. Code Mode proxying collapses every upstream tool schema into 2 portal tools — critical when 7 sub-reviewers hit the portal concurrently.',
      docsUrl: 'https://blog.cloudflare.com/enterprise-mcp/',
    },
    {
      id: 'backstage',
      label: 'Backstage Catalog',
      sublabel: '16K+ entity knowledge graph',
      icon: '\u{1F4DA}',
      type: 'resource',
      product: 'Backstage (OSS)',
      column: 'center',
      description: 'The knowledge graph underneath everything: 2,055 services, 228 API schemas, 544 systems, 1,302 databases, 375 teams, 6,389 users — all with ownership and dependency mappings. Without this, agents work blind: they can read the code in front of them but can\'t see the system around it. Exposed to agents as 13 MCP tools through the portal.',
      docsUrl: 'https://backstage.io/',
    },
    {
      id: 'codex',
      label: 'Engineering Codex',
      sublabel: 'Org standards + AGENTS.md per repo',
      icon: '\u{1F4DC}',
      type: 'resource',
      product: 'Cloudflare internal standards',
      column: 'center',
      description: 'Two layers of context for agents:\n\n• Engineering Codex (org-wide): standards distilled into agent skills. Findings cite specific Codex rule IDs — an AI suggestion becomes a reference to an organisational standard.\n• AGENTS.md (per-repo): runtime, test commands, conventions, boundaries, dependencies. ~3,900 repos bootstrapped automatically by a generator that pulls Backstage metadata, analyses repo structure, and opens an MR for the owning team to refine.\n\nA dedicated AGENTS.md sub-reviewer flags build-tool or structural changes that didn\'t update the file.',
    },
    {
      id: 'ai-gateway',
      label: 'AI Gateway',
      sublabel: 'BYOK · 85.7% cache · ZDR · failback',
      icon: '\u{2699}',
      type: 'cloudflare',
      product: 'Cloudflare AI Gateway',
      column: 'center',
      description: 'Single control plane for all LLM traffic — 20.18M requests / 241.37B tokens per month across the company. BYOK keeps provider keys in Secrets Store; the proxy Worker injects them server-side. Zero Data Retention is auto-applied via `store: false`. Caching delivers an 85.7% hit rate. Per-reviewer model selection comes from a separate Worker backed by Workers KV — flip a switch and every running CI job re-routes within 5 seconds. Hystrix-style circuit breakers walk per-family failback chains on 429/503.',
      docsUrl: 'https://developers.cloudflare.com/ai-gateway/',
    },
    {
      id: 'workers-ai',
      label: 'Workers AI',
      sublabel: 'Kimi K2.5 — same-network inference',
      icon: '\u{1F9E0}',
      type: 'cloudflare',
      product: 'Cloudflare Workers AI',
      column: 'center',
      description: 'Serverless inference on GPUs across Cloudflare\'s global network — 51.83B tokens in 30 days. Inference stays on the same network as Workers, Durable Objects, and storage — no cross-cloud hops. Kimi K2.5 (frontier-scale open model, 256K context, tool calling) handles text-heavy reviewers (Documentation, Release, AGENTS.md) — ~77% cheaper than a mid-tier proprietary model. Handles ~15% of AI Code Reviewer traffic; a separate internal security agent processes 7B+ Kimi tokens per day, which would cost ~$2.4M/year on a proprietary model.',
      docsUrl: 'https://developers.cloudflare.com/workers-ai/',
    },
    {
      id: 'tracker',
      label: 'Review Tracker Worker',
      sublabel: 'Prometheus · Logpush · cost telemetry',
      icon: '\u{1F4CA}',
      type: 'cloudflare',
      product: 'Cloudflare Workers + Logpush',
      column: 'center',
      description: 'Fire-and-forget telemetry Worker that ingests job starts, completions, findings, token usage, and Prometheus metrics. Never blocks the CI pipeline (2-second timeout, pruning, batched flushes). Prometheus metrics forward to internal observability via Workers Logging. This is how we know cost per review by tier ($0.20 trivial / $0.67 lite / $1.68 full), per-reviewer token breakdowns, and finding rates by category.',
      docsUrl: 'https://developers.cloudflare.com/logs/logpush/',
    },

    // === RIGHT COLUMN — Frontier providers + the output ===
    {
      id: 'anthropic',
      label: 'Anthropic',
      sublabel: 'Opus 4.7 (coordinator) + Sonnet 4.6',
      icon: '\u{1F9E0}',
      type: 'ai-service',
      column: 'right',
      description: 'Top-tier model assignments: Claude Opus 4.7 for the Review Coordinator (hardest job — reads 7 reviewers\' output, dedupes, judges severity); Claude Sonnet 4.6 for heavy-lifting sub-reviewers (Code Quality, Security, Performance). Routed via AI Gateway with BYOK; failback chain opus-4-7 → opus-4-6 if a provider 429/503 fires.',
    },
    {
      id: 'openai',
      label: 'OpenAI',
      sublabel: 'GPT-5.4 (coordinator) + GPT-5.3 Codex',
      icon: '\u{1F9E0}',
      type: 'ai-service',
      column: 'right',
      description: 'GPT-5.4 is the alternate top-tier coordinator (cross-vendor failback). GPT-5.3 Codex handles workhorse code review tasks. All requests proxied through AI Gateway with anonymous cf-aig-metadata and store: false auto-injected by the Proxy Worker for Zero Data Retention.',
    },
    {
      id: 'google',
      label: 'Google AI',
      sublabel: 'Gemini — additional fallback',
      icon: '\u{1F9E0}',
      type: 'ai-service',
      column: 'right',
      description: 'Google AI Studio / Gemini models — additional capacity for dynamic routing and provider diversity. Frontier models from OpenAI, Anthropic, and Google handle 91.16% of internal AI request volume today; Workers AI handles 8.84% and that share is growing.',
    },
    {
      id: 'mr-output',
      label: 'Structured MR Comment',
      sublabel: 'Findings + approval decision posted',
      icon: '\u{1F4DD}',
      type: 'resource',
      column: 'right',
      description: 'A single categorised comment with sections (Security, Code Quality, Performance, Documentation, Codex Compliance, Release, AGENTS.md) and severity badges (Critical / Important / Suggestion / Optional Nits). Codex findings cite specific rule IDs. Re-reviews are stateful: fixed → auto-resolve thread, unfixed → re-emit, user-replied "won\'t fix" → respected. Median review: 3m 39s — faster than the engineer\'s context-switch.',
    },
  ],

  edges: [
    // Origin → Stack
    { id: 'e-dev-mr', from: 'developer', to: 'gitlab-mr', label: 'git push', direction: 'ltr' },
    { id: 'e-mr-access', from: 'gitlab-mr', to: 'access', label: 'CI triggers', direction: 'ltr' },

    // Auth + Proxy chain
    { id: 'e-access-proxy', from: 'access', to: 'proxy-worker', label: 'JWT', direction: 'ltr' },
    { id: 'e-proxy-coord', from: 'proxy-worker', to: 'coordinator', label: '', direction: 'ltr' },

    // Coordinator → Sub-reviewers
    { id: 'e-coord-subs', from: 'coordinator', to: 'sub-reviewers', label: 'spawn 7', direction: 'ltr' },

    // Sub-reviewers consult knowledge layer
    { id: 'e-subs-mcp', from: 'sub-reviewers', to: 'mcp-portal', label: '', direction: 'ltr' },
    { id: 'e-mcp-bs', from: 'mcp-portal', to: 'backstage', label: '', direction: 'ltr' },
    { id: 'e-subs-codex', from: 'sub-reviewers', to: 'codex', label: '', direction: 'ltr' },

    // Sub-reviewers → Project Think Execution Ladder (safe code exec)
    { id: 'e-subs-ladder', from: 'sub-reviewers', to: 'execution-ladder', label: '', direction: 'ltr' },
    { id: 'e-ladder-mcp', from: 'execution-ladder', to: 'mcp-portal', label: '', direction: 'ltr' },

    // Sub-reviewers → AI Gateway → Providers
    { id: 'e-subs-aig', from: 'sub-reviewers', to: 'ai-gateway', label: '', direction: 'ltr' },
    { id: 'e-aig-anthropic', from: 'ai-gateway', to: 'anthropic', label: '', direction: 'ltr' },
    { id: 'e-aig-openai', from: 'ai-gateway', to: 'openai', label: '', direction: 'ltr' },
    { id: 'e-aig-google', from: 'ai-gateway', to: 'google', label: '', direction: 'ltr' },
    { id: 'e-aig-wai', from: 'ai-gateway', to: 'workers-ai', label: '', direction: 'ltr' },

    // Response path
    { id: 'e-anthropic-aig', from: 'anthropic', to: 'ai-gateway', label: '', direction: 'rtl' },
    { id: 'e-aig-coord', from: 'ai-gateway', to: 'coordinator', label: '', direction: 'rtl' },
    { id: 'e-coord-out', from: 'coordinator', to: 'mr-output', label: 'verdict', direction: 'ltr' },

    // Telemetry → tracker
    { id: 'e-aig-tracker', from: 'ai-gateway', to: 'tracker', label: '', direction: 'ltr' },

    // MR output back to engineer
    { id: 'e-out-mr', from: 'mr-output', to: 'gitlab-mr', label: '', direction: 'rtl' },
  ],

  steps: [
    {
      title: 'Engineer opens a merge request',
      product: 'GitLab + CI Component',
      description: 'A Cloudflare engineer pushes a branch and opens an MR. Their `.gitlab-ci.yml` includes one line — that\'s the entire integration. Across the 30-day window: 5,169 repositories, 48,095 MRs, averaging 2.7 review runs per MR as engineers push fixes.',
      why: 'Code review is the most reliable bottleneck on a fast-moving team — median first-review wait was previously measured in hours. AI Code Review removes that bottleneck without removing humans from the loop. Built by ONE engineer in ONE afternoon, fine-tuned over 2 weeks. Result: +58% MRs/week on a 4-week rolling average (~5,600 → 8,700+; peak 10,952).',
      activeNodes: ['developer', 'gitlab-mr'],
      activeEdges: ['e-dev-mr'],
      docsUrl: 'https://blog.cloudflare.com/ai-code-review/',
    },
    {
      title: 'Cloudflare Access authenticates the CI job',
      product: 'Cloudflare Access',
      description: 'The CI runner authenticates through the same Access SSO every engineer already uses. cloudflared returns a signed JWT. No API keys exist on developer laptops — provider credentials live only in Secrets Store, server-side. The same Access boundary fronts the MCP Server Portal, the proxy Worker, and every other internal service agents touch.',
      why: 'Zero-trust auth on every hop is non-negotiable when 3,683 engineers + their agents are calling frontier LLMs. One Access policy update governs the entire stack — no per-service IAM sprawl.',
      activeNodes: ['gitlab-mr', 'access'],
      activeEdges: ['e-mr-access'],
      docsUrl: 'https://developers.cloudflare.com/cloudflare-one/',
      owasp: ['ASI03 Identity & Privilege Abuse', 'ASI10 Rogue Agents'],
    },
    {
      title: 'Proxy Worker handles discovery, JWT, and anonymization',
      product: 'Cloudflare Workers',
      description: 'A tiny Hono Worker in front of AI Gateway does three things:\n\n1. Serves /.well-known/opencode discovery — one `opencode auth login <url>` configures providers, MCP servers, agents, commands, and permissions.\n2. Validates the Access JWT on every LLM call, strips client auth headers, injects cf-aig-authorization (real key server-side only) and cf-aig-metadata with an anonymous UUID (email → UUID via D1 + KV).\n3. Hourly cron refreshes the OpenAI model catalog and auto-injects store: false — new models get Zero Data Retention automatically.\n\nSame pattern at Sandbox Tier 4: Outbound Workers inject credentials at the network layer so the agent never holds a raw key.',
      why: 'Every CI job and sub-reviewer is a non-human identity. The proxy Worker is the only thing that knows the credential; the Access JWT is the principal; Workers KV holds the policy. A `wrangler deploy` updates what 3,000+ engineers get next session — no client reconfiguration, no plaintext keys in flight. Cloudflare\'s scannable token formats (cfut_, cfat_, cfk_ + checksum) auto-revoke on GitHub leak.',
      activeNodes: ['access', 'proxy-worker'],
      activeEdges: ['e-access-proxy'],
      docsUrl: 'https://blog.cloudflare.com/internal-ai-engineering-stack/',
      owasp: ['LLM02:2025 Sensitive Information Disclosure', 'ASI03 Identity & Privilege Abuse'],
    },
    {
      title: 'Review Coordinator classifies risk tier and spawns reviewers',
      product: 'OpenCode Coordinator',
      description: 'A CI-native orchestrator spawns OpenCode as a child process and classifies the MR into a risk tier:\n\n• Trivial (≤10 lines, ≤20 files) → 2 agents on Sonnet\n• Lite (≤100 lines) → 4 agents\n• Full (>100 lines, >50 files, or security-sensitive paths like auth/, crypto/) → all 7 specialists with Opus 4.7 / GPT-5.4 as coordinator\n\nDiff filtering pre-strips lock files, minified assets, and source maps — migrations are explicitly exempted.',
      why: 'You don\'t send the dream team to review a typo fix. Trivial reviews cost $0.20 on average, full reviews $1.68. The tier system is the difference between a controlled investment and a runaway token bill.',
      activeNodes: ['proxy-worker', 'coordinator'],
      activeEdges: ['e-proxy-coord'],
      owasp: ['LLM10:2025 Unbounded Consumption'],
    },
    {
      title: 'Up to 7 specialized sub-reviewers run concurrently',
      product: 'OpenCode Sub-Agents',
      description: 'The coordinator calls a `spawn_reviewers` tool that launches sub-reviewer sessions via OpenCode\'s SDK. Each runs in its own session with its own prompt, freely uses read/grep tools, and returns findings as structured XML.\n\nThe roster: Security · Code Quality · Performance · Documentation · Codex Compliance · Release Impact · AGENTS.md freshness.\n\nEvery prompt has explicit "What NOT to Flag" sections — the actual prompt-engineering value is in telling the LLM what to ignore. A shared `shared-mr-context.txt` file is written once and referenced across all 7 reviewers (duplicating context would 7× the token cost).',
      why: 'A single monolithic prompt produces vague suggestions developers learn to ignore. Specialisation + tight scoping ("only flag exploitable or concretely dangerous issues") is what makes the output trustworthy. Result: 1.2 findings per review on average — signal, not noise.',
      activeNodes: ['coordinator', 'sub-reviewers'],
      activeEdges: ['e-coord-subs'],
    },
    {
      title: 'Sub-reviewers query Backstage through the MCP Portal',
      product: 'MCP Server Portal + Backstage',
      description: 'Sub-reviewers need context outside the diff: who owns this service, what depends on it, what databases it talks to. They query the internal MCP Portal — 13 production MCP servers (Backstage, GitLab, Jira, Sentry, Elasticsearch, Prometheus, Google Workspace, Release Manager, …) exposing 182+ tools behind a single Access OAuth flow. Backstage itself tracks 2,055 services, 228 APIs, 1,302 databases, 375 teams, 6,389 users.',
      why: 'Without structured knowledge, agents work blind. The catalog turns individual repos into a connected map of the engineering org. Adding a new MCP server is mostly copying an existing one and changing the API it wraps — shared monorepo, shared auth, shared CI.',
      activeNodes: ['sub-reviewers', 'mcp-portal', 'backstage'],
      activeEdges: ['e-subs-mcp', 'e-mcp-bs'],
      docsUrl: 'https://blog.cloudflare.com/enterprise-mcp/',
      owasp: ['ASI02 Tool Misuse & Exploitation', 'ASI04 Agentic Supply Chain Vulnerabilities'],
    },
    {
      title: 'Code Mode collapses 52 tool schemas into 2 (94% fewer tokens)',
      product: 'Code Mode at the portal layer',
      description: 'Every MCP tool definition burns context-window tokens before the model starts working. Concrete example from our portal: 4 connected MCP servers exposing 52 tools consumed ~9,400 tokens for definitions alone.\n\nWith portal-level Code Mode (`?codemode=search_and_execute`), all 52 tools collapse into two: `portal_codemode_search` (returns definitions on demand) and `portal_codemode_execute` (runs LLM-written JavaScript that calls upstream tools by name). Same workflow now consumes ~600 tokens — a 94% reduction.\n\nCloudflare\'s own MCP server uses the same pattern to expose 1,300+ API endpoints in <1,000 tokens (99.9% reduction).',
      why: 'The cost stays fixed as the portal grows. Connect 4, 13, or 50 MCP servers — the client still sees only 2 tools. DLP guardrails apply consistently across all upstream servers from a single chokepoint.',
      activeNodes: ['sub-reviewers', 'mcp-portal'],
      activeEdges: ['e-subs-mcp'],
      docsUrl: 'https://blog.cloudflare.com/code-mode/',
      owasp: ['LLM10:2025 Unbounded Consumption', 'ASI05 Unexpected Code Execution (RCE)'],
    },
    {
      title: 'Safe code execution — the Project Think Execution Ladder',
      product: 'Project Think + Sandbox SDK',
      description: 'Code Mode is one rung. Project Think (shipped Agents Week) generalises it into a five-tier ladder for safe code execution — useful at Tier 0 alone, additive from there. Each tier exists to unlock a specific capability the previous tier can\'t provide.\n\n• Tier 0 — Workspace · Why: the agent needs to remember files across turns and survive hibernation. What: durable SQLite + R2 filesystem (@cloudflare/shell).\n• Tier 1 — Dynamic Worker isolate · Why: safely run LLM-written code with zero ambient authority. What: fresh V8 isolate in ms, no network by default; tools exposed as TypeScript-over-RPC (~99% fewer tokens than OpenAPI).\n• Tier 2 — npm at runtime · Why: the generated code needs real libraries (zod, Hono, …). What: @cloudflare/worker-bundler resolves and bundles packages on demand.\n• Tier 3 — Browser Run · Why: the target site has no API or MCP yet. What: headless Chrome via CDP, driven by the agent.\n• Tier 4 — Sandbox SDK (GA) · Why: the task needs a real computer (git clone, compilers, test runners, long-lived dev server). What: full Linux container with R2 snapshots that restore in ~2s vs 30s clone+install; Outbound Workers inject credentials at the network layer so the agent never holds secrets; PTY, persistent Python/JS interpreters, live preview URLs, Active-CPU pricing.',
      why: 'The capability model is the point: start with zero authority, grant exactly what\'s needed via bindings or Outbound Workers. This is also the off-ramp from CI — Project Think turns reviewers into durable, hibernation-cheap agents that wake on a webhook, clone the repo via snapshot in seconds, run the tests, open follow-up MRs, then sleep. No CI runner, no per-job container start cost.',
      activeNodes: ['sub-reviewers', 'execution-ladder', 'mcp-portal'],
      activeEdges: ['e-subs-ladder', 'e-ladder-mcp'],
      docsUrl: 'https://blog.cloudflare.com/project-think/',
      owasp: ['ASI05 Unexpected Code Execution (RCE)', 'ASI02 Tool Misuse & Exploitation'],
    },
    {
      title: 'AGENTS.md and Engineering Codex inject the right context',
      product: 'Engineering Codex + AGENTS.md',
      description: 'Two layers of context for agents:\n\n• Per-repo AGENTS.md: short, structured — runtime, test command, conventions, boundaries, dependencies. ~3,900 repos bootstrapped via a generator that pulls Backstage metadata + analyses repo structure, then opens an MR for the owning team to refine.\n• Engineering Codex (org-wide): standards distilled into agent skills with progressive disclosure ("If you need X, use Y"). Findings cite specific Codex rule IDs — an AI suggestion becomes a reference to an organisational standard.\n\nA dedicated AGENTS.md sub-reviewer flags build-tool, test-framework, or structural changes that didn\'t update the file.',
      why: 'Models without local context produce changes that look plausible and are still wrong for the repo. AGENTS.md + Codex force teams to make context explicit. Cloudflare\'s Network Firewall team used a multi-agent Codex audit to compress what used to take weeks of manual compliance review into a structured, repeatable process.',
      activeNodes: ['sub-reviewers', 'codex'],
      activeEdges: ['e-subs-codex'],
    },
    {
      title: 'AI Gateway routes every LLM call with BYOK + ZDR',
      product: 'Cloudflare AI Gateway',
      description: 'Every sub-reviewer LLM call lands here. Single control plane: 20.18M requests, 241.37B tokens per month across the company.\n\n• BYOK provider keys in Secrets Store, injected server-side via `cf-aig-authorization`.\n• Anonymous per-user UUID in `cf-aig-metadata` — per-user cost attribution without exposing emails.\n• Zero Data Retention auto-applied via `store: false`.\n• Per-reviewer model assignments live in a separate Worker + KV — flip a switch and every CI job re-routes within 5 seconds.',
      why: 'When a frontier provider goes down at 8am UTC, you don\'t want to wait for on-call. KV-driven config reshapes model routing from a Worker update — no CI template changes, no engineer interruption.',
      activeNodes: ['sub-reviewers', 'ai-gateway'],
      activeEdges: ['e-subs-aig'],
      docsUrl: 'https://developers.cloudflare.com/ai-gateway/',
      owasp: ['LLM02:2025 Sensitive Information Disclosure', 'LLM10:2025 Unbounded Consumption'],
    },
    {
      title: 'Cache hit rate: 85.7%',
      product: 'AI Gateway Caching',
      description: 'Most tokens routed through the system are cache reads. Top-tier models alone served 25.7B cache-read tokens last month against just 806M input tokens.\n\nThe 85.7% hit rate comes from two things together: (1) same base prompts and shared MR-context file reused across every run, (2) AI Gateway prompt caching that recognises identical context across re-reviews of the same MR.',
      why: 'For the CFO: this is what makes large-scale AI affordable. Token volume looks terrifying in absolute terms (120B+ for the reviewer alone, 241B across the company) — but 85.7% of that is cached. Avg review costs $1.19, median $0.98, P99 $4.45. 99% of reviews come in under $5.',
      activeNodes: ['ai-gateway'],
      activeEdges: [],
      docsUrl: 'https://developers.cloudflare.com/ai-gateway/features/caching/',
      owasp: ['LLM10:2025 Unbounded Consumption'],
    },
    {
      title: 'Model tier selection — and Workers AI handles the text-heavy work',
      product: 'AI Gateway Dynamic Routing + Workers AI',
      description: 'Models are matched to job complexity:\n\n• Top-tier — Claude Opus 4.7 + GPT-5.4: reserved for the Review Coordinator (hardest job: read 7 reviewers, dedupe, judge severity).\n• Standard-tier — Claude Sonnet 4.6 + GPT-5.3 Codex: Code Quality, Security, Performance reviewers. Fast, cheap, excellent at logic errors.\n• Kimi K2.5 on Workers AI: text-heavy reviewers (Documentation, Release, AGENTS.md). Frontier-scale open model, 256K context, ~77% cheaper than a mid-tier proprietary model. Inference stays on the same network as Workers, Durable Objects, and storage — no cross-cloud hops.',
      why: 'Open-source on Workers AI is now a frontier-capable, dramatically cheaper option for the right workloads. A separate internal security agent processes 7B+ Kimi tokens per day — that would cost ~$2.4M/year on a proprietary model.',
      activeNodes: ['ai-gateway', 'anthropic', 'openai', 'google', 'workers-ai'],
      activeEdges: ['e-aig-anthropic', 'e-aig-openai', 'e-aig-google', 'e-aig-wai'],
      docsUrl: 'https://developers.cloudflare.com/workers-ai/',
      owasp: ['LLM03:2025 Supply Chain', 'ASI04 Agentic Supply Chain Vulnerabilities'],
    },
    {
      title: 'Circuit breakers + failback chains handle provider outages',
      product: 'AI Gateway Failback + Hystrix-style circuits',
      description: 'Running 7 concurrent frontier model calls means you will hit rate limits and outages. Each model tier has independent health tracking (Hystrix-style states: closed / open / half-open).\n\nWhen a circuit opens, the system walks a failback chain — opus-4-7 → opus-4-6 → end-of-chain. Each family is isolated: if Opus is overloaded, fall back to the previous Opus generation rather than crossing streams. Exactly one probe request gets through after a 2-minute cooldown to prevent stampeding a recovering API.\n\nThe coordinator has its own failback: if the OpenCode child process fails with a retryable error, the orchestration layer hot-swaps the coordinator model in opencode.json and retries.',
      why: '"Wait for the provider to recover" is not a viable strategy when tens of thousands of CI jobs depend on frontier LLMs. Cross-provider redundancy + intra-family failback gives a graceful degradation curve instead of a cliff.',
      activeNodes: ['ai-gateway', 'anthropic', 'openai'],
      activeEdges: ['e-anthropic-aig'],
      owasp: ['LLM03:2025 Supply Chain', 'ASI08 Cascading Failures'],
    },
    {
      title: 'Coordinator judges, deduplicates, posts the verdict',
      product: 'OpenCode Coordinator + GitLab MCP',
      description: 'The coordinator runs a judge pass: deduplicates (same issue from two reviewers → one), re-categorises (perf flagged by Code Quality moves to Performance), and drops speculative or convention-contradicted findings.\n\nApproval rubric: all LGTM → approved · only suggestions or low warnings → approved_with_comments · risk pattern → minor_issues (revoke prior bot approval) · any critical item → significant_concerns (blocks merge). Escape hatch: a human comment `break glass` forces approval — used in 0.6% of MRs (288 / 48,095).\n\nRe-reviews are stateful via Agent Memory (beta): the reviewer remembers prior decisions across iterations AND across the team. Fixed → auto-resolve thread. Previously-dismissed → stay quiet. Reviews get less noisy over time, not just smarter.',
      why: 'Bias is explicitly toward approval — the system holds the line on critical issues without becoming a nag. Agent Memory turns each interaction into durable team knowledge: conventions, decisions, intentional exceptions that would otherwise live in people\'s heads. Median review: 3m 39s — faster than the engineer\'s context-switch.',
      activeNodes: ['ai-gateway', 'coordinator', 'mr-output', 'gitlab-mr'],
      activeEdges: ['e-aig-coord', 'e-coord-out', 'e-out-mr'],
      owasp: ['ASI01 Agent Goal Hijack', 'ASI03 Identity & Privilege Abuse'],
    },
    {
      title: 'Telemetry: every token, finding, and cost lands in the tracker',
      product: 'Review Tracker Worker + Logpush',
      description: 'A fire-and-forget TrackerClient streams job starts, completions, findings, token usage, and Prometheus metrics to a separate Worker. Never blocks the CI pipeline (2-second timeout, pruning at 50 pending requests, batched flushes before exit). Prometheus metrics forward to internal observability via Workers Logging.\n\nThis is how we know: 131,246 reviews · 48,095 MRs · 5,169 repos · 159,103 findings (≈8.7K critical, ≈65K warnings). Per-reviewer: Code Quality is most prolific (74,898 findings); Security flags the highest critical proportion (4%); Release barely registers.',
      why: 'You cannot optimise what you cannot measure. Real-time telemetry is what lets the team flip KV switches with confidence, kill noisy reviewers, swap models mid-incident, and present finance with a per-tier cost breakdown that holds up.',
      activeNodes: ['coordinator', 'ai-gateway', 'tracker'],
      activeEdges: ['e-aig-tracker'],
      docsUrl: 'https://developers.cloudflare.com/logs/logpush/',
      owasp: ['ASI10 Rogue Agents', 'ASI08 Cascading Failures'],
    },
    {
      title: 'The scoreboard — as of April 2026',
      product: 'Outcomes (30-day window, March 10 – April 9, 2026)',
      description: 'Built by ONE engineer in ONE afternoon. Fine-tuned over 2 weeks. Now running across the whole company.\n\n• Adoption: 3,683 engineers · 60% company-wide · 93% of R&D\n• Coverage: 131,246 reviews · 48,095 MRs · 5,169 repos\n• Cost: $1.19 avg · $0.98 median · $4.45 P99 · 85.7% cache hit rate\n• Findings: 159,103 total · ≈8.7K critical · ≈65K warnings · 1.2/review (signal, not noise)\n• Velocity: +58% MRs/week (~5,600 → 8,700; peak 10,952)\n• Latency: 3m 39s median review\n• Override rate: 0.6% (288 break-glass approvals)\n• Throughput: 241B tokens via AI Gateway · 52B via Workers AI\n\nThe same harness pattern scales beyond MR review. Project Glasswing applies it to deep vulnerability research — Anthropic\'s Mythos Preview running through a Recon → Hunt (~50 concurrent agents) → Validate → Gapfill → Dedupe → Trace → Feedback → Report pipeline across 50+ internal repos, chaining attack primitives into working proof-of-concept exploits.\n\nWhat\'s next: background agents on Project Think — durable, hibernation-cheap, capable of cloning repos, running tests, and opening follow-up MRs with no CI runner. Everything except Backstage runs on Cloudflare products you can buy today.',
      why: 'The pitch in one slide. Same network, same products, same security boundary your AI workloads should live inside. The math works (cache + ZDR + BYOK + dynamic routing). The architecture survives outages (failback + KV-driven config). The velocity gain is measured (+58% MRs/week). And the trajectory is durable: 10,000 Project Think agents at 1% activity = ~100 active at any moment, not 10,000 always-on VMs. Reproducible — your team can ship the same pattern.',
      activeNodes: ['developer', 'gitlab-mr', 'access', 'proxy-worker', 'coordinator', 'sub-reviewers', 'mcp-portal', 'backstage', 'codex', 'execution-ladder', 'ai-gateway', 'workers-ai', 'tracker', 'anthropic', 'openai', 'google', 'mr-output'],
      activeEdges: [],
      docsUrl: 'https://blog.cloudflare.com/internal-ai-engineering-stack/',
    },
  ],
};
