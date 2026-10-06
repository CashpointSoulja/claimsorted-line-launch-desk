import { test } from 'node:test';
import assert from 'node:assert/strict';
import { LINES, lineSpec, lineProgramme, lineReadiness, portfolio } from '../public/lines.js';
import { validateSpec, evaluateGate } from '../public/engine.js';

test('six illustrative lines matching the lines listed on claimsorted.com', () => {
  assert.deepEqual(LINES.map(l => l.label), ['Property', 'Auto', 'Small commercial', 'General liability', 'Accident & health (incl. travel)', 'Warranty']);
  for (const l of LINES) assert.match(lineProgramme(l).line, /\(illustrative\)$/);
  for (const l of LINES) assert.match(l.client, /fictional/);
});

test('readiness comes from the same validate + gate engine', () => {
  for (const l of LINES) {
    const r = lineReadiness(l);
    assert.deepEqual(r.gate, evaluateGate(validateSpec(lineSpec(l), lineProgramme(l))));
    assert.equal(r.validation.rejected.length, 0, l.id);
  }
});

test('per-line decisions and the gaps that drive them', () => {
  const codes = r => [...new Set(r.gate.gaps.map(g => g.code))].sort();
  const p = Object.fromEntries(portfolio().map(r => [r.id, r]));
  assert.equal(p.warranty.gate.decision, 'READY');
  assert.equal(p.warranty.covered, 8);
  assert.deepEqual(codes(p.property), ['NO_CLIENT_SIGNOFF', 'STAGE_BLOCKED', 'STAGE_MISSING']);
  assert.deepEqual(codes(p.auto), ['AUTHORITY_OVER_CAP', 'STAGE_BLOCKED', 'STALE_EVIDENCE']);
  assert.deepEqual(codes(p.small_commercial), ['NEEDS_HUMAN', 'STAGE_BLOCKED', 'STAGE_MISSING']);
  assert.deepEqual(codes(p.general_liability), ['SLA_OVER_FRAMEWORK', 'STAGE_BLOCKED', 'STAGE_MISSING', 'WORDING_VERSION_MISMATCH']);
  assert.deepEqual(codes(p.accident_health), ['NO_CLIENT_SIGNOFF', 'STAGE_BLOCKED']);
  for (const id of ['property', 'auto', 'small_commercial', 'general_liability', 'accident_health']) assert.equal(p[id].gate.decision, 'HOLD', id);
  assert.equal(p.general_liability.covered, 4);
});
