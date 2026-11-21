const STORAGE_KEY = 'leonida-ledger-v5-progress';

// A representative cross-section of the 55 trophies, shown on a first visit so the
// saved-progress tracker is visible immediately. Once saved, user ticks own the state.
const STARTER_EARNED = [2, 4, 6, 7, 15, 28, 29, 31, 42, 54];

/** Demo parameters can be combined in any order. */
export function parseDemoParams(search, data) {
  const params = new URLSearchParams(search);
  const view = ['tracker', 'roadmap', 'missables', 'sources'].includes(params.get('view'))
    ? params.get('view') : 'tracker';
  const filter = params.get('filter') || 'all';
  const requested = params.get('trophy');
  const trophy = requested && data.byName.has(requested) ? data.byName.get(requested) : null;
  return { view, filter, trophy, spoiler: params.get('spoiler') === '1' };
}

/** Progress is browser-local; counts are per trophy and independent of earning. */
export function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) {
      const seeded = {
        earned: Object.fromEntries(STARTER_EARNED.map((id) => [id, true])),
        counts: {}, spoiler: false,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
      return seeded;
    }
    const parsed = raw ? JSON.parse(raw) : {};
    return {
      earned: parsed.earned && typeof parsed.earned === 'object' ? parsed.earned : {},
      counts: parsed.counts && typeof parsed.counts === 'object' ? parsed.counts : {},
      spoiler: Boolean(parsed.spoiler),
    };
  } catch {
    return { earned: {}, counts: {}, spoiler: false };
  }
}

export function persistProgress(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    earned: state.earned, counts: state.counts, spoiler: state.spoiler,
  }));
}

/** One place decides which rows the centre pane shows. */
export function applyFilters(state, data) {
  const query = (state.query || '').trim().toLowerCase();
  return data.trophies.filter((trophy) => {
    if (state.filter === 'missable' && !trophy.missable) return false;
    if (state.filter === 'hidden' && !trophy.hidden) return false;
    if (state.filter === 'disputed' && !(trophy.disputes || []).length) return false;
    if (state.filter === 'note earned' && state.earned[trophy.id]) return false;
    if (state.filter === 'story' && trophy.kind !== 'story') return false;
    if (state.filter === 'collectibles' && trophy.kind !== 'collectibles') return false;
    if (state.filter === 'activities' && trophy.kind !== 'activities') return false;
    if (state.filter === 'online' && trophy.kind !== 'online') return false;
    if (state.filter === 'completion' && trophy.kind !== 'completion') return false;
    if (state.grade && trophy.grade !== state.grade) return false;
    if (query && !(trophy.name + ' ' + trophy.description).toLowerCase().includes(query)) return false;
    return true;
  }).sort((a, b) => a.roadmapStage - b.roadmapStage || a.id - b.id);
}

/** Spoiler shield masks unearned story names, descriptions and steps. */
export function toggleSpoilerShield(state) {
  state.spoiler = !state.spoiler;
  persistProgress(state);
  return state.spoiler;
}

export function setPersonalCount(state, trophy, delta) {
  const max = trophy.count || 18;
  const next = Math.max(0, Math.min(max, (state.counts[trophy.id] || 0) + delta));
  state.counts[trophy.id] = next;
  persistProgress(state);
  return next;
}

export function toggleEarned(state, trophyId) {
  state.earned[trophyId] = !state.earned[trophyId];
  persistProgress(state);
  return state.earned[trophyId];
}

/** Downloadable JSON; no server is involved. */
export function exportProgress(state) {
  const payload = JSON.stringify({
    guide: 'leonida-ledger-v5', exported: new Date().toISOString(),
    earned: state.earned, counts: state.counts, spoiler: state.spoiler,
  }, null, 2);
  const blob = new Blob([payload], { type: 'application/json' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'leonida-ledger-progress.json';
  link.click();
  URL.revokeObjectURL(link.href);
}

export async function importProgress(state, file) {
  const parsed = JSON.parse(await file.text());
  if (!parsed || typeof parsed !== 'object') throw new Error('Not a progress file');
  state.earned = parsed.earned || {};
  state.counts = parsed.counts || {};
  state.spoiler = Boolean(parsed.spoiler);
  persistProgress(state);
}
