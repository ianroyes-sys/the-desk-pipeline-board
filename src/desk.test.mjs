import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { sortDeals, dealAge, fleetSummary, deskSummary } from './desk.mjs';

const now = Date.parse('2026-01-20T12:00:00Z');
test('deals awaiting a reply sort first and closed deals sink', () => {
  const order = sortDeals([{ name: 'a', stage: 'won' }, { name: 'b', stage: 'lead' }, { name: 'c', stage: 'awaiting' }, { name: 'd', stage: 'mystery' }]).map(d => d.name);
  assert.deepEqual(order, ['c', 'b', 'a', 'd']);
});
test('open deals idle for more than seven days are stale; closed deals never are', () => {
  assert.deepEqual(dealAge({ stage: 'pitched', moved: '2026-01-10' }, now), { days: 10, stale: true });
  assert.deepEqual(dealAge({ stage: 'won', moved: '2026-01-01' }, now), { days: 19, stale: false });
  assert.deepEqual(dealAge({ stage: 'lead', moved: '2026-01-15' }, now), { days: 5, stale: false });
  assert.deepEqual(dealAge({ stage: 'lead' }, now), { days: null, stale: false });
});
test('fleet summary counts live, TestFlight and owner-blocked apps', () => {
  const s = fleetSummary([{ status: 'live' }, { status: 'testflight', needs: 'screenshots' }, { status: 'building' }]);
  assert.equal(s.live, 1); assert.equal(s.testflight.length, 1); assert.equal(s.needsOwner, 1);
});
test('desk summary over the bundled example files', () => {
  const load = f => JSON.parse(fs.readFileSync(new URL(`../data/example/${f}`, import.meta.url)));
  const s = deskSummary({ pipeline: load('pipeline.json'), fleet: load('fleet.json'), business: load('business.json') }, now);
  assert.ok(s.openDeals > 0); assert.equal(s.deals[0].stage, 'awaiting');
  assert.ok(Array.isArray(s.staleDeals)); assert.ok(s.ledger.asOf);
});
test('stale window is configurable', () => {
  assert.equal(dealAge({ stage: 'lead', moved: '2026-01-15' }, now, 3).stale, true);
  assert.equal(deskSummary({ pipeline: { deals: [{ name: 'x', stage: 'lead', moved: '2026-01-15' }] } }, now, { staleDays: 3 }).staleAfterDays, 3);
});
