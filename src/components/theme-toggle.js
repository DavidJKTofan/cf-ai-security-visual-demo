/**
 * Theme Toggle — Light / Dark mode switcher
 * Self-initialising: mounts a toggle button into the page header.
 */

const STORAGE_KEY = "theme";

function getTheme() {
	return document.documentElement.getAttribute("data-theme") || "dark";
}

function setTheme(theme) {
	document.documentElement.setAttribute("data-theme", theme);
	localStorage.setItem(STORAGE_KEY, theme);

	const metaThemeColor = document.querySelector('meta[name="theme-color"]');
	if (metaThemeColor) {
		metaThemeColor.setAttribute(
			"content",
			theme === "light" ? "#f5f6f8" : "#0d1117",
		);
	}
	const metaColorScheme = document.querySelector('meta[name="color-scheme"]');
	if (metaColorScheme) {
		metaColorScheme.setAttribute("content", theme);
	}
}

function createToggleButton() {
	const btn = document.createElement("button");
	btn.className = "btn-theme-toggle";
	btn.setAttribute("aria-label", "Toggle light/dark mode");
	btn.setAttribute("title", "Toggle light/dark mode");

	function updateIcon() {
		btn.innerHTML = getTheme() === "dark" ? "☀️" : "🌙";
	}
	updateIcon();

	btn.addEventListener("click", () => {
		setTheme(getTheme() === "dark" ? "light" : "dark");
		updateIcon();
	});

	return btn;
}

function injectStyles() {
	const style = document.createElement("style");
	style.textContent = `
    .btn-theme-toggle {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 2.25rem;
      height: 2.25rem;
      min-height: 2.75rem;
      min-width: 2.75rem;
      border: 1px solid var(--border-color);
      border-radius: var(--radius-sm);
      background: var(--bg-tertiary);
      font-size: 1rem;
      cursor: pointer;
      transition: background var(--transition-fast), border-color var(--transition-fast);
      flex-shrink: 0;
      margin-left: auto;
      -webkit-tap-highlight-color: transparent;
    }
    .btn-theme-toggle:hover {
      background: var(--bg-card-hover);
      border-color: var(--cf-orange);
    }
  `;
	document.head.appendChild(style);
}

function mount() {
	injectStyles();
	const btn = createToggleButton();

	const header =
		document.querySelector(".diagram-header") ||
		document.querySelector(".landing-header") ||
		document.querySelector(".category-header");

	if (header) {
		header.appendChild(btn);
	}
}

if (document.readyState === "loading") {
	document.addEventListener("DOMContentLoaded", mount);
} else {
	mount();
}
