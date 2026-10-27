import test from 'node:test';
import assert from 'node:assert/strict';
import { deskSummary } from './desk.mjs';
import { renderBoard } from './render.mjs';

const now = Date.parse('2026-01-20T12:00:00Z');
test('board renders every deal with stage, value and stale flag', () => {
  const html = renderBoard(deskSummary({ pipeline: { deals: [{ name: 'Harbor Bakery', stage: 'awaiting', value: '$1,500', moved: '2026-01-01' }] }, fleet: [], business: { ledger: { asOf: '2026-01-15', collected: 3000, mrr: 198 } } }, now));
  assert.match(html, /^<!doctype html>/); assert.match(html, /Harbor Bakery/); assert.match(html, /STALE · 19D/); assert.match(html, /\$3,000/);
  assert.doesNotMatch(html, /<script/);
});
test('hand-edited JSON cannot inject markup', () => {
  const html = renderBoard(deskSummary({ pipeline: { deals: [{ name: '<img src=x onerror=alert(1)>', stage: '"><b>', value: '&' }] }, fleet: [{ name: '<script>x</script>', status: 'testflight' }], business: null }, now));
  assert.doesNotMatch(html, /<img src=x/); assert.doesNotMatch(html, /<script>x/); assert.match(html, /&lt;img/);
});
test('empty inputs still render a valid board', () => {
  const html = renderBoard(deskSummary({}, now));
  assert.match(html, /no ledger/); assert.match(html, /No retainers recorded/);
});
