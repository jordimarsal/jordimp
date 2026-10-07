export function initFilter(): void {
  const filter = document.querySelector('.filter-chips');
  if (!filter) return;
  const wrap = filter.closest('details');
  if (wrap && window.innerWidth > 760) {
    wrap.setAttribute('open', '');
  }
  const cards = Array.from(document.querySelectorAll<HTMLElement>('.card[data-stack]'));
  const buttons = Array.from(filter.querySelectorAll<HTMLElement>('button[data-stack]'));
  const reset = filter.querySelector<HTMLElement>('button[data-reset]');
  const status = document.getElementById('filter-status');

  const syncStatus = (visible: number): void => {
    if (!status) return;
    if (visible === 0) {
      status.textContent = status.dataset.emptyLabel || '';
      status.dataset.empty = 'true';
      return;
    }
    const label = visible === 1 ? status.dataset.oneLabel : status.dataset.countLabel;
    status.textContent = (label || '').replace('{n}', String(visible));
    delete status.dataset.empty;
  };

  const apply = (): void => {
    const active = buttons
      .filter((btn) => btn.getAttribute('aria-pressed') === 'true')
      .map((btn) => btn.dataset.stack || '');
    const none = active.length === 0;
    reset?.setAttribute('aria-pressed', none ? 'true' : 'false');
    let visible = 0;
    cards.forEach((card) => {
      const stacks = new Set((card.dataset.stack || '').split('|'));
      const show = none || active.some((a) => stacks.has(a));
      card.hidden = !show;
      if (show) visible += 1;
    });
    syncStatus(visible);
    document.querySelectorAll<HTMLElement>('.cards--tier').forEach((section) => {
      const anyVisible = Array.from(section.querySelectorAll<HTMLElement>('.card[data-stack]'))
        .some((card) => !card.hidden);
      section.hidden = !anyVisible;
    });
  };

  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const pressed = btn.getAttribute('aria-pressed') === 'true';
      btn.setAttribute('aria-pressed', pressed ? 'false' : 'true');
      apply();
    });
  });

  reset?.addEventListener('click', () => {
    buttons.forEach((btn) => {
      btn.setAttribute('aria-pressed', 'false');
    });
    apply();
  });

  apply();
}
