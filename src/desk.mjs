// "The Desk": a read-only operating board over three hand-edited JSON files
// (pipeline deals, app fleet, business ledger). Pure functions; no I/O.

export const STAGES = ['lead', 'pitched', 'awaiting', 'won', 'lost'];
export const STAGE_ORDER = ['awaiting', 'pitched', 'lead', 'won', 'lost'];
const DAY = 86_400_000;
export const STALE_DAYS = 7;

const closed = d => d.stage === 'won' || d.stage === 'lost';

/** Sort deals so the ones waiting on a reply come first. Unknown stages sink. */
export function sortDeals(deals) {
  const rank = s => { const i = STAGE_ORDER.indexOf(s); return i === -1 ? STAGE_ORDER.length : i; };
  return deals.slice().sort((a, b) => rank(a.stage) - rank(b.stage));
}

/** Days since a deal last moved; open deals idle for more than staleDays are stale. */
export function dealAge(deal, now = Date.now(), staleDays = STALE_DAYS) {
  const at = deal.moved ? Date.parse(deal.moved) : NaN;
  if (!Number.isFinite(at)) return { days: null, stale: false };
  const days = Math.floor((now - at) / DAY);
  return { days, stale: days > staleDays && !closed(deal) };
}

export function fleetSummary(apps) {
  return {
    live: apps.filter(a => a.status === 'live').length,
    testflight: apps.filter(a => a.status === 'testflight'),
    needsOwner: apps.filter(a => a.needs).length,
  };
}

export function deskSummary({ pipeline, fleet, business }, now = Date.now(), { staleDays = STALE_DAYS } = {}) {
  const deals = sortDeals(pipeline?.deals ?? []).map(d => ({ ...d, ...dealAge(d, now, staleDays) }));
  return {
    generatedAt: new Date(now).toISOString(),
    staleAfterDays: staleDays,
    ledger: business?.ledger ?? null,
    openDeals: deals.filter(d => !closed(d)).length,
    staleDeals: deals.filter(d => d.stale).map(d => d.name),
    deals,
    fleet: fleetSummary(fleet ?? []),
    retainers: business?.retainers ?? [],
    needsYou: business?.needsYou ?? [],
  };
}
