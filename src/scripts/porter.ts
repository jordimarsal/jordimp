interface PorterCitation {
  source: string;
  title: string;
  heading: string;
}

interface PorterAnswer {
  answer?: unknown;
  citations?: unknown;
  covered?: unknown;
}

interface StreamEvent {
  type?: string;
  text?: unknown;
  answer?: unknown;
  citations?: unknown;
  covered?: unknown;
  top_score?: unknown;
  threshold?: unknown;
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

/** Consume the ask-api SSE stream (`/api/ask/stream`, POST + ReadableStream). */
async function streamAnswer(
  endpoint: string,
  question: string,
  lang: string,
  handlers: {
    onDelta: (text: string) => void;
    onDone: (body: PorterAnswer) => void;
    onRefused: (topScore: unknown) => void;
    onError: (body: StreamEvent) => void;
  },
): Promise<void> {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question, lang }),
  });
  if (!response.ok || !response.body) {
    throw new Error(`stream endpoint status ${response.status}`);
  }
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  for (;;) {
    const { done, value } = await reader.read();
    if (done) return;
    buffer += decoder.decode(value, { stream: true });
    let boundary = buffer.indexOf('\n\n');
    while (boundary !== -1) {
      const chunk = buffer.slice(0, boundary);
      buffer = buffer.slice(boundary + 2);
      for (const line of chunk.split('\n')) {
        if (!line.startsWith('data: ')) continue;
        const payload = line.slice('data: '.length);
        if (payload === '[DONE]') return;
        const event = JSON.parse(payload) as StreamEvent;
        if (event.type === 'delta' && typeof event.text === 'string') {
          handlers.onDelta(event.text);
        } else if (event.type === 'done') {
          handlers.onDone(event);
        } else if (event.type === 'refused') {
          handlers.onRefused(event.top_score);
        } else if (event.type === 'error') {
          handlers.onError(event);
        }
      }
      boundary = buffer.indexOf('\n\n');
    }
  }
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
  const streamEndpoint = `${endpoint}/stream`;
  const strings = {
    thinking: form.dataset.thinking || '…',
    notCovered: form.dataset.notCovered || '',
    error: form.dataset.error || '',
    sources: form.dataset.sources || '',
  };

  const renderError = (): void => {
    out.replaceChildren(el('p', 'porter__err', strings.error));
  };

  const renderFinal = (body: PorterAnswer): void => {
    const covered = body.covered !== false;
    const answer = typeof body.answer === 'string' ? body.answer : '';
    const parts = [el('p', 'porter__answer', answer)];
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

    // Progressive answer: the deltas render as they arrive; the final event
    // carries the citation-guarded answer and replaces the streamed text.
    let streamed = '';
    let answerNode: HTMLElement | null = null;
    try {
      await streamAnswer(streamEndpoint, question, lang, {
        onDelta: (text) => {
          if (answerNode === null) {
            answerNode = el('p', 'porter__answer', '');
            out.replaceChildren(answerNode);
          }
          streamed += text;
          answerNode.textContent = streamed;
        },
        onDone: (body) => renderFinal(body),
        onRefused: () => {
          out.replaceChildren(
            el('p', 'porter__no', strings.notCovered),
          );
        },
        onError: (body) => {
          if (typeof body.answer === 'string' && body.answer) {
            out.replaceChildren(el('p', 'porter__no', body.answer));
          } else {
            renderError();
          }
        },
      });
    } catch {
      renderError();
    } finally {
      bell.disabled = false;
    }
  });
}
