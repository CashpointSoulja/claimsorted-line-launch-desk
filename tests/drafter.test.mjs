import { test } from 'node:test';
import assert from 'node:assert/strict';
import { draftFromWording, NEEDS_HUMAN, CATEGORIES } from '../public/drafter.js';
import { WORDINGS } from '../public/wordings.js';
import { validateSpec, evaluateGate } from '../public/engine.js';

const AS_OF = '2026-10-05';
const draft = id => { const w = WORDINGS.find(x => x.id === id); return [draftFromWording(w.text, { client: w.client, line: w.line, asOf: AS_OF }), w]; };

test('travel sample: every category drafted or flagged, each with its source sentence from the wording', () => {
  const [d, w] = draft('travel');
  assert.equal(d.status, 'drafted');
  assert.deepEqual(d.meta, { title: 'Brightwater Single Trip Travel Insurance Policy Wording', version: 'BWT-2026.1', date: '2026-09-01', sentences: 16 });
  for (const c of CATEGORIES) assert.ok(d.items.some(i => i.category === c.id && i.status === 'drafted'), c.id);
  for (const i of d.items.filter(i => i.source)) assert.ok(w.text.includes(i.source), `invented source: ${i.source}`);
  const xs = d.items.find(i => i.category === 'excess' && i.status === 'drafted');
  assert.equal(xs.value, '£100');
  assert.equal(d.items.find(i => i.category === 'waiting').value, '14 days');
  assert.equal(d.items.find(i => i.rule_id === 'DRF-LIM-03').value, '£1,500 / £300');
});

test('category absent from the wording is "not found: needs human", with no row invented', () => {
  const [p] = draft('property');
  assert.deepEqual(p.items.filter(i => i.category === 'waiting').map(i => i.status), ['not_found']);
  assert.ok(!p.rows.some(r => r.rule_id.startsWith('DRF-WAIT')));
  const [w] = draft('warranty');
  assert.deepEqual(w.items.filter(i => i.category === 'excess').map(i => i.status), ['not_found']);
  assert.equal(w.meta.date, '2026-08-01');
});

test('ambiguous clause is flagged for a human and never becomes a rule row', () => {
  const d = draftFromWording('What is covered\nWe will pay for storm damage to your home.\nWe may, at our discretion, pay for temporary accommodation.\nFlood cover may be limited in some areas.', { asOf: AS_OF });
  const amb = d.items.filter(i => i.status === 'ambiguous');
  assert.equal(amb.length, 2);
  assert.match(amb[0].reason, /Ambiguous wording \("we may"\)/i);
  assert.equal(d.rows.length, 1);
  assert.ok(d.rows.every(r => !/discretion|may be limited/.test(r.rule)));
});

test('refuses empty, non-wording and oversized input without throwing', () => {
  for (const t of ['', '   \n\t', null, undefined, 42, {}, [], 'Lorem ipsum dolor sit amet.', 'rule_id,stage\nA,B', '\u0000\u0001'.repeat(100)]) {
    const d = draftFromWording(t);
    assert.equal(d.status, 'refused', String(t));
    assert.deepEqual(d.rows, []);
    assert.equal(d.csv, '');
  }
  assert.match(draftFromWording('We will pay for fire. '.repeat(6000)).reason, /limit is 100000/);
});

test('never crashes on arbitrary text (seeded fuzz)', () => {
  let seed = 7; const rnd = () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648;
  const alphabet = 'abc XYZ £1,0.:;-•()\n\r\t"\'we will pay not covered excess first 30 days you must provide receipt up to ';
  for (let k = 0; k < 300; k++) {
    let s = ''; const n = Math.floor(rnd() * 400);
    for (let i = 0; i < n; i++) s += alphabet[Math.floor(rnd() * alphabet.length)];
    const d = draftFromWording(s, { asOf: AS_OF });
    assert.ok(d.status === 'drafted' || d.status === 'refused');
    if (d.status === 'drafted') assert.doesNotThrow(() => evaluateGate(validateSpec(d.csv, d.programme)));
  }
});

test('drafted rows flow through Import and Validate unrejected, and the Gate holds them', () => {
  for (const w of WORDINGS) {
    const [d] = draft(w.id);
    const v = validateSpec(d.csv, d.programme);
    assert.equal(v.rejected.length, 0, w.id);
    assert.equal(v.accepted.length, d.rows.length);
    assert.ok(v.accepted.every(r => r.blocked && r.owner === NEEDS_HUMAN && r.client_signoff === 'no'));
    const g = evaluateGate(v);
    assert.equal(g.decision, 'HOLD');
    const codes = new Set(g.gaps.map(x => x.code));
    for (const c of ['NEEDS_HUMAN', 'NO_CLIENT_SIGNOFF', 'STAGE_MISSING']) assert.ok(codes.has(c), `${w.id} ${c}`);
    assert.ok(g.coverage.filter(c => c.status === 'missing').some(c => c.stage === 'AUTHORITY'));
  }
});

test('missing version and date become NEEDS_HUMAN, not guesses; output is deterministic', () => {
  const t = 'What is covered\nWe will pay for fire damage.\nYou must provide an invoice.';
  const a = draftFromWording(t, { asOf: AS_OF }), b = draftFromWording(t, { asOf: AS_OF });
  assert.deepEqual(a, b);
  assert.ok(a.rows.every(r => r.evidence_version === NEEDS_HUMAN && r.evidence_date === NEEDS_HUMAN));
  assert.equal(a.programme.policy_wording_version, NEEDS_HUMAN);
  const v = validateSpec(a.csv, a.programme);
  assert.ok(v.issues.some(i => i.code === 'NEEDS_HUMAN' && /owner, evidence_version, evidence_date/.test(i.message)));
  assert.ok(!v.issues.some(i => i.code === 'WORDING_VERSION_MISMATCH' || i.code === 'BAD_DATE'));
});
