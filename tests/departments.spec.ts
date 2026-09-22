import { expect, test } from '@playwright/test';
import { readFileSync } from 'node:fs';
import {
  BREADCRUMB_DEPTS,
  BREADCRUMB_HOME,
  DEPTS,
  EXPERIENCE,
  FLOOR_ORDER,
  FRONTDESK_PAGE,
  INSPECTIONS_PAGE,
  OPERATIONS_PAGE,
  PAGES,
  PAGE_LABELS,
  PEOPLE_PAGE,
  PRINCIPLES,
  RESEARCH_PAGE,
  SKILLS,
  TELEMETRY_PAGE,
  TOOLING_PAGE,
  UI,
  project,
} from '../src/data/content';
import { LOCALES, type Locale } from '../src/lib/i18n';
import type { DeptKey } from '../src/data/types';
import { SITE } from '../src/config';
import { CATEGORY_KEYS, formatScore, parseQuality, plaqueText } from '../src/lib/quality';

const qualityJson: unknown = JSON.parse(
  readFileSync(new URL('../src/data/quality.json', import.meta.url), 'utf8'),
);

const deptSlug = (key: DeptKey): string =>
  PAGES[key].route.replace(/^departments\//, '').replace(/\.html$/, '');
const deptRoute = (lang: Locale, key: DeptKey): string => `/${lang}/departments/${deptSlug(key)}/`;

const CURRENT_ENTRIES = EXPERIENCE.filter((e) => e.current);

const BACK_LABEL: Record<Locale, string> = {
  en: 'Back to the building',
  es: 'Volver al edificio',
  ca: 'Torna a l’edifici',
};

test.describe('department pages (T8)', () => {
  test('renders the research floor structure', async ({ page }) => {
    const key: DeptKey = 'research';
    const d = DEPTS[key];
    await page.goto(deptRoute('en', key));

    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    expect(await page.title()).toBe(PAGES[key].title.en);

    const breadcrumb = page.locator('nav.breadcrumb[aria-label="Breadcrumb"]');
    await expect(breadcrumb.locator('a')).toHaveCount(2);
    await expect(breadcrumb.locator('a').nth(0)).toHaveText(BREADCRUMB_HOME.en);
    await expect(breadcrumb.locator('a').nth(0)).toHaveAttribute('href', '/en/');
    await expect(breadcrumb.locator('a').nth(1)).toHaveText(BREADCRUMB_DEPTS.en);
    await expect(breadcrumb.locator('a').nth(1)).toHaveAttribute('href', '/en/#building');
    await expect(breadcrumb.locator('span[aria-current="page"]')).toHaveText(d.name.en);

    await expect(page.locator('.navbar__links a[href="/en/#building"]')).toHaveAttribute(
      'aria-current',
      'page',
    );

    await expect(page.locator('.sec-head__num')).toHaveText(d.code);
    await expect(page.locator('h1#page-title')).toHaveText(d.name.en);
    await expect(page.locator('.sec-head__sub')).toHaveText(d.tag.en);
    await expect(page.locator('main > p.prose')).toHaveText(d.intro.en);

    const stats = page.locator('.stats .stat');
    await expect(stats).toHaveCount(RESEARCH_PAGE.stats.en.length);
    for (let i = 0; i < RESEARCH_PAGE.stats.en.length; i++) {
      await expect(stats.nth(i).locator('b')).toHaveText(RESEARCH_PAGE.stats.en[i].value);
      await expect(stats.nth(i).locator('span')).toHaveText(RESEARCH_PAGE.stats.en[i].label);
    }

    const cards = page.locator('section .cards--single article.card');
    await expect(cards).toHaveCount(d.projects.length);
    for (let i = 0; i < d.projects.length; i++) {
      const p = project(d.projects[i]);
      const card = cards.nth(i);
      await expect(card.locator('.chip2')).toHaveText(d.code);
      await expect(card.locator('h3')).toHaveText(p.name);
      await expect(card.locator('.card__sum')).toHaveText(p.summary.en);
      await expect(card.locator('.prose p').nth(0)).toContainText(PAGE_LABELS.problem.en);
      await expect(card.locator('.prose li')).toHaveCount(p.highlights.en.length);
      await expect(card.locator('.stack-line')).toHaveText(
        `${PAGE_LABELS.stack.en}: ${p.stack.join(' · ')}`,
      );
      const caseFile = card.locator('.case-row a.case').nth(0);
      await expect(caseFile).toHaveText(PAGE_LABELS.caseFile.en);
      await expect(caseFile).toHaveAttribute('href', `/en/projects/${p.slug}/`);
      const github = card.locator('.case-row a.case').nth(1);
      await expect(github).toHaveAttribute('href', p.github);
      await expect(github).toHaveAttribute('target', '_blank');
      await expect(github).toHaveAttribute('rel', 'noopener noreferrer');
      await expect(github).toHaveAttribute('aria-label', `${p.name} — ${UI.viewGithub.en}`);
    }

    await expect(page.locator('section .dept-panel__cta a.btn .btn__label')).toHaveText(
      'Back to the building',
    );
    await expect(page.locator('section .dept-panel__cta a.btn')).toHaveAttribute('href', '/en/');
    await expect(page.locator('.footer-desk#desk')).toHaveCount(1);
  });

  test('renders the telemetry floor with system diagrams and on-call note', async ({ page }) => {
    const key: DeptKey = 'telemetry';
    await page.goto(deptRoute('en', key));

    const diagrams = page.locator('.diagram-strip figure.diagram');
    await expect(diagrams).toHaveCount(2);
    await expect(diagrams.nth(0).locator('figcaption')).toHaveText(TELEMETRY_PAGE.kafkaCaption.en);
    await expect(diagrams.nth(0).locator('svg')).toHaveAttribute('viewBox', '0 0 560 170');
    await expect(diagrams.nth(0).locator('svg')).toContainText('KAFKA');
    await expect(diagrams.nth(1).locator('figcaption')).toHaveText(TELEMETRY_PAGE.redisCaption.en);
    await expect(diagrams.nth(1).locator('svg')).toHaveAttribute('viewBox', '0 0 340 170');
    await expect(diagrams.nth(1).locator('svg')).toContainText('REDIS');
    await expect(page.locator('h2#tl-diagrams')).toHaveText(TELEMETRY_PAGE.diagramTitle.en);

    await expect(page.locator('aside.oncall h3#tl-oncall')).toHaveText(TELEMETRY_PAGE.oncallTitle.en);
    await expect(page.locator('aside.oncall p')).toHaveText(TELEMETRY_PAGE.oncallBody.en);

    await expect(page.locator('h2#tl-work')).toHaveText(TELEMETRY_PAGE.workTitle.en);
    await expect(page.locator('section .cards--single article.card')).toHaveCount(
      DEPTS[key].projects.length,
    );
    await expect(page.locator('section .dept-panel__cta a.btn')).toHaveAttribute('href', '/en/');
  });

  test('renders the tooling floor with the workshop note and five bench cards', async ({ page }) => {
    const key: DeptKey = 'tooling';
    const d = DEPTS[key];
    await page.goto(deptRoute('en', key));

    await expect(page.locator('aside.oncall h3#tl-note')).toHaveText(TOOLING_PAGE.noteTitle.en);
    await expect(page.locator('aside.oncall p')).toHaveText(TOOLING_PAGE.noteBody.en);

    await expect(page.locator('h2#tl-bench')).toHaveText(TOOLING_PAGE.workTitle.en);
    const cards = page.locator('section .cards:not(.cards--single) > article.card');
    await expect(cards).toHaveCount(d.projects.length);
    for (let i = 0; i < d.projects.length; i++) {
      await expect(cards.nth(i).locator('h3')).toHaveText(project(d.projects[i]).name);
    }
    await expect(page.locator('section .dept-panel__cta a.btn')).toHaveAttribute('href', '/en/');
  });

  test('renders the operations floor with shift log, coverage map and the CV button', async ({
    page,
  }) => {
    const key: DeptKey = 'operations';
    await page.goto(deptRoute('en', key));

    const rows = page.locator('.ledger.shiftlog .ledger__row');
    await expect(rows).toHaveCount(EXPERIENCE.length);
    for (let i = 0; i < EXPERIENCE.length; i++) {
      const entry = EXPERIENCE[i];
      await expect(rows.nth(i).locator('.ledger__per')).toHaveText(entry.period);
      await expect(rows.nth(i).locator('.shiftlog__role')).toHaveText(entry.role.en);
      await expect(rows.nth(i).locator('.shiftlog__points li')).toHaveCount(entry.points.en.length);
      await expect(rows.nth(i).locator('.chiprow .chip3')).toHaveCount(entry.stack.length);
    }
    await expect(page.locator('.shiftlog__now')).toHaveCount(CURRENT_ENTRIES.length);
    await expect(page.locator('.shiftlog__now')).toContainText(OPERATIONS_PAGE.onShift.en);
    await expect(page.locator('.ledger__row').nth(0).locator('.shiftlog__now')).toHaveCount(
      EXPERIENCE[0].current ? 1 : 0,
    );

    const coverage = page.locator('figure.orgfig');
    await expect(coverage.locator('svg')).toHaveAttribute('viewBox', '0 0 980 120');
    await expect(coverage.locator('svg')).toContainText('OPEN GATEWAY');
    await expect(coverage.locator('figcaption')).toHaveText(OPERATIONS_PAGE.coverageCaption.en);

    await expect(page.locator('h2#op-roots')).toHaveText(OPERATIONS_PAGE.rootsTitle.en);
    await expect(page.locator('#op-roots + p')).toHaveText(OPERATIONS_PAGE.rootsNote.en);
    await expect(page.locator('h2#op-toolbelt')).toHaveText(OPERATIONS_PAGE.toolbeltTitle.en);
    await expect(page.locator('#op-toolbelt + p')).toHaveText(OPERATIONS_PAGE.toolbeltNote.en);

    const cv = page.locator('main a.btn[href="/en/cv/"]');
    await expect(cv).toHaveCount(1);
    await expect(cv.locator('.btn__label')).toHaveText(UI.nav.cv.en);
    await expect(cv.locator('span[aria-hidden="true"]')).toHaveText(UI.enterDeptArrow);

    const ctas = page.locator('main > .dept-panel__cta');
    await expect(ctas).toHaveCount(2);
    const back = ctas.nth(1).locator('a.btn');
    await expect(back).toHaveAttribute('href', '/en/');
    await expect(back.locator('.btn__label')).toHaveText(BACK_LABEL.en);
  });

  test('renders the people mezzanine with skills grid, house rules and org chart', async ({
    page,
  }) => {
    const key: DeptKey = 'people';
    await page.goto(deptRoute('en', key));

    const skillcards = page.locator('.skillgrid .skillcard');
    await expect(skillcards).toHaveCount(SKILLS.length);
    for (let i = 0; i < SKILLS.length; i++) {
      await expect(skillcards.nth(i).locator('h3')).toHaveText(SKILLS[i].group.en);
      await expect(skillcards.nth(i).locator('li')).toHaveCount(SKILLS[i].items.length);
    }

    await expect(page.locator('h2#pp-rules')).toHaveText(PRINCIPLES.title.en);
    const principles = page.locator('ol.principles > li');
    await expect(principles).toHaveCount(PRINCIPLES.items.en.length);
    for (let i = 0; i < PRINCIPLES.items.en.length; i++) {
      await expect(principles.nth(i).locator('.principles__num')).toHaveText(
        String(i + 1).padStart(2, '0'),
      );
      await expect(principles.nth(i).locator('p')).toHaveText(PRINCIPLES.items.en[i]);
    }

    const org = page.locator('figure.orgfig');
    await expect(org.locator('svg')).toHaveAttribute('viewBox', '0 0 980 210');
    for (const role of PEOPLE_PAGE.orgRoles.en) {
      await expect(org.locator('svg')).toContainText(role);
    }
    await expect(org.locator('figcaption')).toHaveText(PEOPLE_PAGE.orgCaption.en);

    await expect(page.locator('main > .dept-panel__cta a.btn')).toHaveAttribute('href', '/en/');
  });

  test('renders the front desk with contact rows, copy button and how-it-works steps', async ({
    page,
  }) => {
    const key: DeptKey = 'frontdesk';
    await page.goto(deptRoute('en', key));

    await expect(page.locator('h2#fd-person')).toHaveText(FRONTDESK_PAGE.personTitle.en);
    const bio = page.locator('section .prose > p');
    await expect(bio).toHaveCount(FRONTDESK_PAGE.bio.en.length);
    await expect(page.locator('p.avail .dot--live')).toHaveCount(1);
    await expect(page.locator('p.avail')).toContainText(FRONTDESK_PAGE.avail.en);

    const offer = page.locator('section:has(#fd-offer)');
    await expect(page.locator('#fd-offer')).toHaveText(FRONTDESK_PAGE.offer.openTitle.en);
    await expect(page.locator('#fd-not-open')).toHaveText(FRONTDESK_PAGE.offer.notOpenTitle.en);
    await expect(offer.locator('p.dept-line')).toHaveText(FRONTDESK_PAGE.cta.en);
    const openItems = offer.locator('.prose').nth(0).locator('li');
    await expect(openItems).toHaveCount(FRONTDESK_PAGE.offer.openItems.en.length);
    for (let i = 0; i < FRONTDESK_PAGE.offer.openItems.en.length; i++) {
      await expect(openItems.nth(i)).toHaveText(FRONTDESK_PAGE.offer.openItems.en[i]);
    }
    const notOpenItems = offer.locator('.prose').nth(1).locator('li');
    await expect(notOpenItems).toHaveCount(FRONTDESK_PAGE.offer.notOpenItems.en.length);
    await expect(notOpenItems.nth(0)).toHaveText(FRONTDESK_PAGE.offer.notOpenItems.en[0]);
    await expect(offer.locator('aside.oncall h3')).toHaveText(FRONTDESK_PAGE.offer.firmLine.en);
    const closing = offer.locator('aside.oncall p');
    await expect(closing.nth(0)).toHaveText(FRONTDESK_PAGE.offer.howLine.en);
    await expect(closing.nth(1)).toHaveText(FRONTDESK_PAGE.offer.deskLine.en);

    const rows = page.locator('.contact-rows .contact-row');
    await expect(rows).toHaveCount(3);
    const emailRow = rows.nth(0);
    await expect(emailRow).not.toHaveAttribute('href');
    await expect(emailRow.locator('.contact-row__k')).toHaveText('EMAIL');
    await expect(emailRow.locator('.contact-row__v')).toHaveText(SITE.email);
    const copy = emailRow.locator('button.copy-btn');
    await expect(copy).toHaveAttribute('data-copy', SITE.email);
    await expect(copy).toHaveAttribute('data-copied', FRONTDESK_PAGE.copied.en);
    await expect(copy).toHaveAttribute('data-fail', FRONTDESK_PAGE.copyFail.en);
    await expect(copy).toHaveAttribute('aria-label', `${FRONTDESK_PAGE.copy.en}: ${SITE.email}`);

    const githubRow = rows.nth(1);
    await expect(githubRow).toHaveAttribute('href', SITE.github);
    await expect(githubRow).toHaveAttribute('target', '_blank');
    await expect(githubRow).toHaveAttribute('rel', 'noopener noreferrer');
    await expect(githubRow.locator('.contact-row__v')).toHaveText('github.com/jordimarsal');
    const linkedinRow = rows.nth(2);
    await expect(linkedinRow).toHaveAttribute('href', SITE.linkedin);
    await expect(linkedinRow).toHaveAttribute('target', '_blank');
    await expect(linkedinRow).toHaveAttribute('rel', 'noopener noreferrer');
    await expect(linkedinRow.locator('.contact-row__v')).toHaveText(
      'linkedin.com/in/jordi-marsal-poy',
    );

    const status = page.locator('#copy-status');
    await expect(status).toHaveAttribute('role', 'status');
    await expect(status).toHaveAttribute('aria-live', 'polite');

    const steps = page.locator('ol.steps > li');
    await expect(steps).toHaveCount(FRONTDESK_PAGE.how.en.length);
    for (let i = 0; i < FRONTDESK_PAGE.how.en.length; i++) {
      await expect(steps.nth(i).locator('.steps__k')).toHaveText(FRONTDESK_PAGE.how.en[i].k);
      await expect(steps.nth(i).locator('p')).toHaveText(FRONTDESK_PAGE.how.en[i].v);
    }

    await expect(page.locator('h2#fd-colo')).toHaveText(FRONTDESK_PAGE.colophonTitle.en);
    await expect(page.locator('main > .dept-panel__cta a.btn')).toHaveAttribute('href', '/en/');
  });

  test('renders the inspections quality wall from the committed audit (F10)', async ({
    page,
  }) => {
    const key: DeptKey = 'inspections';
    const parsed = parseQuality(qualityJson);
    expect(parsed.ok, 'committed quality.json must parse (R5)').toBe(true);
    const report = parsed.ok ? parsed.value : null;
    expect(report).not.toBeNull();
    if (!report) return;

    await page.goto(deptRoute('en', key));
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    expect(await page.title()).toBe(PAGES[key].title.en);
    await expect(page.locator('h1#page-title')).toHaveText(DEPTS[key].name.en);
    await expect(page.locator('.sec-head__num')).toHaveText('Q');

    const gauges = page.locator('.q-gauges .q-gauge');
    await expect(gauges).toHaveCount(4);
    for (let i = 0; i < 4; i++) {
      await expect(gauges.nth(i).locator('.q-gauge__label')).toHaveText(INSPECTIONS_PAGE.categories.en[i]);
      await expect(gauges.nth(i).locator('.q-gauge__score')).toHaveText(
        formatScore(report.lighthouse[CATEGORY_KEYS[i]]),
      );
    }

    if (report.history.length >= 2) {
      await expect(page.locator('.q-sparks .q-spark')).toHaveCount(4);
    } else {
      await expect(page.locator('.q-history-note')).toHaveText(INSPECTIONS_PAGE.historyNote.en);
    }

    const counters = page.locator('.q-counters .q-counter');
    await expect(counters).toHaveCount(7);
    await expect(counters.nth(0).locator('dt')).toHaveText(INSPECTIONS_PAGE.labels.unit.en);
    await expect(counters.nth(0).locator('dd')).toHaveText(
      `${report.tests.unit.passed} / ${report.tests.unit.total}`,
    );
    await expect(counters.nth(1).locator('dd')).toHaveText(
      `${report.tests.e2e.passed} / ${report.tests.e2e.total}`,
    );
    await expect(counters.nth(2).locator('dd')).toHaveText(String(report.repo.pagesGenerated));
    await expect(counters.nth(3).locator('dd')).toHaveText(
      `${report.repo.bundleKb} ${INSPECTIONS_PAGE.kbUnit}`,
    );
    await expect(counters.nth(4).locator('dd')).toHaveText(String(report.repo.deps.prod));
    await expect(counters.nth(5).locator('dd')).toHaveText(String(report.repo.deps.dev));
    await expect(counters.nth(6).locator('dt')).toHaveText(INSPECTIONS_PAGE.labels.auditDate.en);
    await expect(counters.nth(6).locator('dd')).toHaveText(report.generatedAt.slice(0, 10));

    const workflowLink = page.locator('.section a.case[href="' + SITE.actionsUrl + '"]');
    await expect(workflowLink).toHaveCount(1);
    await expect(workflowLink).toContainText(INSPECTIONS_PAGE.labels.workflow.en);

    await expect(page.locator('main > .dept-panel__cta a.btn .btn__label')).toHaveText(
      'Back to the building',
    );
  });

  test('resolves the entrance plaque with the real audit on home (F10 R10)', async ({ page }) => {
    await page.goto('/en/');
    const plaque = page.locator('a.ite-plaque');
    const visible = ((await plaque.locator('.ite-plaque__text').textContent()) ?? '').trim();
    expect(visible).toBe(plaqueText('en', parseQuality(qualityJson).ok ? parseQuality(qualityJson).value : null));
    expect(visible).toMatch(/· 2026-\d{2}-\d{2} · /);
  });

  test('renders all 21 department pages across the three locales', async ({ page }) => {
    for (const lang of LOCALES) {
      for (const key of FLOOR_ORDER) {
        const d = DEPTS[key];
        const response = await page.goto(deptRoute(lang, key));
        expect(response?.status(), `${lang}/${key}`).toBe(200);
        await expect(page.locator('html')).toHaveAttribute('lang', lang);
        expect(await page.title()).toBe(PAGES[key].title[lang]);
        await expect(page.locator('h1#page-title')).toHaveText(d.name[lang]);
        await expect(page.locator('.sec-head__sub')).toHaveText(d.tag[lang]);
        await expect(page.locator('main > p.prose')).toHaveText(d.intro[lang]);
        await expect(
          page.locator('nav.breadcrumb span[aria-current="page"]'),
        ).toHaveText(d.name[lang]);
        await expect(page.locator('main .dept-panel__cta a.btn .btn__label').last()).toHaveText(
          BACK_LABEL[lang],
        );
        for (const slug of d.projects) {
          const p = project(slug);
          await expect(
            page.locator(`article.card a.case[href="${p.github}"]`),
          ).toHaveAttribute('aria-label', `${p.name} — ${UI.viewGithub[lang]}`);
        }
      }
    }
  });

  test('localizes the CV and back-building CTAs across locales (page + panel)', async ({ page }) => {
    await page.goto('/en/');
    await expect(
      page.locator('.dept-panel#dept-panel-operations .dept-panel__cta a.btn[href="/en/cv/"]'),
    ).toHaveCount(1);

    for (const lang of LOCALES) {
      await page.goto(deptRoute(lang, 'operations'));
      const cv = page.locator('main a.btn[href$="/cv/"]');
      await expect(cv).toHaveAttribute('href', `/${lang}/cv/`);
      await expect(cv.locator('.btn__label')).toHaveText(UI.nav.cv[lang]);
      const back = page.locator('main > .dept-panel__cta a.btn').last();
      await expect(back).toHaveAttribute('href', `/${lang}/`);

      await page.goto(deptRoute(lang, 'frontdesk'));
      await expect(page.locator('main > .dept-panel__cta a.btn')).toHaveAttribute(
        'href',
        `/${lang}/`,
      );
    }
  });

  test('copies the desk email from the front-desk copy button', async ({ page }) => {
    await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.goto(deptRoute('en', 'frontdesk'));

    const copy = page.locator('button.copy-btn');
    await copy.click();
    await expect(copy).toHaveText(FRONTDESK_PAGE.copied.en);
    await expect(page.locator('#copy-status')).toHaveText(FRONTDESK_PAGE.copied.en);
    await expect
      .poll(() => page.evaluate(() => navigator.clipboard.readText()))
      .toBe(SITE.email);
  });
});
