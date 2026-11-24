import assert from 'node:assert/strict';
import test from 'node:test';
import { checkUrl } from './offhost-links.mjs';

const realFetch = globalThis.fetch;

function stubFetch(status) {
  const calls = [];
  globalThis.fetch = async (url, init) => {
    calls.push({ url, init });
    return { status };
  };
  return calls;
}

test('checkUrl accepts a 2xx response', async () => {
  const calls = stubFetch(200);
  try {
    const result = await checkUrl('https://example.com/a');
    assert.equal(result.ok, true);
    assert.equal(result.status, 200);
    assert.notEqual(result.rateLimited, true);
    assert.equal(calls.length, 1);
  } finally {
    globalThis.fetch = realFetch;
  }
});

test('checkUrl flags 429 as rate-limited without retrying', async () => {
  const calls = stubFetch(429);
  try {
    const result = await checkUrl('https://www.linkedin.com/in/someone');
    assert.equal(result.ok, false);
    assert.equal(result.status, 429);
    assert.equal(result.rateLimited, true);
    assert.equal(calls.length, 1);
  } finally {
    globalThis.fetch = realFetch;
  }
});

test('checkUrl still retries and fails a server error', async () => {
  const calls = stubFetch(500);
  try {
    const result = await checkUrl('https://example.com/b');
    assert.equal(result.ok, false);
    assert.equal(result.status, 500);
    assert.notEqual(result.rateLimited, true);
    assert.equal(calls.length, 3);
  } finally {
    globalThis.fetch = realFetch;
  }
});
