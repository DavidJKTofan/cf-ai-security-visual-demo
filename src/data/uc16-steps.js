/**
 * UC16 — Durable Long-Running Agents (Project Think)
 *
 * Project Think introduces the next generation of Cloudflare Agents SDK primitives —
 * durable execution with fibers, sub-agents via Facets, the Session API for tree-structured
 * messages, sandboxed code execution, the execution ladder (Workspace → Isolate → npm →
 * Browser → Sandbox), and self-authored extensions. The opinionated Think base class
 * wires them all together for you.
 *
 * The big shift: "agents as infrastructure" — durable, distributed, structurally safe,
 * and serverless. An agent that can crash and resume, hibernate for days, wake on a
 * scheduled event, write and execute its own code in sandboxes, and spawn sub-agents —
 * all without running a VM or container per user.
 *
 * Scaling economics: 10,000 agents each active 1% of the time = 10,000 always-on VMs
 * (old world) vs. ~100 active DO instances at any moment (new world). Marginal cost of
 * spawning a new agent is effectively zero.
 *
 * References:
 *   https://blog.cloudflare.com/project-think/
 *   https://developers.cloudflare.com/agents/api-reference/durable-execution/
 *   https://developers.cloudflare.com/agents/api-reference/sub-agents/
 *   https://developers.cloudflare.com/agents/api-reference/sessions/
 *   https://github.com/cloudflare/agents/tree/main/docs/think
 *   https://blog.cloudflare.com/dynamic-workers/
 *   https://developers.cloudflare.com/sandbox/
 */

export const uc16 = {
  id: 'uc16',
  title: 'Durable Long-Running Agents',
  subtitle: 'Build agents that survive crashes, hibernate when idle, and escalate through an execution ladder — with Project Think',

  nodes: [
    // Left column — triggers
    {
      id: 'user-trigger',
      label: 'User / Event',
      sublabel: 'HTTP, WebSocket, cron, email',
      icon: '\u{1F464}',
      type: 'user',
      column: 'left',
      description: 'The trigger that wakes the agent: an HTTP request, a WebSocket message, a Durable Object alarm, an inbound email, or a sub-agent RPC call. When an event arrives, the platform wakes the hibernating agent, loads its state, and hands it the event. The agent does its work, then goes back to sleep — consuming zero compute while idle.',
    },
    {
      id: 'client',
      label: 'Client',
      sublabel: 'React, CLI, MCP, ai-chat',
      icon: '\u{1F4BB}',
      type: 'user',
      column: 'left',
      description: 'A chat UI (useAgentChat via @cloudflare/ai-chat), a CLI, or any MCP-compatible client. Think speaks the same WebSocket protocol as @cloudflare/ai-chat, so existing UI components work without changes. Clients connect to a named agent instance by ID — routing is built-in.',
      docsUrl: 'https://developers.cloudflare.com/agents/api-reference/chat-agents/',
    },

    // Center column — Project Think primitives
    {
      id: 'think-agent',
      label: 'Think Agent (DO)',
      sublabel: 'Durable Object + SQLite',
      icon: '\u{2699}',
      type: 'cloudflare',
      column: 'center',
      product: 'Cloudflare Agents SDK (Think)',
      description: 'The Think base class wires the full chat lifecycle: agentic loop, message persistence, streaming, tool execution, stream resumption, and extensions. Each agent is a Durable Object with its own SQLite database. Zero cost when hibernated; the platform wakes it on events. Lifecycle hooks (beforeTurn, beforeToolCall, afterToolCall, onStepFinish, onChatResponse) give you control without owning the whole pipeline.',
      docsUrl: 'https://github.com/cloudflare/agents/tree/main/docs/think',
    },
    {
      id: 'fibers',
      label: 'Durable Execution',
      sublabel: 'runFiber() + stash() + recovery',
      icon: '\u{1F501}',
      type: 'cloudflare',
      column: 'center',
      product: 'Agents SDK (Fibers)',
      description: 'A fiber is a durable function invocation: registered in SQLite before execution, checkpointable at any point via ctx.stash({...}), and recoverable on restart via onFiberRecovered. Survives deploys, platform restarts, and resource-limit evictions without losing progress. The SDK keeps the agent alive during fiber execution automatically (no manual keepAlive); for long-running remote work (CI, design reviews, video generation) the agent can persist a job ID, hibernate, and wake on callback.',
      docsUrl: 'https://developers.cloudflare.com/agents/api-reference/durable-execution/',
    },
    {
      id: 'sessions',
      label: 'Session API',
      sublabel: 'Tree messages, forking, FTS5 search',
      icon: '\u{1F4D3}',
      type: 'cloudflare',
      column: 'center',
      product: 'Agents SDK (Sessions)',
      description: 'Conversations stored as trees, not flat arrays — every message has a parent_id. Enables forking (explore an alternative path without losing the original), non-destructive compaction (summarize older messages rather than delete them), and full-text search across history via SQLite FTS5. Context blocks let the model proactively remember facts across hibernation via set_context. search_context tool lets the agent search its own past.',
      docsUrl: 'https://developers.cloudflare.com/agents/api-reference/sessions/',
    },
    {
      id: 'sub-agents',
      label: 'Sub-Agents',
      sublabel: 'Facets + typed RPC',
      icon: '\u{1F465}',
      type: 'cloudflare',
      column: 'center',
      product: 'Agents SDK (Sub-Agents)',
      description: 'this.subAgent(ResearchAgent, "research") spawns a child Durable Object colocated with the parent via Facets. Each sub-agent has its own isolated SQLite and execution context; RPC latency is a function call because they\'re on the same machine. TypeScript catches misuse at compile time. Orchestrator delegates to specialized children (research, review, synthesis) that run in parallel — same scaling model, same hibernation economics.',
      docsUrl: 'https://developers.cloudflare.com/agents/api-reference/sub-agents/',
    },

    // Right column — The Execution Ladder
    {
      id: 'workspace',
      label: 'Tier 0: Workspace',
      sublabel: 'Durable filesystem (SQLite + R2)',
      icon: '\u{1F4C1}',
      type: 'cloudflare',
      column: 'right',
      product: '@cloudflare/shell',
      description: 'A durable virtual filesystem backed by SQLite and R2. Read, write, edit, search, grep, diff. The agent is useful at Tier 0 alone — it has a persistent workspace that survives restarts and hibernation.',
      docsUrl: 'https://www.npmjs.com/package/@cloudflare/shell',
    },
    {
      id: 'isolate-npm',
      label: 'Tier 1–2: Isolate + npm',
      sublabel: 'Dynamic Workers + worker-bundler',
      icon: '\u{26A1}',
      type: 'cloudflare',
      column: 'right',
      product: '@cloudflare/codemode + worker-bundler',
      description: 'Tier 1: Dynamic Worker isolate — LLM-generated JavaScript runs in a sandboxed V8 isolate with no network access (globalOutbound: null), 100x faster than containers. Tier 2: @cloudflare/worker-bundler fetches npm packages, bundles with esbuild, and loads the result into the isolate. The agent writes `import { z } from "zod"` and it just works.',
      docsUrl: 'https://blog.cloudflare.com/dynamic-workers/',
    },
    {
      id: 'browser',
      label: 'Tier 3: Browser Run',
      sublabel: 'Headless Chrome via CDP',
      icon: '\u{1F310}',
      type: 'cloudflare',
      column: 'right',
      product: 'Cloudflare Browser Run',
      description: 'Tier 3: Cloudflare Browser Run (formerly Browser Rendering) — headless Chrome for when the target service doesn\'t support agents via MCP or APIs. Navigate, click, extract, screenshot. See UC14 for the full browser-agent pattern.',
      docsUrl: 'https://developers.cloudflare.com/browser-run/',
    },
    {
      id: 'sandbox',
      label: 'Tier 4: Sandbox',
      sublabel: 'Full OS, git, test runners',
      icon: '\u{1F4E6}',
      type: 'cloudflare',
      column: 'right',
      product: 'Cloudflare Sandbox SDK',
      description: 'Tier 4: Cloudflare Sandbox SDK (GA as of Agents Week) — a full container environment with your toolchains, repos, and dependencies. git clone, npm test, cargo build — synced bidirectionally with the Workspace. Use when the job requires a real development environment. The ladder is additive: agents escalate tier-by-tier only as needed.',
      docsUrl: 'https://developers.cloudflare.com/sandbox/',
    },
    {
      id: 'extensions',
      label: 'Self-Authored Extensions',
      sublabel: 'Agents write their own tools',
      icon: '\u{1F9E9}',
      type: 'cloudflare',
      column: 'right',
      product: 'Agents SDK (Extensions)',
      description: 'An agent can author its own extensions at runtime: TypeScript programs declaring network and workspace permissions, bundled by @cloudflare/worker-bundler, loaded into a Dynamic Worker, and registered as new tools. Persisted in DO storage; survives hibernation. The next time the user asks, the agent has a tool that didn\'t exist 30 seconds ago — sandboxed, auditable, revocable.',
    },
  ],

  edges: [
    { id: 'e-trigger-agent', from: 'user-trigger', to: 'think-agent', label: 'Wake',             direction: 'ltr' },
    { id: 'e-client-agent',  from: 'client',       to: 'think-agent', label: 'WebSocket / RPC',  direction: 'ltr' },
    { id: 'e-agent-fiber',   from: 'think-agent',  to: 'fibers',      label: 'runFiber()',       direction: 'ltr' },
    { id: 'e-agent-session', from: 'think-agent',  to: 'sessions',    label: 'Load tree',        direction: 'ltr' },
    { id: 'e-agent-sub',     from: 'think-agent',  to: 'sub-agents',  label: 'Delegate',         direction: 'ltr' },
    { id: 'e-agent-ws',      from: 'think-agent',  to: 'workspace',   label: 'Tier 0: files',    direction: 'ltr' },
    { id: 'e-fiber-isolate', from: 'fibers',       to: 'isolate-npm', label: 'Tier 1–2: code',   direction: 'ltr' },
    { id: 'e-fiber-browser', from: 'fibers',       to: 'browser',     label: 'Tier 3: web',      direction: 'ltr' },
    { id: 'e-fiber-sandbox', from: 'fibers',       to: 'sandbox',     label: 'Tier 4: full OS',  direction: 'ltr' },
    { id: 'e-sub-ext',       from: 'sub-agents',   to: 'extensions',  label: 'Write tools',      direction: 'ltr' },
    { id: 'e-response',      from: 'think-agent',  to: 'client',      label: 'Resumable stream', direction: 'rtl' },
  ],

  steps: [
    {
      title: 'Event wakes the agent from hibernation',
      product: 'Cloudflare Agents SDK (Think)',
      description: 'A trigger arrives — HTTP request, WebSocket message, DO alarm, inbound email, or an RPC from a parent agent. The platform wakes the hibernating Think agent (a Durable Object with its own SQLite), loads its state, and hands it the event. Every agent is addressable by name; routing is automatic. 10,000 agents each active 1% of the time = ~100 active at any moment. Marginal cost of spawning a new agent is effectively zero.',
      why: 'Traditional applications serve many users from one instance. Agents are one-to-one: one agent per user, task, or email thread. The only economics that work at that scale are per-agent Durable Objects with hibernation — zero compute when idle.',
      activeNodes: ['user-trigger', 'client', 'think-agent'],
      activeEdges: ['e-trigger-agent', 'e-client-agent'],
      docsUrl: 'https://developers.cloudflare.com/durable-objects/',
    },
    {
      title: 'Session API loads the conversation tree',
      product: 'Agents SDK (Sessions)',
      description: 'Conversations are stored as trees in SQLite — each message has a parent_id. The agent forks sessions to explore alternatives without losing the original path; compacts older messages non-destructively (summarize, don\'t delete); and searches its entire history via FTS5. Context blocks persist important facts in the system prompt across hibernation ("MEMORY [42%, 462/1100 tokens]") and the model proactively updates them via set_context.',
      why: 'Agents that run for days or weeks need more than a flat list of messages. Trees + forking + compaction + search are the missing primitives that let a conversation scale from minutes to months.',
      activeNodes: ['think-agent', 'sessions'],
      activeEdges: ['e-agent-session'],
      docsUrl: 'https://developers.cloudflare.com/agents/api-reference/sessions/',
      owasp: ['LLM02:2025 Sensitive Information Disclosure', 'ASI10 Rogue Agents'],
    },
    {
      title: 'Durable execution via runFiber() — survives crashes',
      product: 'Agents SDK (Fibers)',
      description: 'The agent starts long-running work with this.runFiber("research", async (ctx) => { ... }). The fiber is registered in SQLite before execution. At any checkpoint, ctx.stash({ findings, step, topic }) persists progress. If a deploy, platform restart, or eviction happens mid-fiber, the platform calls onFiberRecovered with the last snapshot — the agent resumes exactly where it left off. No more "LLM call took 30s, connection died, no explanation to the user."',
      why: 'Multi-turn agent loops can run for minutes, hours, or days. Without durable execution, any interruption loses progress, burns tokens, and frustrates the user. Fibers turn agent execution into infrastructure — the kind that survives the messy reality of distributed systems.',
      activeNodes: ['think-agent', 'fibers'],
      activeEdges: ['e-agent-fiber'],
      docsUrl: 'https://developers.cloudflare.com/agents/api-reference/durable-execution/',
      owasp: ['ASI08 Cascading Failures', 'ASI10 Rogue Agents'],
    },
    {
      title: 'Tier 0: Workspace — the agent\'s durable filesystem',
      product: '@cloudflare/shell',
      description: 'Even before running any code, the agent has a persistent workspace backed by SQLite + R2. Read, write, edit, search, grep, diff. Files survive hibernation and restarts. The Think base class wires createWorkspaceTools(this.workspace) into the tool set; the agent operates on files like it would in a shell.',
      why: 'The execution ladder\'s design principle: the agent should be useful at Tier 0 alone. Every other tier is additive — users add capabilities as they go, instead of needing the full stack on day one.',
      activeNodes: ['think-agent', 'workspace'],
      activeEdges: ['e-agent-ws'],
      docsUrl: 'https://www.npmjs.com/package/@cloudflare/shell',
    },
    {
      title: 'Tier 1–2: Sandboxed code + npm via Dynamic Workers',
      product: '@cloudflare/codemode + worker-bundler',
      description: 'Instead of sequential tool calls, the LLM writes a single program (Code Mode pattern, ~99% token reduction for large toolsets). Tier 1 runs it in a Dynamic Worker isolate: a fresh V8 isolate with globalOutbound: null, millisecond startup, 100x faster than containers. Tier 2 adds runtime npm: @cloudflare/worker-bundler fetches packages from the registry, bundles with esbuild, and loads into the isolate. `import { z } from "zod"` just works.',
      why: 'Models are better at writing code to use a system than playing the tool-calling game. Sandboxing starts from "almost no authority" (no network by default) and grants capabilities explicitly through bindings — the right security model for agent-generated code.',
      activeNodes: ['fibers', 'isolate-npm'],
      activeEdges: ['e-fiber-isolate'],
      docsUrl: 'https://github.com/cloudflare/agents/tree/main/packages/codemode',
      owasp: ['LLM06:2025 Excessive Agency', 'ASI05 Unexpected Code Execution (RCE)'],
    },
    {
      title: 'Tier 3–4: Browser Run and Sandbox for the rest of the world',
      product: 'Browser Run + Sandbox SDK',
      description: 'Tier 3 is Browser Run — headless Chrome via CDP for sites that don\'t support agents via MCP or APIs (see UC14). Tier 4 is the Sandbox SDK (GA): a full container with git, compilers, test runners — synced bidirectionally with the Workspace. Agents escalate only when the task requires it; most work stays at Tier 0–2.',
      why: 'The execution ladder is additive. Don\'t run a full container when a 5ms isolate suffices. Don\'t open a browser when an API call works. Capability-by-capability escalation keeps costs and blast radius proportional to the task.',
      activeNodes: ['fibers', 'browser', 'sandbox'],
      activeEdges: ['e-fiber-browser', 'e-fiber-sandbox'],
      docsUrl: 'https://developers.cloudflare.com/sandbox/',
      owasp: ['ASI05 Unexpected Code Execution (RCE)'],
    },
    {
      title: 'Sub-agents delegate work with typed RPC',
      product: 'Agents SDK (Sub-Agents)',
      description: 'this.subAgent(ResearchAgent, "research") spawns a child Durable Object colocated via Facets. Each sub-agent has its own isolated SQLite, its own conversation tree, and typed RPC to the parent. An orchestrator fans out research + review + synthesis to specialized children in parallel. Think works as a sub-agent too — researcher.chat(task, streamRelay) returns a streamed response.',
      why: 'A single agent shouldn\'t do everything. Sub-agents keep contexts isolated, let each child specialize, and scale with the same hibernation economics as their parent. Typed RPC catches coordination bugs at compile time instead of 3am.',
      activeNodes: ['think-agent', 'sub-agents'],
      activeEdges: ['e-agent-sub'],
      docsUrl: 'https://developers.cloudflare.com/agents/api-reference/sub-agents/',
      owasp: ['ASI02 Tool Misuse & Exploitation', 'ASI04 Agentic Supply Chain Vulnerabilities'],
    },
    {
      title: 'Self-authored extensions: agents write their own tools',
      product: 'Agents SDK (Extensions)',
      description: 'An agent authors an extension on the fly: a TypeScript program declaring permissions ({ network: ["api.github.com"], workspace: "read-write" }). Think\'s ExtensionManager bundles it (optionally with npm deps via worker-bundler), loads it into a Dynamic Worker, and registers the new tools. The extension persists in DO storage and survives hibernation. The next time the user asks about pull requests, the agent has a github_create_pr tool that didn\'t exist 30 seconds ago — sandboxed, auditable, revocable TypeScript, not fine-tuning or RLHF.',
      why: 'This is the self-improvement loop that makes agents get more useful over time. Capabilities accumulate as code the agent wrote for itself, running inside the same capability model that governs everything else.',
      activeNodes: ['sub-agents', 'extensions'],
      activeEdges: ['e-sub-ext'],
      owasp: ['ASI05 Unexpected Code Execution (RCE)', 'LLM06:2025 Excessive Agency'],
    },
    {
      title: 'Agent responds via resumable stream, then hibernates',
      product: 'Cloudflare Agents SDK (Think)',
      description: 'The agent streams its response token-by-token. A Stream Manager buffers inside the DO so disconnected clients resume mid-stream without data loss. When the work is done, the agent hibernates — zero CPU, zero memory — and stays that way until the next trigger. Every message, every file, every sub-agent tree, every self-authored extension is still in SQLite when it wakes up.',
      why: 'Resumable streams + hibernation + persistent state = agents that feel continuous to users while costing nothing between interactions. This is the scaling math that makes "one agent per user, per task, per thread" economically sustainable.',
      activeNodes: ['think-agent', 'client'],
      activeEdges: ['e-response'],
      docsUrl: 'https://developers.cloudflare.com/agents/api-reference/chat-agents/',
    },
  ],
};
