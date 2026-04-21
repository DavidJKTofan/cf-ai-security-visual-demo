/**
 * UC14 — Browser AI Agent (Browser Run)
 * Give AI agents a browser on Cloudflare's global network via Chrome DevTools Protocol (CDP).
 * Browser Run (formerly Browser Rendering, renamed April 2026) is the browser-for-agents product.
 *
 * What's new with Browser Run (Agents Week 2026):
 *   - CDP endpoint exposed directly — connect from any language, any environment (not just Workers)
 *   - MCP Client Support — Claude Desktop, Cursor, Codex, OpenCode via chrome-devtools-mcp
 *   - WebMCP — sites expose tools to agents via navigator.modelContext (Chromium 146+)
 *   - Live View — watch the agent's browser session in real time (page, DOM, console, network)
 *   - Human in the Loop — human takes control when agent hits CAPTCHA, login, unexpected edge case
 *   - Session Recordings — rrweb-style replay with DOM + mouse + keyboard + navigation
 *   - /crawl endpoint — signed-agent crawler, respects robots.txt + AI Crawl Control
 *   - 120 concurrent browsers (4x increase), 10 req/sec Quick Actions
 *
 * References:
 *   https://blog.cloudflare.com/browser-run-for-ai-agents/
 *   https://developers.cloudflare.com/browser-run/cdp/
 *   https://developers.cloudflare.com/browser-run/features/live-view/
 *   https://developers.cloudflare.com/browser-run/features/human-in-the-loop/
 *   https://developers.cloudflare.com/browser-run/features/session-recording/
 *   https://developers.cloudflare.com/browser-run/features/webmcp/
 *   https://developers.cloudflare.com/agents/api-reference/browse-the-web/
 */

export const uc14 = {
  id: 'uc14',
  title: 'Browser AI Agent',
  subtitle: 'Give AI agents a browser on Cloudflare\'s global network — with CDP, Live View, and human handoff',

  nodes: [
    // Left column — user and human operator
    {
      id: 'user-request',
      label: 'User / Orchestrator',
      sublabel: 'Natural language task',
      icon: '\u{1F4BB}',
      type: 'user',
      column: 'left',
      description: 'A user, developer, or parent orchestrator sends a natural language web task to the AI Agent: extract data, take a screenshot, monitor a site for changes, test a form, or automate a multi-step workflow. The agent decides which browser tools to use autonomously.',
    },
    {
      id: 'human-operator',
      label: 'Human Operator',
      sublabel: 'Human-in-the-Loop handoff',
      icon: '\u{1F9D1}\u200D\u{1F4BC}',
      type: 'user',
      column: 'left',
      description: 'When the agent hits a CAPTCHA, login wall, or unexpected edge case, it hands off to a human. The operator opens Live View in the dashboard, takes control of the live browser (click, type, submit, authenticate), and hands it back once the issue is resolved. Eliminates the "automation fails, start over" failure mode.',
      docsUrl: 'https://developers.cloudflare.com/browser-run/features/human-in-the-loop/',
    },
    // Center column — agent + browser pipeline
    {
      id: 'ai-agent',
      label: 'AI Agent',
      sublabel: 'Agents SDK, reasoning + tool loop',
      icon: '\u2699',
      type: 'cloudflare',
      column: 'center',
      product: 'Cloudflare Agents SDK',
      description: 'The Agent (Durable Object) runs a reasoning loop: observe the task, select a browser tool, observe the result, reason about next steps, repeat. State (current URL, extracted data, task progress) is persisted to SQLite across turns. Can signal for human handoff via Human in the Loop when it hits a wall.',
      docsUrl: 'https://developers.cloudflare.com/agents/',
    },
    {
      id: 'browser-tools',
      label: 'Browser Tools',
      sublabel: '@cloudflare/codemode (CDP)',
      icon: '\u{1F9F0}',
      type: 'cloudflare',
      column: 'center',
      product: 'Agents SDK (Browser Tools)',
      description: 'createBrowserTools() from @cloudflare/codemode exposes two LLM-callable tools: browser_search (discover CDP commands, WebMCP tool definitions) and browser_execute (run CDP code in page context). Tools are passed to streamText() and invoked automatically. Works with any CDP-compatible client — Puppeteer, Playwright, Stagehand, or raw CDP.',
      docsUrl: 'https://developers.cloudflare.com/agents/api-reference/browse-the-web/',
    },
    {
      id: 'browser-run',
      label: 'Browser Run',
      sublabel: 'Headless Chrome + CDP endpoint',
      icon: '\u{1F310}',
      type: 'cloudflare',
      column: 'center',
      product: 'Cloudflare Browser Run',
      description: 'Browser Run (formerly Browser Rendering) provides managed headless Chrome on Cloudflare\'s global network. CDP endpoint is exposed directly via WebSocket — connect from any language or environment, not just Workers. Supports Puppeteer, Playwright, Stagehand, MCP clients (Claude Desktop, Cursor, OpenCode via chrome-devtools-mcp), and raw CDP. Quick Action endpoints (/screenshot, /pdf, /markdown, /crawl) for simple tasks. 120 concurrent browsers per account (4x increase).',
      docsUrl: 'https://developers.cloudflare.com/browser-run/cdp/',
    },
    {
      id: 'observability',
      label: 'Live View & Recordings',
      sublabel: 'Real-time + replay',
      icon: '\u{1F4F9}',
      type: 'cloudflare',
      column: 'center',
      product: 'Browser Run Observability',
      description: 'Live View streams the browser session in real time — page, DOM, console, network requests — via devtoolsFrontendURL from Chrome DevTools, or from the Cloudflare dashboard Live Sessions tab. Session Recordings capture DOM changes, mouse/keyboard events, and page navigation as structured JSON (rrweb format) for post-mortem replay. Enabled with recording: true when launching a browser.',
      docsUrl: 'https://developers.cloudflare.com/browser-run/features/live-view/',
    },
    {
      id: 'llm-reason',
      label: 'LLM Reasoning',
      sublabel: 'Tool selection, content analysis',
      icon: '\u{1F9E0}',
      type: 'cloudflare',
      column: 'center',
      product: 'Cloudflare Workers AI',
      description: 'The LLM drives the agent\'s reasoning loop: given the task and current browser state (page content, screenshot, previous tool results), it decides which CDP command or WebMCP tool to call next. For content analysis (extract prices, summarize layout, identify errors), the LLM processes DOM or screenshot output. Workers AI on-network or external providers via AI Gateway.',
      docsUrl: 'https://developers.cloudflare.com/workers-ai/',
    },
    // Right column — web targets + artifact storage
    {
      id: 'target-web',
      label: 'Target Websites',
      sublabel: 'WebMCP-enabled or legacy',
      icon: '\u{1F30D}',
      type: 'resource',
      column: 'right',
      description: 'Any public URL, internal app, or localhost target. WebMCP-aware sites declare agent-callable tools via navigator.modelContext (Chromium 146+) — the agent calls search_flights() or similar directly instead of looping screenshot-analyze-click. The experimental Browser Run pool (wrangler browser create --lab) runs Chrome beta for WebMCP testing. Legacy sites still work via standard DOM navigation.',
      docsUrl: 'https://developers.cloudflare.com/browser-run/features/webmcp/',
    },
    {
      id: 'artifacts',
      label: 'R2 / Artifacts',
      sublabel: 'Screenshots, PDFs, extracted data',
      icon: '\u{1F5BC}',
      type: 'resource',
      column: 'right',
      description: 'Screenshots, PDFs, crawl results, and session recordings stored in R2 for persistent access. Extracted structured data can be written to D1, KV, or R2. Agent SQLite state tracks intermediate results for multi-step scraping. /crawl endpoint returns HTML, Markdown, or structured JSON — respects robots.txt and AI Crawl Control as a signed agent with Web Bot Auth.',
      docsUrl: 'https://developers.cloudflare.com/r2/',
    },
  ],

  edges: [
    { id: 'e-user-agent',       from: 'user-request',     to: 'ai-agent',        label: 'Web task',           direction: 'ltr' },
    { id: 'e-agent-tools',      from: 'ai-agent',         to: 'browser-tools',   label: 'Tool invocation',    direction: 'ltr' },
    { id: 'e-tools-run',        from: 'browser-tools',    to: 'browser-run',     label: 'CDP over WS',        direction: 'ltr' },
    { id: 'e-run-web',          from: 'browser-run',      to: 'target-web',      label: 'Navigate',           direction: 'ltr' },
    { id: 'e-web-run',          from: 'target-web',       to: 'browser-run',     label: 'Rendered page',      direction: 'rtl' },
    { id: 'e-run-tools',        from: 'browser-run',      to: 'browser-tools',   label: 'DOM / screenshot',   direction: 'rtl' },
    { id: 'e-tools-llm',        from: 'browser-tools',    to: 'llm-reason',      label: 'Tool results',       direction: 'ltr' },
    { id: 'e-llm-tools',        from: 'llm-reason',       to: 'browser-tools',   label: 'Next tool call',     direction: 'rtl' },
    { id: 'e-run-obs',          from: 'browser-run',      to: 'observability',   label: 'Live + recording',   direction: 'ltr' },
    { id: 'e-obs-human',        from: 'observability',    to: 'human-operator',  label: 'Live View',          direction: 'rtl' },
    { id: 'e-human-run',        from: 'human-operator',   to: 'browser-run',     label: 'Takes control',      direction: 'ltr' },
    { id: 'e-tools-artifacts',  from: 'browser-tools',    to: 'artifacts',       label: 'Store artifacts',    direction: 'ltr' },
    { id: 'e-agent-user',       from: 'ai-agent',         to: 'user-request',    label: 'Task result',        direction: 'rtl' },
  ],

  steps: [
    {
      title: 'Web task sent to AI Agent',
      product: 'Cloudflare Agents SDK',
      description: 'The user sends a natural language task to the Agent Worker — extract data, monitor a URL, test a form, complete a purchase, or debug a frontend issue. The agent stores the task in SQLite and begins the reasoning loop, deciding which browser tools to invoke.',
      why: 'Natural language task specification means you describe the goal, not the steps. The agent adapts when pages change — no brittle selector maintenance.',
      activeNodes: ['user-request', 'ai-agent'],
      activeEdges: ['e-user-agent'],
      docsUrl: 'https://developers.cloudflare.com/agents/',
    },
    {
      title: 'Browser tools configured and invoked',
      product: 'Agents SDK (Browser Tools)',
      description: 'createBrowserTools() from @cloudflare/codemode exposes two tools: browser_search (discover CDP spec + WebMCP tool definitions on the current page) and browser_execute (run CDP code). Tools are passed to streamText(). The agent can also connect directly as a CDP client via Puppeteer, Playwright, or Stagehand — Browser Run\'s CDP endpoint speaks the standard protocol.',
      why: 'Two generic tools give agents the full power of Chrome DevTools Protocol without bloating the context window with dozens of wrapper tools. Any CDP-compatible library works out of the box.',
      activeNodes: ['ai-agent', 'browser-tools'],
      activeEdges: ['e-agent-tools'],
      docsUrl: 'https://developers.cloudflare.com/agents/api-reference/browse-the-web/',
      owasp: ['ASI02 Tool Misuse & Exploitation', 'ASI05 Unexpected Code Execution (RCE)'],
    },
    {
      title: 'Browser Run starts a headless Chrome session',
      product: 'Cloudflare Browser Run',
      description: 'Browser Tools connect to Browser Run via the WebSocket CDP endpoint (wss://api.cloudflare.com/.../browser-rendering/devtools/browser). Chrome sessions start near the user on Cloudflare\'s global network for low latency. No cold start — instant access from a warm pool. Up to 120 concurrent browsers per account. The experimental pool (--lab) runs Chrome beta for WebMCP testing.',
      why: 'Renaming Browser Rendering to Browser Run reflects that this is the browser-for-agents product. Direct CDP exposure means any language, any environment — you no longer need a Cloudflare Worker to use it. One-line config change from self-hosted Chrome.',
      activeNodes: ['browser-tools', 'browser-run'],
      activeEdges: ['e-tools-run'],
      docsUrl: 'https://developers.cloudflare.com/browser-run/cdp/',
      owasp: ['ASI05 Unexpected Code Execution (RCE)'],
    },
    {
      title: 'Agent navigates — WebMCP accelerates where supported',
      product: 'Cloudflare Browser Run',
      description: 'Browser Run navigates to the target URL and executes the full page — JavaScript, dynamic content, SPAs. For WebMCP-aware sites (Chromium 146+), navigator.modelContext exposes agent-callable tools on the page (e.g. search_flights(origin, destination, date)). The agent calls these directly instead of the slow screenshot-analyze-click loop. For legacy sites, the agent falls back to CDP-based DOM traversal. Cookie and localStorage injection supports auth-gated pages.',
      why: 'WebMCP is the emerging standard for making sites agent-friendly — tools are discovered on the page rather than preloaded. This matters at the long tail of the web where bundling every possible MCP server is infeasible. Legacy sites still work reliably.',
      activeNodes: ['browser-run', 'target-web'],
      activeEdges: ['e-run-web', 'e-web-run', 'e-run-tools'],
      docsUrl: 'https://developers.cloudflare.com/browser-run/features/webmcp/',
    },
    {
      title: 'LLM analyzes output and chooses next action',
      product: 'Cloudflare Workers AI',
      description: 'Browser tool results (DOM excerpts, screenshots, WebMCP tool outputs, accessibility tree, network log) return to the LLM for analysis. The LLM extracts structured data, identifies visual issues, or picks the next CDP command. Workers AI on-network or external LLMs via AI Gateway drive reasoning.',
      why: 'LLM-powered content analysis eliminates brittle CSS selectors — the agent understands semantic meaning and adapts as pages change. Working with raw CDP messages is also more token-efficient than going through higher-level library abstractions.',
      activeNodes: ['browser-tools', 'llm-reason'],
      activeEdges: ['e-tools-llm', 'e-llm-tools'],
      docsUrl: 'https://developers.cloudflare.com/workers-ai/',
      owasp: ['LLM01:2025 Prompt Injection', 'LLM09:2025 Misinformation', 'ASI01 Agent Goal Hijack'],
    },
    {
      title: 'Live View streams the session in real time',
      product: 'Browser Run Observability',
      description: 'Every browser session is observable via Live View. Open the devtoolsFrontendURL from the session response in Chrome, or click into the session from the dashboard Live Sessions tab. You see the page, DOM, console errors, and network requests as they happen. Session Recordings (launch with recording: true) capture the full session as rrweb-format JSON for post-mortem replay with rrweb-player.',
      why: 'Agents fail in ways that are hard to debug without seeing what the agent saw. Live View answers "is this working?" instantly; Session Recordings answer "why did it fail yesterday?" — both close the observability gap that previously made agent debugging guesswork.',
      activeNodes: ['browser-run', 'observability'],
      activeEdges: ['e-run-obs'],
      docsUrl: 'https://developers.cloudflare.com/browser-run/features/session-recording/',
      owasp: ['ASI10 Rogue Agents'],
    },
    {
      title: 'Human-in-the-Loop handoff when the agent hits a wall',
      product: 'Browser Run (Human in the Loop)',
      description: 'When the agent hits a CAPTCHA, login wall, MFA challenge, or edge case it cannot handle, it can hand off to a human instead of failing. The operator opens Live View, takes control of the live browser — click, type, authenticate, submit — and returns control to the agent. The session continues from where it left off; no restart, no lost state.',
      why: 'Pure automation breaks on anything unexpected. Human-in-the-Loop turns "automation failed, start over" into "human intervenes, automation resumes" — unlocking workflows that include sign-ins, payments, and authentication steps that agents legitimately should not handle autonomously.',
      activeNodes: ['observability', 'human-operator', 'browser-run'],
      activeEdges: ['e-obs-human', 'e-human-run'],
      docsUrl: 'https://developers.cloudflare.com/browser-run/features/human-in-the-loop/',
      owasp: ['ASI01 Agent Goal Hijack', 'ASI03 Identity & Privilege Abuse'],
    },
    {
      title: 'Screenshots, PDFs, and crawl data stored in R2',
      product: 'Cloudflare Browser Run',
      description: 'Screenshots, PDFs, markdown extracts, and /crawl endpoint outputs (HTML, Markdown, or structured JSON) are stored in R2. Extracted structured data lands in D1, KV, or R2 depending on access patterns. The /crawl endpoint is a signed agent with Web Bot Auth, respects robots.txt and AI Crawl Control, and does not bypass bot protections or CAPTCHAs.',
      why: 'R2 storage enables visual regression testing (diff screenshots), competitive intelligence archives, compliance snapshots, and web monitoring baselines — all with zero egress fees. Signed-agent behavior makes Browser Run a good-neighbor crawler that site owners can trust.',
      activeNodes: ['browser-tools', 'artifacts'],
      activeEdges: ['e-tools-artifacts'],
      docsUrl: 'https://developers.cloudflare.com/browser-rendering/rest-api/crawl-endpoint/',
      owasp: ['LLM02:2025 Sensitive Information Disclosure'],
    },
    {
      title: 'Task result returned to user',
      product: 'Cloudflare Agents SDK',
      description: 'When the LLM determines the task is complete, the Agent returns the final result: extracted data, summary, screenshot URL, test outcome, or monitoring report. The full browser interaction log (tools called, pages visited, data extracted, human interventions) is persisted in the agent\'s state for audit and replay.',
      why: 'Fully autonomous web task completion with a single natural language instruction, with human handoff as a fallback and full session replay for every run — reduces complex web automation to a conversation.',
      activeNodes: ['ai-agent', 'user-request'],
      activeEdges: ['e-agent-user'],
      docsUrl: 'https://developers.cloudflare.com/agents/api-reference/browse-the-web/',
      owasp: ['ASI10 Rogue Agents'],
    },
  ],
};
