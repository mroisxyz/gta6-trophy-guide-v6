import { readFileSync, writeFileSync } from 'node:fs';
const file = 'app/data/trophies.json';
const d = JSON.parse(readFileSync(file, 'utf8'));
const extra = {
  15: { question: 'Are all stunts counted the same?', positionA: 'The description tracks 250 completed stunts.', positionB: 'Checklists sometimes separate unique stunt types.', cites: [6, 18, 3] },
  21: { question: 'Must an arcade game be won?', positionA: 'The description asks only to complete one.', positionB: 'Some guides say finish with a win.', cites: [6, 14, 3] },
  26: { question: 'Is Randy one of the eight full strands?', positionA: 'gta.guide names Randy among the stranger chains.', positionB: 'One tracker groups his jobs as a side mission.', cites: [3, 30, 57] }
};
for (const t of d.trophies) {
  if (t.id >= 37) delete t.checks;
  if (t.id >= 11) {
    const last = t.steps[t.steps.length - 1];
    last.cite = [last.cite[0]];
  }
  if (extra[t.id]) t.disputes = [extra[t.id]];
}
d.stats = { claims: 366, backedByTwo: 321 };
const base = { ...d };
delete base.trophies;
const entries = Object.entries(base).map(([k, v]) => {
  const value = (k === 'sources' || k === 'roadmap')
    ? '[\n' + v.map((x) => JSON.stringify(x)).join(',\n') + '\n]'
    : JSON.stringify(v);
  return JSON.stringify(k) + ':' + value;
});
const out = '{\n' + entries.join(',\n') + ',\n"trophies":[\n'
  + d.trophies.map((t) => JSON.stringify(t)).join(',\n') + '\n]\n}\n';
writeFileSync(file, out);
console.log('patched', d.trophies.length, d.stats);
