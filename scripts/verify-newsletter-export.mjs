// Real account read-only probe. No subscriber content or secrets are logged.
import assert from 'node:assert/strict';
import { registerHooks } from 'node:module';
registerHooks({ resolve(specifier, context, nextResolve) {
  if (specifier === 'server-only') return { url: 'data:text/javascript,export%20%7B%7D', shortCircuit: true };
  try { return nextResolve(specifier, context); }
  catch (error) { if (specifier.startsWith('.') && !/\.[a-z]+$/.test(specifier)) return nextResolve(`${specifier}.ts`, context); throw error; }
} });
const originalFetch = globalThis.fetch;
let providerReads = 0;
globalThis.fetch = async (input, init) => {
  const url = input instanceof Request ? input.url : String(input);
  if (url.startsWith('https://api.resend.com/')) {
    const method = init?.method ?? (input instanceof Request ? input.method : 'GET');
    assert.equal(method.toUpperCase(), 'GET', 'Migration exports must never mutate the provider.');
    providerReads++;
  }
  return originalFetch(input, init);
};
try {
  const { exportNewsletterMigration } = await import('../src/lib/newsletter-export.ts');
  const snapshot = await exportNewsletterMigration();
  assert.equal(snapshot.schemaVersion, 1);
  assert.equal(snapshot.requiresFinalReconciliation, true);
  assert.equal(snapshot.counts.total, snapshot.subscribers.length);
  assert.equal(snapshot.counts.total, snapshot.counts.eligible + snapshot.counts.blocked + snapshot.counts.pending + snapshot.counts.review);
  assert.ok(providerReads >= 4);
  const text = JSON.stringify(snapshot);
  for (const secret of ['RESEND_API_KEY', 'RESEND_WEBHOOK_SECRET', 'CRON_SECRET', 'ADMIN_SESSION_SECRET']) {
    if (process.env[secret]?.trim()) assert.equal(text.includes(process.env[secret].trim()), false);
  }
  assert.equal(/confirmation_hash|confirmation_expires_at|confirmationToken/.test(text), false);
  for (const recipient of snapshot.subscribers.filter((record) => record.eligibility === 'eligible')) {
    assert.equal(recipient.status, 'subscribed');
    assert.ok(recipient.confirmedAt);
    assert.deepEqual(recipient.reasons, []);
  }
  console.log(JSON.stringify({ result: 'PASS', providerReads, counts: snapshot.counts,
    digestRuns: snapshot.digestRuns.length, sourceBroadcasts: snapshot.sourceBroadcasts.length,
    cutoverBlockers: snapshot.cutoverBlockers, noSecretsOrTokens: true }));
} finally { globalThis.fetch = originalFetch; }
