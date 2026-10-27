// Type shim so the Next.js component can import the plain ESM core.
declare module "*/src/desk.mjs" { export function deskSummary(input: unknown, now?: number, opts?: { staleDays?: number }): any; }
