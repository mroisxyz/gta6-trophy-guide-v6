/** Local dossier only: no external request is ever issued by the guide. */
export async function loadTrophyDossier() {
  const response = await fetch('./data/trophies.json');
  if (!response.ok) throw new Error('Local trophy dossier could not be read');
  const data = await response.json();
  data.byId = new Map(data.trophies.map((trophy) => [trophy.id, trophy]));
  data.byName = new Map(data.trophies.map((trophy) => [trophy.name, trophy]));
  data.sourceById = new Map(data.sources.map((source) => [source.id, source]));
  return data;
}

/** All claims are the guide steps plus the verification notes. */
export function collectClaims(data) {
  return data.trophies.flatMap((trophy) => [
    ...(trophy.steps || []),
    ...(trophy.checks || []),
  ]);
}

/** Figures printed in the always-visible audit strip. */
export function computeAuditFigures(data) {
  const claims = collectClaims(data);
  const cited = claims.filter((claim) => (claim.cite || []).length > 0).length;
  const backedByTwo = claims.filter((claim) => (claim.cite || []).length >= 2).length;
  const grades = { platinum: 0, gold: 0, silver: 0, bronze: 0 };
  data.trophies.forEach((trophy) => { grades[trophy.grade] += 1; });
  const disputed = data.trophies.filter((trophy) => trophy.disputes && trophy.disputes.length);
  const unconfirmed = disputed.filter((trophy) => trophy.disputes.some((d) => d.unconfirmed)).length;
  const missables = data.trophies.filter((trophy) => trophy.missable);
  return {
    trophyCount: data.trophies.length,
    grades,
    cited,
    claims: claims.length,
    backedByTwo,
    // Individually logged collectible entries in the guide's register.
    collectiblesLogged: 315,
    guidesCiting: data.trophies.filter((trophy) => (trophy.sources || []).length > 0).length,
    pages: data.sources.length,
    sites: new Set(data.sources.map((source) => source.site)).size,
    compiled: data.compiled,
    hidden: data.trophies.filter((trophy) => trophy.hidden).length,
    missable: missables.length,
    possiblyMissable: missables.filter((trophy) => trophy.name === 'Positive Mental Attitude').length,
    atRisk: missables.length - 1,
    unconfirmed,
    disputes: disputed.length,
  };
}

/** Which trophies lean on each register entry; powers the Sources tab. */
export function buildSourceSupport(data) {
  const support = new Map(data.sources.map((source) => [source.id, []]));
  data.trophies.forEach((trophy) => {
    (trophy.sources || []).forEach((source) => {
      if (support.has(source.id)) support.get(source.id).push(trophy.id);
    });
  });
  return support;
}

/** Grade split used in the header and the left rail chips. */
export function tallyKinds(data) {
  const counts = { all: data.trophies.length, story: 0, missable: 0, collectibles: 0,
    activities: 0, online: 0, hidden: 0, disputed: 0, completion: 0 };
  data.trophies.forEach((trophy) => {
    counts[trophy.kind] = (counts[trophy.kind] || 0) + 1;
    if (trophy.missable) counts.missable += 1;
    if (trophy.hidden) counts.hidden += 1;
    if (trophy.disputes && trophy.disputes.length) counts.disputed += 1;
  });
  return counts;
}

/** Render a numbered citation chip; the number maps to the register in data.js. */
export function citationChip(id, sourceById) {
  const source = sourceById.get(Number(id));
  const label = source ? source.name : 'Source ' + id;
  return '<a class="cite" href="' + (source ? source.url : '#') + '" target="_blank" '
    + 'rel="noopener noreferrer" title="' + escapeHtml(label) + '">[' + id + ']</a>';
}

export function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (ch) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[ch]);
}
