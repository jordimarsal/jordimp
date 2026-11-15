export interface FleetEngine {
  up: boolean;
  alias?: string;
  slots?: number;
  ctx_per_slot?: number;
  build?: string;
}

export interface FleetScoreboard {
  slug: string;
  think?: boolean;
  global: number;
  gen_tps?: number;
  ts: string;
}

export interface FleetPayload {
  seq: number;
  ts: string;
  engines: Record<string, FleetEngine>;
  scoreboard: FleetScoreboard[];
}

/** Pure Helpers **/

export function parseFleetEvent(raw: string): FleetPayload | null {
  try {
    const data = JSON.parse(raw);
    if (typeof data.seq !== 'number' || !data.engines || !Array.isArray(data.scoreboard)) {
      return null;
    }
    return data as FleetPayload;
  } catch {
    return null;
  }
}

export function engineLines(payload: FleetPayload): string[] {
  const lines: string[] = [];
  // R3/R9 Guard: Check for forbidden strings in the raw payload object
  const rawStr = JSON.stringify(payload);
  const forbidden = ['models/', '.gguf', 'model_config_flags'];
  if (forbidden.some(f => rawStr.includes(f))) return [];

  for (const [key, eng] of Object.entries(payload.engines)) {
    const status = eng.up ? '●' : '○';
    const alias = eng.alias ? ` (${eng.alias})` : '';
    const slots = eng.slots ? ` [${eng.slots} slots]` : '';
    const ctx = eng.ctx_per_slot ? ` @ ${eng.ctx_per_slot} ctx/slot` : '';
    lines.push(`$ ${status} ${key}${alias}${slots}${ctx}`);
  }
  return lines;
}

export function renderRows(payload: FleetPayload) {
  return payload.scoreboard.map(row => ({
    slug: row.slug,
    global: row.global.toFixed(2),
    tps: row.gen_tps ? row.gen_tps.toFixed(1) : '-',
    updated: new Date(row.ts).toLocaleTimeString()
  }));
}

/** DOM Logic **/

function initFleet(): void {
  const root = document.querySelector<HTMLElement>('.fleet-panel');
  if (!root) return;

  const endpoint = root.dataset.fleetEndpoint || '';
  const statusBody = root.querySelector<HTMLElement>('.status-lines');
  const fallback = root.querySelector<HTMLElement>('.fallback');
  const tbody = root.querySelector<HTMLTableSectionElement>('tbody');
  const watchTs = root.querySelector<HTMLElement>('.watch-ts');
  const connecting = root.querySelector<HTMLElement>('.connecting');

  let hasReceivedFirstMessage = false;

  const updateUI = (payload: FleetPayload): void => {
    hasReceivedFirstMessage = true;
    if (connecting) connecting.classList.add('hidden');
    if (fallback) fallback.classList.add('hidden');

    // Update Status
    if (statusBody) {
      const lines = engineLines(payload);
      statusBody.innerHTML = '';
      lines.forEach(l => {
        const p = document.createElement('span');
        p.className = 'status-line';
        p.textContent = l;
        statusBody.appendChild(p);
      });
    }

    // Update Scoreboard
    if (tbody) {
      const rows = renderRows(payload);
      tbody.innerHTML = '';
      rows.forEach(r => {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${r.slug}</td><td>${r.global}</td><td>${r.tps}</td><td>${r.updated}</td>`;
        tbody.appendChild(tr);
      });
    }

    // Update Watch
    if (watchTs) watchTs.textContent = new Date(payload.ts).toLocaleTimeString();
  };

  const eventSource = new EventSource(endpoint);

  eventSource.addEventListener('fleet', (e) => {
    const payload = parseFleetEvent((e as MessageEvent).data);
    if (payload) updateUI(payload);
  });

  eventSource.onerror = () => {
    if (!hasReceivedFirstMessage && fallback) {
      fallback.classList.remove('hidden');
      if (connecting) connecting.classList.add('hidden');
    }
  };
}

// Auto-init
if (typeof window !== 'undefined') {
  document.addEventListener('DOMContentLoaded', initFleet);
}
