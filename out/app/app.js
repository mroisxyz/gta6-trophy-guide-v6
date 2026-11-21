import { loadTrophyDossier, computeAuditFigures, buildSourceSupport } from './src/data.js';
import { parseDemoParams, loadProgress, persistProgress, applyFilters,
  toggleSpoilerShield, setPersonalCount, toggleEarned, exportProgress, importProgress } from './src/state.js';
import { renderAuditStrip, renderGradeCounts, renderLeftRail, renderTrophyChecklist,
  renderTrophyDetail, renderRoadmap, renderMissables, renderSources, renderNextRail } from './src/render.js';

/** Bring the local dossier up, apply demo parameters, then paint every pane. */
async function bootLedger() {
  const data = await loadTrophyDossier();
  const demo = parseDemoParams(window.location.search, data);
  const state = {
    ...loadProgress(),
    view: demo.view,
    filter: demo.filter,
    query: '',
    grade: '',
    selected: demo.trophy ? demo.trophy.id : 1,
  };
  if (demo.spoiler) state.spoiler = true;
  const figures = computeAuditFigures(data);
  const support = buildSourceSupport(data);

  const nodes = {
    audit: document.getElementById('auditStrip'),
    progress: document.getElementById('progressLine'),
    tabs: document.getElementById('tabs'),
    left: document.getElementById('leftRail'),
    center: document.getElementById('centerPane'),
    detail: document.getElementById('detailPane'),
    next: document.getElementById('nextRail'),
    spoiler: document.getElementById('spoilerBtn'),
    export: document.getElementById('exportBtn'),
    import: document.getElementById('importInput'),
  };

  function refreshLedger() {
    const rows = applyFilters(state, data);
    nodes.audit.innerHTML = renderAuditStrip(figures);
    nodes.progress.innerHTML = renderGradeCounts(state, data);
    nodes.spoiler.textContent = 'Spoiler shield: ' + (state.spoiler ? 'ON' : 'OFF');
    nodes.spoiler.classList.toggle('on', state.spoiler);
    nodes.tabs.querySelectorAll('[data-view]').forEach((button) => {
      button.classList.toggle('on', button.dataset.view === state.view);
    });
    const tracker = state.view === 'tracker';
    document.body.classList.toggle('wide-view', !tracker);
    nodes.left.innerHTML = tracker ? renderLeftRail(state, data) : '';
    nodes.next.innerHTML = tracker ? renderNextRail(state, data) : '';
    nodes.detail.style.display = tracker ? '' : 'none';
    nodes.center.classList.toggle('wide', !tracker);
    if (state.view === 'roadmap') nodes.center.innerHTML = renderRoadmap(data);
    else if (state.view === 'missables') nodes.center.innerHTML = renderMissables(data);
    else if (state.view === 'sources') nodes.center.innerHTML = renderSources(data, support);
    else {
      nodes.center.innerHTML = renderTrophyChecklist(state, data, rows);
      nodes.detail.innerHTML = renderTrophyDetail(state, data);
    }
  }

  /** One delegated click handler keeps the strips and panes in sync. */
  function bindLedgerControls() {
    nodes.tabs.addEventListener('click', (event) => {
      const button = event.target.closest('[data-view]');
      if (!button) return;
      state.view = button.dataset.view;
      refreshLedger();
    });
    document.addEventListener('click', (event) => {
      const tick = event.target.closest('[data-tick]');
      if (tick) {
        toggleEarned(state, Number(tick.dataset.tick));
        refreshLedger();
        return;
      }
      const filter = event.target.closest('[data-filter]');
      if (filter) {
        state.filter = filter.dataset.filter;
        refreshLedger();
        return;
      }
      const chip = event.target.closest('[data-grade]');
      if (chip) {
        state.grade = state.grade === chip.dataset.grade ? '' : chip.dataset.grade;
        refreshLedger();
        return;
      }
      const count = event.target.closest('[data-count]');
      if (count) {
        setPersonalCount(state, data.byId.get(state.selected), Number(count.dataset.count));
        refreshLedger();
        return;
      }
      const pick = event.target.closest('[data-trophy]');
      if (pick) {
        state.selected = Number(pick.dataset.trophy);
        state.view = 'tracker';
        refreshLedger();
      }
    });
    document.addEventListener('input', (event) => {
      if (event.target.id !== 'searchInput') return;
      state.query = event.target.value;
      const caret = event.target.selectionStart;
      refreshLedger();
      const again = document.getElementById('searchInput');
      if (again) { again.focus(); again.setSelectionRange(caret, caret); }
    });
    nodes.spoiler.addEventListener('click', () => {
      toggleSpoilerShield(state);
      refreshLedger();
    });
    nodes.export.addEventListener('click', () => exportProgress(state));
    nodes.import.addEventListener('change', async (event) => {
      const file = event.target.files && event.target.files[0];
      if (!file) return;
      try { await importProgress(state, file); } finally { refreshLedger(); }
    });
  }

  bindLedgerControls();
  refreshLedger();
  persistProgress(state);
}

bootLedger().catch((error) => {
  document.getElementById('centerPane').textContent = 'Ledger could not open: ' + error.message;
});
