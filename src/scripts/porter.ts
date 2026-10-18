interface PorterCitation {
  source: string;
  title: string;
  heading: string;
}

interface PorterAnswer {
  answer?: unknown;
  citations?: unknown;
  covered?: unknown;
  title?: unknown;
  detail?: unknown;
}

function el(tag: string, className: string, text: string): HTMLElement {
  const node = document.createElement(tag);
  node.className = className;
  node.textContent = text;
  return node;
}

function isCitation(value: unknown): value is PorterCitation {
  if (typeof value !== 'object' || value === null) return false;
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.source === 'string' &&
    typeof candidate.title === 'string' &&
    typeof candidate.heading === 'string'
  );
}

export function initPorter(): void {
  const root = document.querySelector<HTMLElement>('.porter');
  if (!root) return;
  const form = root.querySelector<HTMLFormElement>('.porter__form');
  const input = root.querySelector<HTMLInputElement>('.porter__input');
  const bell = root.querySelector<HTMLButtonElement>('.porter__bell');
  const out = root.querySelector<HTMLElement>('.porter__out');
  if (!form || !input || !bell || !out) return;

  const endpoint = form.dataset.porterEndpoint || '';
  const strings = {
    thinking: form.dataset.thinking || '…',
    notCovered: form.dataset.notCovered || '',
    error: form.dataset.error || '',
    sources: form.dataset.sources || '',
  };

  const renderError = (): void => {
    out.replaceChildren(el('p', 'porter__err', strings.error));
  };

  for (const chip of root.querySelectorAll<HTMLButtonElement>('.porter__ex')) {
    chip.addEventListener('click', () => {
      input.value = (chip.textContent || '').trim();
      input.focus();
    });
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const question = input.value.trim();
    if (!question || bell.disabled) return;

    const lang = document.documentElement.lang || 'en';
    bell.disabled = true;
    out.replaceChildren(el('p', 'porter__thinking', strings.thinking));

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, lang }),
      });
      const body = (await response.json()) as PorterAnswer;
      if (!response.ok || typeof body.answer !== 'string') {
        renderError();
        return;
      }
      const covered = body.covered !== false;
      const parts = [el('p', 'porter__answer', body.answer)];
      if (!covered) parts.push(el('p', 'porter__no', strings.notCovered));
      const citations = Array.isArray(body.citations) ? body.citations.filter(isCitation) : [];
      if (covered && citations.length) {
        parts.push(el('p', 'porter__sources', strings.sources));
        for (const citation of citations) {
          parts.push(
            el('span', 'porter__cite', `↳ ${citation.title} · ${citation.heading} · ${citation.source}`),
          );
        }
      }
      out.replaceChildren(...parts);
    } catch {
      renderError();
    } finally {
      bell.disabled = false;
    }
  });
}
