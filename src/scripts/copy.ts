export function initCopy(): void {
  const buttons = Array.from(document.querySelectorAll<HTMLElement>('[data-copy]'));
  if (!buttons.length) return;
  const status = document.getElementById('copy-status');

  const flash = (message: string): void => {
    if (status) status.textContent = message;
  };

  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const text = btn.dataset.copy || '';
      const done = btn.dataset.copied || 'COPIED';
      const fail = btn.dataset.fail || 'COPY FAILED';
      const original = btn.textContent || '';
      let timer: ReturnType<typeof setTimeout> | null = null;

      const reset = (): void => {
        if (timer) clearTimeout(timer);
        timer = setTimeout(() => {
          btn.textContent = original;
          btn.classList.remove('is-copied');
        }, 2200);
      };

      const succeed = (): void => {
        btn.textContent = done;
        btn.classList.add('is-copied');
        flash(done);
        reset();
      };

      const failHard = (): void => {
        btn.textContent = fail;
        flash(fail);
        reset();
      };

      const write = navigator.clipboard?.writeText(text);
      if (write) {
        write.then(succeed, failHard);
      } else {
        failHard();
      }
    });
  });
}
