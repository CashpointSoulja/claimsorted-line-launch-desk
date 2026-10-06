// Six illustrative line specs, one per line of business listed on claimsorted.com.
// Clients, wordings, rules and gaps are synthetic. They are not ClaimSorted's lines, clients or framework.
import { FRAMEWORK, NEEDS_HUMAN, validateSpec, evaluateGate } from './engine.js';
import { toCsv } from './drafter.js';

export const AS_OF = '2026-10-05';

const TEMPLATE = {
  FNOL: { rule: 'Capture first notice via eNOL with policy number, incident date and contact', owner: 'Claims intake', sla_hours: '24' },
  COVERAGE: { rule: 'Check cover, exclusions and excess against the wording section for the incident type', owner: 'Claims handler' },
  ASSESS: { rule: 'Assess the claim and set a reserve within 5 working days', owner: 'Claims handler', sla_hours: '120' },
  AUTHORITY: { rule: 'Refer settlements above handler authority to the team lead', owner: 'Team lead', authority_limit_gbp: '2500' },
  FRAUD: { rule: 'Run duplicate-claim and fraud indicator checks before payment', owner: 'Fraud analyst' },
  PAYMENT: { rule: 'Pay agreed settlements within 3 days of agreement', owner: 'Payments', sla_hours: '72' },
  COMPLAINT: { rule: 'Route any expression of dissatisfaction to complaints within 1 day', owner: 'Complaints lead', sla_hours: '24' },
  REPORTING: { rule: 'Send the monthly claims bordereau to the client', owner: 'Client ops' },
};

// variants: nosign, stale, missing, overcap, mismatch, slow, needs_human
export const LINES = [
  { id: 'property', label: 'Property', client: 'Northgate Home (fictional MGA)', product: 'Home buildings and contents', wording: 'NGH-2026.1', go_live: '2026-11-16', variants: { ASSESS: 'nosign', COMPLAINT: 'missing' } },
  { id: 'auto', label: 'Auto', client: 'Kestrel Motor (fictional MGA)', product: 'Private car', wording: 'KSM-2026.4', go_live: '2026-12-01', variants: { AUTHORITY: 'overcap', FRAUD: 'stale' } },
  { id: 'small_commercial', label: 'Small commercial', client: 'Ashgrove Commercial (fictional)', product: 'Retail and office property', wording: 'ACP-2026.3', go_live: '2026-11-23', variants: { COVERAGE: 'needs_human', REPORTING: 'missing' } },
  { id: 'general_liability', label: 'General liability', client: 'Fenwick Liability (fictional MGA)', product: 'Public and products liability', wording: 'FWL-2026.2', go_live: '2027-01-11', variants: { COVERAGE: 'mismatch', PAYMENT: 'slow', COMPLAINT: 'missing', REPORTING: 'missing' } },
  { id: 'accident_health', label: 'Accident & health (incl. travel)', client: 'Brightwater Travel (fictional)', product: 'Single trip travel', wording: 'BWT-2026.1', go_live: '2026-11-09', variants: { FNOL: 'nosign' } },
  { id: 'warranty', label: 'Warranty', client: 'Keeling Home (fictional)', product: 'Appliance warranty', wording: 'KHW-2026.2', go_live: '2026-11-02', variants: {} },
];

export function lineProgramme(line) {
  return { client: line.client, line: `${line.label}: ${line.product} (illustrative)`, policy_wording_version: line.wording, as_of: AS_OF, go_live: line.go_live };
}

export function lineSpec(line) {
  const code = line.id.split('_').map(w => w[0]).join('').toUpperCase();
  const rows = [];
  for (const [i, st] of FRAMEWORK.stages.entries()) {
    const v = line.variants[st.id];
    if (v === 'missing') continue;
    const t = TEMPLATE[st.id];
    const r = { rule_id: `${code}-${st.id}-01`, stage: st.id, rule: t.rule, owner: t.owner, authority_limit_gbp: t.authority_limit_gbp || '', sla_hours: t.sla_hours || '',
      evidence_doc: st.requiresWordingEvidence ? `${line.wording} wording s.${i + 1}` : `${line.label} handling guide s.${i + 1}`,
      evidence_version: line.wording, evidence_date: '2026-08-01', client_signoff: 'yes' };
    if (v === 'nosign') r.client_signoff = 'no';
    if (v === 'stale') r.evidence_date = '2025-12-01';
    if (v === 'overcap') r.authority_limit_gbp = '7500';
    if (v === 'mismatch') r.evidence_version = line.wording.replace(/\.(\d+)$/, (_, n) => `.${Math.max(0, n - 1)}`);
    if (v === 'slow') r.sla_hours = '96';
    if (v === 'needs_human') r.owner = NEEDS_HUMAN;
    rows.push(r);
  }
  return toCsv(rows);
}

export function lineReadiness(line) {
  const programme = lineProgramme(line), csv = lineSpec(line);
  const validation = validateSpec(csv, programme);
  const gate = evaluateGate(validation);
  return { id: line.id, label: line.label, programme, csv, validation, gate,
    covered: gate.coverage.filter(c => c.status === 'covered').length, total: FRAMEWORK.stages.length };
}

export const portfolio = () => LINES.map(lineReadiness);
