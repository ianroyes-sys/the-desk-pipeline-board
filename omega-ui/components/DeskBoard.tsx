"use client";
// "The Desk" tab: read-only ledger, pipeline board, fleet counts and retainers.
// Extracted from the Omega dashboard Business room; Omega-only widgets (pulse feed, notes, agent buttons) were left out.
import { deskSummary } from "../../src/desk.mjs";
import styles from "./DeskBoard.module.css";

type Deal = { name: string; stage: "lead" | "pitched" | "awaiting" | "won" | "lost"; value: string; note?: string; moved?: string };
type FleetItem = { name: string; status: string; needs?: string };
type Business = { ledger: { asOf: string; collected: number; mrr: number }; retainers: { client: string; amount: number; status: string; nextInvoice: string }[]; needsYou?: { title: string; why?: string; steps: string[] }[] };

const STAGE_COLOR: Record<string, string> = { lead: "#8b8496", pitched: "#9ad8ff", awaiting: "#ffc861", won: "#7ef0b2", lost: "#ff5e5b" };

export default function DeskBoard({ pipeline, fleet, business }: { pipeline: { deals: Deal[] }; fleet: FleetItem[]; business: Business }) {
  const d = deskSummary({ pipeline, fleet, business });
  return (
    <section className={styles.desk} aria-label="Operating desk">
      <header className={styles.hero}>
        <p className={styles.eyebrow}>Ledger snapshot · {d.ledger?.asOf ?? "no ledger"}</p>
        <div className={styles.metrics}>
          <div><span>COLLECTED · RECORDED</span><strong>${(d.ledger?.collected ?? 0).toLocaleString()}</strong></div>
          <div><span>MRR · RECORDED</span><strong>${(d.ledger?.mrr ?? 0).toLocaleString()}<small>/mo</small></strong></div>
          <div><span>OPEN DEALS</span><strong>{d.openDeals}</strong></div>
        </div>
        <p className={styles.note}>Recorded values, not a live bank balance. Deal Lab scenarios stay separate from this ledger.</p>
      </header>

      {d.needsYou.length > 0 && <section className={styles.card}>
        <p className={styles.eyebrow}>NEEDS YOU</p>
        {d.needsYou.map((b: { title: string; why?: string; steps: string[] }) => <div key={b.title} className={styles.need}><p>{b.title}</p>{b.why && <small>{b.why}</small>}<ol>{b.steps.map((s) => <li key={s}>{s}</li>)}</ol></div>)}
      </section>}

      <section className={styles.card}>
        <div className={styles.row}><p className={styles.eyebrow}>PIPELINE</p><small>STALE = OPEN, IDLE MORE THAN 7 DAYS</small></div>
        {d.deals.map((deal: Deal & { days: number | null; stale: boolean }) => (
          <div key={deal.name} className={styles.deal}>
            <span className={styles.stage} style={{ color: STAGE_COLOR[deal.stage], borderColor: `${STAGE_COLOR[deal.stage]}4d` }}>{deal.stage.toUpperCase()}</span>
            <span className={styles.name}>{deal.name}</span>
            <span className={styles.value}>{deal.value}</span>
            {deal.days !== null && <span className={deal.stale ? styles.stale : styles.age}>{deal.stale ? `STALE · ${deal.days}D` : `${deal.days}D`}</span>}
            {deal.note && <p className={styles.dealNote}>{deal.note}</p>}
          </div>
        ))}
      </section>

      <div className={styles.grid}>
        <section className={styles.card}>
          <p className={styles.eyebrow}>APP FLEET</p>
          <div className={styles.counts}><div><strong>{d.fleet.live}</strong><span>LIVE</span></div><div><strong>{d.fleet.testflight.length}</strong><span>TESTFLIGHT</span></div><div><strong>{d.fleet.needsOwner}</strong><span>NEED YOU</span></div></div>
          {d.fleet.testflight.map((a: FleetItem) => <p key={a.name} className={styles.tf}>TF · {a.name}{a.needs ? ` — ${a.needs}` : ""}</p>)}
        </section>
        <section className={styles.card}>
          <p className={styles.eyebrow}>RETAINERS</p>
          {d.retainers.map((r: Business["retainers"][number]) => <div key={r.client} className={styles.retainer}><p>{r.client}<b>${r.amount}/mo</b></p><small>{r.status.toUpperCase()} · NEXT INVOICE {r.nextInvoice}</small></div>)}
        </section>
      </div>
    </section>
  );
}
