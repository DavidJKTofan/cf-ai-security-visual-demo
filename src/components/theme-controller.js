(function () {
  const storageKey = 'cf-ai-theme';
  const media = window.matchMedia('(prefers-color-scheme: dark)');

  function storedTheme() {
    try {
      const value = localStorage.getItem(storageKey);
      return value === 'light' || value === 'dark' ? value : null;
    } catch {
      return null;
    }
  }

  function applyTheme(theme) {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;

    const themeColor = document.querySelector('meta[name="theme-color"]');
    if (themeColor) {
      themeColor.content = theme === 'dark' ? '#0d1117' : '#f7f4ef';
    }

    const button = document.querySelector('.theme-toggle');
    if (button) {
      button.setAttribute('aria-pressed', String(theme === 'dark'));
      button.setAttribute('aria-label', `Theme: ${theme}. Switch to ${theme === 'dark' ? 'light' : 'dark'} mode.`);
      button.title = `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`;
      button.querySelector('.theme-toggle-label').textContent = theme === 'dark' ? 'Dark' : 'Light';
    }

    requestAnimationFrame(() => window.dispatchEvent(new Event('resize')));
  }

  applyTheme(storedTheme() || (media.matches ? 'dark' : 'light'));

  document.addEventListener('DOMContentLoaded', () => {
    const header = document.querySelector('.diagram-header, .landing-header, .map-header');
    if (!header || header.querySelector('.theme-toggle')) return;

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'theme-toggle';
    button.innerHTML = '<span class="theme-toggle-label"></span>';
    button.addEventListener('click', () => {
      const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
      try {
        localStorage.setItem(storageKey, next);
      } catch {
        // The selected theme still applies for this page when storage is unavailable.
      }
      applyTheme(next);
    });
    header.append(button);
    applyTheme(document.documentElement.dataset.theme);
  });

  const handleSystemThemeChange = (event) => {
    if (!storedTheme()) applyTheme(event.matches ? 'dark' : 'light');
  };
  if (media.addEventListener) media.addEventListener('change', handleSystemThemeChange);
  else media.addListener(handleSystemThemeChange);
})();
