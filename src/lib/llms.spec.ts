import { describe, expect, it } from 'vitest';
import { buildLlmsFullTxt, buildLlmsTxt, type LlmsData } from './llms';

const base: LlmsData = {
  name: 'Jordi Marçal Poy',
  role: 'Senior Backend Engineer',
  tagline: 'Java · Python · AI/LLM',
  email: 'jordi.marsal@gmail.com',
  github: 'https://github.com/jordimarsal',
  linkedin: 'https://www.linkedin.com/in/jordi-marsal-poy',
  bio: ['First bio paragraph.', 'Second bio paragraph.'],
  projects: [
    {
      id: 'alpha',
      name: 'Alpha',
      year: 2026,
      summary: 'Alpha summary.',
      problem: 'Alpha problem.',
      highlights: ['Alpha highlight one.', 'Alpha highlight two.'],
      stack: ['Java 25', 'Spring Boot 4'],
      github: 'https://github.com/jordimarsal/alpha',
    },
    {
      id: 'beta-tool',
      name: 'Beta Tool',
      year: 2025,
      summary: 'Beta summary.',
      problem: 'Beta problem.',
      highlights: ['Beta highlight.'],
      stack: ['Python'],
      github: 'https://github.com/jordimarsal/beta-tool',
    },
  ],
  experience: [
    {
      company: 'Telefónica',
      role: 'Backend Engineer',
      period: '2024–Present',
      points: ['Built APIs.', 'Led migration.'],
    },
  ],
  skills: [
    { group: 'Backend & APIs', items: ['Java 25', 'Spring Boot 4'] },
    { group: 'Data', items: ['Kafka'] },
  ],
};

const range = (n: number) => Array.from({ length: n }, (_, i) => i);

const fullScale: LlmsData = {
  ...base,
  projects: range(11).map((i) => ({ ...base.projects[0], id: `project-${i}`, name: `Project ${i}` })),
  experience: range(4).map((i) => ({ ...base.experience[0], company: `Company ${i}` })),
  skills: range(5).map((i) => ({ ...base.skills[0], group: `Group ${i}` })),
};

describe('buildLlmsTxt()', () => {
  it('opens with the H1 name and the role + tagline summary line', () => {
    const lines = buildLlmsTxt(base).split('\n');
    expect(lines[0]).toBe('# Jordi Marçal Poy');
    expect(lines[2]).toBe('> Senior Backend Engineer. Java · Python · AI/LLM');
  });

  it('links every project at its en URL with its summary', () => {
    const text = buildLlmsTxt(base);
    expect(text).toContain('## Projects');
    expect(text).toContain('- [Alpha](https://jordimp.net/en/projects/alpha/): Alpha summary.');
    expect(text).toContain('- [Beta Tool](https://jordimp.net/en/projects/beta-tool/): Beta summary.');
  });

  it('emits one link per project', () => {
    const links = buildLlmsTxt(fullScale).match(/https:\/\/jordimp\.net\/en\/projects\/[a-z0-9-]*\//g);
    expect(links).toHaveLength(11);
  });

  it('lists the four static pages under ## Pages', () => {
    const text = buildLlmsTxt(base);
    expect(text).toContain('## Pages');
    for (const page of ['about', 'cv', 'experience', 'skills']) {
      expect(text).toContain(`https://jordimp.net/en/${page}/`);
    }
    expect(text.indexOf('## Pages')).toBeGreaterThan(text.indexOf('## Projects'));
  });

  it('is deterministic', () => {
    expect(buildLlmsTxt(fullScale)).toBe(buildLlmsTxt(fullScale));
  });
});

describe('buildLlmsFullTxt()', () => {
  it('counts 11 project + 4 experience + 5 skill headings', () => {
    const headings = buildLlmsFullTxt(fullScale).match(/^### /gm);
    expect(headings).toHaveLength(20);
  });

  it('carries every ## section', () => {
    const text = buildLlmsFullTxt(fullScale);
    for (const section of ['## About', '## Contact', '## Projects', '## Experience', '## Skills']) {
      expect(text).toContain(section);
    }
  });

  it('dumps each project with year, summary, problem, highlights, stack and repository', () => {
    const text = buildLlmsFullTxt(base);
    expect(text).toContain('### Alpha (2026)');
    expect(text).toContain('Summary: Alpha summary.');
    expect(text).toContain('Problem: Alpha problem.');
    expect(text).toContain('- Alpha highlight one.');
    expect(text).toContain('Stack: Java 25, Spring Boot 4');
    expect(text).toContain('Repository: https://github.com/jordimarsal/alpha');
  });

  it('dumps experience entries as company — role (period) with points', () => {
    const text = buildLlmsFullTxt(base);
    expect(text).toContain('### Telefónica — Backend Engineer (2024–Present)');
    expect(text).toContain('- Built APIs.');
    expect(text).toContain('- Led migration.');
  });

  it('dumps skill groups with their items', () => {
    const text = buildLlmsFullTxt(base);
    expect(text).toContain('### Backend & APIs');
    expect(text).toContain('- Java 25');
  });

  it('includes the bio and the contact block', () => {
    const text = buildLlmsFullTxt(base);
    expect(text).toContain('First bio paragraph.');
    expect(text).toContain('Second bio paragraph.');
    expect(text).toContain('jordi.marsal@gmail.com');
    expect(text).toContain('https://github.com/jordimarsal');
    expect(text).toContain('https://www.linkedin.com/in/jordi-marsal-poy');
  });

  it('is deterministic', () => {
    expect(buildLlmsFullTxt(fullScale)).toBe(buildLlmsFullTxt(fullScale));
  });
});
