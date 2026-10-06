// Line Launch Desk engine: pure functions, no DOM, no network.

export const FRAMEWORK = {
  version: 'LLD-FW-0.1 (synthetic baseline)',
  stages: [
    { id: 'FNOL', label: 'eNOL intake', maxSlaHours: 24 },
    { id: 'COVERAGE', label: 'Coverage & eligibility', requiresWordingEvidence: true },
    { id: 'ASSESS', label: 'Assessment', maxSlaHours: 120 },
    { id: 'AUTHORITY', label: 'Authority & referral', maxAuthorityGbp: 5000 },
    { id: 'FRAUD', label: 'Fraud & leakage checks' },
    { id: 'PAYMENT', label: 'Settlement & payment', maxSlaHours: 72 },
    { id: 'COMPLAINT', label: 'Complaint route', maxSlaHours: 72 },
    { id: 'REPORTING', label: 'Client reporting' },
  ],
  maxEvidenceAgeDays: 180,
};

export const NEEDS_HUMAN = 'NEEDS_HUMAN';

export const REQUIRED_COLUMNS = [
  'rule_id', 'stage', 'rule', 'owner', 'authority_limit_gbp', 'sla_hours',
  'evidence_doc', 'evidence_version', 'evidence_date', 'client_signoff',
];

export function parseCsv(text) {
  const rows = [];
  let row = [], field = '', inQuotes = false;
  const src = String(text).replace(/\r\n?/g, '\n');
  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (inQuotes) {
      if (c === '"' && src[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') inQuotes = false;
      else field += c;
    } else if (c === '"') inQuotes = true;
    else if (c === ',') { row.push(field); field = ''; }
    else if (c === '\n') { row.push(field); rows.push(row); row = []; field = ''; }
    else field += c;
  }
  if (field !== '' || row.length) { row.push(field); rows.push(row); }
  const nonEmpty = rows.filter(r => r.some(v => v.trim() !== ''));
  if (!nonEmpty.length) return { header: [], records: [] };
  const header = nonEmpty[0].map(h => h.trim().toLowerCase());
  const records = nonEmpty.slice(1).map((r, idx) => {
    const rec = { _line: idx + 2 };
    header.forEach((h, j) => { rec[h] = (r[j] ?? '').trim(); });
    return rec;
  });
  return { header, records };
}

const DAY = 86400000;
const stageById = id => FRAMEWORK.stages.find(s => s.id === id);
const contentKey = r => REQUIRED_COLUMNS.map(c => r[c] ?? '').join('\u241f');

function issue(severity, code, message, rec) {
  return { severity, code, message, rule_id: rec?.rule_id || null, line: rec?._line ?? null };
}

export function validateSpec(csvText, programme) {
  const { header, records } = parseCsv(csvText);
  const issues = [];
  const missingCols = REQUIRED_COLUMNS.filter(c => !header.includes(c));
  if (missingCols.length) {
    issues.push(issue('error', 'MISSING_COLUMNS', `CSV is missing required columns: ${missingCols.join(', ')}`));
    return { programme, accepted: [], rejected: records, deduped: [], issues, rowCount: records.length };
  }
  const asOf = Date.parse(programme.as_of);
  const byId = new Map();
  const accepted = [], rejected = [], deduped = [];

  for (const rec of records) {
    const rowIssues = [];
    const blank = REQUIRED_COLUMNS.filter(c => c !== 'authority_limit_gbp' && c !== 'sla_hours' && !rec[c]);
    if (!rec.rule_id) { rowIssues.push(issue('error', 'MISSING_ID', 'Row has no rule_id; rules are keyed by stable ID, never by name', rec)); }
    else if (blank.length) rowIssues.push(issue('error', 'MISSING_FIELDS', `Blank required fields: ${blank.join(', ')}`, rec));

    const stage = stageById(rec.stage?.toUpperCase());
    if (rec.stage && !stage) rowIssues.push(issue('error', 'UNKNOWN_STAGE', `Stage "${rec.stage}" is not in framework ${FRAMEWORK.version}`, rec));

    for (const num of ['authority_limit_gbp', 'sla_hours']) {
      if (rec[num] !== '' && rec[num] !== NEEDS_HUMAN && !(Number.isFinite(Number(rec[num])) && Number(rec[num]) >= 0))
        rowIssues.push(issue('error', 'BAD_NUMBER', `${num} must be a non-negative number, got "${rec[num]}"`, rec));
    }
    if (rec.evidence_date && rec.evidence_date !== NEEDS_HUMAN && Number.isNaN(Date.parse(rec.evidence_date)))
      rowIssues.push(issue('error', 'BAD_DATE', `evidence_date "${rec.evidence_date}" is not an ISO date`, rec));

    if (rowIssues.some(i => i.severity === 'error')) { issues.push(...rowIssues); rejected.push(rec); continue; }

    if (byId.has(rec.rule_id)) {
      const prev = byId.get(rec.rule_id);
      if (contentKey(prev) === contentKey(rec)) {
        deduped.push(rec);
        issues.push(issue('info', 'DUPLICATE_IDENTICAL', `Identical duplicate of line ${prev._line}; kept once`, rec));
      } else {
        rejected.push(rec);
        issues.push(issue('error', 'DUPLICATE_CONFLICT', `rule_id already used on line ${prev._line} with different content; resolve with the client before import`, rec));
      }
      continue;
    }

    const blockers = [];
    const needsHuman = REQUIRED_COLUMNS.filter(c => rec[c] === NEEDS_HUMAN);
    if (needsHuman.length)
      blockers.push(issue('blocker', 'NEEDS_HUMAN', `Drafted, not confirmed: ${needsHuman.join(', ')} needs a human`, rec));
    const num = v => (v === '' || v === NEEDS_HUMAN ? null : Number(v));
    const sla = num(rec.sla_hours);
    const limit = num(rec.authority_limit_gbp);
    if (stage.maxSlaHours && sla !== null && sla > stage.maxSlaHours)
      blockers.push(issue('blocker', 'SLA_OVER_FRAMEWORK', `${stage.id} SLA ${sla}h exceeds framework maximum ${stage.maxSlaHours}h`, rec));
    if (stage.maxAuthorityGbp && limit !== null && limit > stage.maxAuthorityGbp)
      blockers.push(issue('blocker', 'AUTHORITY_OVER_CAP', `Handler authority £${limit} exceeds framework cap £${stage.maxAuthorityGbp}; needs a referral rule instead`, rec));
    const ageDays = Math.floor((asOf - Date.parse(rec.evidence_date)) / DAY);
    if (ageDays > FRAMEWORK.maxEvidenceAgeDays)
      blockers.push(issue('blocker', 'STALE_EVIDENCE', `Evidence dated ${rec.evidence_date} is ${ageDays} days old (max ${FRAMEWORK.maxEvidenceAgeDays})`, rec));
    if (stage.requiresWordingEvidence && rec.evidence_version !== NEEDS_HUMAN && programme.policy_wording_version !== NEEDS_HUMAN && rec.evidence_version !== programme.policy_wording_version)
      blockers.push(issue('blocker', 'WORDING_VERSION_MISMATCH', `Cites wording ${rec.evidence_version}; programme wording is ${programme.policy_wording_version}`, rec));
    if (rec.client_signoff.toLowerCase() !== 'yes')
      blockers.push(issue('blocker', 'NO_CLIENT_SIGNOFF', 'Client has not signed off this rule', rec));

    issues.push(...blockers);
    const clean = { ...rec, stage: stage.id, sla_hours: sla, authority_limit_gbp: limit, blocked: blockers.length > 0 };
    byId.set(rec.rule_id, rec);
    accepted.push(clean);
  }
  return { programme, accepted, rejected, deduped, issues, rowCount: records.length };
}

export function coverage(validation) {
  return FRAMEWORK.stages.map(s => {
    const rules = validation.accepted.filter(r => r.stage === s.id);
    const ready = rules.filter(r => !r.blocked);
    return { stage: s.id, label: s.label, rules: rules.length, readyRules: ready.length,
      status: ready.length ? 'covered' : rules.length ? 'blocked' : 'missing' };
  });
}

export function evaluateGate(validation) {
  const cov = coverage(validation);
  const gaps = [];
  for (const i of validation.issues) if (i.severity === 'error' || i.severity === 'blocker') gaps.push(i);
  for (const c of cov) if (c.status !== 'covered')
    gaps.push({ severity: 'blocker', code: c.status === 'missing' ? 'STAGE_MISSING' : 'STAGE_BLOCKED',
      message: `${c.label} (${c.stage}) has no launch-ready rule`, rule_id: null, line: null });
  return { decision: gaps.length ? 'HOLD' : 'READY', gaps, coverage: cov };
}

export function canonicalPack(validation) {
  const p = validation.programme;
  return {
    framework: FRAMEWORK.version,
    client: p.client, line: p.line, policy_wording_version: p.policy_wording_version, go_live: p.go_live,
    rules: validation.accepted.filter(r => !r.blocked)
      .map(r => Object.fromEntries(REQUIRED_COLUMNS.map(c => [c, r[c]])))
      .sort((a, b) => a.rule_id.localeCompare(b.rule_id)),
  };
}

export function hashPack(pack) {
  const s = JSON.stringify(pack);
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
  return 'pk_' + h.toString(16).padStart(8, '0');
}

export const APPROVERS = ['ops_lead', 'client_programme_owner'];

// store: { get(key) -> string|null, set(key, string) }
export function publishPack({ validation, approvals, store, now }) {
  const gate = evaluateGate(validation);
  if (gate.decision !== 'READY') return { status: 'refused', reason: `Gate is HOLD with ${gate.gaps.length} open gap(s)`, gaps: gate.gaps };
  const pack = canonicalPack(validation);
  const hash = hashPack(pack);
  const missing = APPROVERS.filter(a => approvals?.[a] !== hash);
  if (missing.length) return { status: 'refused', reason: `Missing approval for pack ${hash}: ${missing.join(', ')}` };
  const all = JSON.parse(store.get('lld.publications') || '{}');
  if (all[hash]) return { status: 'noop', publishId: all[hash].publishId, hash, message: 'Already published; nothing written' };
  const publishId = `PUB-${hash.slice(3)}`;
  all[hash] = { publishId, at: now, pack, approvals: { ...approvals } };
  store.set('lld.publications', JSON.stringify(all));
  return { status: 'published', publishId, hash };
}

export function verifyPublication({ hash, store }) {
  const all = JSON.parse(store.get('lld.publications') || '{}');
  const rec = all[hash];
  if (!rec) return { ok: false, reason: 'No publication found for this pack in a fresh read' };
  const recomputed = hashPack(rec.pack);
  return { ok: recomputed === hash, publishId: rec.publishId, recomputed, rules: rec.pack.rules.length,
    reason: recomputed === hash ? 'Fresh read matches published hash' : 'Stored pack does not match its hash' };
}

export function regressionCases(validation) {
  return validation.issues.filter(i => i.severity !== 'info').map((i, n) => ({
    case_id: `RC-${String(n + 1).padStart(3, '0')}`, rule_id: i.rule_id, line: i.line,
    expect: i.severity === 'error' ? 'reject_row' : 'hold_launch', code: i.code, why: i.message,
  }));
}

// ---------- pilot metrics ----------
const median = xs => { if (!xs.length) return null; const s = [...xs].sort((a, b) => a - b); const m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };

export const METRIC_RULES = { minSegmentN: 30, adoptionTarget: 0.8, reopenWindowDays: 30 };

export function pilotMetrics(claims, asOf) {
  const asOfT = Date.parse(asOf);
  const weeks = [...new Set(claims.map(c => c.week))].sort();
  const segments = [...new Set(claims.map(c => c.segment))].sort();
  const closed = claims.filter(c => c.closed);
  const cyc = c => (Date.parse(c.closed) - Date.parse(c.opened)) / DAY;

  const cycle = weeks.map(w => {
    const wc = closed.filter(c => c.week === w);
    return { week: w, n: wc.length, median: median(wc.map(cyc)),
      bySegment: segments.map(s => { const sc = wc.filter(c => c.segment === s); return { segment: s, n: sc.length, median: median(sc.map(cyc)) }; }) };
  });

  const [w0, w1] = [cycle[0], cycle[cycle.length - 1]];
  const aggImproved = w1.median < w0.median;
  const segWorse = w1.bySegment.filter((s, i) => s.median !== null && w0.bySegment[i].median !== null && s.median > w0.bySegment[i].median).map(s => s.segment);
  const smallSegments = cycle.flatMap(w => w.bySegment.filter(s => s.n < METRIC_RULES.minSegmentN).map(s => `${s.segment} in ${w.week} (n=${s.n})`));
  let cycleDecision, cycleWhy;
  if (aggImproved && segWorse.length) { cycleDecision = 'NO DECISION'; cycleWhy = `Aggregate median fell ${w0.median.toFixed(1)}d → ${w1.median.toFixed(1)}d, but ${segWorse.join(' and ')} claims both got slower. The drop is case-mix, not speed.`; }
  else if (smallSegments.length) { cycleDecision = 'HOLD'; cycleWhy = `Segments below n=${METRIC_RULES.minSegmentN}: ${smallSegments.join('; ')}`; }
  else { cycleDecision = aggImproved ? 'IMPROVED' : 'NOT IMPROVED'; cycleWhy = 'Aggregate and segments agree.'; }
  if (cycleDecision === 'NO DECISION' && smallSegments.length) cycleWhy += ` Also under-sampled: ${smallSegments.join('; ')}.`;

  const mature = closed.filter(c => Date.parse(c.closed) + METRIC_RULES.reopenWindowDays * DAY <= asOfT);
  const reopened = mature.filter(c => c.reopened_30d);
  const reopen = { numerator: reopened.length, denominator: mature.length, excludedImmature: closed.length - mature.length,
    rate: mature.length ? reopened.length / mature.length : null,
    decision: mature.length < METRIC_RULES.minSegmentN ? 'HOLD' : 'REPORT' };

  const handlers = [...new Set(claims.map(c => c.handler))].sort();
  const adoption = handlers.map(h => { const hc = claims.filter(c => c.handler === h); const used = hc.filter(c => c.used_playbook).length;
    return { handler: h, used, total: hc.length, rate: used / hc.length, flag: used / hc.length < METRIC_RULES.adoptionTarget }; });
  const usedAll = claims.filter(c => c.used_playbook).length;

  return { cycle, cycleDecision, cycleWhy, reopen,
    adoption: { overall: { used: usedAll, total: claims.length, rate: usedAll / claims.length }, byHandler: adoption, target: METRIC_RULES.adoptionTarget } };
}

export function productAgenda(gate, metrics) {
  const items = [];
  const byCode = {};
  for (const g of gate.gaps) (byCode[g.code] ||= []).push(g);
  if (byCode.UNKNOWN_STAGE) items.push({ title: 'Framework has no stage for recoveries / subrogation', evidence: byCode.UNKNOWN_STAGE.map(g => g.rule_id), owner: 'Ops & Strategy → Product', type: 'HYPOTHESIS' });
  if (byCode.WORDING_VERSION_MISMATCH || byCode.STALE_EVIDENCE) items.push({ title: 'Coverage rules should pin a policy-wording version and expire automatically', evidence: [...(byCode.WORDING_VERSION_MISMATCH || []), ...(byCode.STALE_EVIDENCE || [])].map(g => g.rule_id), owner: 'Product', type: 'HYPOTHESIS' });
  if (byCode.DUPLICATE_CONFLICT) items.push({ title: 'Client spec intake needs ID-level conflict review before import', evidence: byCode.DUPLICATE_CONFLICT.map(g => g.rule_id), owner: 'Ops', type: 'HYPOTHESIS' });
  if (metrics) {
    const low = metrics.adoption.byHandler.filter(h => h.flag);
    if (low.length) items.push({ title: `Playbook step skipped by ${low.map(h => h.handler).join(', ')}: find out why before more training`, evidence: low.map(h => `${h.handler} ${h.used}/${h.total}`), owner: 'Ops lead', type: 'TO TEST' });
    if (metrics.cycleDecision === 'NO DECISION') items.push({ title: 'Report cycle time by segment by default; the blended median hides mix shift', evidence: metrics.cycle.map(w => `${w.week} n=${w.n}`), owner: 'Ops & Strategy', type: 'TO TEST' });
  }
  return items;
}
