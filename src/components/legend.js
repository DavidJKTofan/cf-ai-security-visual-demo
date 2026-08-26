/**
 * Legend — Renders the product/node-type legend bar.
 */

export class Legend {
  constructor(containerEl, items) {
    this._container = containerEl;
    this._items = items || [
      { type: 'user', label: 'User / Device' },
      { type: 'cloudflare', label: 'Cloudflare Product' },
      { type: 'ai-service', label: 'AI Service' },
      { type: 'resource', label: 'Resource / API' },
      { type: 'coming-soon', label: 'Coming Soon' },
    ];
    this._render();
  }

  _render() {
    const items = this._items.map(item => `
      <div class="legend-item">
        <span class="legend-dot ${item.type}"></span>
        <span>${item.label}</span>
      </div>
    `).join('');

    this._container.innerHTML = items + `
      <div class="legend-meta">
        <span>Disclaimer: Educational demo only</span>
        <span aria-hidden="true">&middot;</span>
        <span>Last Updated: <time datetime="2026-08-25">August 25, 2026</time></span>
      </div>
    `;
  }
}
