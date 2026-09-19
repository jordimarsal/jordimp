export function initCopy(): void {
  const buttons = Array.from(document.querySelectorAll<HTMLElement>('[data-copy]'));
  if (!buttons.length) return;
  const status = document.getElementById('copy-status');

  const flash = (message: string): void => {
    if (status) status.textContent = message;
  };

  const fallbackCopy = (text: string): boolean => {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    let ok = false;
    try {
      ok = document.execCommand('copy');
    } catch {
      ok = false;
    }
    document.body.removeChild(ta);
    return ok;
  };

  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const text = btn.getAttribute('data-copy') || '';
      const done = btn.getAttribute('data-copied') || 'COPIED';
      const fail = btn.getAttribute('data-fail') || 'COPY FAILED';
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

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(succeed, () => {
          if (fallbackCopy(text)) {
            succeed();
          } else {
            failHard();
          }
        });
      } else if (fallbackCopy(text)) {
        succeed();
      } else {
        failHard();
      }
    });
  });
}
