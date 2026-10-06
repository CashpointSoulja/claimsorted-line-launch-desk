import { FRAMEWORK, APPROVERS, validateSpec, evaluateGate, canonicalPack, hashPack, publishPack, verifyPublication, regressionCases, pilotMetrics, productAgenda } from './engine.js';
import { PROGRAMME, SPEC_V1, SPEC_V2, PILOT_CLAIMS } from './samples.js';

const $ = s => document.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const store = { get: k => localStorage.getItem(k), set: (k, v) => localStorage.setItem(k, v) };
const APPROVER_LABEL = { ops_lead: 'ClaimSorted ops lead', client_programme_owner: 'Client programme owner' };

const state = { source: null, validation: null, gate: null, approvals: {}, publish: null, verify: null, events: [] };
const metrics = pilotMetrics(PILOT_CLAIMS, PROGRAMME.as_of);

function emit(name, payload) {
  state.events.unshift({ at: new Date().toISOString(), name, payload });
  renderEvents();
}

function loadSpec(csv, source) {
  $('#csv').value = csv;
  state.source = source;
  invalidate();
  emit('spec_loaded', { source, bytes: csv.length });
}

function invalidate() {
  state.validation = null; state.gate = null; state.publish = null; state.verify = null;
  $('#csv-meta').textContent = state.source ? `Source: ${state.source}. Not validated yet.` : '';
  render();
}

function runValidate() {
  const v = validateSpec($('#csv').value, PROGRAMME);
  state.validation = v; state.gate = evaluateGate(v); state.publish = null; state.verify = null;
  const by = sev => v.issues.filter(i => i.severity === sev).length;
  emit('spec_validated', { source: state.source || 'pasted', rows: v.rowCount, accepted: v.accepted.length, rejected: v.rejected.length, deduped: v.deduped.length, errors: by('error'), blockers: by('blocker') });
  emit('gate_evaluated', { decision: state.gate.decision, open_gaps: state.gate.gaps.length, stages_covered: state.gate.coverage.filter(c => c.status === 'covered').length, stages_total: FRAMEWORK.stages.length });
  $('#csv-meta').textContent = `Validated ${v.rowCount} rows from ${state.source || 'pasted CSV'}.`;
  render();
  document.getElementById('validation').scrollIntoView({ block: 'start' });
}

function currentHash() { return state.validation ? hashPack(canonicalPack(state.validation)) : null; }

function renderProgramme() {
  $('#programme').innerHTML = [['Client', PROGRAMME.client], ['Line', PROGRAMME.line], ['Policy wording', PROGRAMME.policy_wording_version], ['Evidence as of', PROGRAMME.as_of], ['Target go-live', PROGRAMME.go_live]]
    .map(([k, v]) => `<div class="kv"><b>${k}</b><span>${esc(v)}</span></div>`).join('');
  $('#fw-version').textContent = `Framework ${FRAMEWORK.version}: ${FRAMEWORK.stages.length} stages every line must cover. Evidence older than ${FRAMEWORK.maxEvidenceAgeDays} days is refused.`;
}

function renderStepper() {
  const v = state.validation, g = state.gate;
  const pub = state.publish && (state.publish.status === 'published' || state.publish.status === 'noop');
  const steps = [
    ['import', 'Import', !!v], ['validation', 'Validate', !!v], ['coverage', 'Coverage', g && g.coverage.every(c => c.status === 'covered'), g && !g.coverage.every(c => c.status === 'covered')],
    ['gate', 'Gate', g?.decision === 'READY', g?.decision === 'HOLD'], ['publish', 'Publish', pub && state.verify?.ok], ['metrics', 'Metrics', false, true], ['agenda', 'Agenda', false],
  ];
  $('#stepper').innerHTML = steps.map(([id, l, done, hold], i) => `<li class="${done ? 'done' : hold ? 'hold' : ''}"><a href="#${id}"><span class="dot">${i + 1}</span>${l}</a></li>`).join('');
}

function renderValidation() {
  const v = state.validation, el = $('#validation-body');
  if (!v) { el.className = 'empty'; el.innerHTML = 'Validate a spec to see accepted, rejected and de-duplicated rows.'; return; }
  el.className = '';
  const blocked = v.accepted.filter(r => r.blocked).length;
  const tiles = [[v.rowCount, 'rows in file'], [v.accepted.length - blocked, 'launch-ready'], [blocked, 'accepted, blocked'], [v.rejected.length, 'rejected'], [v.deduped.length, 'identical duplicates dropped']];
  const order = { error: 0, blocker: 1, info: 2 };
  const rows = [...v.issues].sort((a, b) => order[a.severity] - order[b.severity] || (a.line ?? 0) - (b.line ?? 0));
  el.innerHTML = `<div class="tiles">${tiles.map(([n, l]) => `<div class="tile"><div class="n">${n}</div><div class="l">${l}</div></div>`).join('')}</div>` +
    (rows.length ? `<div class="table-wrap"><table><thead><tr><th>Severity</th><th>Line</th><th>Rule ID</th><th>Check</th><th>Detail</th></tr></thead><tbody>${rows.map(i =>
      `<tr><td><span class="chip ${i.severity}">${i.severity === 'error' ? 'rejected' : i.severity === 'blocker' ? 'blocks launch' : 'info'}</span></td><td>${i.line ?? '—'}</td><td>${esc(i.rule_id ?? '—')}</td><td><code>${i.code}</code></td><td>${esc(i.message)}</td></tr>`).join('')}</tbody></table></div>`
      : `<div class="empty">No row issues.</div>`);
}

function renderCoverage() {
  const g = state.gate;
  const cov = g ? g.coverage : FRAMEWORK.stages.map(s => ({ stage: s.id, label: s.label, rules: 0, readyRules: 0, status: 'pending' }));
  const ico = { covered: '✓', blocked: '!', missing: '–', pending: '·' };
  const txt = c => c.status === 'pending' ? 'Not checked' : c.status === 'covered' ? `${c.readyRules} ready of ${c.rules} rule${c.rules === 1 ? '' : 's'}` : c.status === 'blocked' ? `${c.rules} rule${c.rules === 1 ? '' : 's'}, none launch-ready` : 'No rule in spec';
  $('#coverage-body').innerHTML = cov.map(c => `<div class="stage ${c.status === 'pending' ? 'missing' : c.status}"><span class="ico">${ico[c.status]}</span><span class="t">${esc(c.label)}</span><span class="s"><code>${c.stage}</code> ${txt(c)}</span></div>`).join('');
}

function renderGate() {
  const g = state.gate, el = $('#gate-body');
  if (!g) { el.className = 'empty'; el.textContent = 'No spec validated yet.'; return; }
  el.className = '';
  const head = `<div class="decision ${g.decision}"><span class="big">${g.decision}</span><div>${g.decision === 'READY'
    ? `All ${FRAMEWORK.stages.length} stages have a signed-off, in-date rule. The pack can go to approval.`
    : `Go-live on ${esc(PROGRAMME.go_live)} stays on hold until these ${g.gaps.length} gaps are closed. Nothing partial gets published.`}</div></div>`;
  el.innerHTML = head + (g.gaps.length ? `<ul class="gaps">${g.gaps.map(x => `<li><span class="chip ${x.severity}">${x.severity === 'error' ? 'rejected' : 'blocker'}</span><span><b>${esc(x.rule_id || x.code)}</b> ${esc(x.message)}</span></li>`).join('')}</ul>` : '');
}

function renderPublish() {
  const el = $('#publish-body');
  const ready = state.gate?.decision === 'READY';
  const hash = currentHash();
  const approvalsHtml = APPROVERS.map(a => {
    const ok = hash && state.approvals[a] === hash;
    return `<button class="btn ${ok ? 'done' : 'btn-ghost'}" data-approve="${a}" ${state.gate ? '' : 'disabled'}>${ok ? '✓ Approved' : 'Approve'} as ${APPROVER_LABEL[a]}</button>`;
  }).join('');
  const r = state.publish, vr = state.verify;
  const resHtml = r ? `<div class="result ${r.status === 'published' ? 'ok' : r.status}">${r.status === 'published' ? `Published <b>${r.publishId}</b> (pack ${r.hash}).` : r.status === 'noop' ? `No-op: pack ${r.hash} is already published as <b>${r.publishId}</b>. Nothing written.` : `Refused: ${esc(r.reason)}`}</div>` : '';
  const verHtml = vr ? `<div class="result ${vr.ok ? 'ok' : 'refused'}">${vr.ok ? `Verified on a fresh read: ${vr.publishId}, ${vr.rules} rules, hash ${vr.recomputed} matches.` : esc(vr.reason)}</div>` : '';
  el.innerHTML = `<div class="pub-grid">
    <div class="panel"><h3>Sign-off</h3><p class="muted">Approvals are tied to pack hash <code>${hash ?? '—'}</code>. If the spec changes, earlier approvals stop counting.</p>
      <div class="row-actions">${approvalsHtml}</div></div>
    <div class="panel"><h3>Publish &amp; verify</h3><p class="muted">${ready ? 'Gate is READY.' : 'Publishing is refused while the gate is HOLD.'} Publishing the same pack twice writes nothing the second time.</p>
      <div class="row-actions"><button class="btn btn-primary" id="do-publish" ${state.gate ? '' : 'disabled'}>Publish handling pack</button><button class="btn btn-ghost" id="do-verify" ${r?.hash ? '' : 'disabled'}>Verify fresh read</button></div>${resHtml}${verHtml}</div>
  </div>`;
  el.querySelectorAll('[data-approve]').forEach(b => b.onclick = () => {
    const a = b.dataset.approve; state.approvals[a] = hash;
    emit('approval_recorded', { approver: a, pack_hash: hash, gate: state.gate.decision });
    renderPublish(); renderStepper();
  });
  $('#do-publish').onclick = () => {
    state.publish = publishPack({ validation: state.validation, approvals: state.approvals, store, now: new Date().toISOString() });
    state.verify = null;
    const p = state.publish;
    emit(p.status === 'published' ? 'pack_published' : p.status === 'noop' ? 'publish_noop' : 'publish_refused', { pack_hash: p.hash ?? hash, publish_id: p.publishId ?? null, reason: p.reason ?? null, open_gaps: p.gaps?.length ?? 0 });
    renderPublish(); renderStepper();
  };
  $('#do-verify').onclick = () => {
    state.verify = verifyPublication({ hash: state.publish.hash, store });
    emit('publish_verified', { pack_hash: state.publish.hash, ok: state.verify.ok, rules: state.verify.rules ?? 0 });
    renderPublish(); renderStepper();
  };
}

function renderMetrics() {
  const m = metrics;
  const segs = m.cycle[0].bySegment.map(s => s.segment);
  const fmt = x => x == null ? '—' : `${x.toFixed(1)}d`;
  const table = `<div class="table-wrap"><table><thead><tr><th>Median cycle time</th>${m.cycle.map(w => `<th>${w.week}</th>`).join('')}<th>Change</th></tr></thead><tbody>
    <tr><td><b>All claims (blended)</b></td>${m.cycle.map(w => `<td>${fmt(w.median)} <span class="muted">n=${w.n}</span></td>`).join('')}<td><span class="chip ok">faster</span></td></tr>
    ${segs.map((s, i) => { const a = m.cycle[0].bySegment[i], b = m.cycle[1].bySegment[i]; return `<tr><td>${s}</td><td>${fmt(a.median)} <span class="muted">n=${a.n}</span></td><td>${fmt(b.median)} <span class="muted">n=${b.n}</span></td><td><span class="chip ${b.median > a.median ? 'blocker' : 'ok'}">${b.median > a.median ? 'slower' : 'faster'}</span></td></tr>`; }).join('')}
  </tbody></table></div>`;
  const decision = `<div class="decision HOLD" style="margin-top:12px"><span class="big">${m.cycleDecision}</span><div>${esc(m.cycleWhy)}</div></div>`;
  const r = m.reopen;
  const reopen = `<div class="panel" style="margin-top:12px"><h3>30-day reopen rate</h3><p><b>${r.numerator} / ${r.denominator}</b> mature closed claims${r.rate != null ? ` = ${(r.rate * 100).toFixed(1)}%` : ''}. ${r.excludedImmature} claims closed less than 30 days before ${PROGRAMME.as_of} are left out of the denominator rather than counted as "not reopened".</p></div>`;
  const tgt = m.adoption.target;
  const bars = `<div class="panel"><h3>Playbook adoption by handler</h3><p class="muted">Claims where the new line's playbook step was used. Overall ${m.adoption.overall.used}/${m.adoption.overall.total} (${(m.adoption.overall.rate * 100).toFixed(0)}%). Target ${(tgt * 100).toFixed(0)}%.</p>
    <div class="bars"><div class="target" style="bottom:${tgt * 100 * 1.4}px"><span>target ${(tgt * 100).toFixed(0)}%</span></div>${m.adoption.byHandler.map(h => `<div class="bar ${h.flag ? 'flag' : ''}"><b>${(h.rate * 100).toFixed(0)}%</b><i style="height:${h.rate * 140}px"></i><span>${esc(h.handler.replace('Handler ', 'H'))}<br>${h.used}/${h.total}</span></div>`).join('')}</div></div>`;
  $('#metrics-body').innerHTML = `<div class="metric-grid"><div>${table}${decision}</div>${bars}</div>${reopen}`;
}

function renderAgenda() {
  const items = productAgenda(state.gate || { gaps: [] }, metrics);
  $('#agenda-body').innerHTML = `<ul class="agenda">${items.map(a => `<li><div class="t"><span class="chip tag">${a.type}</span>${esc(a.title)}</div><div class="e">Owner: ${esc(a.owner)} · Evidence: ${a.evidence.map(esc).join(', ')}</div></li>`).join('')}</ul>`;
}

function renderEvents() {
  $('#event-log').innerHTML = state.events.length ? state.events.map(e => `<li><b>${e.name}</b> ${esc(e.at.slice(11, 19))} ${esc(JSON.stringify(e.payload))}</li>`).join('') : '<li>No events yet.</li>';
}

function render() { renderStepper(); renderValidation(); renderCoverage(); renderGate(); renderPublish(); renderMetrics(); renderAgenda(); renderEvents(); }

function download(name, obj) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([JSON.stringify(obj, null, 2)], { type: 'application/json' }));
  a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

$('#load-v1').onclick = () => loadSpec(SPEC_V1, 'Harbour Pet spec v1');
$('#load-v2').onclick = () => loadSpec(SPEC_V2, 'Harbour Pet revised spec v2');
$('#file').onchange = async e => { const f = e.target.files[0]; if (f) loadSpec(await f.text(), f.name); };
$('#csv').oninput = () => { state.source = 'edited CSV'; invalidate(); };
$('#validate').onclick = runValidate;
$('#dl-pack').onclick = () => { if (!state.validation) return; download('handling-pack.json', { gate: state.gate.decision, pack_hash: currentHash(), ...canonicalPack(state.validation) }); emit('export_downloaded', { kind: 'handling_pack', pack_hash: currentHash() }); };
$('#dl-cases').onclick = () => { if (!state.validation) return; const rc = regressionCases(state.validation); download('regression-cases.json', rc); emit('export_downloaded', { kind: 'regression_cases', count: rc.length }); };
$('#reset').onclick = () => { localStorage.removeItem('lld.publications'); state.approvals = {}; state.events = []; loadSpec('', null); $('#csv').value = ''; emit('local_state_reset', {}); };

renderProgramme();
metrics && emit('metric_decision', { metric: 'median_cycle_time', decision: metrics.cycleDecision, n_week_1: metrics.cycle[0].n, n_week_2: metrics.cycle[1].n });
render();
