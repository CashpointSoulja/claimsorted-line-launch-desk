import test from 'node:test';
import assert from 'node:assert/strict';
import { validateSpec, evaluateGate, publishPack, verifyPublication, canonicalPack, hashPack, pilotMetrics, regressionCases, productAgenda, APPROVERS } from '../public/engine.js';
import { PROGRAMME, SPEC_V1, SPEC_V2, PILOT_CLAIMS } from '../public/samples.js';

const memStore = () => { const m = new Map(); return { get: k => m.get(k) ?? null, set: (k, v) => m.set(k, v) }; };
const codes = v => v.issues.map(i => `${i.rule_id}:${i.code}`);

test('v1 spec holds launch with every expected gap', () => {
  const v = validateSpec(SPEC_V1, PROGRAMME);
  const c = codes(v);
  for (const want of ['PET-COV-01:WORDING_VERSION_MISMATCH', 'PET-COV-01:STALE_EVIDENCE', 'PET-AUTH-01:AUTHORITY_OVER_CAP',
    'PET-FRD-01:DUPLICATE_CONFLICT', 'PET-PAY-01:SLA_OVER_FRAMEWORK', 'PET-PAY-02:NO_CLIENT_SIGNOFF',
    'PET-REC-01:UNKNOWN_STAGE', 'PET-REP-01:MISSING_FIELDS', 'PET-ASS-01:DUPLICATE_IDENTICAL']) assert.ok(c.includes(want), want);
  const gate = evaluateGate(v);
  assert.equal(gate.decision, 'HOLD');
  assert.equal(gate.coverage.find(s => s.stage === 'COMPLAINT').status, 'missing');
  assert.equal(gate.coverage.find(s => s.stage === 'REPORTING').status, 'missing');
});

test('identical duplicate is kept once; same name with different IDs is not merged', () => {
  const v = validateSpec(SPEC_V1, PROGRAMME);
  assert.equal(v.deduped.length, 1);
  assert.equal(v.accepted.filter(r => r.rule === 'Pay vet direct or policyholder').length, 2);
});

test('missing columns rejects the whole file', () => {
  const v = validateSpec('rule_id,stage\nX,FNOL', PROGRAMME);
  assert.equal(v.issues[0].code, 'MISSING_COLUMNS');
  assert.equal(evaluateGate(v).decision, 'HOLD');
});

test('v2 spec is READY', () => {
  const g = evaluateGate(validateSpec(SPEC_V2, PROGRAMME));
  assert.equal(g.decision, 'READY', JSON.stringify(g.gaps));
});

test('publish refuses on HOLD and without approvals; is idempotent; verifies on fresh read', () => {
  const store = memStore();
  const v1 = validateSpec(SPEC_V1, PROGRAMME);
  assert.equal(publishPack({ validation: v1, approvals: {}, store, now: 't' }).status, 'refused');
  const v2 = validateSpec(SPEC_V2, PROGRAMME);
  const hash = hashPack(canonicalPack(v2));
  assert.match(publishPack({ validation: v2, approvals: { ops_lead: hash }, store, now: 't' }).reason, /client_programme_owner/);
  const approvals = Object.fromEntries(APPROVERS.map(a => [a, hash]));
  const first = publishPack({ validation: v2, approvals, store, now: 't1' });
  assert.equal(first.status, 'published');
  const second = publishPack({ validation: v2, approvals, store, now: 't2' });
  assert.equal(second.status, 'noop');
  assert.equal(second.publishId, first.publishId);
  assert.equal(Object.keys(JSON.parse(store.get('lld.publications'))).length, 1);
  const ver = verifyPublication({ hash, store });
  assert.equal(ver.ok, true);
  assert.equal(ver.rules, 11);
});

test('approval for an older pack hash does not carry over', () => {
  const v2 = validateSpec(SPEC_V2, PROGRAMME);
  const stale = Object.fromEntries(APPROVERS.map(a => [a, 'pk_00000000']));
  assert.equal(publishPack({ validation: v2, approvals: stale, store: memStore(), now: 't' }).status, 'refused');
});

test('tampered stored pack fails verification', () => {
  const store = memStore();
  const v2 = validateSpec(SPEC_V2, PROGRAMME);
  const hash = hashPack(canonicalPack(v2));
  publishPack({ validation: v2, approvals: Object.fromEntries(APPROVERS.map(a => [a, hash])), store, now: 't' });
  const all = JSON.parse(store.get('lld.publications')); all[hash].pack.rules.pop(); store.set('lld.publications', JSON.stringify(all));
  assert.equal(verifyPublication({ hash, store }).ok, false);
});

test('pilot metrics refuse the misleading aggregate', () => {
  const m = pilotMetrics(PILOT_CLAIMS, PROGRAMME.as_of);
  assert.ok(m.cycle[1].median < m.cycle[0].median, 'aggregate improves');
  m.cycle[1].bySegment.forEach((s, i) => assert.ok(s.median > m.cycle[0].bySegment[i].median, `${s.segment} slower`));
  assert.equal(m.cycleDecision, 'NO DECISION');
  assert.ok(m.reopen.excludedImmature > 0);
  assert.equal(m.reopen.denominator + m.reopen.excludedImmature, PILOT_CLAIMS.length);
  assert.ok(m.adoption.byHandler.find(h => h.handler === 'Handler 3').flag);
});

test('regression cases and agenda derive from real gaps', () => {
  const v = validateSpec(SPEC_V1, PROGRAMME);
  const rc = regressionCases(v);
  assert.ok(rc.every(r => ['reject_row', 'hold_launch'].includes(r.expect)));
  const agenda = productAgenda(evaluateGate(v), pilotMetrics(PILOT_CLAIMS, PROGRAMME.as_of));
  assert.ok(agenda.some(a => /recoveries/.test(a.title)));
  assert.ok(agenda.every(a => ['HYPOTHESIS', 'TO TEST'].includes(a.type)));
});
