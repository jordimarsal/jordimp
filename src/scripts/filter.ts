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
      status.textContent = status.getAttribute('data-empty-label') || '';
      status.setAttribute('data-empty', 'true');
      return;
    }
    const label = visible === 1 ? status.getAttribute('data-one-label') : status.getAttribute('data-count-label');
    status.textContent = (label || '').replace('{n}', String(visible));
    status.removeAttribute('data-empty');
  };

  const apply = (): void => {
    const active = buttons
      .filter((btn) => btn.getAttribute('aria-pressed') === 'true')
      .map((btn) => btn.getAttribute('data-stack') || '');
    const none = active.length === 0;
    reset?.setAttribute('aria-pressed', none ? 'true' : 'false');
    let visible = 0;
    cards.forEach((card) => {
      const stacks = (card.getAttribute('data-stack') || '').split('|');
      const show = none || active.some((a) => stacks.indexOf(a) !== -1);
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
