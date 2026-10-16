export const CMD = 'npx skills add jordimarsal/harness';

export interface CmdSegments {
  before: string;
  cmd: string;
  after: string;
}

/**
 * Split a highlight line around the first occurrence of the standalone-skills
 * install command. Returns null when the line does not contain it; otherwise
 * the line === before + cmd + after, with cmd === CMD.
 */
export function splitCmdLine(text: string): CmdSegments | null {
  const i = text.indexOf(CMD);
  if (i === -1) return null;
  return {
    before: text.slice(0, i),
    cmd: CMD,
    after: text.slice(i + CMD.length),
  };
}
