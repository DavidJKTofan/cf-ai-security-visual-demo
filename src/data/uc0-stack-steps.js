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
 * The narrative: an engineer opens a merge request, which triggers the AI Code
 * Review workflow and the broader internal AI engineering stack — Access → Proxy
 * Worker → Coordinator → Sub-reviewers → MCP Portal → Backstage → Codex → AI
 * Gateway → Frontier providers / Workers AI → prompt caching + failback → MR
 * comment.
 *
 * Key numbers featured (from the two blog posts):
 *   - 3,683 internal users (60% company-wide, 93% across R&D)
 *   - 131,246 review runs across 48,095 MRs in 5,169 repos (30 days)
 *   - $1.19 average cost per review, P99 $4.45
 *   - 85.7% cached-token rate
 *   - 159,103 total findings (≈8.7K critical, ≈65K warnings)
 *   - 241B tokens through AI Gateway in 30 days; ~120B specifically through Code Reviewer
 *   - 58% more MRs/week (4-week rolling average: ~5,600 → 8,700+)
 *   - 13 MCP servers, 182+ tools, OAuth via single Access flow
 *   - Code Mode at portal layer: upstream tool schemas collapse to a constant-size tool surface
 *   - Kimi-class open models on Workers AI: Kimi K2.5 pricing cited as ~77% cheaper than mid-tier proprietary
 *   - Rapidly prototyped, then operationalized across Cloudflare engineering
 */

export const uc0 = {
  id: 'uc0',
  title: "Cloudflare's Internal AI Engineering Stack",
  subtitle: "Reference architecture: how Cloudflare ships code with AI Code Review on Cloudflare's platform",
  overview: {
    eyebrow: 'Reference Architecture Summary',
    title: 'CI-native AI Code Review, backed by Cloudflare\'s internal AI engineering stack',
    description: 'To optimize pull request and merge request reviews for quality and efficiency, Cloudflare moved away from standard AI tools and single-prompt review approaches that were too noisy and inflexible. Instead, Cloudflare built a CI-native orchestration system around the open-source coding agent OpenCode, then wired it into the same Cloudflare platform primitives customers can use: Access, Workers, AI Gateway, Workers AI, MCP Server Portal, Code Mode, and the Agents SDK.',
    sections: [
      {
        title: '1. Multi-agent, specialized review',
        items: [
          'Each MR can launch up to <strong>seven specialized OpenCode reviewers</strong> for security, performance, code quality, documentation, release impact, AGENTS.md freshness, and Engineering Codex compliance.',
          'Risk tiers keep the system efficient: typo-sized changes get a lightweight pass, while security-sensitive or large MRs trigger the full reviewer set.',
        ],
      },
      {
        title: '2. Coordinator agent',
        items: [
          'A coordinator agent deduplicates overlapping findings, re-categorizes issues, judges severity, and filters out speculative noise.',
          'Developers receive one structured GitLab review comment instead of seven separate agent outputs, with severe or security-relevant issues able to block merge.',
        ],
      },
      {
        title: '3. Composable platform architecture',
        items: [
          'Plugins isolate GitLab integration, Cloudflare AI Gateway routing, model tiers, failback chains, Engineering Codex checks, AGENTS.md context, and telemetry.',
          'MCP Server Portal and Backstage give reviewers production context, while Code Mode and Dynamic Workers keep tool execution isolated and token-efficient.',
        ],
      },
    ],
    result: 'Across tens of thousands of internal MRs, the system reviews clean code quickly, flags concrete bugs with high signal, and reduces the old hours-long wait for first review to minutes. In the measured 30-day window it ran <strong>131,246 reviews</strong> across <strong>48,095 MRs</strong>, with a <strong>$1.19 average cost</strong> per review and an <strong>85.7% cached-token rate</strong>.',
  },

  nodes: [
    // === LEFT COLUMN — Origins ===
    {
      id: 'developer',
      label: 'Cloudflare Engineer',
      sublabel: 'OpenCode + GitLab',
      icon: '\u{1F468}\u{200D}\u{1F4BB}',
      type: 'user',
      column: 'left',
      description: '3,683 active internal users (60% company-wide, 93% of R&D) use OpenCode and other MCP-compatible coding assistants. Onboarding is one command — no API keys, no manual MCP setup, no config files. The AI Code Review post reports 48,095 MRs in 30 days; the 4-week rolling MR average climbed from ~5,600/week to over 8,700/week (+58%) as AI adoption grew.',
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
      description: 'The entry point for the engineer-facing stack. Same SSO every engineer already uses at Cloudflare. cloudflared returns a signed JWT that OpenCode stores locally and attaches to subsequent provider requests — no API keys on user machines. Access also fronts the MCP Server Portal with a single OAuth flow that governs all 13 MCP servers and 182+ tools.',
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
      description: 'A simple Hono app sitting in front of AI Gateway. Serves /.well-known/opencode discovery config (providers, MCP servers, agents, commands, permissions) so a single `opencode auth login <url>` configures everything. Validates the Cloudflare Access JWT on every LLM request, strips client auth headers (authorization, cf-access-token, host), then injects cf-aig-authorization (real gateway credential, server-side only) and cf-aig-metadata with an anonymous UUID (email → UUID via D1 + KV read-cache). AI Gateway and provider logs never see employee identities. An hourly cron also refreshes the OpenAI model catalog from models.dev and injects provider-side retention controls such as store: false where supported — new models inherit the control plane without a config redeploy.',
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
      description: 'Aggregates 13 production MCP servers (Backstage, GitLab, Jira, Sentry, Elasticsearch, Prometheus, Google Workspace, internal Release Manager, …) behind a single Cloudflare Access OAuth flow. Each server runs on the same McpAgent + workers-oauth-provider stack. Code Mode keeps the model-facing tool surface constant even as upstream tool count grows — critical when 7 sub-reviewers hit the portal concurrently.',
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
      sublabel: 'BYOK · caching · retention controls · failback',
      icon: '\u{2699}',
      type: 'cloudflare',
      product: 'Cloudflare AI Gateway',
      column: 'center',
      description: 'Single control plane for all LLM traffic — 20.18M requests / 241.37B tokens per month across the company. BYOK keeps provider keys in Secrets Store; the proxy Worker injects gateway credentials server-side. Provider-side retention controls such as `store: false` are applied where supported, while AI Gateway also supports ZDR for eligible Unified Billing routes. Prompt/prefix caching and stable context deliver the 85.7% cached-token rate reported by the reviewer. Per-reviewer model selection comes from a separate Worker backed by Workers KV — flip a switch and every running CI job re-routes within 5 seconds. Hystrix-style circuit breakers walk per-family failback chains on 429/503.',
      docsUrl: 'https://developers.cloudflare.com/ai-gateway/',
    },
    {
      id: 'workers-ai',
      label: 'Workers AI',
      sublabel: 'Kimi-class open models — same-network inference',
      icon: '\u{1F9E0}',
      type: 'cloudflare',
      product: 'Cloudflare Workers AI',
      column: 'center',
      description: 'Serverless inference on GPUs across Cloudflare\'s global network — 51.83B tokens in 30 days. Inference stays on the same network as Workers, Durable Objects, and storage — no cross-cloud hops. Kimi-class open models handle text-heavy reviewers (Documentation, Release, AGENTS.md). The blog cited Kimi K2.5 as a frontier-scale open model with 256K context and tool calling, ~77% cheaper than a mid-tier proprietary model for the referenced workload. Workers AI handles ~15% of AI Code Reviewer traffic; a separate internal security agent processes 7B+ Kimi tokens per day, estimated at ~$2.4M/year on a proprietary model.',
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
      description: 'GPT-5.4 is the alternate top-tier coordinator (cross-vendor failback). GPT-5.3 Codex handles workhorse code review tasks. All requests proxied through AI Gateway with anonymous cf-aig-metadata and provider-side retention controls such as store: false applied by the Proxy Worker where supported.',
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
      why: 'This is not a boxed "AI Code Review" product. It is a reference architecture built from flexible Cloudflare primitives — Access, Workers, AI Gateway, Workers AI, MCP Server Portals, Agents SDK, Sandbox SDK, and observability — that customers can compose into the AI development workflow they want: review code, govern agents, route models, control spend, protect data, run tools safely, or build an entirely different agentic process. Cloudflare used those primitives to remove a code-review bottleneck without removing humans from the loop. Result: +58% MRs/week on a 4-week rolling average (~5,600 → 8,700+; peak 10,952).',
      activeNodes: ['developer', 'gitlab-mr'],
      activeEdges: ['e-dev-mr'],
      docsUrl: 'https://blog.cloudflare.com/ai-code-review/',
    },
    {
      title: 'Cloudflare Access secures the engineer-facing stack',
      product: 'Cloudflare Access',
      description: 'OpenCode authenticates through the same Access SSO every engineer already uses. cloudflared returns a signed JWT, and the proxy Worker validates it before forwarding LLM calls. No API keys exist on developer laptops — provider credentials live only in Secrets Store or server-side configuration. The same Access boundary fronts the MCP Server Portal and the internal services agents touch.',
      why: 'Zero-trust auth is non-negotiable when 3,683 internal users and their agents are calling frontier LLMs and internal tools. The pattern is reusable for customers: centralize identity at the edge, keep credentials server-side, and let policy changes apply without reconfiguring every AI client.',
      activeNodes: ['gitlab-mr', 'access'],
      activeEdges: ['e-mr-access'],
      docsUrl: 'https://developers.cloudflare.com/cloudflare-one/',
      owasp: ['ASI03 Identity & Privilege Abuse', 'ASI10 Rogue Agents'],
    },
    {
      title: 'Proxy Worker handles discovery, JWT, and anonymization',
      product: 'Cloudflare Workers',
      description: 'A tiny Hono Worker in front of AI Gateway does three things:\n\n1. Serves /.well-known/opencode discovery — one `opencode auth login <url>` configures providers, MCP servers, agents, commands, and permissions.\n2. Validates the Access JWT on every LLM call, strips client auth headers, injects cf-aig-authorization (gateway credential server-side only) and cf-aig-metadata with an anonymous UUID (email → UUID via D1 + KV).\n3. Hourly cron refreshes the OpenAI model catalog and applies provider-side retention controls such as `store: false` where supported.\n\nSame pattern at Sandbox Tier 4: Outbound Workers inject credentials at the network layer so the agent never holds a raw key.',
      why: 'The proxy Worker is the programmable control plane: identity in, policy and routing decisions in code, provider credentials out of the client. A `wrangler deploy` updates what 3,000+ internal users get next session — no client reconfiguration, no plaintext keys in flight.',
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
      title: 'Code Mode keeps the tool surface small as MCP grows',
      product: 'Code Mode at the portal layer',
      description: 'Every MCP tool definition burns context-window tokens before the model starts working. Code Mode for MCP Server Portals replaces a growing list of upstream tool definitions with a small, constant model-facing interface. In the portal flow, the client can request Code Mode with `?codemode=search_and_execute`, where the connected agent writes JavaScript against typed `codemode.*` methods and the generated code runs in an isolated Dynamic Worker.\n\nFor broader context optimization, the `optimize_context=search_and_execute` option exposes only `query` and `execute` so agents discover definitions on demand. The principle is the same: the token cost no longer scales linearly with every new MCP server and tool. Cloudflare\'s API MCP pattern shows the extreme version — 1,300+ API endpoints exposed in under ~1,000 tokens instead of loading every endpoint schema up front.',
      why: 'The customer lesson is not the exact tool count; it is the architecture. You can add tools as your AI program matures without making every model call heavier, leakier, or harder to govern. Access remains the identity boundary, Dynamic Workers provide isolated execution, and the portal gives one place to curate what agents can do.',
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
      title: 'AI Gateway routes every LLM call with keys, policy, and visibility',
      product: 'Cloudflare AI Gateway',
      description: 'Every sub-reviewer LLM call lands here. Single control plane: 20.18M requests, 241.37B tokens per month across the company.\n\n• BYOK provider keys in Secrets Store, selected through AI Gateway and kept out of app code.\n• Anonymous per-user UUID in `cf-aig-metadata` — per-user cost attribution without exposing emails.\n• Provider-side retention controls such as `store: false` applied where supported; AI Gateway ZDR is also available for eligible Unified Billing routes.\n• Per-reviewer model assignments live in a separate Worker + KV — flip a switch and every CI job re-routes within 5 seconds.',
      why: 'When a frontier provider goes down at 8am UTC, you don\'t want to wait for on-call. KV-driven config reshapes model routing from a Worker update — no CI template changes, no engineer interruption. For customers, this is the operating model: route LLM traffic through one programmable gateway, then adapt policy, spend, model choice, and retention posture centrally.',
      activeNodes: ['sub-reviewers', 'ai-gateway'],
      activeEdges: ['e-subs-aig'],
      docsUrl: 'https://developers.cloudflare.com/ai-gateway/',
      owasp: ['LLM02:2025 Sensitive Information Disclosure', 'LLM10:2025 Unbounded Consumption'],
    },
    {
      title: 'Prompt caching makes scale affordable: 85.7% cached-token rate',
      product: 'Prompt Caching + AI Gateway Analytics',
      description: 'Most tokens routed through the reviewer are cache reads. Top-tier models alone served 25.7B cache-read tokens last month against just 806M fresh input tokens.\n\nThe 85.7% cached-token rate comes from prompt/prefix caching and stable prompt design: same base prompts, consistent tool definitions, and a shared MR-context file reused across review runs. AI Gateway separately supports exact-match response caching for repeated full requests, but this reviewer metric is primarily about repeated prompt prefixes and cached input tokens.',
      why: 'For the CFO: this is what makes large-scale AI affordable. Token volume looks terrifying in absolute terms (120B+ for the reviewer alone, 241B across the company) — but most reviewer input tokens are served from cache or discounted cached-token paths. Avg review costs $1.19, median $0.98, P99 $4.45. 99% of reviews come in under $5.',
      activeNodes: ['ai-gateway'],
      activeEdges: [],
      docsUrl: 'https://developers.cloudflare.com/ai-gateway/features/caching/',
      owasp: ['LLM10:2025 Unbounded Consumption'],
    },
    {
      title: 'Model tier selection — and Workers AI handles the text-heavy work',
      product: 'AI Gateway Dynamic Routing + Workers AI',
      description: 'Models are matched to job complexity:\n\n• Top-tier — Claude Opus 4.7 + GPT-5.4: reserved for the Review Coordinator (hardest job: read 7 reviewers, dedupe, judge severity).\n• Standard-tier — Claude Sonnet 4.6 + GPT-5.3 Codex: Code Quality, Security, Performance reviewers. Fast, cheap, excellent at logic errors.\n• Kimi-class open models on Workers AI: text-heavy reviewers (Documentation, Release, AGENTS.md). Kimi K2.5 launched with a 256K context window, tool calling, and structured outputs; Workers AI keeps inference on the same network as Workers, Durable Objects, and storage — no cross-cloud hops.',
      why: 'Open models on Workers AI are a dramatically cheaper option for the right workloads. A separate internal security agent processes 7B+ Kimi tokens per day — estimated at ~$2.4M/year on a proprietary model, and 77% cheaper on Workers AI for the Kimi K2.5 pricing cited in the blog.',
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
      description: 'The coordinator runs a judge pass: deduplicates (same issue from two reviewers → one), re-categorises (perf flagged by Code Quality moves to Performance), and drops speculative or convention-contradicted findings.\n\nApproval rubric: all LGTM → approved · only suggestions or low warnings → approved_with_comments · risk pattern → minor_issues (revoke prior bot approval) · any critical item → significant_concerns (blocks merge). Escape hatch: a human comment `break glass` forces approval — used in 0.6% of MRs (288 / 48,095).\n\nRe-reviews are stateful because the coordinator reads prior review comments and inline thread state. Fixed → auto-resolve thread. Previously-dismissed → stay quiet. Reviews get less noisy over time.',
      why: 'Bias is explicitly toward approval — the system holds the line on critical issues without becoming a nag. The customer takeaway: AI governance is not only blocking. It is memory, workflow, escalation, and auditability wrapped around developer velocity. Median review: 3m 39s — faster than the engineer\'s context-switch.',
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
      description: '30-day snapshot: 3,683 active users, 131,246 reviews across 48,095 MRs, $1.19 average cost per review, 85.7% cached-token rate, +58% MRs/week, 3m 39s median review time, and only 0.6% break-glass overrides.',
      why: 'All figures in this walkthrough are from public Cloudflare Blog posts, primarily "The AI engineering stack we built internally — on the platform we ship" and "Orchestrating AI Code Review at scale." For customers, the point is not to copy Cloudflare\'s exact AI Code Review workflow. The point is that the same primitives let you shape your own safe AI development process. Configure Cloudflare Access for identity, a Worker proxy for discovery and policy logic, AI Gateway for provider keys, routing, metadata, caching, retention controls, and cost visibility, Workers AI or frontier providers for model choice, MCP Server Portals for governed tool access, Dynamic Workers or Sandbox SDK for isolated code execution, and Logpush/analytics for audit and spend reporting. Then adapt the workflow to your SDLC: code review, secure coding assistants, agent governance, compliance checks, release automation, or another process unique to your business.',
      activeNodes: ['developer', 'gitlab-mr', 'access', 'proxy-worker', 'coordinator', 'sub-reviewers', 'mcp-portal', 'backstage', 'codex', 'execution-ladder', 'ai-gateway', 'workers-ai', 'tracker', 'anthropic', 'openai', 'google', 'mr-output'],
      activeEdges: [],
      docsUrl: 'https://blog.cloudflare.com/internal-ai-engineering-stack/',
    },
  ],
};
