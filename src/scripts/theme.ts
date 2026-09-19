export function initTheme(): void {
  const btn = document.querySelector<HTMLElement>('[data-night-toggle]');
  if (!btn) return;
  const root = document.documentElement;

  const sync = (): void => {
    const night = root.getAttribute('data-night') === '1';
    btn.setAttribute('aria-pressed', night ? 'true' : 'false');
  };

  btn.addEventListener('click', () => {
    const night = root.getAttribute('data-night') === '1';
    if (night) {
      root.removeAttribute('data-night');
    } else {
      root.setAttribute('data-night', '1');
    }
    try {
      localStorage.setItem('jordimp-night', night ? '0' : '1');
    } catch {
      // localStorage unavailable (privacy mode): the choice only lasts the visit
    }
    sync();
  });

  if (window.matchMedia) {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = (event: MediaQueryListEvent): void => {
      let stored: string | null = null;
      try {
        stored = localStorage.getItem('jordimp-night');
      } catch {
        stored = null;
      }
      if (stored !== null) return;
      if (event.matches) {
        root.setAttribute('data-night', '1');
      } else {
        root.removeAttribute('data-night');
      }
      sync();
    };
    if (mq.addEventListener) {
      mq.addEventListener('change', onChange);
    }
  }

  sync();
}
