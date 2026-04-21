/**
 * UC15 — Private Networking for Agents (Cloudflare Mesh + Workers VPC)
 *
 * Give AI agents — whether running on your laptop, on a home Mac mini, or on Workers —
 * secure, bidirectional private access to internal databases, APIs, and MCP servers
 * WITHOUT VPNs, public endpoints, or per-service tunnels.
 *
 * Cloudflare Mesh replaces the legacy patterns:
 *   - VPNs require interactive login — agents can't use them
 *   - SSH tunnels require manual setup per-target
 *   - Exposing internal services publicly is a security risk
 *   - None of these give audit visibility into what agents are doing
 *
 * Key architectural points:
 *   - WARP Connector → renamed "Cloudflare Mesh node"
 *   - WARP Client → renamed "Cloudflare One Client"
 *   - Traffic is bidirectional many-to-many (unlike Tunnel which is unidirectional)
 *   - All Mesh traffic routes through Cloudflare's 330+ city network — NAT traversal solved
 *   - Gateway policies, Access, DLP, and device posture apply automatically
 *   - Workers VPC binding exposes the entire Mesh network to Workers via cf1:network
 *   - Free tier: 50 nodes + 50 users
 *
 * References:
 *   https://blog.cloudflare.com/mesh/
 *   https://developers.cloudflare.com/cloudflare-one/networks/connectors/cloudflare-mesh/
 *   https://blog.cloudflare.com/workers-vpc-open-beta/
 *   https://developers.cloudflare.com/workers-vpc/
 *   https://developers.cloudflare.com/agents/
 */

export const uc15 = {
  id: 'uc15',
  title: 'Private Networking for Agents',
  subtitle: 'Give agents secure, bidirectional private access to internal resources with Cloudflare Mesh and Workers VPC',

  nodes: [
    // Left column — agent clients
    {
      id: 'dev-laptop',
      label: 'Developer Laptop',
      sublabel: 'Coding agent (OpenCode, Cursor, Claude Code)',
      icon: '\u{1F4BB}',
      type: 'user',
      column: 'left',
      description: 'A developer laptop running a local coding agent (OpenCode, Cursor, Claude Code, Codex). The Cloudflare One Client (formerly WARP Client) puts the laptop on the organization\'s Mesh network. The agent can now read from staging databases, query internal analytics, or call internal APIs using private IPs — without tunneling the entire laptop into a cloud VPC.',
      docsUrl: 'https://developers.cloudflare.com/cloudflare-one/team-and-resources/devices/cloudflare-one-client/',
    },
    {
      id: 'mobile-personal',
      label: 'Personal Device',
      sublabel: 'Cloudflare One Client (iOS/macOS)',
      icon: '\u{1F4F1}',
      type: 'user',
      column: 'left',
      description: 'A personal mobile device or home workstation running the Cloudflare One Client. Used to reach personal AI agents (e.g. OpenClaw on a home Mac mini) securely from anywhere — no exposure to the public internet, no home-network port forwarding, no VPN gymnastics.',
    },
    {
      id: 'workers-agent',
      label: 'Workers Agent',
      sublabel: 'Agents SDK + Workers VPC binding',
      icon: '\u{2699}',
      type: 'cloudflare',
      column: 'left',
      product: 'Cloudflare Agents SDK',
      description: 'An agent deployed as a Worker / Durable Object using the Agents SDK. Declares a Workers VPC binding (vpc_networks) in wrangler.jsonc to access the entire Mesh network — no pre-registration of individual resources required. Each fetch() through the binding is routed privately over Cloudflare\'s backbone.',
      docsUrl: 'https://developers.cloudflare.com/workers-vpc/',
    },

    // Center column — Cloudflare Mesh fabric
    {
      id: 'cf-one-client',
      label: 'Cloudflare One Client',
      sublabel: 'Device on-ramp (formerly WARP Client)',
      icon: '\u{1F512}',
      type: 'cloudflare',
      column: 'center',
      product: 'Cloudflare One Client',
      description: 'The user-device on-ramp to the Mesh network. Authenticates with user identity via your IdP; carries device posture signals; enforces Gateway DNS/Network/HTTP policies and Access policies on every connection. One install on a laptop or phone and the device can reach every Mesh node the user is authorized for.',
      docsUrl: 'https://developers.cloudflare.com/cloudflare-one/team-and-resources/devices/cloudflare-one-client/',
    },
    {
      id: 'mesh-edge',
      label: 'Cloudflare Mesh',
      sublabel: 'Global edge backbone, 330+ cities',
      icon: '\u{1F310}',
      type: 'cloudflare',
      column: 'center',
      product: 'Cloudflare Mesh',
      description: 'A unified private network for users, nodes, and agents. All Mesh traffic routes through Cloudflare\'s global backbone — the same infrastructure serving the largest sites on the Internet — which solves NAT traversal without self-hosted relay servers. Bidirectional, many-to-many connectivity between every device and node. Free for up to 50 nodes + 50 users per account. Included with Cloudflare One SASE subscriptions.',
      docsUrl: 'https://developers.cloudflare.com/cloudflare-one/networks/connectors/cloudflare-mesh/',
    },
    {
      id: 'mesh-node',
      label: 'Mesh Nodes',
      sublabel: 'Headless connector on Linux / VMs',
      icon: '\u{1F517}',
      type: 'cloudflare',
      column: 'center',
      product: 'Mesh Node (formerly WARP Connector)',
      description: 'A headless Cloudflare One Client running on a Linux server, VM, bare-metal box, or home hardware (Mac mini). Each node gets a Mesh IP and can reach / be reached by every other Mesh peer. High availability: run multiple connectors with the same token in active-passive mode — advertised routes fail over automatically. A containerized (Docker) variant is shipping later in 2026 for Kubernetes, Docker Compose, and CI/CD runners.',
      docsUrl: 'https://developers.cloudflare.com/cloudflare-one/networks/connectors/cloudflare-mesh/',
    },
    {
      id: 'gateway-policies',
      label: 'Gateway + Access + DLP',
      sublabel: 'Applied automatically to Mesh traffic',
      icon: '\u{1F6E1}',
      type: 'cloudflare',
      column: 'center',
      product: 'Cloudflare One',
      description: 'Because Mesh runs on the Cloudflare One platform, every packet routed through Mesh passes through Cloudflare\'s security stack. Existing Gateway policies (DNS, Network, HTTP), Access rules, DLP profiles, and device posture checks apply to Mesh traffic automatically — no separate configuration, no agent-specific product. Identity-aware routing is on the roadmap: per-node, per-device, per-agent identities visible to policy.',
      docsUrl: 'https://developers.cloudflare.com/cloudflare-one/',
    },
    {
      id: 'workers-vpc',
      label: 'Workers VPC',
      sublabel: 'cf1:network binding',
      icon: '\u{1F4E1}',
      type: 'cloudflare',
      column: 'center',
      product: 'Workers VPC',
      description: 'Workers VPC exposes your entire Mesh network to Workers / Durable Objects / Agents SDK via a single binding using the cf1:network reserved keyword. env.MESH.fetch("http://10.0.1.50/api/data") reaches any internal host on the Mesh, with no per-resource pre-registration. Complements Workers VPC Tunnel bindings for unidirectional reverse-proxy access to external cloud VPCs.',
      docsUrl: 'https://developers.cloudflare.com/workers-vpc/',
    },

    // Right column — private resources
    {
      id: 'home-agent',
      label: 'Home Hardware',
      sublabel: 'OpenClaw on Mac mini',
      icon: '\u{1F3E0}',
      type: 'resource',
      column: 'right',
      description: 'A personal AI agent (e.g. OpenClaw, local Codex) running on home hardware — a Mac mini, NUC, or always-on desktop. Runs a Mesh node so it\'s reachable from mobile/laptop without exposing a public endpoint. The agent has shell, filesystem, and network access to the home network, so exposing it publicly would be catastrophic — Mesh eliminates that risk.',
    },
    {
      id: 'staging-resources',
      label: 'Staging / Internal Services',
      sublabel: 'Databases, APIs, internal MCPs',
      icon: '\u{1F5C4}',
      type: 'resource',
      column: 'right',
      description: 'Private databases (Postgres, ClickHouse), internal APIs, analytics platforms, and internal MCP servers running inside a corporate VPC or on-prem. Mesh nodes on these networks make them reachable from developer laptops and from Worker-hosted agents via private IP — no VPN for developers, no public endpoints, no credential leakage.',
    },
    {
      id: 'multi-cloud',
      label: 'Multi-Cloud VPCs',
      sublabel: 'AWS, GCP, Azure, on-prem',
      icon: '\u{2601}',
      type: 'resource',
      column: 'right',
      description: 'External cloud VPCs (AWS, GCP, Azure) or on-prem networks connected via Mesh nodes. Cross-region and multi-cloud traffic consistently beats public-Internet routing because the Cloudflare edge is the path. Agents can access resources and MCP servers across all your networks from a single Workers VPC binding.',
    },
  ],

  edges: [
    { id: 'e-dev-client',     from: 'dev-laptop',      to: 'cf-one-client',    label: 'Install',           direction: 'ltr' },
    { id: 'e-mobile-client',  from: 'mobile-personal', to: 'cf-one-client',    label: 'Install',           direction: 'ltr' },
    { id: 'e-client-mesh',    from: 'cf-one-client',   to: 'mesh-edge',        label: 'Joins Mesh',        direction: 'ltr' },
    { id: 'e-worker-vpc',     from: 'workers-agent',   to: 'workers-vpc',      label: 'vpc_networks',      direction: 'ltr' },
    { id: 'e-vpc-mesh',       from: 'workers-vpc',     to: 'mesh-edge',        label: 'cf1:network',       direction: 'ltr' },
    { id: 'e-mesh-policies',  from: 'mesh-edge',       to: 'gateway-policies', label: 'Applied to all',    direction: 'ltr' },
    { id: 'e-mesh-nodes',     from: 'mesh-edge',       to: 'mesh-node',        label: 'Private IPs',       direction: 'ltr' },
    { id: 'e-nodes-home',     from: 'mesh-node',       to: 'home-agent',       label: 'Home network',      direction: 'ltr' },
    { id: 'e-nodes-staging',  from: 'mesh-node',       to: 'staging-resources', label: 'Corporate VPC',    direction: 'ltr' },
    { id: 'e-nodes-cloud',    from: 'mesh-node',       to: 'multi-cloud',      label: 'AWS / GCP / Azure', direction: 'ltr' },
    { id: 'e-response-worker', from: 'staging-resources', to: 'workers-agent', label: 'Response',          direction: 'rtl' },
    { id: 'e-response-dev',   from: 'home-agent',      to: 'dev-laptop',       label: 'Response',          direction: 'rtl' },
  ],

  steps: [
    {
      title: 'Devices and servers join one private network',
      product: 'Cloudflare Mesh',
      description: 'Install the Cloudflare One Client on laptops and phones; install a Mesh node (headless Cloudflare One Client) on each Linux server, VM, home Mac mini, or cloud VPC you want reachable. Every device and node gets a Mesh IP and can talk to every other Mesh peer bidirectionally. One tool replaces VPNs, SSH tunnels, and ad-hoc reverse proxies.',
      why: 'Agents can\'t do interactive VPN logins and you don\'t want to expose internal services publicly. Mesh gives every agent, every developer, and every personal device the same consistent private on-ramp — set up in minutes.',
      activeNodes: ['dev-laptop', 'mobile-personal', 'cf-one-client', 'mesh-edge'],
      activeEdges: ['e-dev-client', 'e-mobile-client', 'e-client-mesh'],
      docsUrl: 'https://developers.cloudflare.com/cloudflare-one/networks/connectors/cloudflare-mesh/',
    },
    {
      title: 'Traffic routes through Cloudflare\'s global backbone',
      product: 'Cloudflare Mesh',
      description: 'Every packet between Mesh peers flows through Cloudflare\'s 330+ city edge network — the same backbone serving the largest sites on the Internet. This solves NAT traversal (no self-hosted relay servers, no limited points of presence) and consistently beats public-Internet routing for cross-region and multi-cloud traffic. For mesh nodes, enable HA mode: multiple connectors with the same token in active-passive failover.',
      why: 'Pure peer-to-peer mesh networks fail when peers sit behind NAT. Routing through Cloudflare\'s anycast edge eliminates the degraded-fallback path that plagues self-hosted mesh networks.',
      activeNodes: ['mesh-edge', 'mesh-node', 'home-agent', 'staging-resources', 'multi-cloud'],
      activeEdges: ['e-mesh-nodes', 'e-nodes-home', 'e-nodes-staging', 'e-nodes-cloud'],
      docsUrl: 'https://blog.cloudflare.com/mesh/',
    },
    {
      title: 'Existing Cloudflare One policies apply automatically',
      product: 'Cloudflare One',
      description: 'Mesh is built on the Cloudflare One platform — so your existing Gateway policies (DNS, Network, HTTP), Access rules, DLP profiles, and device posture checks apply to Mesh traffic with zero extra configuration. Start with simple private connectivity. Turn on Gateway policies when you need traffic filtering; enable Access for Infrastructure for SSH/RDP session management; add DLP when sensitive data leaves your network.',
      why: 'You don\'t need a separate product to secure agentic network traffic. The SASE stack you already operate also governs what your agents do on your private network.',
      activeNodes: ['mesh-edge', 'gateway-policies'],
      activeEdges: ['e-mesh-policies'],
      docsUrl: 'https://developers.cloudflare.com/cloudflare-one/',
      owasp: ['ASI02 Tool Misuse & Exploitation', 'ASI03 Identity & Privilege Abuse', 'ASI10 Rogue Agents'],
    },
    {
      title: 'Local coding agent reaches staging via Mesh',
      product: 'Cloudflare One Client',
      description: 'The developer runs Claude Code / Cursor / OpenCode on their laptop. Because the laptop is on the Mesh, the agent reaches a staging Postgres, internal ClickHouse analytics, or internal MCP servers directly over their Mesh private IPs — no VPN prompts, no port forwarding, no "my tunnel died" debugging sessions. Gateway policies still apply. Mesh DNS and hostname routing (e.g. postgres-staging.mesh) are on the roadmap for later in 2026.',
      why: 'This is the #1 workflow blocker for coding agents today: they can see your code, but can\'t see your staging systems. Mesh closes that gap while keeping Zero Trust posture intact.',
      activeNodes: ['dev-laptop', 'staging-resources'],
      activeEdges: ['e-response-dev'],
      docsUrl: 'https://developers.cloudflare.com/cloudflare-one/team-and-resources/devices/cloudflare-one-client/',
      owasp: ['ASI02 Tool Misuse & Exploitation'],
    },
    {
      title: 'Personal agent on home hardware, reachable from anywhere',
      product: 'Cloudflare Mesh',
      description: 'A personal AI agent (OpenClaw, local Codex, home-built tools) runs on a Mac mini at home. A Mesh node on that Mac mini makes it reachable from your phone and work laptop over private IPs — zero public exposure. The agent has shell, filesystem, and home-network access, so exposing it to the Internet even behind a password is a non-starter; Mesh is the right answer.',
      why: 'Personal agents are becoming infrastructure. Mesh is the difference between "accidentally exposed your home network to the Internet" and "secure private access from any device you own."',
      activeNodes: ['mobile-personal', 'home-agent', 'mesh-node'],
      activeEdges: ['e-response-dev'],
    },
    {
      title: 'Workers agent gets the entire Mesh via one binding',
      product: 'Workers VPC',
      description: 'Agents deployed on Workers declare a Workers VPC binding in wrangler.jsonc with network_id: "cf1:network" — a reserved keyword that binds to your Mesh network. Any Worker call like env.MESH.fetch("http://10.0.1.50/api/data") reaches any host on the Mesh, with no pre-registration. This also complements Workers VPC Tunnel bindings, which remain the right choice for unidirectional reverse-proxy access to external cloud VPCs.',
      why: 'Agents on Workers need to see internal APIs, databases, and MCP servers to be useful. Workers VPC + Mesh merges connectivity and compute: the entire Developer Platform now has a secure, audited path to every resource on your private network.',
      activeNodes: ['workers-agent', 'workers-vpc', 'mesh-edge'],
      activeEdges: ['e-worker-vpc', 'e-vpc-mesh'],
      docsUrl: 'https://developers.cloudflare.com/workers-vpc/',
      owasp: ['ASI02 Tool Misuse & Exploitation'],
    },
    {
      title: 'Workers agent calls internal databases and MCPs',
      product: 'Workers VPC + Agents SDK',
      description: 'The Worker-hosted agent calls internal services over private IPs — a staging Postgres, an internal API behind a firewall, a private MCP server. The request flows through the VPC binding, onto the Mesh, over Cloudflare\'s backbone, and into your network. Response flows back the same way. Your origin services stay unpublishable; no one on the Internet can reach them.',
      why: 'Deployed agents can now autonomously observe your entire stack end-to-end — cross-reference logs, suggest optimizations, run experiments — without your security team relaxing posture to let them in.',
      activeNodes: ['workers-agent', 'staging-resources', 'multi-cloud'],
      activeEdges: ['e-response-worker'],
      owasp: ['LLM02:2025 Sensitive Information Disclosure', 'ASI02 Tool Misuse & Exploitation'],
    },
    {
      title: 'Mesh vs Tunnel: when to use which',
      product: 'Cloudflare Tunnel vs Mesh',
      description: 'Cloudflare Tunnel is unidirectional — Cloudflare proxies inbound traffic from the edge to a specific private service (a web app, a database behind a reverse proxy). Cloudflare Mesh is bidirectional, many-to-many — every device and node on the Mesh can reach any other peer by private IP. Use Tunnel for "publish an internal service through Cloudflare." Use Mesh when your agents and developers need to reach arbitrary resources across your fleet.',
      why: 'These are complementary, not competing. A typical enterprise uses Tunnel to expose specific internal web apps behind Access, and Mesh to give agents and developers broad private-network access to everything else.',
      activeNodes: ['workers-vpc', 'mesh-edge', 'mesh-node'],
      activeEdges: [],
      docsUrl: 'https://developers.cloudflare.com/cloudflare-one/networks/connectors/cloudflare-tunnel/',
    },
  ],
};
