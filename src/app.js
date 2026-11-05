import {
  quizTitle,
  allQuestions,
  categories,
  getQuestionsByCategory,
  prepareQuizQuestions,
  shuffleArray
} from './data/questions.js';
import { sounds } from './utils/audio.js';
import { storage } from './utils/storage.js';
import { triggerConfetti } from './utils/confetti.js';
import { dialog } from './utils/dialog.js';

// Global Application State
const initialSettings = storage.getSettings();

const state = {
  currentScreen: 'home', // 'home' | 'quiz' | 'results'
  quizMode: 'practice', // 'practice' | 'mistakes' | 'bookmarks'
  selectedCategory: 'Összes témakör',
  questionCount: 20, // 10, 20, 50, 100
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
    state.currentScreen = session.currentScreen || 'quiz';
    state.quizMode = session.quizMode || 'practice';
    state.selectedCategory = session.selectedCategory || 'Összes témakör';
    state.questionCount = session.questionCount || session.activeQuestions.length;
    state.activeQuestions = session.activeQuestions;
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

function startTimer() {
  if (state.timerInterval) clearInterval(state.timerInterval);
  state.timerInterval = setInterval(() => {
    state.elapsedSeconds++;
    const timerDisplay = document.getElementById('quiz-timer-display');
    if (timerDisplay) {
      const mins = String(Math.floor(state.elapsedSeconds / 60)).padStart(2, '0');
      const secs = String(state.elapsedSeconds % 60).padStart(2, '0');
      timerDisplay.textContent = `${mins}:${secs}`;
    }
  }, 1000);
}

function stopTimer() {
  if (state.timerInterval) {
    clearInterval(state.timerInterval);
    state.timerInterval = null;
  }
}

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
  restoreActiveSessionIfExists();
  initThemeAndLayout();
  initDesktopToolbar();
  initClockSimulation();
  renderApp();
  initKeyboardNav();
  window.addEventListener('beforeunload', () => {
    persistActiveSession();
  });
});

// Setup Theme & Device Frame
function initThemeAndLayout() {
  document.documentElement.setAttribute('data-theme', state.settings.theme);
  const container = document.getElementById('device-container');
  if (container) {
    if (state.settings.mobileFrameOnDesktop) {
      container.classList.remove('mode-fullscreen');
    } else {
      container.classList.add('mode-fullscreen');
    }
  }
}

// Simulated Phone Clock (Update every minute)
function initClockSimulation() {
  const clockEl = document.getElementById('phone-clock');
  const updateTime = () => {
    if (!clockEl) return;
    const now = new Date();
    const hrs = String(now.getHours()).padStart(2, '0');
    const mins = String(now.getMinutes()).padStart(2, '0');
    clockEl.textContent = `${hrs}:${mins}`;
  };
  updateTime();
  setInterval(updateTime, 10000);
}

// Desktop Toolbar Controls
function initDesktopToolbar() {
  const frameBtn = document.getElementById('btn-toggle-frame');
  const themeBtn = document.getElementById('btn-toggle-theme');
  const soundBtn = document.getElementById('btn-toggle-sound');

  if (frameBtn) {
    frameBtn.addEventListener('click', () => {
      sounds.playTap();
      const current = state.settings.mobileFrameOnDesktop;
      state.settings = storage.updateSettings({ mobileFrameOnDesktop: !current });
      const container = document.getElementById('device-container');
      if (container) {
        container.classList.toggle('mode-fullscreen', !state.settings.mobileFrameOnDesktop);
      }
      frameBtn.textContent = state.settings.mobileFrameOnDesktop ? '📱 Mobil Keret' : '🖥️ Teljes Nézet';
    });
  }

  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      sounds.playTap();
      const newTheme = state.settings.theme === 'dark' ? 'light' : 'dark';
      state.settings = storage.updateSettings({ theme: newTheme });
      document.documentElement.setAttribute('data-theme', newTheme);
      themeBtn.textContent = newTheme === 'dark' ? '🌙 Sötét Mód' : '☀️ Világos Mód';
    });
  }

  if (soundBtn) {
    soundBtn.addEventListener('click', () => {
      const enabled = sounds.toggleSound();
      soundBtn.textContent = enabled ? '🔊 Hang: Be' : '🔇 Hang: Ki';
      renderHeaderQuickIcons();
    });
  }
}

// Master Render Router
function renderApp() {
  const root = document.getElementById('mobile-app-root');
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

  // Render or update question grid drawer modal
  renderQuestionGridModal();
}

// Update Header Icons (Sound, Bookmark)
function renderHeaderQuickIcons() {
  const soundBtn = document.getElementById('hdr-sound-btn');
  if (soundBtn) {
    soundBtn.classList.toggle('active', sounds.isSoundEnabled());
    soundBtn.title = sounds.isSoundEnabled() ? 'Hang némítása' : 'Hang bekapcsolása';
  }

  const currentQ = state.activeQuestions[state.currentIndex];
  const starBtn = document.getElementById('hdr-star-btn');
  if (starBtn && currentQ) {
    const isBookmarked = storage.isBookmarked(currentQ.id);
    starBtn.classList.toggle('bookmarked', isBookmarked);
  }
}

/* ==========================================================================
   1. HOME SCREEN
   ========================================================================== */
function getHomeScreenHTML() {
  const wrongCount = storage.getWrongQuestions().length;
  const bookmarksCount = storage.getBookmarks().length;
  const history = storage.getHistory();
  const lastScore = history.length > 0 ? `${history[0].percentage}%` : 'N/A';

  return `
    <div class="home-screen">
      <!-- Hero -->
      <div class="home-hero">
        <div class="hero-icon-box">
          <svg viewBox="0 0 24 24" width="34" height="34" fill="none" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </div>
        <h1>Quiz App</h1>
        <p>Anatómia & Élettan – 100 Kérdéses Gyakorló & Vizsgafelkészítő Rendszer</p>
      </div>

      <!-- Quick Stats Banner -->
      <div class="stats-banner">
        <div class="stat-item">
          <span class="stat-value">100</span>
          <span class="stat-label">Összes kérdés</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">${lastScore}</span>
          <span class="stat-label">Legutóbbi eredmény</span>
        </div>
        <div class="stat-item">
          <span class="stat-value" style="color: ${wrongCount > 0 ? '#f43f5e' : 'inherit'};">${wrongCount}</span>
          <span class="stat-label">Gyenge pont</span>
        </div>
      </div>

      <!-- Mode Selection -->
      <div>
        <div class="section-title">Válassz Üzemmódot</div>
        <div class="mode-grid">
          <!-- Practice Mode -->
          <div class="mode-card ${state.quizMode === 'practice' ? 'selected' : ''}" data-mode="practice">
            <div class="mode-icon" style="background: rgba(14, 165, 233, 0.15); color: #0284c7;">
              🎓
            </div>
            <div class="mode-info">
              <h3>Gyakorló Mód</h3>
              <p>Azonnali magyarázatok és tanácsok minden válasz után</p>
            </div>
            <div class="mode-badge">Ajánlott</div>
          </div>

          <!-- Mistakes / Weak Points -->
          <div class="mode-card ${state.quizMode === 'mistakes' ? 'selected' : ''}" data-mode="mistakes">
            <div class="mode-icon" style="background: rgba(244, 63, 94, 0.15); color: #f43f5e;">
              🎯
            </div>
            <div class="mode-info">
              <h3>Tévesztett Kérdések</h3>
              <p>${wrongCount > 0 ? `${wrongCount} hibás kérdés vár javításra` : 'Nincs elmentett hiba, szép munka!'}</p>
            </div>
            <div class="mode-badge" style="color: #f43f5e;">${wrongCount} db</div>
          </div>

          <!-- Bookmarked Questions -->
          <div class="mode-card ${state.quizMode === 'bookmarks' ? 'selected' : ''}" data-mode="bookmarks">
            <div class="mode-icon" style="background: rgba(245, 158, 11, 0.15); color: #f59e0b;">
              ⭐
            </div>
            <div class="mode-info">
              <h3>Csillagozott Kérdések</h3>
              <p>A saját magad által elmentett nehéz kérdések</p>
            </div>
            <div class="mode-badge" style="color: #f59e0b;">${bookmarksCount} db</div>
          </div>
        </div>
      </div>

      <!-- Categories Selector (Visible when Practice mode) -->
      ${state.quizMode === 'practice' ? `
        <div>
          <div class="section-title">Témakör / Fejezet</div>
          <div class="category-chips-scroll">
            ${categories.map(cat => `
              <button class="category-chip-btn ${state.selectedCategory === cat ? 'active' : ''}" data-cat="${cat}">
                ${cat}
              </button>
            `).join('')}
          </div>
        </div>
      ` : ''}

      <!-- Settings & Question Count -->
      <div class="settings-box">
        <div class="setting-row">
          <div>
            <div class="setting-label">Kérdések száma</div>
            <div class="setting-desc">Hány kérdést szeretnél megoldani?</div>
          </div>
        </div>
        <div class="count-chips">
          ${[10, 20, 50, 100].map(cnt => `
            <button class="count-chip ${state.questionCount === cnt ? 'active' : ''}" data-count="${cnt}">
              ${cnt === 100 ? 'Mind (100)' : `${cnt} db`}
            </button>
          `).join('')}
        </div>

        <div class="setting-row" style="margin-top: 6px;">
          <div>
            <div class="setting-label">Kérdések keverése</div>
            <div class="setting-desc">Véletlenszerű sorrend minden tesztben</div>
          </div>
          <label class="switch">
            <input type="checkbox" id="chk-shuffle-questions" ${state.shuffleQuestions ? 'checked' : ''}>
            <span class="slider"></span>
          </label>
        </div>

        <div class="setting-row">
          <div>
            <div class="setting-label">Válaszlehetőségek keverése</div>
            <div class="setting-desc">Ne tanulhasd be pozíció alapján</div>
          </div>
          <label class="switch">
            <input type="checkbox" id="chk-shuffle-options" ${state.shuffleOptions ? 'checked' : ''}>
            <span class="slider"></span>
          </label>
        </div>
      </div>

      <!-- Start Quiz CTA Button -->
      <button class="btn-primary" id="btn-start-quiz">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
          <path d="M8 5v14l11-7z"/>
        </svg>
        Teszt Indítása
      </button>
    </div>
  `;
}

function bindHomeScreenEvents() {
  // Mode selection cards
  document.querySelectorAll('.mode-card').forEach(card => {
    card.addEventListener('click', () => {
      sounds.playTap();
      const mode = card.getAttribute('data-mode');
      state.quizMode = mode;
      renderApp();
    });
  });

  // Category chip buttons
  document.querySelectorAll('.category-chip-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      sounds.playTap();
      state.selectedCategory = btn.getAttribute('data-cat');
      document.querySelectorAll('.category-chip-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  // Count selector chips
  document.querySelectorAll('.count-chip').forEach(btn => {
    btn.addEventListener('click', () => {
      sounds.playTap();
      state.questionCount = parseInt(btn.getAttribute('data-count'), 10);
      document.querySelectorAll('.count-chip').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
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
  let pool = [];

  if (state.quizMode === 'mistakes') {
    const wrongIds = storage.getWrongQuestions();
    pool = allQuestions.filter(q => wrongIds.includes(q.id));
    if (pool.length === 0) {
      dialog.alert({
        title: 'Nincsenek hibás kérdések',
        message: 'Jelenleg nincs rögzített hibás kérdésed! Gyakorolj a többi témakörrel.',
        confirmText: 'Rendben',
        type: 'info'
      });
      return;
    }
  } else if (state.quizMode === 'bookmarks') {
    const starIds = storage.getBookmarks();
    pool = allQuestions.filter(q => starIds.includes(q.id));
    if (pool.length === 0) {
      dialog.alert({
        title: 'Nincsenek csillagozott kérdések',
        message: 'Még nem mentettél el kérdéseket! A kvíz során a jobb felső csillag ikonnal jelölhetsz meg kérdéseket.',
        confirmText: 'Rendben',
        type: 'warning'
      });
      return;
    }
  } else {
    pool = getQuestionsByCategory(state.selectedCategory);
  }

  // Prepare with shuffling
  let questions = prepareQuizQuestions(pool, state.shuffleQuestions, state.shuffleOptions);

  // Limit count
  const limit = Math.min(state.questionCount, questions.length);
  state.activeQuestions = questions.slice(0, limit);
  state.currentIndex = 0;
  state.userAnswers = {};
  state.currentStreak = 0;
  state.maxStreak = 0;
  state.elapsedSeconds = 0;
  state.startTime = Date.now();

  // Start timer & persist
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
  if (!q) return '<div class="quiz-screen-content">Nincs kérdés</div>';

  const total = state.activeQuestions.length;
  const currentNum = state.currentIndex + 1;
  const progressPercent = Math.round((currentNum / total) * 100);

  const answeredInfo = state.userAnswers[q.id];
  const isAnswered = !!answeredInfo;
  const isBookmarked = storage.isBookmarked(q.id);

  // Sound active class
  const soundActive = sounds.isSoundEnabled();

  const mins = String(Math.floor(state.elapsedSeconds / 60)).padStart(2, '0');
  const secs = String(state.elapsedSeconds % 60).padStart(2, '0');

  return `
    <div class="quiz-view-wrapper">
      <!-- Top Sticky Header -->
      <header class="app-header">
      <div class="header-left">
        <button class="icon-btn" id="hdr-back-btn" title="Vissza a főmenübe">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/>
          </svg>
        </button>
        <button class="icon-btn" id="hdr-grid-btn" title="Kérdésválasztó táblázat">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="7" height="7" rx="1.5"/>
            <rect x="14" y="3" width="7" height="7" rx="1.5"/>
            <rect x="14" y="14" width="7" height="7" rx="1.5"/>
            <rect x="3" y="14" width="7" height="7" rx="1.5"/>
          </svg>
        </button>
      </div>

      <div class="header-title">
        ${currentNum} / ${total}
      </div>

      <div class="header-right">
        <button class="icon-btn ${isBookmarked ? 'bookmarked' : ''}" id="hdr-star-btn" title="Csillagozás">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="${isBookmarked ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
          </svg>
        </button>

        <button class="icon-btn ${soundActive ? 'active' : ''}" id="hdr-sound-btn" title="Hang">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
          </svg>
        </button>
      </div>
    </header>

    <!-- Progress & Streak Bar -->
    <div class="progress-container">
      <div class="progress-header">
        <span>${currentNum}. kérdés a(z) ${total}-ból</span>
        ${state.currentStreak >= 2 ? `
          <div class="streak-badge">
            🔥 ${state.currentStreak}x Sorozat
          </div>
        ` : `<span>${progressPercent}%</span>`}
      </div>
      <div class="progress-bar-track">
        <div class="progress-bar-fill" style="width: ${progressPercent}%;"></div>
      </div>
    </div>

    <!-- Question & Options Area -->
    <div class="quiz-screen-content">
      <div class="question-meta">
        <span class="category-chip">
          <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
          </svg>
          ${q.category || 'Anatómia'}
        </span>
        <span style="font-size: 12px; color: var(--text-dim); font-weight: 600;">ID #${q.id}</span>
      </div>

      <!-- Question Card -->
      <div class="question-card">
        <div class="question-text">${q.question}</div>
      </div>

      <!-- Options List -->
      <div class="options-list">
        ${q.answers.map((answerText, idx) => {
          const letter = String.fromCharCode(65 + idx); // A, B, C, D
          let stateClass = '';

          if (isAnswered) {
            const isUserSelected = answeredInfo.answer === answerText;
            const isCorrectAnswer = answerText === q.correct_answer;

            if (isCorrectAnswer) {
              stateClass = 'correct';
            } else if (isUserSelected && !answeredInfo.isCorrect) {
              stateClass = 'wrong';
            } else {
              stateClass = 'dimmed';
            }
          }

          return `
            <button class="option-btn ${stateClass}" data-answer="${encodeURIComponent(answerText)}" data-idx="${idx}">
              <div class="option-letter">${letter}</div>
              <div class="option-text">${answerText}</div>
              <svg class="option-status-icon" viewBox="0 0 24 24" fill="currentColor">
                ${answerText === q.correct_answer ? `
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                ` : `
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                `}
              </svg>
            </button>
          `;
        }).join('')}
      </div>

      <!-- Explanation Panel (Visible once answered) -->
      ${isAnswered ? `
        <div class="explanation-card">
          <svg class="explanation-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          <div class="explanation-content">
            <h4>Anatómiai Magyarázat</h4>
            <p>${q.explanation}</p>
          </div>
        </div>
      ` : ''}
    </div>

      <!-- Sticky Bottom Action Bar -->
      <div class="bottom-action-bar">
        ${state.currentIndex > 0 ? `
          <button class="btn-secondary" id="btn-prev-question" title="Előző kérdés">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/>
            </svg>
          </button>
        ` : ''}

        ${isAnswered ? `
          <button class="btn-primary" id="btn-next-question">
            <span>${currentNum === total ? 'Kvíz Befejezése' : 'Következő Kérdés'}</span>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/>
            </svg>
          </button>
        ` : `
          <button class="btn-primary" disabled style="opacity: 0.6;">
            <span>Válassz egy választ</span>
          </button>
        `}
      </div>
    </div>
  `;
}

function bindQuizScreenEvents() {
  const q = state.activeQuestions[state.currentIndex];
  if (!q) return;

  // Header Back Button
  const backBtn = document.getElementById('hdr-back-btn');
  if (backBtn) {
    backBtn.addEventListener('click', async () => {
      const confirmed = await dialog.confirm({
        title: 'Teszt megszakítása',
        message: 'Biztosan vissza szeretnél térni a főmenübe? A teszt jelenlegi haladása elvész.',
        confirmText: 'Igen, kilépek',
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

  // Header Grid Navigator Button
  const gridBtn = document.getElementById('hdr-grid-btn');
  if (gridBtn) {
    gridBtn.addEventListener('click', () => {
      sounds.playTap();
      state.isGridOpen = true;
      renderQuestionGridModal();
    });
  }

  // Header Star/Bookmark Button
  const starBtn = document.getElementById('hdr-star-btn');
  if (starBtn) {
    starBtn.addEventListener('click', () => {
      sounds.playTap();
      const isNowStarred = storage.toggleBookmark(q.id);
      starBtn.classList.toggle('bookmarked', isNowStarred);
      if (isNowStarred) {
        sounds.playStreak();
      }
    });
  }

  // Header Sound Button
  const soundBtn = document.getElementById('hdr-sound-btn');
  if (soundBtn) {
    soundBtn.addEventListener('click', () => {
      const enabled = sounds.toggleSound();
      soundBtn.classList.toggle('active', enabled);
    });
  }

  // Option buttons
  const isAnswered = !!state.userAnswers[q.id];
  document.querySelectorAll('.option-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      // If already answered, ignore clicks
      if (isAnswered) return;

      const rawAnswer = btn.getAttribute('data-answer');
      const selectedAnswer = decodeURIComponent(rawAnswer);
      selectOption(q, selectedAnswer);
    });
  });

  // Next Question Button
  const nextBtn = document.getElementById('btn-next-question');
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      sounds.playTap();
      goToNextQuestion();
    });
  }

  // Prev Question Button
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
}

// Option selection handler
function selectOption(question, answerText) {
  const isCorrect = answerText === question.correct_answer;

  // Record Answer
  state.userAnswers[question.id] = {
    answer: answerText,
    isCorrect: isCorrect
  };

  // Update Mistake Tracker in Storage
  storage.recordAnswerResult(question.id, isCorrect);

  // Audio & Streak feedback
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
    // Gentle vibration on supported mobile devices
    if ('vibrate' in navigator) navigator.vibrate([25]);
  } else {
    state.currentStreak = 0;
    sounds.playIncorrect();
    if ('vibrate' in navigator) navigator.vibrate([60, 40, 60]);
  }

  // Re-render and persist
  persistActiveSession();
  renderApp();

  // Smoothly scroll the explanation into view so it is fully visible immediately
  setTimeout(() => {
    const expl = document.querySelector('.explanation-card');
    if (expl) {
      expl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, 60);
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

// Finish & Evaluate Quiz
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

  // Save to history
  storage.saveQuizResult({
    mode: state.quizMode,
    category: state.selectedCategory,
    total: total,
    correct: correctCount,
    wrong: wrongCount,
    percentage: percentage,
    durationSeconds: state.elapsedSeconds,
    maxStreak: state.maxStreak
  });

  // Confetti & Celebration Sound on high scores
  if (percentage >= 70) {
    sounds.playFanfare();
    setTimeout(triggerConfetti, 250);
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

  // Verdict text
  let verdictTitle = '';
  let verdictDesc = '';
  if (percentage >= 90) {
    verdictTitle = '🏆 Kiváló Eredmény!';
    verdictDesc = 'Fantasztikus tudás! Készen állsz a legnehezebb anatómia vizsgára is!';
  } else if (percentage >= 75) {
    verdictTitle = '🎉 Sikeres Vizsga!';
    verdictDesc = 'Nagyszerű felkészültség! Néhány apró részletet még csiszolj.';
  } else if (percentage >= 50) {
    verdictTitle = '👍 Jó Próbálkozás!';
    verdictDesc = 'Az alapok megvannak, de érdemes átismételned a tévesztett kérdéseket.';
  } else {
    verdictTitle = '💪 Gyakorolj Még!';
    verdictDesc = 'Az anatómia komoly precizitást igényel. Ismételd át a fejezeteket!';
  }

  const mins = Math.floor(state.elapsedSeconds / 60);
  const secs = state.elapsedSeconds % 60;
  const timeFormatted = mins > 0 ? `${mins} perc ${secs} mp` : `${secs} másodperc`;

  // SVG Circle calculation
  const radius = 65;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (circumference * percentage) / 100;

  // Filtered review questions
  const filteredQuestions = state.activeQuestions.filter(q => {
    const ans = state.userAnswers[q.id];
    const isCorr = ans && ans.isCorrect;
    if (state.resultsFilter === 'wrong') return !isCorr;
    if (state.resultsFilter === 'correct') return isCorr;
    return true;
  });

  return `
    <div class="results-screen">
      <!-- Animated Circular Score -->
      <div class="score-circle-wrapper">
        <svg class="score-circle-svg" viewBox="0 0 160 160">
          <circle class="score-circle-bg" cx="80" cy="80" r="${radius}" />
          <circle class="score-circle-progress" cx="80" cy="80" r="${radius}"
                  style="stroke-dasharray: ${circumference}; stroke-dashoffset: ${strokeDashoffset};
                         stroke: ${percentage >= 75 ? 'var(--correct)' : percentage >= 50 ? 'var(--warning)' : 'var(--wrong)'};" />
        </svg>
        <div class="score-circle-text">
          <div class="score-percent">${percentage}%</div>
          <div class="score-ratio">${correctCount} / ${total} helyes</div>
        </div>
      </div>

      <!-- Verdict Banner -->
      <div class="results-verdict">
        <h2>${verdictTitle}</h2>
        <p>${verdictDesc}</p>
      </div>

      <!-- Stats Tiles -->
      <div class="results-stats-grid">
        <div class="results-stat-card">
          <div class="stat-icon-title">
            <span style="color: var(--correct);">✓</span> Helyes válaszok
          </div>
          <div class="val" style="color: var(--correct);">${correctCount} db</div>
        </div>

        <div class="results-stat-card">
          <div class="stat-icon-title">
            <span style="color: var(--wrong);">✗</span> Hibás válaszok
          </div>
          <div class="val" style="color: var(--wrong);">${wrongCount} db</div>
        </div>

        <div class="results-stat-card">
          <div class="stat-icon-title">
            ⏱️ Eltelt idő
          </div>
          <div class="val" style="font-size: 16px;">${timeFormatted}</div>
        </div>

        <div class="results-stat-card">
          <div class="stat-icon-title">
            🔥 Max Sorozat
          </div>
          <div class="val" style="color: #f59e0b;">${state.maxStreak} db</div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div style="width: 100%; display: flex; flex-direction: column; gap: 10px;">
        ${wrongCount > 0 ? `
          <button class="btn-primary" id="btn-retry-mistakes" style="background: linear-gradient(135deg, #f43f5e 0%, #e11d48 100%);">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Csak a hibásak újrázása (${wrongCount} db)
          </button>
        ` : ''}

        <button class="btn-secondary" id="btn-results-home" style="width: 100%; height: 50px;">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
          </svg>
          Vissza a Főmenübe
        </button>
      </div>

      <!-- Detailed Review List -->
      <div style="width: 100%; margin-top: 14px;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
          <div class="section-title" style="margin: 0;">Részletes Áttekintés</div>
          <div style="display: flex; gap: 6px;">
            <button class="count-chip ${state.resultsFilter === 'all' ? 'active' : ''}" data-filter="all" style="padding: 4px 10px;">Mind</button>
            <button class="count-chip ${state.resultsFilter === 'wrong' ? 'active' : ''}" data-filter="wrong" style="padding: 4px 10px;">Csak hibás</button>
            <button class="count-chip ${state.resultsFilter === 'correct' ? 'active' : ''}" data-filter="correct" style="padding: 4px 10px;">Csak helyes</button>
          </div>
        </div>

        <div class="review-list-container">
          ${filteredQuestions.map((q, idx) => {
            const ans = state.userAnswers[q.id];
            const isCorrect = ans && ans.isCorrect;
            const userChoice = ans ? ans.answer : 'Nem válaszoltál';

            return `
              <div class="review-card ${isCorrect ? 'correct-review' : 'wrong-review'}">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <span style="font-size: 11px; font-weight: 700; color: ${isCorrect ? 'var(--correct)' : 'var(--wrong)'};">
                    ${isCorrect ? '✓ Helyes' : '✗ Hibás'}
                  </span>
                  <span style="font-size: 11px; color: var(--text-dim);">${q.category}</span>
                </div>
                <div class="review-question">${q.id}. ${q.question}</div>
                <div class="review-answer-row">
                  <div><strong>Válaszod:</strong> <span style="color: ${isCorrect ? 'var(--correct)' : 'var(--wrong)'};">${userChoice}</span></div>
                  ${!isCorrect ? `<div><strong>Helyes válasz:</strong> <span style="color: var(--correct); font-weight: 600;">${q.correct_answer}</span></div>` : ''}
                </div>
                <div class="review-explanation">
                  💡 <strong>Magyarázat:</strong> ${q.explanation}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    </div>
  `;
}

function bindResultsScreenEvents() {
  // Retry only mistakes
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

  // Home Button
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

  // Review Filter Chips
  document.querySelectorAll('[data-filter]').forEach(btn => {
    btn.addEventListener('click', () => {
      sounds.playTap();
      state.resultsFilter = btn.getAttribute('data-filter');
      persistActiveSession();
      renderApp();
    });
  });
}

/* ==========================================================================
   4. QUESTION GRID MODAL (1-100 Question Navigator)
   ========================================================================== */
function renderQuestionGridModal() {
  let modal = document.getElementById('question-grid-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'question-grid-modal';
    modal.className = 'modal-overlay';
    document.getElementById('device-container').appendChild(modal);
  }

  if (!state.isGridOpen) {
    modal.classList.remove('open');
    return;
  }

  modal.classList.add('open');

  const questions = state.activeQuestions.length > 0 ? state.activeQuestions : allQuestions;

  modal.innerHTML = `
    <div class="bottom-sheet" id="sheet-content">
      <div class="sheet-header">
        <div class="sheet-handle"></div>
        <div class="sheet-title-row">
          <div class="sheet-title">Kérdésválasztó Rács (${questions.length} db)</div>
          <button class="icon-btn" id="btn-close-grid" style="width: 32px; height: 32px;">✕</button>
        </div>
        <div class="sheet-legend">
          <span><span class="legend-dot" style="background: var(--correct);"></span>Helyes</span>
          <span><span class="legend-dot" style="background: var(--wrong);"></span>Hibás</span>
          <span><span class="legend-dot" style="background: var(--primary-light);"></span>Jelenlegi</span>
          <span><span class="legend-dot" style="background: var(--border-card);"></span>Megválaszolatlan</span>
        </div>
      </div>

      <div class="sheet-grid-scroll">
        <div class="questions-grid">
          ${questions.map((q, idx) => {
            const isCurrent = state.currentScreen === 'quiz' && state.currentIndex === idx;
            const ans = state.userAnswers[q.id];
            const isBookmarked = storage.isBookmarked(q.id);

            let statusClass = '';
            if (isCurrent) statusClass = 'active-current';
            else if (ans) {
              statusClass = ans.isCorrect ? 'status-correct' : 'status-wrong';
            }

            const starClass = isBookmarked ? 'has-star' : '';

            return `
              <button class="grid-cell-btn ${statusClass} ${starClass}" data-jump="${idx}">
                ${idx + 1}
              </button>
            `;
          }).join('')}
        </div>
      </div>
    </div>
  `;

  // Bind close
  modal.onclick = (e) => {
    if (e.target === modal || e.target.id === 'btn-close-grid') {
      sounds.playTap();
      state.isGridOpen = false;
      modal.classList.remove('open');
    }
  };

  // Bind cell jumps
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
function initKeyboardNav() {
  window.addEventListener('keydown', (e) => {
    if (state.currentScreen !== 'quiz') return;
    const q = state.activeQuestions[state.currentIndex];
    if (!q) return;

    // Keys 1, 2, 3, 4 or A, B, C, D
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
    }

    // Space / Enter or Right Arrow for Next
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowRight') {
      const isAnswered = !!state.userAnswers[q.id];
      if (isAnswered) {
        e.preventDefault();
        goToNextQuestion();
      }
    }

    // Left Arrow for Prev
    if (e.key === 'ArrowLeft') {
      if (state.currentIndex > 0) {
        e.preventDefault();
        state.currentIndex--;
        persistActiveSession();
        renderApp();
      }
    }

    // Key 'S' for Star / Bookmark
    if (key === 'S') {
      storage.toggleBookmark(q.id);
      renderApp();
    }

    // Key 'M' for Mute
    if (key === 'M') {
      sounds.toggleSound();
      renderHeaderQuickIcons();
    }
  });
}
