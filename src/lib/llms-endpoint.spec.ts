import { describe, expect, it } from 'vitest';
import { buildLlmsFullTxt, buildLlmsTxt } from './llms';
import { llmsData } from '../pages/llms.txt';

const data = llmsData();

describe('llmsData() against src/data/content', () => {
  it('resolves all seven departments in floor order with their directory routes', () => {
    expect(data.departments.map((dept) => dept.code)).toEqual(['F3', 'F2', 'F1', 'Q', 'M', 'F0', 'B']);
    expect(data.departments.map((dept) => dept.route)).toEqual([
      'departments/research/',
      'departments/telemetry/',
      'departments/tooling/',
      'departments/inspections/',
      'departments/people/',
      'departments/operations/',
      'departments/front-desk/',
    ]);
  });

  it('exposes the curated members and keeps all 11 projects reachable', () => {
    expect(data.projects).toHaveLength(11);
    const projectSlugs = data.projects.map((p) => p.slug);
    const members = data.departments.flatMap((dept) => dept.projects).map((p) => p.slug);
    expect(members).toHaveLength(7);
    expect(new Set(members).size).toBe(7);
    const annexes = ['bible-text-analysis', 'product-offers', 'rustcut', 'spring-boot-casino'];
    for (const annex of annexes) {
      expect(members).not.toContain(annex);
      expect(projectSlugs).toContain(annex);
    }
    for (const member of members) {
      expect(projectSlugs).toContain(member);
    }
  });

  it('carries the ledger, skills and principles', () => {
    expect(data.experience.length).toBeGreaterThan(0);
    expect(data.skills).toHaveLength(5);
    expect(data.principles).toHaveLength(4);
  });
});

describe('GET-ready llms.txt content (canonical data)', () => {
  const text = buildLlmsTxt(data);

  it('opens with the brand header', () => {
    expect(text.startsWith('# Jordimp & Co.\n\n> Jordi Marçal Poy — Senior Backend Engineer')).toBe(
      true,
    );
  });

  it('lists the seven departments with their canonical lines', () => {
    expect(text).toContain('- F3 Research & Retrieval — APPLIED AI YOU CAN EVALUATE — RETRIEVAL WITH RECEIPTS.');
    expect(text).toContain('- F2 Transport & Telemetry — THE PLUMBING THAT MUST NOT LIE — TELEMETRY WITH HONEST FAILURE MODES.');
    expect(text).toContain('- F1 Tooling & Platform — THE WORKSHOP FLOOR — HARNESSES, CLIS AND DELIBERATELY SMALL TOOLS.');
    expect(text).toContain('- Q Inspections — THE ITE CERTIFICATE — EVERY SCORE ON THE WALL, DATED AND SIGNED.');
    expect(text).toContain('- M People & Principles — HOW THE WORK GETS DONE — STACK, STANDARDS AND THE WORKING RULES.');
    expect(text).toContain('- F0 Operations — THE CAREER LEDGER — 2017 TO PRESENT, SAME PAIR OF HANDS.');
    expect(text).toContain('- B Front Desk — WALK-INS WELCOME — ROLES, REPOS OR A SPEC-FIRST ENGAGEMENT.');
  });

  it('uses the linked directory URLs everywhere', () => {
    expect(text).toContain('- [Projects](https://jordimp.net/en/projects/)');
    expect(text).toContain('- [CV](https://jordimp.net/en/cv/)');
    expect(text).toContain('- [F3 Research & Retrieval](https://jordimp.net/en/departments/research/)');
    expect(text).toContain('- [Q Inspections](https://jordimp.net/en/departments/inspections/)');
    expect(text).toContain('- [B Front Desk](https://jordimp.net/en/departments/front-desk/)');
    expect(text).toContain(
      '- [Project case pages](https://jordimp.net/en/projects/<slug>/) — one per project, 11 total',
    );
    expect(text).not.toContain('.html');
  });

  it('closes with the contact block', () => {
    expect(text).toContain('- Email: hello@jordimp.net');
    expect(text).toContain('- [GitHub](https://github.com/jordimarsal)');
    expect(text).toContain('- [LinkedIn](https://www.linkedin.com/in/jordi-marsal-poy)');
    expect(text.trimEnd().endsWith('Full details in llms-full.txt.')).toBe(true);
  });

  it('links the essay from the key pages', () => {
    expect(text).toContain(
      '- [Writing: RAG without an eval gate is a demo.](https://jordimp.net/en/writing/rag-eval-gate/)',
    );
  });
});

describe('GET-ready llms-full.txt content (canonical data)', () => {
  const text = buildLlmsFullTxt(data);

  it('lists one repo line per project — 11 total', () => {
    const repos = text.split('## All repos')[1].split('## Career ledger')[0].trim().split('\n');
    expect(repos).toHaveLength(11);
    expect(repos[0]).toContain('- CodebaseRAG (2026): Hexagonal RAG over your own codebase');
    expect(text).toContain('  - CodebaseRAG (2026): Hexagonal RAG over your own codebase, with a deterministic, eval-first core: ingest, query, and CI-gated retrieval evals. Stack: Python 3.13, FastAPI, pgvector, Qdrant, Ollama, Langfuse, mypy strict. [repo](https://github.com/jordimarsal/codebaserag)');
  });

  it('keeps the spike section structure', () => {
    for (const section of [
      '## The building',
      '## All repos',
      '## Career ledger (Operations, F0)',
      '## Skills (Mezzanine)',
      '## Working principles (Mezzanine)',
      '## Writing',
      '## Pages',
    ]) {
      expect(text).toContain(section);
    }
  });

  it('carries the essay through the real content module', () => {
    expect(text).toContain('## Writing');
    expect(text).toContain(
      '- [RAG without an eval gate is a demo.](https://jordimp.net/en/writing/rag-eval-gate/)',
    );
  });

  it('carries the inspections floor through the default Q page suffix', () => {
    expect(text).toContain('## Q — Inspections');
    expect(text).toContain(
      'The inspection floor keeps the quality wall: Lighthouse gauges, test counters, bundle weight and dependency census',
    );
    expect(text).toContain('- [Q department page](https://jordimp.net/en/departments/inspections/)');
  });

  it('carries the updated Front Desk offer intro', () => {
    expect(text).toContain(
      'The desk takes three things: senior or staff backend roles, short spec-first engagements, and questions about a floor or a repo.',
    );
  });

  it('carries the telemetry conflict-of-interest line', () => {
    expect(text).toContain(
      'Personal study of the Open Gateway telemetry problem. Not Telefónica code. Not production traffic.',
    );
  });

  it('matches the committed llms-full.txt regression oracle', () => {
    expect(text).toMatchSnapshot();
  });
});
