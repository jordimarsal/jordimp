interface OpenFloorOptions {
  readonly focus?: boolean;
  readonly scroll?: boolean;
}

export function initBuilding(): void {
  const building = document.querySelector('.building-stack');
  if (!building) return;

  const reduced = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const floors = Array.from(building.querySelectorAll<HTMLElement>('[data-floor]'));
  const panels = Array.from(building.querySelectorAll('.dept-panel'));

  const floorButton = (key: string | null): HTMLElement | null =>
    building.querySelector<HTMLElement>(`[data-floor="${key}"]`);

  const close = (panel: Element): void => {
    panel.classList.remove('open');
    floorButton(panel.id.replace('dept-panel-', ''))?.setAttribute('aria-expanded', 'false');
  };

  const closeAll = (): void => {
    panels.forEach(close);
  };

  const openFloor = (key: string | null, options: OpenFloorOptions = {}): void => {
    const panel = document.getElementById(`dept-panel-${key}`);
    const btn = floorButton(key);
    if (!panel || !btn) return;
    const wasOpen = panel.classList.contains('open');
    closeAll();
    if (wasOpen) {
      btn.focus();
      return;
    }
    panel.classList.add('open');
    btn.setAttribute('aria-expanded', 'true');
    if (options.focus !== false) {
      panel.querySelector<HTMLElement>('h3')?.focus({ preventScroll: true });
    }
    if (options.scroll !== false) {
      const behavior = reduced ? 'auto' : 'smooth';
      const top = panel.getBoundingClientRect().top + window.pageYOffset - 76;
      window.scrollTo({ top, behavior });
    }
  };

  floors.forEach((btn) => {
    btn.addEventListener('click', () => {
      openFloor(btn.getAttribute('data-floor'));
    });
  });

  building.addEventListener('click', (event) => {
    if (!(event.target instanceof Element)) return;
    const closer = event.target.closest('[data-close-panel]');
    if (!closer) return;
    const panel = closer.closest('.dept-panel');
    if (!panel) return;
    close(panel);
    floorButton(panel.id.replace('dept-panel-', ''))?.focus();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    const open = panels.find((panel) => panel.classList.contains('open'));
    if (!open) return;
    close(open);
    floorButton(open.id.replace('dept-panel-', ''))?.focus();
  });

  const openFromHash = (focus: boolean): void => {
    const match = /^#dept-([a-z0-9-]+)$/i.exec(window.location.hash);
    if (!match) return;
    openFloor(match[1], { focus, scroll: focus });
  };

  window.addEventListener('hashchange', () => {
    openFromHash(true);
  });

  openFromHash(false);
}
