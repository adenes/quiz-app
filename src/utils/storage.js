// LocalStorage State Manager

const KEYS = {
  BOOKMARKS: 'anatomy_quiz_bookmarks',
  WRONG_QUESTIONS: 'anatomy_quiz_wrong_questions',
  HISTORY: 'anatomy_quiz_history',
  SETTINGS: 'anatomy_quiz_settings',
  ACTIVE_SESSION: 'anatomy_quiz_active_session'
};

export const storage = {
  // Bookmarks
  getBookmarks() {
    try {
      return JSON.parse(localStorage.getItem(KEYS.BOOKMARKS)) || [];
    } catch {
      return [];
    }
  },

  isBookmarked(id) {
    const list = this.getBookmarks();
    return list.includes(id);
  },

  toggleBookmark(id) {
    let list = this.getBookmarks();
    if (list.includes(id)) {
      list = list.filter(item => item !== id);
    } else {
      list.push(id);
    }
    localStorage.setItem(KEYS.BOOKMARKS, JSON.stringify(list));
    return list.includes(id);
  },

  // Wrong Questions (Mistakes tracker)
  getWrongQuestions() {
    try {
      return JSON.parse(localStorage.getItem(KEYS.WRONG_QUESTIONS)) || [];
    } catch {
      return [];
    }
  },

  recordAnswerResult(id, isCorrect) {
    let wrongList = this.getWrongQuestions();
    if (isCorrect) {
      // Remove from wrong list if user got it right
      wrongList = wrongList.filter(item => item !== id);
    } else {
      // Add to wrong list if not already there
      if (!wrongList.includes(id)) {
        wrongList.push(id);
      }
    }
    localStorage.setItem(KEYS.WRONG_QUESTIONS, JSON.stringify(wrongList));
  },

  clearWrongQuestions() {
    localStorage.setItem(KEYS.WRONG_QUESTIONS, JSON.stringify([]));
  },

  // Quiz History
  getHistory() {
    try {
      return JSON.parse(localStorage.getItem(KEYS.HISTORY)) || [];
    } catch {
      return [];
    }
  },

  saveQuizResult(result) {
    const history = this.getHistory();
    const entry = {
      id: Date.now(),
      date: new Date().toISOString(),
      ...result
    };
    history.unshift(entry);
    // Keep last 30 tests
    if (history.length > 30) history.pop();
    localStorage.setItem(KEYS.HISTORY, JSON.stringify(history));
    return entry;
  },

  // Settings
  getSettings() {
    const defaults = {
      theme: 'dark',
      mobileFrameOnDesktop: true,
      shuffleQuestions: true,
      shuffleOptions: true,
      instantFeedback: true
    };
    try {
      const stored = JSON.parse(localStorage.getItem(KEYS.SETTINGS));
      return { ...defaults, ...stored };
    } catch {
      return defaults;
    }
  },

  updateSettings(newSettings) {
    const current = this.getSettings();
    const merged = { ...current, ...newSettings };
    localStorage.setItem(KEYS.SETTINGS, JSON.stringify(merged));
    return merged;
  },

  // Active Session Persistence
  saveActiveSession(sessionData) {
    try {
      localStorage.setItem(KEYS.ACTIVE_SESSION, JSON.stringify(sessionData));
    } catch {
      // ignore
    }
  },

  getActiveSession() {
    try {
      const data = localStorage.getItem(KEYS.ACTIVE_SESSION);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  clearActiveSession() {
    try {
      localStorage.removeItem(KEYS.ACTIVE_SESSION);
    } catch {
      // ignore
    }
  }
};
