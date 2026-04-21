(function (global) {
  const state = {
    activeInsightIndex: 0,
    insights: [],
    initialized: false,
    isOpen: false
  };

  function getPageContent() {
    return document.body ? document.body.innerText : '';
  }

  async function runAnalysis() {
    const content = getPageContent();
    const insight = await global.ZayvoraBridge.analyzePage(content);
    state.insights = [insight];
    state.activeInsightIndex = 0;
    renderInsight();
  }

  function currentInsight() {
    return state.insights[state.activeInsightIndex] || { summary: 'No insight yet.', keyConcepts: [] };
  }

  function renderInsight() {
    const mount = document.getElementById('alchemist-output');
    if (!mount) return;
    const insight = currentInsight();
    mount.innerHTML = `
      <h4>Summary</h4>
      <p>${insight.summary}</p>
      <h4>Key concepts</h4>
      <ul>${(insight.keyConcepts || []).map((item) => `<li>${item}</li>`).join('')}</ul>
      <h4>Tool ideas</h4>
      <ul>${(insight.toolIdeas || []).map((item) => `<li>${item}</li>`).join('')}</ul>
      <h4>Game ideas</h4>
      <ul>${(insight.gameIdeas || []).map((item) => `<li>${item}</li>`).join('')}</ul>
    `;
  }

  function togglePanel(force) {
    const panel = document.getElementById('alchemist-panel');
    if (!panel) return;
    state.isOpen = typeof force === 'boolean' ? force : !state.isOpen;
    panel.classList.toggle('open', state.isOpen);
  }

  async function handleAction(action) {
    const insight = currentInsight();
    if (action === 'understand' || action === 'extract') await runAnalysis();
    if (action === 'tool') {
      const result = await global.AlchemistActions.generateTool(insight);
      document.getElementById('alchemist-output').insertAdjacentHTML('beforeend', `<h4>Generated tool</h4><p>${result.preview}</p>`);
    }
    if (action === 'game') {
      document.getElementById('alchemist-output').insertAdjacentHTML('beforeend', '<h4>Generated game</h4><p>Concept game generated from current insight.</p>');
    }
    if (action === 'epub') global.AlchemistEpubExport.exportSession(insight);
    if (action === 'pdf') global.AlchemistPdfExport.exportReport(insight);
    if (action === 'publish') {
      const result = global.AlchemistActions.publishInsight(insight);
      document.getElementById('alchemist-output').insertAdjacentHTML('beforeend', `<h4>Published</h4><p>${result.category} · ${result.fields.title}</p>`);
    }
  }

  function initialize() {
    if (state.initialized) return;
    const wrapper = document.createElement('div');
    wrapper.innerHTML = `
      <button class="alchemist-launcher" id="alchemist-launcher">⚗ Alchemist Panel</button>
      <aside class="alchemist-panel" id="alchemist-panel" aria-label="Alchemist panel">
        <div class="alchemist-header">
          <div>
            <div class="alchemist-title">⚗ Alchemist Panel</div>
            <div class="alchemist-subtitle">Analyze, generate, export, publish</div>
          </div>
          <button class="alchemist-action" id="alchemist-close">Close</button>
        </div>
        <div class="alchemist-body">
          <div class="alchemist-actions">
            <button class="alchemist-action" data-action="understand">Understand this</button>
            <button class="alchemist-action" data-action="extract">Extract ideas</button>
            <button class="alchemist-action" data-action="tool">Generate tool</button>
            <button class="alchemist-action" data-action="game">Generate game</button>
            <button class="alchemist-action" data-action="epub">Export EPUB</button>
            <button class="alchemist-action" data-action="pdf">Export PDF</button>
            <button class="alchemist-action" data-action="publish">Publish insight</button>
          </div>
          <section class="alchemist-output" id="alchemist-output"><h4>Ready</h4><p>Swipe up or click an action to begin.</p></section>
        </div>
      </aside>
    `;
    document.body.appendChild(wrapper);

    document.getElementById('alchemist-launcher').addEventListener('click', () => togglePanel(true));
    document.getElementById('alchemist-close').addEventListener('click', () => togglePanel(false));
    Array.from(wrapper.querySelectorAll('[data-action]')).forEach((button) => {
      button.addEventListener('click', () => handleAction(button.dataset.action));
    });

    global.AlchemistSwipeUI.attachSwipe(document.getElementById('alchemist-panel'), {
      onUp: () => togglePanel(true),
      onDown: () => togglePanel(false),
      onLeft: () => {
        if (!state.insights.length) return;
        state.activeInsightIndex = Math.min(state.insights.length - 1, state.activeInsightIndex + 1);
        renderInsight();
      },
      onRight: () => {
        if (!state.insights.length) return;
        state.activeInsightIndex = Math.max(0, state.activeInsightIndex - 1);
        renderInsight();
      }
    });

    state.initialized = true;
  }

  global.AlchemistPanel = {
    init: initialize,
    open: () => togglePanel(true)
  };
})(window);
