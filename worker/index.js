import { uc0 } from '../src/data/uc0-stack-steps.js';
import { uc1 } from '../src/data/uc1-steps.js';
import { uc2 } from '../src/data/uc2-steps.js';
import { uc3 } from '../src/data/uc3-steps.js';
import { uc4 } from '../src/data/uc4-steps.js';
import { uc5 } from '../src/data/uc5-steps.js';
import { uc6 } from '../src/data/uc6-steps.js';
import { uc7 } from '../src/data/uc7-steps.js';
import { uc8 } from '../src/data/uc8-steps.js';
import { uc9 } from '../src/data/uc9-steps.js';
import { uc10 } from '../src/data/uc10-steps.js';
import { uc11 } from '../src/data/uc11-steps.js';
import { uc12 } from '../src/data/uc12-steps.js';
import { uc13 } from '../src/data/uc13-steps.js';
import { uc14 } from '../src/data/uc14-steps.js';
import { uc15 } from '../src/data/uc15-steps.js';
import { uc16 } from '../src/data/uc16-steps.js';

const SITE_ORIGIN = 'https://ai-security.automatic-demo.com';

const USE_CASES = [
  useCase(uc0, 'UC0', 'Reference Architecture', '/use-cases/uc0-internal-stack.html', 'All audiences'),
  useCase(uc1, 'UC1', 'AI Security', '/use-cases/uc1-genai-workforce.html', 'Security / IT'),
  useCase(uc2, 'UC2', 'AI Security', '/use-cases/uc2-govern-agents.html', 'Security / Platform'),
  useCase(uc3, 'UC3', 'AI Security', '/use-cases/uc3-build-with-ai.html', 'Developers / AppSec'),
  useCase(uc4, 'UC4', 'AI Security', '/use-cases/uc4-protect-ai-apps.html', 'AppSec / Developers'),
  useCase(uc5, 'UC5', 'AI Security', '/use-cases/uc5-self-hosted-agents.html', 'Platform / AI Engineers'),
  useCase(uc6, 'UC6', 'AI Security', '/use-cases/uc6-code-execution.html', 'AI Engineers / AppSec'),
  useCase(uc7, 'UC7', 'AI Security', '/use-cases/uc7-multi-agent.html', 'AI Engineers / Platform'),
  useCase(uc8, 'UC8', 'AI Builder', '/use-cases/uc8-unified-billing.html', 'Developers / FinOps'),
  useCase(uc9, 'UC9', 'AI Builder', '/use-cases/uc9-dynamic-routing.html', 'Developers / Platform'),
  useCase(uc10, 'UC10', 'AI Builder', '/use-cases/uc10-rag.html', 'AI Engineers / Developers'),
  useCase(uc11, 'UC11', 'AI Builder', '/use-cases/uc11-voice-agent.html', 'Developers'),
  useCase(uc12, 'UC12', 'AI Builder', '/use-cases/uc12-ai-chat.html', 'Developers'),
  useCase(uc13, 'UC13', 'AI Builder', '/use-cases/uc13-scheduled-agent.html', 'Developers / Ops'),
  useCase(uc14, 'UC14', 'AI Builder', '/use-cases/uc14-browser-agent.html', 'AI Engineers / Developers'),
  useCase(uc15, 'UC15', 'AI Builder', '/use-cases/uc15-private-networking.html', 'Platform / Security'),
  useCase(uc16, 'UC16', 'AI Builder', '/use-cases/uc16-durable-agents.html', 'AI Engineers / Platform'),
];

const USE_CASE_BY_PATH = new Map(USE_CASES.flatMap((item) => pathVariants(item.path).map((path) => [path, item])));
const PAGE_ROUTES = new Set([
  '/',
  '/index.html',
  '/ai-security',
  '/ai-security.html',
  '/ai-builder',
  '/ai-builder.html',
  ...USE_CASE_BY_PATH.keys(),
]);

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const routePath = normalizeRoutePath(url.pathname);

    if (request.method === 'GET' || request.method === 'HEAD') {
      if (wantsMarkdown(request, url)) {
        const markdown = renderMarkdown(routePath);

        if (markdown) {
          return new Response(request.method === 'HEAD' ? null : markdown, {
            headers: markdownHeaders(url, routePath),
          });
        }
      }
    }

    const response = await env.ASSETS.fetch(request);

    if ((request.method === 'GET' || request.method === 'HEAD') && PAGE_ROUTES.has(routePath) && isHtmlResponse(response)) {
      return withMarkdownAlternate(response, url, routePath);
    }

    return response;
  },
};

function useCase(data, number, category, path, audience) {
  return { data, number, category, path, audience };
}

function pathVariants(path) {
  const withoutHtml = path.endsWith('.html') ? path.slice(0, -5) : path;
  return withoutHtml === path ? [path] : [path, withoutHtml];
}

function normalizeRoutePath(pathname) {
  let path = pathname;

  if (path.endsWith('.md')) {
    path = path.slice(0, -3);
  }

  if (path.length > 1 && path.endsWith('/')) {
    path = path.slice(0, -1);
  }

  return path || '/';
}

function wantsMarkdown(request, url) {
  const format = url.searchParams.get('format');

  if (format === 'markdown' || format === 'md' || format === 'text') {
    return true;
  }

  if (url.pathname.endsWith('.md')) {
    return true;
  }

  const accept = request.headers.get('accept') || '';
  const markdownQuality = bestAcceptQuality(accept, ['text/markdown', 'application/markdown', 'application/x-markdown', 'text/plain', 'text/*']);
  const htmlQuality = bestAcceptQuality(accept, ['text/html', 'application/xhtml+xml']);

  return markdownQuality > 0 && markdownQuality >= htmlQuality;
}

function bestAcceptQuality(accept, candidates) {
  return accept
    .split(',')
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean)
    .reduce((best, entry) => {
      const [mediaType, ...params] = entry.split(';').map((part) => part.trim());

      if (!candidates.includes(mediaType)) {
        return best;
      }

      const qualityParam = params.find((param) => param.startsWith('q='));
      const quality = qualityParam ? Number(qualityParam.slice(2)) : 1;

      return Number.isFinite(quality) ? Math.max(best, quality) : best;
    }, 0);
}

function renderMarkdown(routePath) {
  const useCasePage = USE_CASE_BY_PATH.get(routePath);

  if (useCasePage) {
    return renderUseCaseMarkdown(useCasePage);
  }

  if (routePath === '/' || routePath === '/index.html') {
    return renderHomeMarkdown();
  }

  if (routePath === '/ai-security' || routePath === '/ai-security.html') {
    return renderCategoryMarkdown('AI Security', USE_CASES.filter((item) => item.category === 'AI Security'));
  }

  if (routePath === '/ai-builder' || routePath === '/ai-builder.html') {
    return renderCategoryMarkdown('AI Builder', USE_CASES.filter((item) => item.category === 'AI Builder'));
  }

  return null;
}

function renderHomeMarkdown() {
  const securityCases = USE_CASES.filter((item) => item.category === 'AI Security');
  const builderCases = USE_CASES.filter((item) => item.category === 'AI Builder');
  const referenceArchitecture = USE_CASES[0];

  return compactLines([
    '# Cloudflare AI Interactive Visual Demos (Unofficial)',
    '',
    'Unofficial educational demo: explore interactive visual walkthroughs of Cloudflare AI security and AI builder use cases. Not affiliated with or endorsed by Cloudflare.',
    '',
    'Canonical URL: ' + SITE_ORIGIN + '/',
    '',
    '## Featured Reference Architecture',
    '',
    useCaseListItem(referenceArchitecture),
    '',
    '## AI Security',
    '',
    ...securityCases.map(useCaseListItem),
    '',
    '## AI Builder',
    '',
    ...builderCases.map(useCaseListItem),
  ]);
}

function renderCategoryMarkdown(category, cases) {
  const description = category === 'AI Security'
    ? 'Seven walkthroughs for discovering, governing, and protecting AI usage and AI-powered applications.'
    : 'Nine walkthroughs for building AI applications and agentic systems on Cloudflare.';

  return compactLines([
    '# ' + category + ' Use Cases',
    '',
    description,
    '',
    'Canonical URL: ' + SITE_ORIGIN + '/' + slugifyCategory(category),
    '',
    '## Use Cases',
    '',
    ...cases.map(useCaseListItem),
  ]);
}

function renderUseCaseMarkdown(useCasePage) {
  const { data, number, category, path, audience } = useCasePage;
  const canonicalUrl = SITE_ORIGIN + path;

  return compactLines([
    '# ' + data.title,
    '',
    data.subtitle,
    '',
    '- Use case: ' + number,
    '- Category: ' + category,
    '- Primary audience: ' + audience,
    '- Interactive diagram: ' + canonicalUrl,
    '- Canonical URL: ' + canonicalUrl,
    '',
    '## Overview',
    '',
    'This walkthrough contains ' + data.nodes.length + ' architecture nodes, ' + data.edges.length + ' edges, and ' + data.steps.length + ' guided steps.',
    '',
    '## Walkthrough Steps',
    '',
    ...data.steps.flatMap((step, index) => renderStep(step, index)),
    '',
    '## Architecture Nodes',
    '',
    ...data.nodes.flatMap(renderNode),
  ]);
}

function renderStep(step, index) {
  const lines = [
    '### ' + (index + 1) + '. ' + step.title,
    '',
  ];

  if (step.product) {
    lines.push('- Product: ' + step.product);
  }

  if (step.docsUrl) {
    lines.push('- Docs: ' + step.docsUrl);
  }

  if (step.owasp?.length) {
    lines.push('- OWASP mapping: ' + step.owasp.join('; '));
  }

  lines.push('', cleanText(step.description));

  if (step.why) {
    lines.push('', '**Why it matters:** ' + cleanText(step.why));
  }

  lines.push('');
  return lines;
}

function renderNode(node) {
  const lines = [
    '### ' + node.label,
    '',
    '- Type: ' + node.type,
    '- Column: ' + node.column,
  ];

  if (node.sublabel) {
    lines.push('- Subtitle: ' + node.sublabel);
  }

  if (node.product) {
    lines.push('- Product: ' + node.product);
  }

  if (node.docsUrl) {
    lines.push('- Docs: ' + node.docsUrl);
  }

  lines.push('', cleanText(node.description), '');
  return lines;
}

function useCaseListItem(item) {
  return '- [' + item.number + ': ' + item.data.title + '](' + item.path + ') - ' + item.data.subtitle + ' Audience: ' + item.audience + '.';
}

function cleanText(value) {
  return String(value || '').replace(/\n{3,}/g, '\n\n').trim();
}

function compactLines(lines) {
  return lines.join('\n').replace(/\n{3,}/g, '\n\n').trim() + '\n';
}

function slugifyCategory(category) {
  return category.toLowerCase().replace(/\s+/g, '-');
}

function markdownHeaders(url, routePath) {
  const headers = new Headers({
    'Content-Type': 'text/markdown; charset=utf-8',
    'Vary': 'Accept',
    'X-Content-Type-Options': 'nosniff',
  });

  headers.set('Link', '<' + canonicalHtmlUrl(routePath, url) + '>; rel="canonical"; type="text/html"');
  return headers;
}

function isHtmlResponse(response) {
  return (response.headers.get('content-type') || '').toLowerCase().includes('text/html');
}

function withMarkdownAlternate(response, url, routePath) {
  const headers = new Headers(response.headers);
  headers.append('Link', '<' + markdownAlternateUrl(routePath, url) + '>; rel="alternate"; type="text/markdown"');
  appendVary(headers, 'Accept');

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

function appendVary(headers, value) {
  const vary = headers.get('Vary');

  if (!vary) {
    headers.set('Vary', value);
    return;
  }

  const existing = vary.split(',').map((part) => part.trim().toLowerCase());

  if (!existing.includes(value.toLowerCase())) {
    headers.set('Vary', vary + ', ' + value);
  }
}

function markdownAlternateUrl(routePath, requestUrl) {
  const url = new URL(canonicalHtmlUrl(routePath, requestUrl));
  url.searchParams.set('format', 'markdown');
  return url.toString();
}

function canonicalHtmlUrl(routePath, requestUrl) {
  const useCasePage = USE_CASE_BY_PATH.get(routePath);

  if (useCasePage) {
    return new URL(useCasePage.path, SITE_ORIGIN).toString();
  }

  if (routePath === '/' || routePath === '/index.html') {
    return SITE_ORIGIN + '/';
  }

  const path = routePath.endsWith('.html') ? routePath.slice(0, -5) : routePath;
  return new URL(path, SITE_ORIGIN).toString();
}
