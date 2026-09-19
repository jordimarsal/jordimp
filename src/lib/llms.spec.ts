import { describe, expect, it } from 'vitest';
import {
  buildLlmsFullTxt,
  buildLlmsTxt,
  type LlmsData,
  type LlmsDept,
} from './llms';

const projectRef = (slug: string, name: string, year: string) => ({
  slug,
  name,
  year,
  summary: `${name} summary.`,
  stack: ['Java 25', 'Spring Boot 4'],
  github: `https://github.com/jordimarsal/${slug}`,
});

const dept = (code: string, name: string, slugs: readonly string[]): LlmsDept => ({
  code,
  name,
  line: `${name} LINE.`,
  intro: `${name} intro.`,
  route: `departments/${name.toLowerCase().replace(/[^a-z]+/g, '-')}/`,
  projects: slugs.map((slug) => projectRef(slug, slug, '2026')),
});

const base: LlmsData = {
  person: 'Jordi Marçal Poy',
  role: 'Senior Backend Engineer',
  tagline: 'Java · Python · AI/LLM',
  est: '2017',
  city: 'Barcelona',
  email: 'jordi.marsal@gmail.com',
  github: 'https://github.com/jordimarsal',
  linkedin: 'https://www.linkedin.com/in/jordi-marsal-poy',
  departments: [
    dept('F3', 'Research & Retrieval', ['codebaserag']),
    dept('F2', 'Transport & Telemetry', ['redis-toolkit']),
    dept('F1', 'Tooling & Platform', ['rustcut', 'md-mermaid-pdf']),
    dept('M', 'People & Principles', []),
    dept('F0', 'Operations', []),
    dept('B', 'Front Desk', []),
  ],
  projects: [
    projectRef('codebaserag', 'CodebaseRAG', '2026'),
    projectRef('rustcut', 'Rustcut', '2026'),
  ],
  experience: [
    {
      period: '2022—NOW',
      company: 'Telefónica Kernel · Open Gateway',
      role: 'Backend Engineer — Microservices & Automation',
      points: ['Built adapters.', 'Authored a CLI suite.'],
    },
  ],
  skills: [
    { group: 'Backend & APIs', items: ['Java 25', 'Spring Boot 4'] },
    { group: 'Data', items: ['Kafka'] },
  ],
  principles: ['SOLID, Clean Code and TDD as daily practice.', 'I/O at the edges.'],
};

describe('buildLlmsTxt()', () => {
  it('opens with the brand H1 and the person blockquote', () => {
    const lines = buildLlmsTxt(base).split('\n');
    expect(lines[0]).toBe('# Jordimp & Co.');
    expect(lines[2]).toBe(
      '> Jordi Marçal Poy — Senior Backend Engineer (Java · Python · AI/LLM). A one-person engineering firm: backend systems, event pipelines and applied AI, designed, built and audited by the same pair of hands since 2017. Barcelona. Business in English, Español or Català.',
    );
  });

  it('lists every department as "CODE Name — LINE"', () => {
    const text = buildLlmsTxt(base);
    expect(text).toContain('## Departments');
    expect(text).toContain('- F3 Research & Retrieval — Research & Retrieval LINE.');
    expect(text).toContain('- M People & Principles — People & Principles LINE.');
    expect(text).toContain('- B Front Desk — Front Desk LINE.');
  });

  it('lists home, projects, CV and departments as linked directory URLs', () => {
    const text = buildLlmsTxt(base);
    expect(text).toContain(
      '- [Home](https://jordimp.net/en/) (also [Español](https://jordimp.net/es/), [Català](https://jordimp.net/ca/))',
    );
    expect(text).toContain('- [Projects](https://jordimp.net/en/projects/)');
    expect(text).toContain('- [CV](https://jordimp.net/en/cv/)');
    expect(text).toContain('- [F1 Tooling & Platform](https://jordimp.net/en/departments/tooling-platform/)');
    expect(text).toContain('- [B Front Desk](https://jordimp.net/en/departments/front-desk/)');
  });

  it('points the case-pages line at directory slugs with the project count', () => {
    expect(buildLlmsTxt(base)).toContain(
      '- [Project case pages](https://jordimp.net/en/projects/<slug>/) — one per project, 2 total',
    );
  });

  it('closes with the contact block and the llms-full.txt pointer', () => {
    const text = buildLlmsTxt(base);
    expect(text).toContain('## Contact');
    expect(text).toContain('- Email: jordi.marsal@gmail.com');
    expect(text).toContain('- [GitHub](https://github.com/jordimarsal)');
    expect(text).toContain('- [LinkedIn](https://www.linkedin.com/in/jordi-marsal-poy)');
    expect(text.trimEnd().endsWith('Full details in llms-full.txt.')).toBe(true);
  });

  it('is deterministic', () => {
    expect(buildLlmsTxt(base)).toBe(buildLlmsTxt(base));
  });
});

describe('buildLlmsFullTxt()', () => {
  it('opens with the full-reference header and contact line', () => {
    const lines = buildLlmsFullTxt(base).split('\n');
    expect(lines[0]).toBe('# Jordimp & Co. — full reference');
    expect(lines[2]).toBe('Jordi Marçal Poy — Senior Backend Engineer (Java · Python · AI/LLM).');
    expect(lines[4]).toBe(
      'Contact: jordi.marsal@gmail.com · [GitHub](https://github.com/jordimarsal) · [LinkedIn](https://www.linkedin.com/in/jordi-marsal-poy)',
    );
  });

  it('renders each department as a "CODE — Name" block with its intro', () => {
    const text = buildLlmsFullTxt(base);
    expect(text).toContain('## The building');
    expect(text).toContain('## F3 — Research & Retrieval');
    expect(text).toContain('## F2 — Transport & Telemetry');
    expect(text).toContain('## F1 — Tooling & Platform');
    expect(text).toContain('## M — People & Principles');
    expect(text).toContain('## F0 — Operations');
    expect(text).toContain('## B — Front Desk');
    expect(text).toContain('Research & Retrieval intro.');
  });

  it('dumps a department\'s projects with two-space bullets, stack and linked repository', () => {
    const text = buildLlmsFullTxt(base);
    expect(text).toContain(
      '  - codebaserag (2026): codebaserag summary. Stack: Java 25, Spring Boot 4. [repo](https://github.com/jordimarsal/codebaserag)',
    );
    expect(text).toContain(
      '  - md-mermaid-pdf (2026): md-mermaid-pdf summary. Stack: Java 25, Spring Boot 4. [repo](https://github.com/jordimarsal/md-mermaid-pdf)',
    );
  });

  it('omits the Projects block for departments without projects', () => {
    const building = buildLlmsFullTxt(base).split('## All repos')[0];
    expect(building).not.toMatch(/## M — People & Principles[\s\S]*Projects:/);
    expect(building).not.toMatch(/## F0 — Operations[\s\S]*Projects:/);
  });

  it('lists one "All repos" line per project', () => {
    const repos = buildLlmsFullTxt(base)
      .split('## All repos')[1]
      .split('## Career ledger')[0]
      .trim()
      .split('\n');
    expect(repos).toHaveLength(2);
    expect(repos[0]).toBe(
      '- CodebaseRAG (2026): CodebaseRAG summary. [repo](https://github.com/jordimarsal/codebaserag)',
    );
  });

  it('flattens the career ledger as "period — company, role: points"', () => {
    expect(buildLlmsFullTxt(base)).toContain(
      '- 2022—NOW — Telefónica Kernel · Open Gateway, Backend Engineer — Microservices & Automation: Built adapters. Authored a CLI suite.',
    );
  });

  it('flattens skills and principles as bullet lines', () => {
    const text = buildLlmsFullTxt(base);
    expect(text).toContain('- Backend & APIs: Java 25, Spring Boot 4');
    expect(text).toContain('- Data: Kafka');
    expect(text).toContain('- SOLID, Clean Code and TDD as daily practice.');
  });

  it('lists the pages as linked directory URLs with Mezzanine and Front Desk labels', () => {
    const text = buildLlmsFullTxt(base);
    expect(text).toContain(
      '- [Home](https://jordimp.net/en/) · [Español](https://jordimp.net/es/) · [Català](https://jordimp.net/ca/) (home, trilingual)',
    );
    expect(text).toContain('- [Projects](https://jordimp.net/en/projects/) — all projects with stack filter');
    expect(text).toContain('- [CV](https://jordimp.net/en/cv/) — CV summary with PDF downloads');
    expect(text).toContain('- [F3 department page](https://jordimp.net/en/departments/research-retrieval/)');
    expect(text).toContain('- [Mezzanine department page](https://jordimp.net/en/departments/people-principles/)');
    expect(text).toContain('- [Front Desk page](https://jordimp.net/en/departments/front-desk/)');
    expect(text).toContain(
      '- [Case pages](https://jordimp.net/en/projects/<slug>/) — one case page per project (2), e.g. [CodebaseRAG](https://jordimp.net/en/projects/codebaserag/)',
    );
  });

  it('closes with the static-site colophon', () => {
    expect(
      buildLlmsFullTxt(base)
        .trimEnd()
        .endsWith('This site is static HTML, zero trackers, zero external dependencies beyond linked fonts.'),
    ).toBe(true);
  });

  it('is deterministic', () => {
    expect(buildLlmsFullTxt(base)).toBe(buildLlmsFullTxt(base));
  });
});

describe('link invariants (both builders)', () => {
  const builders = [
    ['buildLlmsTxt', buildLlmsTxt],
    ['buildLlmsFullTxt', buildLlmsFullTxt],
  ] as const;

  it('leaves no https:// URL outside a Markdown link', () => {
    for (const [name, build] of builders) {
      const stripped = build(base).replace(/\[[^\]]*\]\([^)]*\)/g, '');
      expect(stripped, name).not.toContain('https://');
    }
  });

  it('never uses a URL as a link label', () => {
    for (const [name, build] of builders) {
      const labels = [...build(base).matchAll(/\[([^\]]*)\]\(([^)]*)\)/g)].map((match) => match[1]);
      for (const label of labels) {
        expect(label, name).not.toMatch(/https?:\/\//);
      }
    }
  });
});
