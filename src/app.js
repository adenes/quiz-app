import {
  AVAILABLE_TESTS,
  getTest,
  getCategoriesForTest,
  getQuestionsForTest,
  prepareQuizQuestions
} from './data/questions.js';
import { sounds } from './utils/audio.js';
import { storage } from './utils/storage.js';
import { triggerConfetti } from './utils/confetti.js';
import { dialog } from './utils/dialog.js';

// Clean Stroke SVG Icons
const ICONS = {
  brand: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M8 6h8M7 11h10M8 16h8"/></svg>`,
  anatomia: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/><path d="M3.22 12H9.5l1.5-2 2 4.5 1.5-2.5H20.8"/></svg>`,
  gerinctrening: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20"/><rect x="7" y="4" width="10" height="3" rx="1"/><rect x="6" y="10.5" width="12" height="3" rx="1"/><rect x="7" y="17" width="10" height="3" rx="1"/></svg>`,
  practice: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>`,
  mistakes: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2"/></svg>`,
  bookmarks: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
  sun: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>`,
  moon: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>`,
  soundOn: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>`,
  soundOff: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="22" y1="9" x2="16" y2="15"/><line x1="16" y1="9" x2="22" y2="15"/></svg>`,
  back: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>`,
  forward: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6"/></svg>`,
  grid: `<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg>`,
  clock: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
  streak: `<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`,
  check: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
  x: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
  note: `<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>`,
  zoom: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>`,
  retry: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>`,
  home: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`
};

function starIcon(filled = false) {
  return `<svg viewBox="0 0 24 24" width="18" height="18" fill="${filled ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`;
}

// Global Application State
const initialSettings = storage.getSettings();

const state = {
  currentTestId: initialSettings.selectedTestId || 'anatomia',
  currentScreen: 'home', // 'home' | 'quiz' | 'results'
  quizMode: 'practice', // 'practice' | 'mistakes' | 'bookmarks'
  selectedCategory: 'Összes témakör',
  questionCount: 20,
  shuffleQuestions: initialSettings.shuffleQuestions !== undefined ? initialSettings.shuffleQuestions : true,
  shuffleOptions: initialSettings.shuffleOptions !== undefined ? initialSettings.shuffleOptions : true,

  // Active Quiz State
  activeQuestions: [],
  currentIndex: 0,
  userAnswers: {}, // { [questionId]: { answer, isCorrect } }
  currentStreak: 0,
  maxStreak: 0,
  startTime: null,
  timerInterval: null,
  elapsedSeconds: 0,

  // UI Settings & Modals
  isGridOpen: false,
  resultsFilter: 'all', // 'all' | 'wrong' | 'correct'
  settings: initialSettings
};

// Active Session Persistence & Timer Helpers
function persistActiveSession() {
  if (state.currentScreen === 'quiz' || state.currentScreen === 'results') {
    storage.saveActiveSession({
      testId: state.currentTestId,
      currentScreen: state.currentScreen,
      quizMode: state.quizMode,
      selectedCategory: state.selectedCategory,
      questionCount: state.questionCount,
      activeQuestions: state.activeQuestions,
      currentIndex: state.currentIndex,
      userAnswers: state.userAnswers,
      currentStreak: state.currentStreak,
      maxStreak: state.maxStreak,
      elapsedSeconds: state.elapsedSeconds,
      resultsFilter: state.resultsFilter
    });
  } else {
    storage.clearActiveSession();
  }
}

function restoreActiveSessionIfExists() {
  const session = storage.getActiveSession();
  if (session && session.activeQuestions && session.activeQuestions.length > 0) {
    state.currentTestId = session.testId || session.currentTestId || 'anatomia';
    state.currentScreen = session.currentScreen || 'quiz';
    state.quizMode = session.quizMode || 'practice';
    state.selectedCategory = session.selectedCategory || 'Összes témakör';
    state.questionCount = session.questionCount || session.activeQuestions.length;

    const testConfig = getTest(state.currentTestId);
    state.activeQuestions = session.activeQuestions.map(q => {
      const full = testConfig.questions.find(item => item.id === q.id);
      if (full && full.image) {
        return { ...q, image: full.image, image_title: full.image_title };
      }
      return q;
    });

    state.currentIndex = session.currentIndex || 0;
    state.userAnswers = session.userAnswers || {};
    state.currentStreak = session.currentStreak || 0;
    state.maxStreak = session.maxStreak || 0;
    state.elapsedSeconds = session.elapsedSeconds || 0;
    state.resultsFilter = session.resultsFilter || 'all';

    if (state.currentScreen === 'quiz') {
      startTimer();
    }
  }
}

function formatTimer(seconds) {
  const mins = String(Math.floor(seconds / 60)).padStart(2, '0');
  const secs = String(seconds % 60).padStart(2, '0');
  return `${mins}:${secs}`;
}

function startTimer() {
  if (state.timerInterval) clearInterval(state.timerInterval);
  state.timerInterval = setInterval(() => {
    state.elapsedSeconds++;
    const timerDisplay = document.getElementById('quiz-timer-display');
    if (timerDisplay) {
      timerDisplay.textContent = formatTimer(state.elapsedSeconds);
    }
  }, 1000);
}

function stopTimer() {
  if (state.timerInterval) {
    clearInterval(state.timerInterval);
    state.timerInterval = null;
  }
}

// Theme Helpers
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  const metaTheme = document.querySelector('meta[name="theme-color"]');
  if (metaTheme) {
    metaTheme.setAttribute('content', theme === 'dark' ? '#111418' : '#f5f4ef');
  }
}

function toggleTheme() {
  sounds.playTap();
  const newTheme = state.settings.theme === 'dark' ? 'light' : 'dark';
  state.settings = storage.updateSettings({ theme: newTheme });
  applyTheme(newTheme);
  renderHeaderQuickIcons();
}

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
  restoreActiveSessionIfExists();
  applyTheme(state.settings.theme);
  renderApp();
  initKeyboardNav();
  window.addEventListener('beforeunload', () => {
    persistActiveSession();
  });
});

// Master Render Router
function renderApp() {
  const root = document.getElementById('app-root');
  if (!root) return;

  if (state.currentScreen === 'home') {
    root.classList.remove('screen-quiz-mode');
    root.innerHTML = getHomeScreenHTML();
    bindHomeScreenEvents();
  } else if (state.currentScreen === 'quiz') {
    root.classList.add('screen-quiz-mode');
    root.innerHTML = getQuizScreenHTML();
    bindQuizScreenEvents();
  } else if (state.currentScreen === 'results') {
    root.classList.remove('screen-quiz-mode');
    root.innerHTML = getResultsScreenHTML();
    bindResultsScreenEvents();
  }

  bindTopbarUtilityEvents();
  renderQuestionGridModal();
}

function renderHeaderQuickIcons() {
  const soundBtn = document.getElementById('hdr-sound-btn');
  if (soundBtn) {
    const enabled = sounds.isSoundEnabled();
    soundBtn.classList.toggle('active', enabled);
    soundBtn.innerHTML = enabled ? ICONS.soundOn : ICONS.soundOff;
    soundBtn.title = enabled ? 'Hang némítása (M)' : 'Hang bekapcsolása (M)';
    soundBtn.setAttribute('aria-label', soundBtn.title);
  }

  const themeBtn = document.getElementById('hdr-theme-btn');
  if (themeBtn) {
    const isDark = state.settings.theme === 'dark';
    themeBtn.innerHTML = isDark ? ICONS.sun : ICONS.moon;
    themeBtn.title = isDark ? 'Váltás világos módra' : 'Váltás sötét módra';
    themeBtn.setAttribute('aria-label', themeBtn.title);
  }

  const currentQ = state.activeQuestions[state.currentIndex];
  const starBtn = document.getElementById('hdr-star-btn');
  if (starBtn && currentQ) {
    const isBookmarked = storage.isBookmarked(currentQ.id, state.currentTestId);
    starBtn.classList.toggle('bookmarked', isBookmarked);
    starBtn.innerHTML = starIcon(isBookmarked);
  }
}

function getUtilityButtonsHTML() {
  const soundEnabled = sounds.isSoundEnabled();
  const isDark = state.settings.theme === 'dark';

  return `
    <button class="icon-btn ${soundEnabled ? 'active' : ''}" id="hdr-sound-btn" type="button" title="${soundEnabled ? 'Hang némítása (M)' : 'Hang bekapcsolása (M)'}" aria-label="${soundEnabled ? 'Hang némítása' : 'Hang bekapcsolása'}">
      ${soundEnabled ? ICONS.soundOn : ICONS.soundOff}
    </button>
    <button class="icon-btn" id="hdr-theme-btn" type="button" title="${isDark ? 'Váltás világos módra' : 'Váltás sötét módra'}" aria-label="${isDark ? 'Világos mód' : 'Sötét mód'}">
      ${isDark ? ICONS.sun : ICONS.moon}
    </button>
  `;
}

function bindTopbarUtilityEvents() {
  const soundBtn = document.getElementById('hdr-sound-btn');
  if (soundBtn) {
    soundBtn.addEventListener('click', () => {
      sounds.toggleSound();
      renderHeaderQuickIcons();
    });
  }

  const themeBtn = document.getElementById('hdr-theme-btn');
  if (themeBtn) {
    themeBtn.addEventListener('click', toggleTheme);
  }
}

/* ==========================================================================
   1. HOME SCREEN
   ========================================================================== */
function getEffectivePoolCount() {
  if (state.quizMode === 'mistakes') {
    return storage.getWrongQuestions(state.currentTestId).length;
  }
  if (state.quizMode === 'bookmarks') {
    return storage.getBookmarks(state.currentTestId).length;
  }
  return getQuestionsForTest(state.currentTestId, state.selectedCategory).length;
}

function getEffectiveSessionLength() {
  const poolSize = getEffectivePoolCount();
  return Math.min(state.questionCount, poolSize);
}

function getCategoryCounts(testId) {
  const categories = getCategoriesForTest(testId);
  const allQuestions = getTest(testId).questions;
  const counts = {};

  categories.forEach(cat => {
    if (cat === 'Összes témakör') {
      counts[cat] = allQuestions.length;
    } else {
      counts[cat] = allQuestions.filter(q => q.category === cat).length;
    }
  });
  return counts;
}

function getHomeScreenHTML() {
  const currentTest = getTest(state.currentTestId);
  const wrongCount = storage.getWrongQuestions(state.currentTestId).length;
  const bookmarksCount = storage.getBookmarks(state.currentTestId).length;
  const testCategories = getCategoriesForTest(state.currentTestId);
  const catCounts = getCategoryCounts(state.currentTestId);
  const countOptions = currentTest.defaultCounts;
  const effectiveLen = getEffectiveSessionLength();

  const modeLabels = {
    practice: 'Gyakorló mód',
    mistakes: 'Tévesztett kérdések',
    bookmarks: 'Csillagozott kérdések'
  };

  return `
    <header class="topbar">
      <div class="topbar-inner">
        <div class="topbar-left">
          <div class="brand-mark">
            <div class="brand-emblem">${ICONS.brand}</div>
            <div class="brand-name">Vizsgafelkészítő</div>
          </div>
        </div>
        <div class="topbar-right">
          ${getUtilityButtonsHTML()}
        </div>
      </div>
    </header>

    <div class="home-container">
      <section class="home-header">
        <span class="home-eyebrow">Orvosi &amp; Biomechanikai Kérdésbank</span>
        <h1 class="home-title">${currentTest.title}</h1>
        <p class="home-subtitle">${currentTest.description}. Válassz tesztsort, gyakorlási módot és témakört a felkészüléshez.</p>
      </section>

      <!-- Test Dataset Selector -->
      <section>
        <div class="section-heading">
          <h2 class="section-label">Tesztsor kiválasztása</h2>
          <span class="section-meta">${AVAILABLE_TESTS.length} elérhető tananyag</span>
        </div>

        <div class="deck-grid">
          ${AVAILABLE_TESTS.map(t => {
            const isSelected = state.currentTestId === t.id;
            const deckWrong = storage.getWrongQuestions(t.id).length;
            const deckHistory = storage.getHistory(t.id);
            const deckLast = deckHistory.length > 0 ? `${deckHistory[0].percentage}%` : '—';
            const deckCatCount = getCategoriesForTest(t.id).length - 1;
            const deckIcon = ICONS[t.id] || ICONS.practice;

            return `
              <button type="button" class="deck-card ${isSelected ? 'selected' : ''}" data-testid="${t.id}">
                <div>
                  <div class="deck-card-top">
                    <div class="deck-icon-wrap">${deckIcon}</div>
                    <div class="deck-radio"><div class="deck-radio-dot"></div></div>
                  </div>
                  <div class="deck-body" style="margin-top: 14px;">
                    <h2>${t.title}</h2>
                    <p>${t.description}</p>
                  </div>
                </div>

                <div class="deck-stats-row">
                  <span class="deck-stat"><strong>${t.totalQuestions}</strong> kérdés</span>
                  <span class="deck-stat"><strong>${deckCatCount}</strong> témakör</span>
                  <span class="deck-stat">Legutóbbi: <strong>${deckLast}</strong></span>
                  ${deckWrong > 0 ? `<span class="deck-stat has-mistakes">Hibás: <strong>${deckWrong}</strong></span>` : ''}
                </div>
              </button>
            `;
          }).join('')}
        </div>
      </section>

      <!-- Study Configuration Panel -->
      <section>
        <div class="section-heading">
          <h2 class="section-label">Gyakorlás beállításai</h2>
          <span class="section-meta">${currentTest.shortTitle}</span>
        </div>

        <div class="config-panel">
          <!-- Study Mode -->
          <div class="config-section">
            <div class="section-heading" style="margin-bottom: 10px;">
              <span class="section-label">Üzemmód</span>
            </div>
            <div class="mode-tabs">
              <button type="button" class="mode-option ${state.quizMode === 'practice' ? 'selected' : ''}" data-mode="practice">
                <div class="mode-option-head">
                  ${ICONS.practice}
                  <span class="mode-count-pill">${currentTest.totalQuestions} db</span>
                </div>
                <div class="mode-option-title">Gyakorló mód</div>
                <div class="mode-option-desc">Azonnali magyarázat és anatómiai ábra minden válasz után</div>
              </button>

              <button type="button" class="mode-option ${state.quizMode === 'mistakes' ? 'selected' : ''}" data-mode="mistakes">
                <div class="mode-option-head">
                  ${ICONS.mistakes}
                  <span class="mode-count-pill ${wrongCount > 0 ? 'alert' : ''}">${wrongCount} db</span>
                </div>
                <div class="mode-option-title">Tévesztett kérdések</div>
                <div class="mode-option-desc">${wrongCount > 0 ? `${wrongCount} hibás kérdés vár javításra` : 'Nincs elmentett hiba ebben a tesztsorban'}</div>
              </button>

              <button type="button" class="mode-option ${state.quizMode === 'bookmarks' ? 'selected' : ''}" data-mode="bookmarks">
                <div class="mode-option-head">
                  ${ICONS.bookmarks}
                  <span class="mode-count-pill ${bookmarksCount > 0 ? 'warn' : ''}">${bookmarksCount} db</span>
                </div>
                <div class="mode-option-title">Csillagozottak</div>
                <div class="mode-option-desc">${bookmarksCount > 0 ? `${bookmarksCount} megjelölt kérdés ismétlése` : 'A kvíz közben csillaggal menthetsz el kérdéseket'}</div>
              </button>
            </div>
          </div>

          <!-- Topics (Visible in Practice Mode) -->
          ${state.quizMode === 'practice' ? `
            <div class="config-section">
              <div class="section-heading" style="margin-bottom: 10px;">
                <span class="section-label">Témakör / Fejezet</span>
                <span class="section-meta">${testCategories.length - 1} fejezet</span>
              </div>
              <div class="topic-chips-wrap">
                ${testCategories.map(cat => `
                  <button type="button" class="topic-chip ${state.selectedCategory === cat ? 'active' : ''}" data-cat="${cat}">
                    <span>${cat}</span>
                    <span class="topic-chip-count">${catCounts[cat]}</span>
                  </button>
                `).join('')}
              </div>
            </div>
          ` : ''}

          <!-- Question Count & Randomization -->
          <div class="config-section">
            <div class="settings-grid">
              <div>
                <div class="section-heading" style="margin-bottom: 8px;">
                  <span class="section-label">Kérdések száma</span>
                </div>
                <div class="count-segmented">
                  ${countOptions.map(cnt => `
                    <button type="button" class="count-seg-btn ${state.questionCount === cnt ? 'active' : ''}" data-count="${cnt}">
                      ${cnt === currentTest.totalQuestions ? `Mind` : `${cnt}`}
                    </button>
                  `).join('')}
                </div>
              </div>

              <div class="toggles-stack">
                <label class="toggle-row" for="chk-shuffle-questions">
                  <div>
                    <div class="toggle-text-title">Kérdések keverése</div>
                    <div class="toggle-text-desc">Véletlenszerű sorrend indításkor</div>
                  </div>
                  <span class="switch">
                    <input type="checkbox" id="chk-shuffle-questions" ${state.shuffleQuestions ? 'checked' : ''}>
                    <span class="slider"></span>
                  </span>
                </label>

                <label class="toggle-row" for="chk-shuffle-options">
                  <div>
                    <div class="toggle-text-title">Válaszlehetőségek keverése</div>
                    <div class="toggle-text-desc">A, B, C, D sorrend randomizálása</div>
                  </div>
                  <span class="switch">
                    <input type="checkbox" id="chk-shuffle-options" ${state.shuffleOptions ? 'checked' : ''}>
                    <span class="slider"></span>
                  </span>
                </label>
              </div>
            </div>
          </div>

          <!-- Launch Footer -->
          <div class="config-launch-bar">
            <div class="launch-summary" id="launch-summary-text">
              <strong>${modeLabels[state.quizMode]}</strong>
              ${state.quizMode === 'practice' ? ` · ${state.selectedCategory}` : ''}
              · <span class="tabular">${effectiveLen} kérdés</span>
            </div>
            <button type="button" class="btn-primary" id="btn-start-quiz">
              <span>Teszt indítása</span>
              ${ICONS.forward}
            </button>
          </div>
        </div>
      </section>
    </div>
  `;
}

function updateLaunchSummaryText() {
  const el = document.getElementById('launch-summary-text');
  if (!el) return;
  const modeLabels = {
    practice: 'Gyakorló mód',
    mistakes: 'Tévesztett kérdések',
    bookmarks: 'Csillagozott kérdések'
  };
  const effectiveLen = getEffectiveSessionLength();
  el.innerHTML = `
    <strong>${modeLabels[state.quizMode]}</strong>
    ${state.quizMode === 'practice' ? ` · ${state.selectedCategory}` : ''}
    · <span class="tabular">${effectiveLen} kérdés</span>
  `;
}

function bindHomeScreenEvents() {
  // Deck selection cards
  document.querySelectorAll('.deck-card').forEach(card => {
    card.addEventListener('click', () => {
      const testId = card.getAttribute('data-testid');
      if (testId && testId !== state.currentTestId) {
        sounds.playTap();
        state.currentTestId = testId;
        state.selectedCategory = 'Összes témakör';
        const newTest = getTest(testId);
        if (!newTest.defaultCounts.includes(state.questionCount)) {
          state.questionCount = newTest.defaultCounts[1] || newTest.totalQuestions;
        }
        storage.updateSettings({ selectedTestId: testId });
        renderApp();
      }
    });
  });

  // Mode options
  document.querySelectorAll('.mode-option').forEach(card => {
    card.addEventListener('click', () => {
      sounds.playTap();
      state.quizMode = card.getAttribute('data-mode');
      renderApp();
    });
  });

  // Topic chips
  document.querySelectorAll('.topic-chip').forEach(btn => {
    btn.addEventListener('click', () => {
      sounds.playTap();
      state.selectedCategory = btn.getAttribute('data-cat');
      document.querySelectorAll('.topic-chip').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      updateLaunchSummaryText();
    });
  });

  // Count selector
  document.querySelectorAll('.count-seg-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      sounds.playTap();
      state.questionCount = parseInt(btn.getAttribute('data-count'), 10);
      document.querySelectorAll('.count-seg-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      updateLaunchSummaryText();
    });
  });

  // Shuffle checkboxes
  const shuffleQEl = document.getElementById('chk-shuffle-questions');
  if (shuffleQEl) {
    shuffleQEl.addEventListener('change', (e) => {
      state.shuffleQuestions = e.target.checked;
      storage.updateSettings({ shuffleQuestions: e.target.checked });
    });
  }

  const shuffleOEl = document.getElementById('chk-shuffle-options');
  if (shuffleOEl) {
    shuffleOEl.addEventListener('change', (e) => {
      state.shuffleOptions = e.target.checked;
      storage.updateSettings({ shuffleOptions: e.target.checked });
    });
  }

  // Start Button
  const startBtn = document.getElementById('btn-start-quiz');
  if (startBtn) {
    startBtn.addEventListener('click', () => {
      sounds.playTap();
      startQuizSession();
    });
  }
}

// Start Quiz Session
function startQuizSession() {
  const currentTest = getTest(state.currentTestId);
  let pool = [];

  if (state.quizMode === 'mistakes') {
    const wrongIds = storage.getWrongQuestions(state.currentTestId);
    pool = currentTest.questions.filter(q => wrongIds.includes(q.id));
    if (pool.length === 0) {
      dialog.alert({
        title: 'Nincsenek hibás kérdések',
        message: 'Ebben a tesztsorban jelenleg nincs rögzített hibás kérdésed. Gyakorolj a témakörökkel!',
        confirmText: 'Rendben',
        type: 'info'
      });
      return;
    }
  } else if (state.quizMode === 'bookmarks') {
    const starIds = storage.getBookmarks(state.currentTestId);
    pool = currentTest.questions.filter(q => starIds.includes(q.id));
    if (pool.length === 0) {
      dialog.alert({
        title: 'Nincsenek csillagozott kérdések',
        message: 'Ebben a tesztsorban még nem jelöltél meg kérdést. A kvíz során a felső csillag ikonnal menthetsz el nehéz kérdéseket.',
        confirmText: 'Rendben',
        type: 'warning'
      });
      return;
    }
  } else {
    pool = getQuestionsForTest(state.currentTestId, state.selectedCategory);
  }

  const questions = prepareQuizQuestions(pool, state.shuffleQuestions, state.shuffleOptions);
  const limit = Math.min(state.questionCount, questions.length);

  state.activeQuestions = questions.slice(0, limit);
  state.currentIndex = 0;
  state.userAnswers = {};
  state.currentStreak = 0;
  state.maxStreak = 0;
  state.elapsedSeconds = 0;
  state.startTime = Date.now();

  startTimer();
  state.currentScreen = 'quiz';
  persistActiveSession();
  renderApp();
}

/* ==========================================================================
   2. QUIZ SCREEN
   ========================================================================== */
function getQuizScreenHTML() {
  const q = state.activeQuestions[state.currentIndex];
  if (!q) return '<div class="quiz-column">Nincs kérdés</div>';

  const currentTest = getTest(state.currentTestId);
  const total = state.activeQuestions.length;
  const currentNum = state.currentIndex + 1;
  const progressPercent = Math.round((currentNum / total) * 100);

  const answeredInfo = state.userAnswers[q.id];
  const isAnswered = !!answeredInfo;
  const isBookmarked = storage.isBookmarked(q.id, state.currentTestId);

  return `
    <div class="quiz-shell">
      <header class="topbar topbar-quiz">
        <div class="topbar-inner">
          <div class="topbar-left">
            <button type="button" class="nav-pill-btn" id="hdr-back-btn" title="Vissza a főmenübe" aria-label="Vissza a főmenübe">
              ${ICONS.back}
              <span>Főmenü</span>
            </button>

            <button type="button" class="nav-pill-btn tabular" id="hdr-grid-btn" title="Kérdésválasztó táblázat">
              ${ICONS.grid}
              <span>${currentNum} / ${total}</span>
            </button>
          </div>

          <div class="topbar-right">
            ${state.currentStreak >= 2 ? `
              <span class="streak-chip" title="Helyes válasz sorozat">
                ${ICONS.streak}
                <span>${state.currentStreak}x</span>
              </span>
            ` : ''}

            <span class="quiz-timer-chip tabular" title="Eltelt idő">
              ${ICONS.clock}
              <span id="quiz-timer-display">${formatTimer(state.elapsedSeconds)}</span>
            </span>

            <button type="button" class="icon-btn ${isBookmarked ? 'bookmarked' : ''}" id="hdr-star-btn" title="Csillagozás (S)" aria-label="Csillagozás">
              ${starIcon(isBookmarked)}
            </button>

            ${getUtilityButtonsHTML()}
          </div>
        </div>
        <div class="progress-line-track" aria-hidden="true">
          <div class="progress-line-fill" style="width: ${progressPercent}%;"></div>
        </div>
      </header>

      <div class="quiz-scroll-area" id="quiz-scroll-area">
        <div class="quiz-column">
          <div class="question-header-meta">
            <span class="category-tag">${q.category || currentTest.shortTitle}</span>
            <span class="question-id-tag">#${String(q.id).padStart(3, '0')}</span>
          </div>

          <h2 class="question-prompt">${q.question}</h2>

          <div class="options-stack">
            ${q.answers.map((answerText, idx) => {
              const letter = String.fromCharCode(65 + idx);
              let stateClass = '';
              let statusSVG = '';

              if (isAnswered) {
                const isUserSelected = answeredInfo.answer === answerText;
                const isCorrectAnswer = answerText === q.correct_answer;

                if (isCorrectAnswer) {
                  stateClass = 'correct';
                  statusSVG = ICONS.check;
                } else if (isUserSelected && !answeredInfo.isCorrect) {
                  stateClass = 'wrong';
                  statusSVG = ICONS.x;
                } else {
                  stateClass = 'dimmed';
                }
              }

              return `
                <button
                  type="button"
                  class="option-btn ${stateClass}"
                  data-answer="${encodeURIComponent(answerText)}"
                  data-idx="${idx}"
                  ${isAnswered ? 'disabled' : ''}
                >
                  <span class="option-key">${letter}</span>
                  <span class="option-text">${answerText}</span>
                  ${statusSVG ? `<span class="option-status-icon">${statusSVG}</span>` : ''}
                </button>
              `;
            }).join('')}
          </div>

          ${isAnswered ? `
            <div class="explanation-box">
              <div class="explanation-head">
                ${ICONS.note}
                <span>Magyarázat</span>
              </div>
              <p class="explanation-prose">${q.explanation}</p>

              ${q.image ? `
                <button
                  type="button"
                  class="plate-card"
                  id="explanation-image-trigger"
                  data-img="${q.image}"
                  data-title="${encodeURIComponent(q.image_title || 'Anatómiai ábra')}"
                >
                  <div class="plate-image-wrap">
                    <img src="${q.image}" alt="${q.image_title || 'Anatómiai ábra'}" class="plate-thumb" loading="lazy" />
                  </div>
                  <div class="plate-footer">
                    <span>${q.image_title || 'Anatómiai illusztráció'}</span>
                    <span class="plate-zoom-action">
                      ${ICONS.zoom}
                      <span>Nagyítás</span>
                    </span>
                  </div>
                </button>
              ` : ''}
            </div>
          ` : ''}
        </div>
      </div>

      <footer class="quiz-bottom-bar">
        <div class="quiz-bottom-inner">
          <div class="quiz-actions-row">
            ${state.currentIndex > 0 ? `
              <button type="button" class="btn-secondary" id="btn-prev-question" title="Előző kérdés (←)">
                ${ICONS.back}
                <span>Előző</span>
              </button>
            ` : ''}

            ${isAnswered ? `
              <button type="button" class="btn-primary" id="btn-next-question">
                <span>${currentNum === total ? 'Teszt befejezése' : 'Következő kérdés'}</span>
                ${ICONS.forward}
              </button>
            ` : `
              <button type="button" class="btn-primary" disabled>
                <span>Válassz egy választ</span>
              </button>
            `}
          </div>

          <div class="keyboard-hints" aria-hidden="true">
            <span><kbd>1</kbd>–<kbd>4</kbd> vagy <kbd>A</kbd>–<kbd>D</kbd> Válasz</span>
            <span><kbd>Enter</kbd> Következő</span>
            <span><kbd>←</kbd> Előző</span>
            <span><kbd>S</kbd> Csillag</span>
            <span><kbd>M</kbd> Némítás</span>
          </div>
        </div>
      </footer>
    </div>
  `;
}

function bindQuizScreenEvents() {
  const q = state.activeQuestions[state.currentIndex];
  if (!q) return;

  const backBtn = document.getElementById('hdr-back-btn');
  if (backBtn) {
    backBtn.addEventListener('click', async () => {
      const confirmed = await dialog.confirm({
        title: 'Teszt megszakítása',
        message: 'Biztosan visszatérsz a főmenübe? A jelenlegi teszt haladása elvész.',
        confirmText: 'Kilépés a főmenübe',
        cancelText: 'Folytatás',
        type: 'danger'
      });

      if (confirmed) {
        stopTimer();
        storage.clearActiveSession();
        state.currentScreen = 'home';
        renderApp();
      }
    });
  }

  const gridBtn = document.getElementById('hdr-grid-btn');
  if (gridBtn) {
    gridBtn.addEventListener('click', () => {
      sounds.playTap();
      state.isGridOpen = true;
      renderQuestionGridModal();
    });
  }

  const starBtn = document.getElementById('hdr-star-btn');
  if (starBtn) {
    starBtn.addEventListener('click', () => {
      sounds.playTap();
      const isNowStarred = storage.toggleBookmark(q.id, state.currentTestId);
      starBtn.classList.toggle('bookmarked', isNowStarred);
      starBtn.innerHTML = starIcon(isNowStarred);
      if (isNowStarred) {
        sounds.playStreak();
      }
    });
  }

  const isAnswered = !!state.userAnswers[q.id];
  document.querySelectorAll('.option-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (isAnswered) return;
      const selectedAnswer = decodeURIComponent(btn.getAttribute('data-answer'));
      selectOption(q, selectedAnswer);
    });
  });

  const nextBtn = document.getElementById('btn-next-question');
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      sounds.playTap();
      goToNextQuestion();
    });
  }

  const prevBtn = document.getElementById('btn-prev-question');
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      sounds.playTap();
      if (state.currentIndex > 0) {
        state.currentIndex--;
        persistActiveSession();
        renderApp();
      }
    });
  }

  const imgTrigger = document.getElementById('explanation-image-trigger');
  if (imgTrigger) {
    imgTrigger.addEventListener('click', () => {
      sounds.playTap();
      const src = imgTrigger.getAttribute('data-img');
      const title = decodeURIComponent(imgTrigger.getAttribute('data-title') || '');
      openDiagramLightbox(src, title);
    });
  }
}

function selectOption(question, answerText) {
  const isCorrect = answerText === question.correct_answer;

  state.userAnswers[question.id] = {
    answer: answerText,
    isCorrect: isCorrect
  };

  storage.recordAnswerResult(question.id, isCorrect, state.currentTestId);

  if (isCorrect) {
    state.currentStreak++;
    if (state.currentStreak > state.maxStreak) {
      state.maxStreak = state.currentStreak;
    }
    if (state.currentStreak >= 3 && state.currentStreak % 3 === 0) {
      sounds.playStreak();
    } else {
      sounds.playCorrect();
    }
    if ('vibrate' in navigator) navigator.vibrate([25]);
  } else {
    state.currentStreak = 0;
    sounds.playIncorrect();
    if ('vibrate' in navigator) navigator.vibrate([60, 40, 60]);
  }

  persistActiveSession();
  renderApp();

  setTimeout(() => {
    const expl = document.querySelector('.explanation-box');
    if (expl) {
      expl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, 50);
}

function goToNextQuestion() {
  if (state.currentIndex < state.activeQuestions.length - 1) {
    state.currentIndex++;
    persistActiveSession();
    renderApp();
  } else {
    finishQuizSession();
  }
}

function finishQuizSession() {
  stopTimer();

  let correctCount = 0;
  let wrongCount = 0;

  state.activeQuestions.forEach(q => {
    const ans = state.userAnswers[q.id];
    if (ans && ans.isCorrect) {
      correctCount++;
    } else {
      wrongCount++;
    }
  });

  const total = state.activeQuestions.length;
  const percentage = Math.round((correctCount / total) * 100);
  const currentTest = getTest(state.currentTestId);

  storage.saveQuizResult({
    testId: state.currentTestId,
    testTitle: currentTest.title,
    mode: state.quizMode,
    category: state.selectedCategory,
    total,
    correct: correctCount,
    wrong: wrongCount,
    percentage,
    durationSeconds: state.elapsedSeconds,
    maxStreak: state.maxStreak
  });

  if (percentage >= 70) {
    sounds.playFanfare();
    setTimeout(triggerConfetti, 200);
  } else {
    sounds.playCorrect();
  }

  state.currentScreen = 'results';
  persistActiveSession();
  renderApp();
}

/* ==========================================================================
   3. RESULTS SCREEN
   ========================================================================== */
function getResultsScreenHTML() {
  let correctCount = 0;
  let wrongCount = 0;

  state.activeQuestions.forEach(q => {
    const ans = state.userAnswers[q.id];
    if (ans && ans.isCorrect) {
      correctCount++;
    } else {
      wrongCount++;
    }
  });

  const total = state.activeQuestions.length;
  const percentage = Math.round((correctCount / total) * 100);
  const currentTest = getTest(state.currentTestId);

  let verdictTitle = '';
  let verdictDesc = '';
  if (percentage >= 90) {
    verdictTitle = 'Kiváló eredmény';
    verdictDesc = `Magabiztos tudás. A(z) ${currentTest.shortTitle.toLowerCase()} anyagát magas szinten uralod.`;
  } else if (percentage >= 75) {
    verdictTitle = 'Sikeres felkészülés';
    verdictDesc = 'Stabil alapok; néhány részletet még érdemes finomítani az ismétléssel.';
  } else if (percentage >= 50) {
    verdictTitle = 'Jó kezdés';
    verdictDesc = 'Az alapfogalmak megvannak, de érdemes külön átnézni a tévesztett kérdéseket.';
  } else {
    verdictTitle = 'További gyakorlás javasolt';
    verdictDesc = `A(z) ${currentTest.shortTitle.toLowerCase()} pontos terminológiát igényel. Ismételd át a hibás pontokat.`;
  }

  const mins = Math.floor(state.elapsedSeconds / 60);
  const secs = state.elapsedSeconds % 60;
  const timeFormatted = mins > 0 ? `${mins}p ${String(secs).padStart(2, '0')}mp` : `${secs} mp`;

  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (circumference * percentage) / 100;
  const ringColor = percentage >= 75 ? 'var(--correct)' : percentage >= 50 ? 'var(--warning)' : 'var(--wrong)';

  const filteredQuestions = state.activeQuestions.filter(q => {
    const ans = state.userAnswers[q.id];
    const isCorr = ans && ans.isCorrect;
    if (state.resultsFilter === 'wrong') return !isCorr;
    if (state.resultsFilter === 'correct') return isCorr;
    return true;
  });

  return `
    <header class="topbar">
      <div class="topbar-inner">
        <div class="topbar-left">
          <div class="brand-mark">
            <div class="brand-emblem">${ICONS.brand}</div>
            <div class="brand-name">Eredmények</div>
          </div>
        </div>
        <div class="topbar-right">
          ${getUtilityButtonsHTML()}
        </div>
      </div>
    </header>

    <div class="results-container">
      <section class="results-summary-card">
        <div class="results-hero-row">
          <div class="score-ring-wrap">
            <svg class="score-ring-svg" viewBox="0 0 124 124">
              <circle class="score-ring-bg" cx="62" cy="62" r="${radius}" />
              <circle
                class="score-ring-fg"
                cx="62"
                cy="62"
                r="${radius}"
                style="stroke-dasharray: ${circumference}; stroke-dashoffset: ${strokeDashoffset}; stroke: ${ringColor};"
              />
            </svg>
            <div class="score-ring-label">
              <span class="score-ring-pct">${percentage}%</span>
              <span class="score-ring-sub">${correctCount}/${total}</span>
            </div>
          </div>

          <div class="results-verdict">
            <span class="results-deck-tag">${currentTest.title}</span>
            <h1>${verdictTitle}</h1>
            <p>${verdictDesc}</p>
          </div>
        </div>

        <div class="results-metrics-strip">
          <div class="metric-cell">
            <span class="metric-label">Helyes</span>
            <span class="metric-val is-correct">${correctCount} db</span>
          </div>
          <div class="metric-cell">
            <span class="metric-label">Hibás</span>
            <span class="metric-val is-wrong">${wrongCount} db</span>
          </div>
          <div class="metric-cell">
            <span class="metric-label">Eltelt idő</span>
            <span class="metric-val">${timeFormatted}</span>
          </div>
          <div class="metric-cell">
            <span class="metric-label">Max sorozat</span>
            <span class="metric-val">${state.maxStreak}x</span>
          </div>
        </div>

        <div class="results-actions">
          ${wrongCount > 0 ? `
            <button type="button" class="btn-primary btn-danger-solid" id="btn-retry-mistakes">
              ${ICONS.retry}
              <span>Hibásak újrázása (${wrongCount} db)</span>
            </button>
          ` : ''}

          <button type="button" class="btn-secondary" id="btn-results-home">
            ${ICONS.home}
            <span>Vissza a főmenübe</span>
          </button>
        </div>
      </section>

      <section>
        <div class="review-header">
          <h2 class="section-label">Részletes áttekintés</h2>
          <div class="filter-segmented">
            <button type="button" class="filter-btn ${state.resultsFilter === 'all' ? 'active' : ''}" data-filter="all">
              Mind (${total})
            </button>
            <button type="button" class="filter-btn ${state.resultsFilter === 'wrong' ? 'active' : ''}" data-filter="wrong">
              Hibás (${wrongCount})
            </button>
            <button type="button" class="filter-btn ${state.resultsFilter === 'correct' ? 'active' : ''}" data-filter="correct">
              Helyes (${correctCount})
            </button>
          </div>
        </div>

        <div class="review-list">
          ${filteredQuestions.length === 0 ? `
            <div class="review-item">
              <p style="color: var(--text-muted); font-size: 14px;">Nincs a szűrőnek megfelelő kérdés ebben a tesztben.</p>
            </div>
          ` : filteredQuestions.map(q => {
            const ans = state.userAnswers[q.id];
            const isCorrect = ans && ans.isCorrect;
            const userChoice = ans ? ans.answer : 'Nem válaszoltál';

            return `
              <article class="review-item ${isCorrect ? 'is-correct' : 'is-wrong'}">
                <div class="review-item-top">
                  <span class="review-status-pill ${isCorrect ? 'correct' : 'wrong'}">
                    ${isCorrect ? ICONS.check : ICONS.x}
                    <span>${isCorrect ? 'Helyes' : 'Hibás'}</span>
                  </span>
                  <span class="review-cat">${q.category} · <span class="tabular">#${q.id}</span></span>
                </div>

                <h3 class="review-q-text">${q.question}</h3>

                <div class="review-answers">
                  <div>
                    <span style="color: var(--text-muted);">Válaszod:</span>
                    <span style="font-weight: 600; color: ${isCorrect ? 'var(--correct-text)' : 'var(--wrong-text)'};">${userChoice}</span>
                  </div>
                  ${!isCorrect ? `
                    <div>
                      <span style="color: var(--text-muted);">Helyes válasz:</span>
                      <span style="font-weight: 600; color: var(--correct-text);">${q.correct_answer}</span>
                    </div>
                  ` : ''}
                </div>

                <div class="review-expl">
                  <div><strong>Magyarázat:</strong> ${q.explanation}</div>
                  ${q.image ? `
                    <button
                      type="button"
                      class="review-plate-btn"
                      data-img="${q.image}"
                      data-title="${encodeURIComponent(q.image_title || 'Anatómiai ábra')}"
                    >
                      <img src="${q.image}" alt="${q.image_title || 'Anatómiai ábra'}" class="review-plate-thumb" loading="lazy" />
                      <span>${q.image_title || 'Ábra megtekintése'}</span>
                      ${ICONS.zoom}
                    </button>
                  ` : ''}
                </div>
              </article>
            `;
          }).join('')}
        </div>
      </section>
    </div>
  `;
}

function bindResultsScreenEvents() {
  const retryMistakesBtn = document.getElementById('btn-retry-mistakes');
  if (retryMistakesBtn) {
    retryMistakesBtn.addEventListener('click', () => {
      sounds.playTap();
      const wrongQuestions = state.activeQuestions.filter(q => {
        const ans = state.userAnswers[q.id];
        return !ans || !ans.isCorrect;
      });

      state.activeQuestions = prepareQuizQuestions(wrongQuestions, false, true);
      state.currentIndex = 0;
      state.userAnswers = {};
      state.currentStreak = 0;
      state.maxStreak = 0;
      state.elapsedSeconds = 0;
      state.startTime = Date.now();
      state.currentScreen = 'quiz';
      startTimer();
      persistActiveSession();
      renderApp();
    });
  }

  const homeBtn = document.getElementById('btn-results-home');
  if (homeBtn) {
    homeBtn.addEventListener('click', () => {
      sounds.playTap();
      stopTimer();
      storage.clearActiveSession();
      state.currentScreen = 'home';
      renderApp();
    });
  }

  document.querySelectorAll('[data-filter]').forEach(btn => {
    btn.addEventListener('click', () => {
      sounds.playTap();
      state.resultsFilter = btn.getAttribute('data-filter');
      persistActiveSession();
      renderApp();
    });
  });

  document.querySelectorAll('.review-plate-btn').forEach(row => {
    row.addEventListener('click', () => {
      sounds.playTap();
      const src = row.getAttribute('data-img');
      const title = decodeURIComponent(row.getAttribute('data-title') || '');
      openDiagramLightbox(src, title);
    });
  });
}

/* ==========================================================================
   4. QUESTION NAVIGATOR MODAL
   ========================================================================== */
function renderQuestionGridModal() {
  let modal = document.getElementById('question-grid-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'question-grid-modal';
    modal.className = 'modal-overlay';
    document.body.appendChild(modal);
  }

  if (!state.isGridOpen) {
    modal.classList.remove('open');
    return;
  }

  modal.classList.add('open');

  const testObj = getTest(state.currentTestId);
  const questions = state.activeQuestions.length > 0 ? state.activeQuestions : testObj.questions;

  modal.innerHTML = `
    <div class="nav-sheet" id="sheet-content" role="dialog" aria-modal="true" aria-label="Kérdésválasztó">
      <div class="sheet-header">
        <div class="sheet-handle"></div>
        <div class="sheet-title-row">
          <div class="sheet-title">${testObj.shortTitle} · Kérdések (<span class="tabular">${questions.length}</span>)</div>
          <button type="button" class="icon-btn" id="btn-close-grid" aria-label="Bezárás">
            ${ICONS.x}
          </button>
        </div>
        <div class="sheet-legend">
          <span class="legend-item"><span class="legend-dot" style="background: var(--correct);"></span>Helyes</span>
          <span class="legend-item"><span class="legend-dot" style="background: var(--wrong);"></span>Hibás</span>
          <span class="legend-item"><span class="legend-dot" style="background: var(--accent);"></span>Jelenlegi</span>
          <span class="legend-item"><span class="legend-dot" style="background: var(--border-strong);"></span>Megválaszolatlan</span>
        </div>
      </div>

      <div class="sheet-grid-scroll">
        <div class="questions-grid">
          ${questions.map((q, idx) => {
            const isCurrent = state.currentScreen === 'quiz' && state.currentIndex === idx;
            const ans = state.userAnswers[q.id];
            const isBookmarked = storage.isBookmarked(q.id, state.currentTestId);

            let statusClass = '';
            if (isCurrent) statusClass = 'active-current';
            else if (ans) {
              statusClass = ans.isCorrect ? 'status-correct' : 'status-wrong';
            }

            const starClass = isBookmarked ? 'has-star' : '';

            return `
              <button type="button" class="grid-cell-btn ${statusClass} ${starClass}" data-jump="${idx}">
                ${idx + 1}
              </button>
            `;
          }).join('')}
        </div>
      </div>
    </div>
  `;

  modal.onclick = (e) => {
    if (e.target === modal || e.target.closest('#btn-close-grid')) {
      sounds.playTap();
      state.isGridOpen = false;
      modal.classList.remove('open');
    }
  };

  modal.querySelectorAll('[data-jump]').forEach(btn => {
    btn.addEventListener('click', () => {
      sounds.playTap();
      const jumpIdx = parseInt(btn.getAttribute('data-jump'), 10);
      state.currentIndex = jumpIdx;
      state.isGridOpen = false;
      modal.classList.remove('open');
      persistActiveSession();
      renderApp();
    });
  });
}

/* ==========================================================================
   Keyboard Accessibility & Navigation
   ========================================================================== */
function isAnyModalOpen() {
  const gridOpen = document.getElementById('question-grid-modal')?.classList.contains('open');
  const lightboxOpen = document.getElementById('diagram-lightbox-modal')?.classList.contains('open');
  const dialogOpen = document.getElementById('custom-dialog-overlay')?.classList.contains('open');
  return Boolean(gridOpen || lightboxOpen || dialogOpen);
}

function initKeyboardNav() {
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && state.isGridOpen) {
      state.isGridOpen = false;
      renderQuestionGridModal();
      return;
    }

    if (state.currentScreen !== 'quiz' || isAnyModalOpen()) return;
    if (e.metaKey || e.ctrlKey || e.altKey) return;

    const q = state.activeQuestions[state.currentIndex];
    if (!q) return;

    const key = e.key.toUpperCase();
    let optionIdx = -1;
    if (key === '1' || key === 'A') optionIdx = 0;
    if (key === '2' || key === 'B') optionIdx = 1;
    if (key === '3' || key === 'C') optionIdx = 2;
    if (key === '4' || key === 'D') optionIdx = 3;

    if (optionIdx >= 0 && optionIdx < q.answers.length) {
      const isAnswered = !!state.userAnswers[q.id];
      if (!isAnswered) {
        selectOption(q, q.answers[optionIdx]);
      }
      return;
    }

    if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowRight') {
      const isAnswered = !!state.userAnswers[q.id];
      if (isAnswered) {
        e.preventDefault();
        goToNextQuestion();
      }
      return;
    }

    if (e.key === 'ArrowLeft') {
      if (state.currentIndex > 0) {
        e.preventDefault();
        state.currentIndex--;
        persistActiveSession();
        renderApp();
      }
      return;
    }

    if (key === 'S') {
      storage.toggleBookmark(q.id, state.currentTestId);
      renderHeaderQuickIcons();
      return;
    }

    if (key === 'M') {
      sounds.toggleSound();
      renderHeaderQuickIcons();
    }
  });
}

/* ==========================================================================
   5. ANATOMICAL PLATE LIGHTBOX MODAL
   ========================================================================== */
function openDiagramLightbox(imageSrc, title) {
  let lightbox = document.getElementById('diagram-lightbox-modal');
  if (!lightbox) {
    lightbox = document.createElement('div');
    lightbox.id = 'diagram-lightbox-modal';
    lightbox.className = 'lightbox-overlay';
    document.body.appendChild(lightbox);
  }

  lightbox.innerHTML = `
    <div class="lightbox-dialog" role="dialog" aria-modal="true" aria-label="${title}">
      <header class="lightbox-header">
        <div class="lightbox-title-box">
          <span class="lightbox-badge">Anatómiai Tábla</span>
          <h3 class="lightbox-title">${title}</h3>
        </div>
        <button type="button" class="lightbox-close-btn" id="lightbox-close-btn" aria-label="Bezárás">
          ${ICONS.x}
        </button>
      </header>
      <div class="lightbox-body">
        <img src="${imageSrc}" alt="${title}" class="lightbox-img" />
      </div>
      <footer class="lightbox-footer">
        <span>Kattints a háttérre vagy nyomd meg az ESC gombot a bezáráshoz</span>
      </footer>
    </div>
  `;

  requestAnimationFrame(() => {
    lightbox.classList.add('open');
  });

  const closeLightbox = () => {
    sounds.playTap();
    lightbox.classList.remove('open');
    window.removeEventListener('keydown', handleKey);
  };

  const handleKey = (e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      closeLightbox();
    }
  };

  window.addEventListener('keydown', handleKey);

  const closeBtn = document.getElementById('lightbox-close-btn');
  if (closeBtn) closeBtn.onclick = closeLightbox;

  lightbox.onclick = (e) => {
    if (e.target === lightbox) closeLightbox();
  };
}
