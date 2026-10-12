import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';

/**
 * Arms the tracked git hooks (`.githooks/`) for this clone.
 *
 * Wired to npm's `prepare` lifecycle, so `npm ci` and `npm install` enable the
 * pre-push parity guard (`qa:guard`) without a manual `git config`. It never fails
 * the install: a non-git checkout or a read-only `.git` only costs the guard, and
 * `git push --no-verify` bypasses it per push.
 */

const HOOKS_DIR = '.githooks';
// S4036: resolve git against a fixed PATH instead of inheriting the environment's.
const GIT_ENV = { PATH: '/usr/local/bin:/usr/bin:/bin' };
const QUIET = { stdio: 'ignore', env: GIT_ENV };

if (!existsSync(HOOKS_DIR)) {
  console.log(`install-hooks: ${HOOKS_DIR}/ not present — skipping the hook install`);
  process.exit(0);
}

try {
  execFileSync('git', ['rev-parse', '--git-dir'], QUIET);
  execFileSync('git', ['config', 'core.hooksPath', HOOKS_DIR], QUIET);
  console.log(`install-hooks: hooks armed (core.hooksPath=${HOOKS_DIR}) — pre-push verifies the parity oracle`);
  console.log('install-hooks: bypass a single push with git push --no-verify');
} catch (error) {
  // A missing/read-only git metadata dir is not worth failing `npm ci` over.
  console.log(`install-hooks: could not arm the hooks (${error.message.split('\n')[0]}) — continuing`);
}
