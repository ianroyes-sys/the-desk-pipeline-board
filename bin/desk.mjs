#!/usr/bin/env node
// desk: a terminal and static-HTML view of your deal pipeline, app fleet and recorded ledger.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { deskSummary } from '../src/desk.mjs';
import { renderBoard } from '../src/render.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const [command = 'view', ...rest] = process.argv.slice(2);
const flags = {};
for (let i = 0; i < rest.length; i++) if (rest[i].startsWith('--')) flags[rest[i].slice(2)] = rest[i + 1] === undefined || rest[i + 1].startsWith('--') ? true : rest[++i];
const dataDir = path.resolve(flags.data || (fs.existsSync(path.join(ROOT, 'data/pipeline.json')) ? path.join(ROOT, 'data') : path.join(ROOT, 'data/example')));
const load = f => { try { return JSON.parse(fs.readFileSync(path.join(dataDir, f), 'utf8')); } catch (e) { if (e.code === 'ENOENT') return null; throw new Error(`${f}: ${e.message}`); } };
const now = flags.now ? Date.parse(flags.now) : Date.now();
if (!Number.isFinite(now)) { console.error('--now must be a date, e.g. 2026-01-20'); process.exit(1); }
const staleDays = flags['stale-days'] ? Number(flags['stale-days']) : undefined;
const d = deskSummary({ pipeline: load('pipeline.json'), fleet: load('fleet.json'), business: load('business.json') }, now, staleDays ? { staleDays } : {});
const usd = n => typeof n === 'number' ? '$' + n.toLocaleString('en-US') : '—';

if (command === 'view') {
  if (d.ledger) console.log(`Ledger as of ${d.ledger.asOf}: collected ${usd(d.ledger.collected)} · MRR ${usd(d.ledger.mrr)} (recorded, not live)`);
  console.log(`Open deals: ${d.openDeals} · stale (> ${d.staleAfterDays}d): ${d.staleDeals.join(', ') || 'none'}\n`);
  for (const deal of d.deals) console.log(`  ${String(deal.stage).toUpperCase().padEnd(9)} ${deal.name.padEnd(24)} ${String(deal.value ?? '').padEnd(18)}${deal.days !== null ? ` ${deal.stale ? 'STALE ' : ''}${deal.days}d` : ''}`);
  console.log(`\nFleet: ${d.fleet.live} live · ${d.fleet.testflight.length} TestFlight · ${d.fleet.needsOwner} need you`);
  for (const n of d.needsYou) console.log(`Needs you: ${n.title}`);
} else if (command === 'stale') {
  // Exit 1 when anything is stale, so a cron job or CI step can alert on it.
  for (const deal of d.deals.filter(x => x.stale)) console.log(`${deal.name}\t${deal.stage}\t${deal.days}d`);
  process.exitCode = d.staleDeals.length ? 1 : 0;
} else if (command === 'fleet') {
  console.log(JSON.stringify({ live: d.fleet.live, testflight: d.fleet.testflight.map(a => a.name), needsOwner: d.fleet.needsOwner }, null, 2));
} else if (command === 'json') {
  console.log(JSON.stringify(d, null, 2));
} else if (command === 'html') {
  const html = renderBoard(d, { title: flags.title || 'The Desk' });
  if (flags.out) { fs.writeFileSync(path.resolve(flags.out), html); console.log(`Wrote ${flags.out}`); } else process.stdout.write(html);
} else {
  console.log('Usage: desk [view] | stale | fleet | json | html [--out board.html] [--title T]   [--data DIR] [--now DATE] [--stale-days N]');
}
