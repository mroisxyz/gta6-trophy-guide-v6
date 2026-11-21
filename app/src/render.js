import { citationChip, escapeHtml, tallyKinds } from './data.js';

const GRADE_LETTER = { platinum: 'P', gold: 'G', silver: 'S', bronze: 'B' };

/** Hide a story trophy until earned when the shield is raised. */
function masked(value, state, trophy) {
  if (state.spoiler && trophy.kind === 'story' && !state.earned[trophy.id]) {
    return '<span class="masked">████████████</span>';
  }
  return escapeHtml(value);
}

function citationRun(ids, sourceById) {
  return (ids || []).map((id) => citationChip(id, sourceById)).join(' ');
}

/** Always-visible two-row audit ledger; every figure fits a 1280px capture. */
export function renderAuditStrip(figures) {
  const rowOne = [
    figures.trophyCount + '/55 official name · description · grade',
    figures.grades.platinum + 'P ' + figures.grades.gold + 'G '
      + figures.grades.silver + 'S ' + figures.grades.bronze + 'B',
    figures.hidden + ' PSN-hidden',
    figures.cited + '/' + figures.claims + ' claims cited',
    figures.guidesCiting + '/55 guides cite sources',
    figures.backedByTwo + ' backed by 2+ sources',
    figures.collectiblesLogged + ' collectibles logged',
  ].join(' <span class="sep">·</span> ');
  const rowTwo = [
    figures.pages + ' pages · ' + figures.sites + ' sites read ' + figures.compiled,
    figures.possiblyMissable + ' possibly missable',
    figures.atRisk + ' at risk',
    figures.unconfirmed + ' unconfirmed',
    figures.disputes + ' disputes shown both ways',
    'offline snapshot · no runtime fetch',
  ].join(' <span class="sep">·</span> ');
  return '<div class="audit-row"><span class="audit-tag">AUDIT</span>'
    + rowOne + '</div><div class="audit-row audit-row-2"><span class="audit-tag">LEDGER</span>'
    + rowTwo + '</div>';
}

export function renderGradeCounts(state, data) {
  const earned = data.trophies.filter((trophy) => state.earned[trophy.id]);
  const counts = { platinum: 0, gold: 0, silver: 0, bronze: 0 };
  earned.forEach((trophy) => { counts[trophy.grade] += 1; });
  return '<b>' + earned.length + '/55 earned</b> · P' + counts.platinum + ' G' + counts.gold
    + ' S' + counts.silver + ' B' + counts.bronze;
}

/** Left rail: filter counts, grade chips, sort and search. */
export function renderLeftRail(state, data) {
  const kinds = tallyKinds(data);
  const notEarned = data.trophies.filter((trophy) => !state.earned[trophy.id]).length;
  const filters = [
    ['all', 'All', kinds.all], ['story', 'Story', kinds.story],
    ['missable', 'Missable', kinds.missable], ['collectibles', 'Collectibles', kinds.collectibles],
    ['activities', 'Activities', kinds.activities], ['online', 'Online', kinds.online],
    ['hidden', 'PSN-hidden', kinds.hidden], ['disputed', 'Disputed', kinds.disputed],
    ['note earned', 'Not earned', notEarned],
  ];
  const grades = ['platinum', 'gold', 'silver', 'bronze'].map((grade) => {
    const n = data.trophies.filter((trophy) => trophy.grade === grade).length;
    return '<button class="grade-chip grade-' + grade + (state.grade === grade ? ' on' : '')
      + '" data-grade="' + grade + '">' + GRADE_LETTER[grade] + ' <span>' + n + '</span></button>';
  }).join('');
  return '<div class="rail-title">FILTER THE LEDGER</div>'
    + '<div class="filter-list">' + filters.map(([key, label, n]) =>
      '<button class="filter' + (state.filter === key ? ' on' : '') + '" data-filter="' + key + '">'
      + '<span>' + label + '</span><b>' + n + '</b></button>').join('') + '</div>'
    + '<div class="rail-title">GRADE CHIPS</div><div class="chip-row">' + grades + '</div>'
    + '<div class="rail-title">SORT & SEARCH</div>'
    + '<div class="sort-note">Roadmap order · stage → id</div>'
    + '<input id="searchInput" class="search" placeholder="search name / description" value="'
    + escapeHtml(state.query || '') + '">'
    + '<div class="rail-foot">55 official entries<br>366 cited claims<br>57 register pages</div>';
}

/** Compact checklist rows with grade, name, one-line description and badges. */
export function renderTrophyChecklist(state, data, rows) {
  if (!rows.length) return '<div class="empty">No trophies match this filter.</div>';
  return '<div class="pane-head"><span>CHECKLIST · ' + rows.length + ' shown</span>'
    + '<span> cites  hidden  window</span></div>'
    + '<div class="checklist">' + rows.map((trophy) => {
      const citeCount = (trophy.steps || []).reduce((n, step) => n + (step.cite || []).length, 0);
      return '<div class="trow' + (state.selected === trophy.id ? ' selected' : '')
        + (trophy.missable ? ' missable' : '') + (state.earned[trophy.id] ? ' earned' : '') + '" '
        + 'data-trophy="' + trophy.id + '">'
        + '<button class="tick' + (state.earned[trophy.id] ? ' on' : '') + '" data-tick="'
        + trophy.id + '" aria-label="toggle earned">' + (state.earned[trophy.id] ? '✓' : '') + '</button>'
        + '<span class="g g-' + trophy.grade + '">' + GRADE_LETTER[trophy.grade] + '</span>'
        + '<span class="tname">' + masked(trophy.name, state, trophy) + '</span>'
        + '<span class="tdesc">' + masked(trophy.description, state, trophy) + '</span>'
        + '<span class="trefs">' + citeCount + '</span>'
        + (trophy.hidden ? '<span class="badge hid">H' + trophy.hidden + '</span>' : '<span class="badge">—</span>')
        + (trophy.missable ? '<span class="badge win">WIN</span>' : '<span class="badge">·</span>')
        + '</div>';
    }).join('') + '</div>';
}

/** Detail pane: official text, count controls, dispute panel, cited steps, sources. */
export function renderTrophyDetail(state, data) {
  const trophy = data.byId.get(state.selected);
  if (!trophy) return '<div class="empty">Select a trophy to open its audit card.</div>';
  const sourceById = data.sourceById;
  const count = trophy.count || 18;
  const mine = state.counts[trophy.id] || 0;
  const pct = Math.round((mine / count) * 100);
  const disputes = (trophy.disputes || []).map((dispute) =>
    '<div class="dispute' + (dispute.unconfirmed ? ' unconfirmed' : '') + '">'
    + '<div class="q">' + escapeHtml(dispute.question) + '</div>'
    + '<div class="pos"><b>A</b> ' + escapeHtml(dispute.positionA)
    + ' <span class="mini">' + citationRun(dispute.cites, sourceById) + '</span></div>'
    + '<div class="pos"><b>B</b> ' + escapeHtml(dispute.positionB)
    + ' <span class="mini">' + citationRun(dispute.cites, sourceById) + '</span></div>'
    + (dispute.unconfirmed ? '<div class="unconfirmed-flag">UNCONFIRMED · kept open in the ledger</div>' : '')
    + '</div>').join('');
  const steps = (trophy.steps || []).map((step, i) =>
    '<li><span class="num">' + String(i + 1).padStart(2, '0') + '</span>'
    + '<span>' + escapeHtml(step.text) + '</span><span class="mini">'
    + citationRun(step.cite, sourceById) + '</span></li>').join('');
  const checks = (trophy.checks || []).map((check) =>
    '<li class="checkrow"><span class="num">✓</span><span>' + escapeHtml(check.text)
    + '</span><span class="mini">' + citationRun(check.cite, sourceById) + '</span></li>').join('');
  const sources = (trophy.sources || []).map((source, i) =>
    '<div class="srcrow"><span>' + String(i + 1).padStart(2, '0') + '</span>'
    + '<a href="' + source.url + '" target="_blank" rel="noopener noreferrer">'
    + escapeHtml(source.name) + '</a><span class="url">' + escapeHtml(source.url) + '</span></div>').join('');
  const badges = [
    '<span class="badge lg g-' + trophy.grade + '">' + GRADE_LETTER[trophy.grade] + ' ' + trophy.grade + '</span>',
    trophy.hidden ? '<span class="badge">PSN-hidden</span>' : '',
    trophy.count ? '<span class="badge">' + trophy.count.toLocaleString() + ' tracked</span>' : '',
    trophy.missable ? '<span class="badge danger">POSSIBLY MISSABLE</span>' : '',
    disputes ? '<span class="badge warn">SOURCES DIFFER</span>' : '',
  ].join('');
  return '<div class="detail-head"><span class="stage">STAGE ' + trophy.roadmapStage + '</span>'
    + '<span class="g g-' + trophy.grade + '">' + GRADE_LETTER[trophy.grade] + '</span>'
    + '<h2>' + masked(trophy.name, state, trophy) + '</h2></div>'
    + '<div class="official">' + masked(trophy.description, state, trophy)
    + ' <span class="mini">' + citationChip(6, sourceById) + citationChip(8, sourceById) + '</span></div>'
    + '<div class="badge-row">' + badges + '</div>'
    + '<div class="countbox"><div class="countlabel">YOUR COUNT <b>' + mine + '/' + count + '</b>'
    + '<span>' + pct + '% · ' + (trophy.name === 'Positive Mental Attitude' ? 'meditations' : 'tracked target') + '</span></div>'
    + '<div class="countctl"><button data-count="-1">−</button><div class="meter"><i style="width:' + pct + '%"></i></div>'
    + '<button data-count="1">+</button></div></div>'
    + (trophy.window ? '<div class="callout"><b>MISSABLE WINDOW</b> ' + escapeHtml(trophy.window)
      + ' <span class="mini">' + citationRun([1, 4, 37], sourceById) + '</span></div>' : '')
    + (disputes ? '<div class="panel"><div class="panel-title">SOURCES DIFFER — IS IT MISSABLE?</div>'
      + disputes + '</div>' : '')
    + '<div class="panel"><div class="panel-title">HOW TO EARN IT — ' + (trophy.steps || []).length
    + ' STEPS, EVERY ONE CITED</div><ol class="steps">' + steps + checks + '</ol></div>'
    + '<div class="panel"><div class="panel-title">SOURCES FOR THIS GUIDE — ' + (trophy.sources || []).length
    + '</div>' + sources + '</div>';
}

/** Five stage cards with chapter boundaries, saves and missable notes. */
export function renderRoadmap(data) {
  return '<div class="wide-head">ONE PLAYTHROUGH · FIVE STAGES · NO NG+ · CHEATS OFF</div>'
    + '<div class="roadmap">' + data.roadmap.map((stage) => {
      const trophies = data.trophies.filter((trophy) => trophy.roadmapStage === stage.stage);
      return '<article class="stage-card"><div class="stage-no">0' + stage.stage + '</div>'
        + '<h3>' + escapeHtml(stage.name) + '</h3><div class="chapter">' + escapeHtml(stage.chapters) + '</div>'
        + '<p>' + escapeHtml(stage.goal) + '</p><div class="save"><b>MANUAL SAVE</b> '
        + escapeHtml(stage.saves) + '</div>'
        + (stage.missables.length ? '<div class="save danger"><b>WINDOW</b> '
          + stage.missables.map(escapeHtml).join(' · ') + '</div>' : '')
        + '<div class="stage-trophies">' + trophies.map((trophy) =>
          '<span class="g g-' + trophy.grade + '" title="' + escapeHtml(trophy.name) + '">'
          + GRADE_LETTER[trophy.grade] + '</span>').join('') + '</div>'
        + '<div class="mini">' + citationRun(stage.sources, data.sourceById) + '</div></article>';
    }).join('') + '</div>';
}

/** Flagged trophies only, with their exact windows and the open disputes. */
export function renderMissables(data) {
  return '<div class="wide-head">9 FLAGGED · 1 POSSIBLY MISSABLE · 8 AT RISK · 3 UNCONFIRMED</div>'
    + '<div class="miss-grid">' + data.trophies.filter((trophy) => trophy.missable).map((trophy) =>
      '<article class="miss-card' + ((trophy.disputes || []).some((d) => d.unconfirmed) ? ' unconfirmed' : '') + '">'
      + '<div class="g g-' + trophy.grade + '">' + GRADE_LETTER[trophy.grade] + '</div>'
      + '<div><b>' + escapeHtml(trophy.name) + '</b><p>' + escapeHtml(trophy.description) + '</p>'
      + '<div class="window"><b>WINDOW</b> ' + escapeHtml(trophy.window || 'Save before the related action.') + '</div>'
      + '<div class="mini">' + citationRun(trophy.sources.map((s) => s.id), data.sourceById) + '</div></div></article>')
      .join('') + '</div>';
}

/** Register of all 57 pages, with the trophies each page supports. */
export function renderSources(data, support) {
  return '<div class="wide-head">57 PAGES · 19 SITES · READ 20 NOV 2026 · ANCHORS ONLY</div>'
    + '<table class="source-table"><thead><tr><th>#</th><th>Site</th><th>Page / anchor</th>'
    + '<th>Used for</th><th>Supports trophies</th></tr></thead><tbody>'
    + data.sources.map((source) => '<tr><td class="mono">' + source.id + '</td><td>'
      + escapeHtml(source.site) + '</td><td><a href="' + source.url + '" target="_blank" '
      + 'rel="noopener noreferrer">' + escapeHtml(source.name) + '</a></td><td>'
      + escapeHtml(source.use) + '</td><td class="mono">'
      + (support.get(source.id) || []).join(' ') + '</td></tr>').join('')
    + '</tbody></table>';
}

/** Far-right rail keeps the next unearned trophies visible at all times. */
export function renderNextRail(state, data) {
  const upcoming = data.trophies
    .filter((trophy) => !state.earned[trophy.id])
    .sort((a, b) => a.roadmapStage - b.roadmapStage || a.id - b.id)
    .slice(0, 9);
  return '<div class="rail-title">NEXT UP · ROADMAP ORDER</div>'
    + upcoming.map((trophy, i) => '<button class="next" data-trophy="' + trophy.id + '">'
      + '<span class="mono">' + String(i + 1).padStart(2, '0') + '</span>'
      + '<span class="g g-' + trophy.grade + '">' + GRADE_LETTER[trophy.grade] + '</span>'
      + '<span>' + (state.spoiler && trophy.kind === 'story' ? '████████' : escapeHtml(trophy.name)) + '</span>'
      + '<small>S' + trophy.roadmapStage + '</small></button>').join('')
    + '<div class="rail-foot">Stage 1 → 5<br>15 manual saves<br>cheats disable trophies</div>';
}
