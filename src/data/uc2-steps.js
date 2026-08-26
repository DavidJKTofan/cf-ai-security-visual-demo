/**
 * UC2 — Govern AI Agents & MCP
 * Secure interactions between human users, MCP clients, LLMs, and remote MCP servers
 * via Cloudflare's governance layer: Access (ZTNA), Gateway (DLP), MCP Server Portals,
 * AI Gateway, Worker Isolate (Codemode), and Remote MCP Servers.
 *
 * Key governance principle: Remote MCP servers via Cloudflare are recommended over local
 * installations. Local MCP servers = shadow IT risk with no audit trail.
 * Remote MCP servers = centralized visibility, identity-based access, and audit logging.
 *
 * MCP authorization uses OAuth 2.1. Cloudflare Access acts as the OAuth provider,
 * issuing OAuth ID tokens with user identity attributes. Access policies apply per
 * upstream server; portal administrators separately curate and toggle exposed tools.
 *
 * MCP portal traffic can be routed through
 * Cloudflare Gateway for HTTP logging and DLP scanning via Gateway HTTP policies.
 *
 * References:
 *   https://developers.cloudflare.com/agents/model-context-protocol/governance/
 *   https://developers.cloudflare.com/cloudflare-one/access-controls/ai-controls/mcp-portals/
 *   https://developers.cloudflare.com/agents/guides/remote-mcp-server/
 *   https://developers.cloudflare.com/ai-gateway/
 *   https://developers.cloudflare.com/dynamic-workers/
 *   https://developers.cloudflare.com/agents/api-reference/codemode/
 *   https://developers.cloudflare.com/cloudflare-one/traffic-policies/
 *   https://developers.cloudflare.com/cloudflare-one/data-loss-prevention/dlp-policies/
 *   https://blog.cloudflare.com/mcp-v2/
 *   https://blog.cloudflare.com/mcp-security-updates/
 */

export const uc2 = {
  id: 'uc2',
  title: 'Govern AI Agents & MCP',
  subtitle: 'Secure interactions between human users and AI agents via MCP',

  nodes: [
    // Left column — Human, MCP Clients, LLMs, AI Gateway
    {
      id: 'human-user',
      label: 'User',
      sublabel: 'Employee or developer',
      icon: '\u{1F464}',
      type: 'user',
      column: 'left',
      description: 'A human user who interacts with AI agents through MCP client applications.',
    },
    {
      id: 'mcp-clients',
      label: 'MCP Clients',
      sublabel: 'OpenCode, Claude Code',
      icon: '\u{1F4BB}',
      type: 'user',
      column: 'left',
      description: 'MCP host/client applications such as OpenCode, Claude Code, Cursor IDE, or Claude Desktop. These translate user intent into MCP protocol requests sent to remote MCP servers.',
    },
    {
      id: 'llms',
      label: 'LLMs',
      sublabel: 'Claude, Gemini, GPT, etc.',
      icon: '\u{1F916}',
      type: 'ai-service',
      column: 'left',
      description: 'Large Language Models that power the AI agents embedded in MCP clients. The LLM decides which tools to call and generates the tool call parameters.',
    },
    {
      id: 'ai-gateway',
      label: 'AI Gateway',
      sublabel: 'Cost controls, logging',
      icon: '\u{1F4CA}',
      type: 'cloudflare',
      column: 'left',
      product: 'Cloudflare AI Gateway',
      description: 'AI Gateway provides cost controls, rate limiting, caching, and logging for LLM API calls. Tracks token usage, latency, and costs across all AI providers from a unified dashboard.',
      docsUrl: 'https://developers.cloudflare.com/ai-gateway/',
    },

    // Center column — Cloudflare governance layer
    {
      id: 'cf-gateway',
      label: 'Cloudflare Gateway',
      sublabel: 'HTTP inspection, DLP',
      icon: '\u{1F6E1}',
      type: 'cloudflare',
      column: 'center',
      product: 'Cloudflare Gateway',
      description: 'Gateway identifies TLS-inspected remote MCP traffic using protocol signals, exposes the experimental.is_mcp selector, and distinguishes direct client traffic from the mcp_portal Traffic Source. Gateway policies can monitor or block direct MCP connections, while portal routing adds HTTP logging and DLP for compatible upstream calls.',
      docsUrl: 'https://developers.cloudflare.com/cloudflare-one/traffic-policies/',
    },
    {
      id: 'worker-isolate',
      label: 'Worker Isolate',
      sublabel: 'Codemode sandbox',
      icon: '\u{1F4E6}',
      type: 'cloudflare',
      column: 'center',
      product: 'Dynamic Workers / Codemode',
      description: 'Dynamic Workers spin up isolated V8 sandboxes for MCP tool execution via Codemode. MCP Server Portals natively support portal-level Code Mode: add ?codemode=search_and_execute to the portal URL and the portal advertises a small code interface instead of listing every upstream MCP tool. The agent writes JavaScript against typed codemode.* methods, generated code runs in an isolated Dynamic Worker, and credentials stay out of model context.',
      docsUrl: 'https://developers.cloudflare.com/cloudflare-one/access-controls/ai-controls/mcp-portals/#code-mode',
    },
    {
      id: 'mcp-portal',
      label: 'MCP Server Portal',
      sublabel: 'Discovery, OAuth, DLP',
      icon: '\u{1F6AA}',
      type: 'cloudflare',
      column: 'center',
      product: 'Cloudflare MCP Server Portal',
      description: 'Centralizes multiple MCP servers onto one endpoint. Admins curate tools, turn tools on/off, and configure prompt templates. Portals support unauthenticated and OAuth-secured upstreams, including pre-registered OAuth clients with manual credentials. Portal logs provide audit views; Gateway routing adds compatible HTTP policy and DLP controls.',
      docsUrl: 'https://developers.cloudflare.com/cloudflare-one/access-controls/ai-controls/mcp-portals/',
    },
    {
      id: 'remote-mcp',
      label: 'Remote MCP Servers',
      sublabel: 'Stateless Workers handler',
      icon: '\u{2699}',
      type: 'cloudflare',
      column: 'center',
      product: 'Cloudflare Workers',
      description: 'MCP 2026-07-28 is stateless: createMcpHandler can serve tools, prompts, resources, and elicitation from a Worker without a protocol session or Durable Object. Use Durable Objects only when the application itself needs coordinated state. McpAgent is deprecated and feature-frozen; migration can preserve legacy stateless clients on the same endpoint.',
      docsUrl: 'https://developers.cloudflare.com/agents/model-context-protocol/guides/migrate-to-mcp-sdk-v2/',
    },
    {
      id: 'cf-access',
      label: 'ZTNA (Access)',
      sublabel: 'SSO + MFA',
      icon: '\u{1F512}',
      type: 'cloudflare',
      column: 'center',
      product: 'Cloudflare Access',
      description: 'Zero Trust Network Access with SSO and MFA enforcement. Access policies control which users and groups can reach each portal and server. Managed OAuth provides the MCP client transport while enforcing the same Access policies. Upstream pre-registered OAuth applications remain tied to each user\'s authorization.',
      docsUrl: 'https://developers.cloudflare.com/cloudflare-one/access-controls/policies/',
    },

    // Right column — Downstream resources
    {
      id: 'saas-mcp',
      label: 'SaaS MCP Servers',
      sublabel: 'Slack, Jira, GitHub',
      icon: '\u{1F4E1}',
      type: 'resource',
      column: 'right',
      description: 'MCP servers for SaaS applications — Slack, Jira, GitHub, and other third-party services accessed via MCP tool invocations through the portal.',
    },
    {
      id: 'internal-services',
      label: 'Internal Services',
      sublabel: 'Databases, APIs',
      icon: '\u{1F3E2}',
      type: 'resource',
      column: 'right',
      description: 'Internal services, databases, private APIs, and self-hosted applications accessed by remote MCP servers running on Cloudflare Workers.',
    },
  ],

  edges: [
    // Left column flow
    { id: 'e-user-clients', from: 'human-user', to: 'mcp-clients', label: '', direction: 'ltr' },
    { id: 'e-clients-gateway', from: 'mcp-clients', to: 'cf-gateway', label: 'MCP request', direction: 'ltr' },
    { id: 'e-llms-aigateway', from: 'llms', to: 'ai-gateway', label: '', direction: 'ltr' },

    // Center column flow
    { id: 'e-gateway-isolate', from: 'cf-gateway', to: 'worker-isolate', label: '', direction: 'ltr' },
    { id: 'e-gateway-portal', from: 'cf-gateway', to: 'mcp-portal', label: 'DLP scan', direction: 'ltr' },
    { id: 'e-portal-remote', from: 'mcp-portal', to: 'remote-mcp', label: '', direction: 'ltr' },
    { id: 'e-access-portal', from: 'cf-access', to: 'mcp-portal', label: 'Policy', direction: 'ltr' },

    // Right column flow
    { id: 'e-remote-saas', from: 'remote-mcp', to: 'saas-mcp', label: 'API call', direction: 'ltr' },
    { id: 'e-remote-internal', from: 'remote-mcp', to: 'internal-services', label: 'API call', direction: 'ltr' },

    // Response path
    { id: 'e-resp-clients', from: 'remote-mcp', to: 'mcp-clients', label: 'Response', direction: 'rtl' },
  ],

  steps: [
    {
      title: 'User connects via MCP client',
      product: 'MCP Protocol',
      description: 'The user opens OpenCode, Claude Code, Cursor, Claude Desktop, or another MCP client and connects to the organization\'s portal. MCP 2026-07-28 removes the required initialize handshake, Mcp-Session-Id, and protocol session: each request carries its protocol version, identity, and capabilities. Optional server/discover supports capability discovery.',
      why: 'The stateless protocol maps cleanly to ordinary HTTP infrastructure. A centralized portal URL then adds an approved path for identity, catalog curation, and audit without requiring each upstream server to maintain protocol sessions.',
      activeNodes: ['human-user', 'mcp-clients'],
      activeEdges: ['e-user-clients'],
    },
    {
      title: 'LLM calls routed through AI Gateway',
      product: 'Cloudflare AI Gateway',
      description: 'LLM inference calls from the MCP client are routed through AI Gateway for cost controls, rate limiting, caching, and unified logging. AI Gateway tracks token usage, latency, and costs across all AI providers from a single dashboard.',
      why: 'AI Gateway provides visibility and cost control over LLM API usage. Rate limiting prevents abuse, caching reduces redundant calls, and unified analytics show which models and providers agents are using.',
      activeNodes: ['llms', 'ai-gateway'],
      activeEdges: ['e-llms-aigateway'],
      docsUrl: 'https://developers.cloudflare.com/ai-gateway/',
      owasp: ['LLM10:2025 Unbounded Consumption'],
    },
    {
      title: 'Gateway inspects MCP traffic',
      product: 'Cloudflare Gateway',
      description: 'On managed paths with TLS inspection, Gateway identifies remote MCP traffic from protocol-level signals and exposes the experimental.is_mcp selector. The MCP dashboard shows users, servers, request volume, and whether traffic used a portal. Combine Is MCP with Traffic Source to monitor or block direct connections while allowing mcp_portal traffic. Local stdio, off-network, Do Not Inspect, and nonconforming traffic remain outside this view.',
      why: 'Hostname and /mcp path matching misses ordinary URLs and can create false positives. Protocol detection provides a stronger signal, while Traffic Source separates unknown shadow MCP from bypass of an approved portal.',
      activeNodes: ['mcp-clients', 'cf-gateway'],
      activeEdges: ['e-clients-gateway'],
      docsUrl: 'https://blog.cloudflare.com/mcp-security-updates/',
      owasp: ['LLM02:2025 Sensitive Information Disclosure', 'ASI01 Agent Goal Hijack', 'ASI02 Tool Misuse & Exploitation'],
    },
    {
      title: 'Portal Code Mode sandboxes tool execution',
      product: 'MCP Portal + Dynamic Workers',
      description: 'MCP Server Portals support portal-level Code Mode — append ?codemode=search_and_execute to the portal URL. Instead of listing every upstream tool from every connected MCP server, the portal advertises a small model-facing code interface. The agent writes JavaScript against typed codemode.* methods, and the generated code runs in an isolated Dynamic Worker environment so credentials and environment variables stay out of model context. For context optimization, the related optimize_context=search_and_execute mode exposes query and execute tools so agents discover tool definitions on demand.',
      why: 'Classic MCP loads every tool schema upfront, consuming context before the model starts working. Portal Code Mode scales cleanly because the model-facing surface stays small as more MCP servers are connected behind the portal. Sandboxed execution keeps tool invocation safe and auditable, bridging the security boundary via typed Workers RPC.',
      activeNodes: ['cf-gateway', 'worker-isolate'],
      activeEdges: ['e-gateway-isolate'],
      docsUrl: 'https://developers.cloudflare.com/cloudflare-one/access-controls/ai-controls/mcp-portals/#code-mode',
      owasp: ['LLM06:2025 Excessive Agency', 'ASI05 Unexpected Code Execution (RCE)'],
    },
    {
      title: 'MCP Portal routes tool calls',
      product: 'Cloudflare MCP Server Portal',
      description: 'The MCP Server Portal aggregates multiple servers onto a single endpoint. Admins curate tools, turn individual tools on/off, and configure prompt templates. For upstream providers that require a registered OAuth application, admins can configure the callback URL and manual client credentials; each user still authorizes access to their own upstream data. Logpush exports portal activity.',
      why: 'Centralized portal management replaces per-server configuration. Admins control exactly which tools are available — the less external context exposed to the AI model, the better the responses. Audit logging provides compliance-ready visibility into all MCP usage.',
      activeNodes: ['cf-gateway', 'mcp-portal'],
      activeEdges: ['e-gateway-portal'],
      docsUrl: 'https://developers.cloudflare.com/cloudflare-one/access-controls/ai-controls/mcp-portals/',
      owasp: ['LLM06:2025 Excessive Agency', 'ASI02 Tool Misuse & Exploitation', 'ASI04 Agentic Supply Chain Vulnerabilities'],
    },
    {
      title: 'Access enforces identity per upstream server',
      product: 'Cloudflare Access',
      description: 'Access enforces SSO and MFA for the portal, while per-server policies control which users and groups can reach each upstream. Managed OAuth is enabled by default on new MCP portals and carries the same Access policy into MCP clients. MCP 2026-07-28 prefers pre-registered clients, then Client ID Metadata Documents; Dynamic Client Registration is deprecated for new implementations.',
      why: 'Identity and client registration are separate concerns. Access governs the user at the portal, while audience-bound OAuth tokens and explicit client registration reduce authorization confusion at upstream servers.',
      activeNodes: ['cf-access', 'mcp-portal'],
      activeEdges: ['e-access-portal'],
      docsUrl: 'https://developers.cloudflare.com/cloudflare-one/access-controls/policies/',
      owasp: ['LLM06:2025 Excessive Agency', 'LLM01:2025 Prompt Injection', 'ASI02 Tool Misuse & Exploitation', 'ASI03 Identity & Privilege Abuse'],
    },
    {
      title: 'Remote MCP server executes tool',
      product: 'Cloudflare Workers',
      description: 'A Worker using createMcpHandler executes the tool call with the stateless MCP 2026-07-28 protocol. Streamable HTTP requests expose Mcp-Method and Mcp-Name headers, allowing HTTP infrastructure to apply operation-aware policy and metrics. Durable Objects remain available when the tool application needs durable state, but MCP itself no longer requires one.',
      why: 'Stateless servers remove sticky routing and session-draining complexity. Applications pay for coordinated state only when their own behavior needs it, not because the protocol imposes it.',
      activeNodes: ['mcp-portal', 'remote-mcp', 'saas-mcp', 'internal-services'],
      activeEdges: ['e-portal-remote', 'e-remote-saas', 'e-remote-internal'],
      docsUrl: 'https://developers.cloudflare.com/agents/model-context-protocol/apis/handler-api/',
      owasp: ['LLM06:2025 Excessive Agency', 'ASI05 Unexpected Code Execution (RCE)'],
    },
    {
      title: 'All interactions logged and audited',
      product: 'Cloudflare Access',
      description: 'Portal logs provide per-portal and per-server activity, Gateway HTTP logs show protocol detection, Traffic Source, and DLP events, and the MCP dashboard summarizes users and servers. Logpush exports supported logs to external destinations. AI Gateway separately tracks the model calls and costs that led the agent to invoke tools.',
      why: 'No single control point sees local stdio, all network paths, authorization decisions, and model behavior. Correlating portal, Gateway, Access, server, and AI Gateway telemetry gives the most complete investigation trail.',
      activeNodes: ['mcp-portal', 'cf-gateway', 'ai-gateway'],
      activeEdges: [],
      docsUrl: 'https://developers.cloudflare.com/cloudflare-one/access-controls/ai-controls/mcp-portals/#view-portal-logs',
      owasp: ['ASI10 Rogue Agents', 'ASI08 Cascading Failures'],
    },
    {
      title: 'Response returns to user',
      product: 'MCP Protocol',
      description: 'The tool execution result is returned through the remote MCP server, back through the MCP Server Portal, and ultimately presented to the human user in their MCP client. Gateway DLP scans apply to response traffic as well when Gateway routing is enabled.',
      why: 'The complete round-trip is secured and audited. The user receives results knowing that identity, authorization, DLP, and sandboxing policies were enforced at every step.',
      activeNodes: ['remote-mcp', 'mcp-clients', 'human-user'],
      activeEdges: ['e-resp-clients'],
    },
  ],
};
