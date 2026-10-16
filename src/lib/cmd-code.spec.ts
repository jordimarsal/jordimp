import { describe, expect, it } from 'vitest';
import { CMD, splitCmdLine } from './cmd-code';

describe('splitCmdLine', () => {
  it('exposes the exact install command as CMD', () => {
    expect(CMD).toBe('npx skills add jordimarsal/harness');
  });

  it('splits a mid-line occurrence into before/cmd/after', () => {
    const line =
      'Its process ships as six standalone skills, installable with npx skills add jordimarsal/harness.';
    const r = splitCmdLine(line);
    expect(r).not.toBeNull();
    expect(r?.cmd).toBe('npx skills add jordimarsal/harness');
    expect(r?.before).toBe('Its process ships as six standalone skills, installable with ');
    expect(r?.after).toBe('.');
  });

  it('returns null when the line has no command', () => {
    expect(splitCmdLine('Born from daily use across personal projects.')).toBeNull();
  });

  it('handles the command at line start (before is empty)', () => {
    const r = splitCmdLine('npx skills add jordimarsal/harness and then some');
    expect(r?.before).toBe('');
    expect(r?.cmd).toBe('npx skills add jordimarsal/harness');
    expect(r?.after).toBe(' and then some');
  });

  it('handles the command at line end (after is empty)', () => {
    const r = splitCmdLine('Installable with npx skills add jordimarsal/harness');
    expect(r?.before).toBe('Installable with ');
    expect(r?.after).toBe('');
  });

  it('does not mutate the input', () => {
    const line = 'with npx skills add jordimarsal/harness inside';
    splitCmdLine(line);
    expect(line).toBe('with npx skills add jordimarsal/harness inside');
  });
});
