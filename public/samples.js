// All data here is synthetic. Harbour Pet is a fictional MGA.

export const PROGRAMME = {
  client: 'Harbour Pet Insurance (fictional MGA)',
  line: 'Pet (UK)',
  policy_wording_version: 'HPW-2026.2',
  as_of: '2026-10-05',
  go_live: '2026-11-02',
};

const HEADER = 'rule_id,stage,rule,owner,authority_limit_gbp,sla_hours,evidence_doc,evidence_version,evidence_date,client_signoff';

export const SPEC_V1 = [HEADER,
  'PET-FNOL-01,FNOL,Acknowledge eNOL submission to policyholder,Claims ops,,24,eNOL field spec,HPW-2026.2,2026-09-20,yes',
  'PET-FNOL-02,FNOL,"Collect vet invoice, clinical history and pet ID at eNOL",Claims ops,,24,eNOL field spec,HPW-2026.2,2026-09-20,yes',
  'PET-COV-01,COVERAGE,Check pre-existing condition exclusion,Claims handler,,,Policy wording s.4.2,HPW-2025.4,2025-11-03,yes',
  'PET-COV-02,COVERAGE,Apply 14-day illness waiting period,Claims handler,,,Policy wording s.3.1,HPW-2026.2,2026-09-18,yes',
  'PET-ASS-01,ASSESS,Assess vet fees against benefit schedule,Claims handler,,96,Benefit schedule,HPW-2026.2,2026-09-18,yes',
  'PET-ASS-01,ASSESS,Assess vet fees against benefit schedule,Claims handler,,96,Benefit schedule,HPW-2026.2,2026-09-18,yes',
  'PET-AUTH-01,AUTHORITY,Handler may settle up to limit without referral,Claims handler,7500,,Delegated authority letter,HPW-2026.2,2026-09-25,yes',
  'PET-AUTH-02,AUTHORITY,Refer anything above handler limit to Harbour claims manager,Client,,48,Delegated authority letter,HPW-2026.2,2026-09-25,yes',
  'PET-FRD-01,FRAUD,Flag duplicate invoice numbers and edited PDFs,Fraud desk,,,Fraud referral guide,HPW-2026.2,2026-09-22,yes',
  'PET-FRD-01,FRAUD,Flag duplicate invoice numbers,Claims handler,,,Fraud referral guide,HPW-2026.2,2026-09-22,yes',
  'PET-PAY-01,PAYMENT,Pay vet direct or policyholder,Payments,,120,Payment SOP,HPW-2026.2,2026-09-22,yes',
  'PET-PAY-02,PAYMENT,Pay vet direct or policyholder,Payments,,48,Payment SOP,HPW-2026.2,2026-09-22,no',
  'PET-REC-01,RECOVERY,Recover third-party share for dog-bite claims,Claims handler,,,Recovery note,HPW-2026.2,2026-09-22,yes',
  'PET-REP-01,REPORTING,Weekly bordereau via SFTP every Monday,Reporting,,,Reporting schedule,HPW-2026.2,,yes',
].join('\n');

export const SPEC_V2 = [HEADER,
  'PET-FNOL-01,FNOL,Acknowledge eNOL submission to policyholder,Claims ops,,24,eNOL field spec,HPW-2026.2,2026-09-20,yes',
  'PET-FNOL-02,FNOL,"Collect vet invoice, clinical history and pet ID at eNOL",Claims ops,,24,eNOL field spec,HPW-2026.2,2026-09-20,yes',
  'PET-COV-01,COVERAGE,Check pre-existing condition exclusion,Claims handler,,,Policy wording s.4.2,HPW-2026.2,2026-10-01,yes',
  'PET-COV-02,COVERAGE,Apply 14-day illness waiting period,Claims handler,,,Policy wording s.3.1,HPW-2026.2,2026-09-18,yes',
  'PET-ASS-01,ASSESS,Assess vet fees against benefit schedule,Claims handler,,96,Benefit schedule,HPW-2026.2,2026-09-18,yes',
  'PET-AUTH-01,AUTHORITY,Handler may settle up to limit without referral,Claims handler,5000,,Delegated authority letter v2,HPW-2026.2,2026-10-02,yes',
  'PET-AUTH-02,AUTHORITY,Refer anything above handler limit to Harbour claims manager,Client,,48,Delegated authority letter v2,HPW-2026.2,2026-10-02,yes',
  'PET-FRD-01,FRAUD,Flag duplicate invoice numbers and edited PDFs,Fraud desk,,,Fraud referral guide,HPW-2026.2,2026-09-22,yes',
  'PET-PAY-02,PAYMENT,Pay vet direct or policyholder,Payments,,48,Payment SOP,HPW-2026.2,2026-09-22,yes',
  'PET-CMP-01,COMPLAINT,Acknowledge complaint and route to complaints desk,Complaints desk,,48,Complaints procedure,HPW-2026.2,2026-10-01,yes',
  'PET-REP-01,REPORTING,Weekly bordereau via SFTP every Monday,Reporting,,,Reporting schedule,HPW-2026.2,2026-09-30,yes',
].join('\n');

// Two pilot weeks of fictional claims. Built so the blended median improves
// while each segment slows down (case-mix shift).
function build() {
  const out = [];
  const plan = [
    { week: '2026-W35', start: '2026-08-24', segment: 'simple', n: 20, base: 3.0, step: 0.25, mod: 5 },
    { week: '2026-W35', start: '2026-08-24', segment: 'complex', n: 32, base: 10.0, step: 0.5, mod: 4 },
    { week: '2026-W36', start: '2026-08-31', segment: 'simple', n: 48, base: 3.5, step: 0.25, mod: 5 },
    { week: '2026-W36', start: '2026-08-31', segment: 'complex', n: 10, base: 11.0, step: 0.5, mod: 4 },
  ];
  let k = 0;
  for (const p of plan) for (let i = 0; i < p.n; i++, k++) {
    const opened = Date.parse(p.start + 'T09:00:00Z') + (i % 5) * 86400000;
    const days = p.base + (i % p.mod) * p.step;
    const handler = `Handler ${(k % 4) + 1}`;
    const used = handler === 'Handler 3' ? i % 5 < 2 : k % 9 !== 4;
    out.push({
      claim_id: `HP-${String(k + 1).padStart(4, '0')}`, week: p.week, segment: p.segment, handler,
      opened: new Date(opened).toISOString(), closed: new Date(opened + days * 86400000).toISOString(),
      reopened_30d: k % 13 === 0, used_playbook: used,
    });
  }
  return out;
}
export const PILOT_CLAIMS = build();
