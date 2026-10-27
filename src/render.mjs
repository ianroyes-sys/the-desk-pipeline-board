// Self-contained static HTML board from a deskSummary(). No scripts, no external assets.
import { STAGES } from './desk.mjs';

const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const money = n => typeof n === 'number' && Number.isFinite(n) ? '$' + n.toLocaleString('en-US') : '—';
const STAGE_CLASS = Object.fromEntries(STAGES.map(s => [s, s]));

export function renderBoard(summary, { title = 'The Desk' } = {}) {
  const s = summary;
  const deals = s.deals.map(d => `
      <li class="deal${d.stale ? ' is-stale' : ''}">
        <span class="stage ${STAGE_CLASS[d.stage] || 'unknown'}">${esc(String(d.stage).toUpperCase())}</span>
        <span class="name">${esc(d.name)}</span>
        <span class="value">${esc(d.value)}</span>
        ${d.days === null ? '' : `<span class="age">${d.stale ? `STALE · ${d.days}D` : `${d.days}D`}</span>`}
        ${d.note ? `<p class="note">${esc(d.note)}</p>` : ''}
      </li>`).join('');
  const needs = s.needsYou.map(n => `
      <div class="need"><h3>${esc(n.title)}</h3>${n.why ? `<p>${esc(n.why)}</p>` : ''}<ol>${(n.steps || []).map(x => `<li>${esc(x)}</li>`).join('')}</ol></div>`).join('');
  const retainers = s.retainers.map(r => `
      <div class="retainer"><p><span>${esc(r.client)}</span><b>${money(r.amount)}/mo</b></p><small>${esc(String(r.status || '').toUpperCase())} · NEXT INVOICE ${esc(r.nextInvoice)}</small></div>`).join('') || '<p class="muted">No retainers recorded.</p>';
  const tf = s.fleet.testflight.map(a => `<p class="tf">TF · ${esc(a.name)}${a.needs ? ` — ${esc(a.needs)}` : ''}</p>`).join('');
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title>
<style>
:root{--bg:#0b0810;--card:#130e1a;--line:#ffffff14;--text:#eeeaf3;--muted:#a9a2b6;--amber:#ffc861;--ice:#9ad8ff;--green:#7ef0b2;--red:#ff8a6d;--grey:#8b8496;color-scheme:dark}
@media (prefers-color-scheme:light){:root{--bg:#f7f5f1;--card:#fff;--line:#00000014;--text:#1b1720;--muted:#6b6475;--amber:#a36a00;--ice:#1f6e9c;--green:#1b8a55;--red:#c2410c;--grey:#6b6475;color-scheme:light}}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--text);font:15px/1.5 system-ui,-apple-system,"Segoe UI",sans-serif}
main{max-width:1040px;margin:0 auto;padding:32px 16px 64px}.mono,.eyebrow,.stage,.value,.age,small,.metric span,.metric strong,.tf{font-family:ui-monospace,"SF Mono",Menlo,monospace}
.eyebrow{font-size:11px;letter-spacing:.14em;color:var(--amber);margin:0 0 10px;text-transform:uppercase}h1{font-size:clamp(30px,6vw,48px);letter-spacing:-.04em;margin:0 0 6px;font-weight:600}
.lede{color:var(--muted);margin:0 0 24px;max-width:60ch}.metrics{display:flex;flex-wrap:wrap;gap:12px}.metric{flex:1 1 160px;background:var(--card);border:1px solid var(--line);border-radius:14px;padding:16px}
.metric span{display:block;font-size:10px;letter-spacing:.1em;color:var(--muted)}.metric strong{display:block;font-size:30px;font-weight:500;margin-top:6px}.ledger-note{font-size:12px;color:var(--muted);margin:10px 0 0}
section{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:20px;margin-top:16px}.head{display:flex;justify-content:space-between;align-items:baseline;gap:12px;flex-wrap:wrap}
ul{list-style:none;margin:0;padding:0}.deal{display:flex;flex-wrap:wrap;align-items:baseline;gap:6px 14px;padding:12px 0;border-top:1px solid var(--line)}
.stage{width:84px;text-align:center;border:1px solid currentColor;border-radius:99px;padding:2px 8px;font-size:10px;letter-spacing:.1em}.lead,.unknown{color:var(--grey)}.pitched{color:var(--ice)}.awaiting{color:var(--amber)}.won{color:var(--green)}.lost{color:var(--red)}
.name{flex:1 1 160px;font-weight:500}.value{color:var(--amber);font-size:13px}.age{font-size:11px;color:var(--muted)}.is-stale .age{color:var(--red)}.note{flex-basis:100%;margin:0;font-size:13px;color:var(--muted);padding-left:98px}
.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:16px}.grid section{margin-top:16px}.counts{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;text-align:center}
.counts div{border:1px solid var(--line);border-radius:10px;padding:10px}.counts strong{display:block;font:500 24px ui-monospace,monospace}.counts span{font-size:10px;color:var(--muted);letter-spacing:.08em}
.tf{font-size:12px;margin:10px 0 0}.retainer{border:1px solid var(--line);border-radius:10px;padding:12px;margin-top:8px}.retainer p{display:flex;justify-content:space-between;margin:0}.retainer b{color:var(--amber);font-family:ui-monospace,monospace}
small{font-size:11px;color:var(--muted)}.need h3{font-size:16px;margin:12px 0 4px}.need p{margin:0;color:var(--muted);font-size:13px}.need ol{margin:8px 0 0 20px;padding:0}.muted{color:var(--muted)}
footer{margin-top:28px;font-size:12px;color:var(--muted)}
@media (max-width:560px){.note{padding-left:0}.stage{width:auto}}
</style></head>
<body><main>
  <p class="eyebrow">Ledger snapshot · ${esc(s.ledger?.asOf ?? 'no ledger')}</p>
  <h1>${esc(title)}</h1>
  <p class="lede">What has shipped, which conversations are moving, and which ones have gone quiet.</p>
  <div class="metrics">
    <div class="metric"><span>COLLECTED · RECORDED</span><strong>${money(s.ledger?.collected)}</strong></div>
    <div class="metric"><span>MRR · RECORDED</span><strong>${money(s.ledger?.mrr)}<small>/mo</small></strong></div>
    <div class="metric"><span>OPEN DEALS</span><strong>${s.openDeals}</strong></div>
    <div class="metric"><span>STALE DEALS</span><strong>${s.staleDeals.length}</strong></div>
  </div>
  <p class="ledger-note">Recorded values, not a live bank balance.</p>
  ${needs ? `<section aria-labelledby="needs"><p class="eyebrow" id="needs">Needs you</p>${needs}</section>` : ''}
  <section aria-labelledby="pipeline"><div class="head"><p class="eyebrow" id="pipeline">Pipeline</p><small>STALE = OPEN, NO MOVEMENT IN MORE THAN ${s.staleAfterDays} DAYS</small></div><ul>${deals}</ul></section>
  <div class="grid">
    <section aria-labelledby="fleet"><p class="eyebrow" id="fleet">App fleet</p>
      <div class="counts"><div><strong>${s.fleet.live}</strong><span>LIVE</span></div><div><strong>${s.fleet.testflight.length}</strong><span>TESTFLIGHT</span></div><div><strong>${s.fleet.needsOwner}</strong><span>NEED YOU</span></div></div>${tf}</section>
    <section aria-labelledby="retainers"><p class="eyebrow" id="retainers">Retainers</p>${retainers}</section>
  </div>
  <footer>Generated ${esc(s.generatedAt)} by the-desk-pipeline-board.</footer>
</main></body></html>
`;
}
