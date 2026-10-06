// Deterministic, rule-based drafter: policy wording text -> draft rule rows in the import format.
// No network and no model. Anything it cannot find is marked NEEDS_HUMAN, never guessed.
import { REQUIRED_COLUMNS, NEEDS_HUMAN } from './engine.js';

export { NEEDS_HUMAN };
export const MAX_WORDING_CHARS = 100000;

export const CATEGORIES = [
  { id: 'covered', label: 'Covered event', stage: 'COVERAGE', code: 'COV' },
  { id: 'exclusion', label: 'Exclusion', stage: 'COVERAGE', code: 'EXC' },
  { id: 'excess', label: 'Excess', stage: 'ASSESS', code: 'XS' },
  { id: 'waiting', label: 'Waiting period', stage: 'COVERAGE', code: 'WAIT' },
  { id: 'limit', label: 'Limit', stage: 'ASSESS', code: 'LIM' },
  { id: 'documents', label: 'Documents needed', stage: 'FNOL', code: 'DOC' },
  { id: 'eligibility', label: 'Eligibility check', stage: 'COVERAGE', code: 'ELIG' },
];

const AMOUNT = /£\s?\d(?:[\d,]*\d)?(?:\.\d{2})?/;
const PERIOD = /\b(\d+)\s*(?:consecutive\s+)?(days?|months?|hours?)\b/i;
const HEDGE = /\bwe may\b|\bat our (?:sole |absolute )?discretion\b|\bwhere appropriate\b|\bin some cases\b|\bas we see fit\b|\bunless otherwise agreed\b|\bnormally\b|\busually\b|\breasonabl[ey]\b|\bif we (?:think|consider|decide)\b|\bmay be (?:limited|reduced|refused|restricted)\b/i;

const SENTENCE_RULES = {
  exclusion: /\bwe (?:will|do) not (?:pay|cover)\b|\b(?:is|are) not covered\b|\b(?:is|are) excluded\b|\bexcluding\b/i,
  excess: /\bexcess\b|\bdeductible\b|\byou (?:must|will) pay the first £/i,
  waiting: /\bwaiting period\b|\bin the first \d+ (?:days?|months?)\b|\b(?:starts|begins) \d+ (?:days?|months?) after\b|\bwithin (?:the first )?\d+ (?:days?|months?) of (?:the )?(?:start|cover|policy)/i,
  limit: /\b(?:up to|maximum|most we will pay|limit(?:ed)? (?:of|to)|single item limit|no more than|not exceed|not pay more than)\b/i,
  documents: /\b(?:you must|you will need to|please|we will need|we need|send us|provide|supply)\b[^.]*\b(?:receipts?|invoices?|reports?|reference(?: number)?|certificates?|proof|evidence|photo(?:graph)?s?|documents?|letters?|estimates?|statements?|serial number|booking)\b/i,
  eligibility: /\byou must be\b|\bmust be (?:aged|less than|under|over|bought|purchased|a uk|registered|resident)\b|\baged \d+ or (?:under|over)\b|\b(?:uk )?resident\b|\bregistered with\b|\beligible\b|\bonly available to\b|\b(?:premises|business|property) must\b/i,
  covered: /\bwe will (?:pay|cover|repair|replace|reimburse)\b|\b(?:is|are) covered\b|\byou are covered\b/i,
};

const HEADING_CTX = [
  ['exclusion', /not covered|exclusions?|we will not pay|do not cover|don.t cover/i],
  ['excess', /\bexcess\b/i],
  ['waiting', /waiting/i],
  ['limit', /\blimits?\b/i],
  ['eligibility', /eligib|who can|who is (?:covered|eligible)/i],
  ['documents', /claim|documents?|evidence/i],
  ['covered', /what (?:is|we) cover|covered events?|what we cover|\bcover\b|we will pay/i],
];

const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];

function isoDate(s) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return Number.isNaN(Date.parse(s)) ? null : s;
  const m = /^(\d{1,2}) ([A-Za-z]+) (\d{4})$/.exec(s);
  const mi = m ? MONTHS.indexOf(m[2].toLowerCase()) : -1;
  if (mi < 0 || +m[1] < 1 || +m[1] > 31) return null;
  return `${m[3]}-${String(mi + 1).padStart(2, '0')}-${m[1].padStart(2, '0')}`;
}

function isHeading(line) {
  if (line.length > 80 || /[.!?]$/.test(line) || AMOUNT.test(line)) return false;
  return /:$/.test(line) || /^(?:section|part)\b/i.test(line) ||
    /^\d+(?:\.\d+)?\.?\s+[A-Z][A-Za-z ,&'’\-]*$/.test(line) ||
    (/^[A-Z][A-Za-z ,&'’\-]{2,60}$/.test(line) && line.split(/\s+/).length <= 8);
}

function headingCtx(line) {
  for (const [id, re] of HEADING_CTX) if (re.test(line)) return id;
  return null;
}

export function splitWording(text) {
  const lines = text.replace(/\r\n?/g, '\n').split('\n');
  const out = [];
  let ctx = null, clause = null;
  for (const raw of lines) {
    let line = raw.trim();
    if (!line) continue;
    const bullet = /^(?:[-•*–]|\([a-z0-9]{1,3}\)|[a-z]\))\s+/.exec(line);
    if (bullet) line = line.slice(bullet[0].length).trim();
    else if (isHeading(line)) { ctx = headingCtx(line); continue; }
    const num = /^(\d+(?:\.\d+)+|\d+)[.)]?\s+(?=\S)/.exec(line);
    if (num) { clause = num[1]; line = line.slice(num[0].length); }
    const parts = line.split(/(?<=[.!?])\s+(?=[A-Z£(])/);
    for (const p of parts) if (p.trim()) out.push({ text: p.trim(), clause, ctx });
  }
  return out;
}

function classify(s) {
  const hit = Object.keys(SENTENCE_RULES).filter(id => SENTENCE_RULES[id].test(s.text));
  let ids = new Set(hit);
  if (ids.has('limit') && !AMOUNT.test(s.text)) ids.delete('limit');
  if (ids.has('limit')) { if (/\bmost we will pay\b|\bnot pay more than\b/i.test(s.text)) ids.delete('covered'); if (/not pay more than|no more than/i.test(s.text)) ids.delete('exclusion'); }
  if (ids.has('exclusion')) ids.delete('covered');
  if (!ids.size && s.ctx) {
    const c = s.ctx;
    if (c === 'limit' || c === 'excess') { if (AMOUNT.test(s.text)) ids.add(c); }
    else if (c === 'waiting') { if (PERIOD.test(s.text)) ids.add(c); }
    else ids.add(c);
  }
  return CATEGORIES.filter(c => ids.has(c.id)).map(c => c.id);
}

function valueFor(cat, text) {
  if (cat === 'excess' || cat === 'limit') return (text.match(new RegExp(AMOUNT.source, 'g')) || []).join(' / ') || null;
  if (cat === 'waiting') { const m = PERIOD.exec(text); return m ? `${m[1]} ${m[2]}` : null; }
  return text;
}

function csvCell(v) {
  const s = String(v ?? '');
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function toCsv(rows) {
  return [REQUIRED_COLUMNS.join(','), ...rows.map(r => REQUIRED_COLUMNS.map(c => csvCell(r[c])).join(','))].join('\n');
}

function refused(reason, meta = {}) {
  return { status: 'refused', reason, meta, items: [], rows: [], csv: '', programme: null };
}

export function draftFromWording(input, opts = {}) {
  const text = typeof input === 'string' ? input : input == null ? '' : String(input);
  if (!text.trim()) return refused('Nothing to draft: the wording is empty.');
  if (text.length > MAX_WORDING_CHARS) return refused(`Wording is ${text.length} characters; the limit is ${MAX_WORDING_CHARS}. Split it by section.`);

  const firstLine = text.replace(/\r\n?/g, '\n').split('\n').map(l => l.trim()).find(Boolean) || '';
  const title = firstLine.length <= 100 && !/[.!?]$/.test(firstLine) && /[A-Za-z]{3}/.test(firstLine) && !/,.*,.*,/.test(firstLine) ? firstLine : null;
  const ver = /\b(?:wording|version|ref(?:erence)?)\b[^:\n]{0,20}:\s*([A-Za-z0-9][A-Za-z0-9.\-\/]{2,})/i.exec(text);
  const dm = /\b(?:effective|issued|dated|in force from|valid from)\b[^:\n\d]{0,20}:?\s*(\d{4}-\d{2}-\d{2}|\d{1,2} [A-Za-z]+ \d{4})/i.exec(text);
  const meta = { title, version: ver ? ver[1] : null, date: dm ? isoDate(dm[1]) : null };

  const sentences = splitWording(text);
  meta.sentences = sentences.length;
  const items = [], rows = [], counters = {};
  for (const s of sentences) {
    for (const catId of classify(s)) {
      const cat = CATEGORIES.find(c => c.id === catId);
      const base = { category: cat.id, label: cat.label, stage: cat.stage, source: s.text, clause: s.clause };
      const hedge = HEDGE.exec(s.text);
      if (hedge) { items.push({ ...base, status: 'ambiguous', reason: `Ambiguous wording ("${hedge[0]}"): needs a human to decide the handling rule` }); continue; }
      const value = valueFor(cat.id, s.text);
      if (!value) { items.push({ ...base, status: 'needs_human', reason: `${cat.label} mentioned but no value stated` }); continue; }
      counters[cat.code] = (counters[cat.code] || 0) + 1;
      const rule_id = `DRF-${cat.code}-${String(counters[cat.code]).padStart(2, '0')}`;
      const rule = `${cat.label}: ${s.text.length > 180 ? s.text.slice(0, 179) + '…' : s.text}`;
      rows.push({ rule_id, stage: cat.stage, rule, owner: NEEDS_HUMAN, authority_limit_gbp: '', sla_hours: '',
        evidence_doc: `${title || 'Pasted wording'}${s.clause ? ' s.' + s.clause : ''}`,
        evidence_version: meta.version || NEEDS_HUMAN, evidence_date: meta.date || NEEDS_HUMAN, client_signoff: 'no' });
      items.push({ ...base, status: 'drafted', rule_id, value: cat.id === 'excess' || cat.id === 'limit' || cat.id === 'waiting' ? value : null });
    }
  }
  if (!items.length) return refused('No policy-wording clauses recognised (covered events, exclusions, excess, waiting periods, limits, documents, eligibility). Nothing drafted.', meta);
  for (const cat of CATEGORIES) if (!items.some(i => i.category === cat.id))
    items.push({ category: cat.id, label: cat.label, stage: cat.stage, status: 'not_found', source: null, clause: null, reason: 'Not found in this wording: needs a human' });

  const programme = { client: opts.client || 'Unknown client (pasted wording)', line: opts.line || 'Unknown line',
    policy_wording_version: meta.version || NEEDS_HUMAN, as_of: opts.asOf, go_live: opts.goLive || 'not set' };
  return { status: 'drafted', reason: null, meta, items, rows, csv: toCsv(rows), programme };
}
