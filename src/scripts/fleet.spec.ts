import { describe, it, expect } from 'vitest';
import { parseFleetEvent, engineLines, renderRows } from './fleet';

describe('fleet.ts pure helpers', () => {
  const validPayload = {
    seq: 1,
    ts: '2026-11-05T12:00:00Z',
    engines: {
      llamacpp: { up: true, alias: 'llama', slots: 2, ctx_per_slot: 91648 }
    },
    scoreboard: [
      { slug: 'qwen36', global: 0.892, gen_tps: 244.0, ts: '2026-11-05T12:00:00Z' }
    ]
  };

  it('parseFleetEvent: parses valid payload', () => {
    const raw = JSON.stringify(validPayload);
    expect(parseFleetEvent(raw)).toEqual(validPayload);
  });

  it('parseFleetEvent: returns null on invalid JSON', () => {
    expect(parseFleetEvent('{ invalid }')).toBeNull();
  });

  it('parseFleetEvent: returns null on missing engines', () => {
    const bad = JSON.stringify({ seq: 1, scoreboard: [] });
    expect(parseFleetEvent(bad)).toBeNull();
  });

  it('engineLines: renders correct terminal lines', () => {
    const lines = engineLines(validPayload as any);
    expect(lines[0]).toContain('$ ● llamacpp (llama) [2 slots]');
  });

  it('engineLines: enforces R3/R9 guard against forbidden strings', () => {
    const sneakyPayload = {
      ...validPayload,
      engines: { bad: { up: true, alias: 'models/secret.gguf' } }
    };
    // The stringify check in engineLines should catch this
    expect(engineLines(sneakyPayload as any)).toEqual([]);
  });

  it('renderRows: formats global to 2 decimals and tps correctly', () => {
    const rows = renderRows(validPayload as any);
    expect(rows[0].global).toBe('0.89');
    expect(rows[0].tps).toBe('244.0');
  });

  it('renderRows: handles missing gen_tps with dash', () => {
    const noTps = {
      ...validPayload,
      scoreboard: [{ slug: 'test', global: 0.5, ts: '...' }]
    };
    const rows = renderRows(noTps as any);
    expect(rows[0].tps).toBe('-');
  });
});
