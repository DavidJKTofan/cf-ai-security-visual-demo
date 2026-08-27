/**
 * Tooltip — Contextual overlay for node details.
 * Listens for 'show-tooltip' custom events dispatched by FlowEngine.
 *
 * On mobile (<= 768px), renders as a bottom sheet instead of a floating card.
 */

export class Tooltip {
  constructor() {
    this._el = null;
    this._visible = false;
    this._isMobile = false;
    this._init();
  }

  _init() {
    // Create tooltip element
    this._el = document.createElement('div');
    this._el.className = 'tooltip-overlay';
    this._el.setAttribute('role', 'tooltip');
    this._el.setAttribute('aria-hidden', 'true');
    this._el.innerHTML = '<div class="tooltip-card"></div>';
    document.body.appendChild(this._el);

    // Track mobile state
    this._mqMobile = window.matchMedia('(max-width: 48rem)');
    this._isMobile = this._mqMobile.matches;
    this._mqMobile.addEventListener('change', (e) => {
      this._isMobile = e.matches;
      if (this._visible) this.hide();
    });

    // Listen for show-tooltip events
    window.addEventListener('show-tooltip', (e) => {
      this.show(e.detail.node, e.detail.targetEl);
    });

    // Close on click/tap outside
    document.addEventListener('click', (e) => {
      if (this._visible && !this._el.contains(e.target)) {
        // Check if click was on a node — if so, don't close (a new tooltip will replace)
        if (!e.target.closest('.flow-node')) {
          this.hide();
        }
      }
    });

    // Close on escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.hide();
    });
  }

  show(node, targetEl) {
    const card = this._el.querySelector('.tooltip-card');

    card.innerHTML = `
      <h2>${node.label}</h2>
      ${node.product ? `<div class="tooltip-product">${node.product}</div>` : ''}
      <div class="tooltip-description">${this._formatDescription(node.description)}</div>
      ${node.docsUrl ? `<a class="tooltip-link" href="${node.docsUrl}" target="_blank" rel="noopener">View docs &#8599;</a>` : ''}
    `;

    if (this._isMobile) {
      // Bottom-sheet positioning handled entirely by CSS media query
      this._el.style.left = '';
      this._el.style.top = '';
    } else {
      // Desktop: position near the target element
      const rect = targetEl.getBoundingClientRect();
      this._el.style.left = '0px';
      this._el.style.top = '0px';
      const tooltipRect = card.getBoundingClientRect();
      const tooltipWidth = tooltipRect.width;
      const tooltipHeight = tooltipRect.height;

      // Decide placement: try right, then left
      let left = rect.right + 12;
      let top = rect.top + rect.height / 2 - tooltipHeight / 2;

      if (left + tooltipWidth > window.innerWidth) {
        left = rect.left - tooltipWidth - 12;
      }

      // Ensure tooltip stays within viewport
      left = Math.max(8, Math.min(left, window.innerWidth - tooltipWidth - 8));

      // Keep the complete card in the viewport. Long descriptions scroll
      // inside the card while the title and docs link remain visible.
      top = Math.max(8, Math.min(top, window.innerHeight - tooltipHeight - 8));

      this._el.style.left = `${left}px`;
      this._el.style.top = `${top}px`;
    }

    this._el.classList.add('visible');
    this._el.setAttribute('aria-hidden', 'false');
    const description = card.querySelector('.tooltip-description');
    const isScrollable = description.scrollHeight > description.clientHeight + 1;
    description.classList.toggle('is-scrollable', isScrollable);
    description.tabIndex = isScrollable ? 0 : -1;
    if (isScrollable) description.setAttribute('aria-label', 'Scrollable node description');
    this._visible = true;
  }

  _formatDescription(value) {
    const parts = String(value || '').split(/\s*•\s*/).filter(Boolean);
    if (parts.length <= 1) return `<p>${parts[0] || ''}</p>`;

    return `<p>${parts.shift()}</p><ul>${parts.map(part => {
      const separator = part.indexOf(' · ');
      const content = separator > 0
        ? `<strong>${part.slice(0, separator)}</strong>${part.slice(separator)}`
        : part;
      return `<li>${content}</li>`;
    }).join('')}</ul>`;
  }

  hide() {
    this._el.classList.remove('visible');
    this._el.setAttribute('aria-hidden', 'true');
    this._visible = false;
  }
}
