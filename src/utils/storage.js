// LocalStorage State Manager with Multi-Test Support

const KEYS = {
  BOOKMARKS_PREFIX: 'quiz_bookmarks_',
  WRONG_PREFIX: 'quiz_wrong_questions_',
  LEGACY_BOOKMARKS: 'anatomy_quiz_bookmarks',
  LEGACY_WRONG: 'anatomy_quiz_wrong_questions',
  HISTORY: 'anatomy_quiz_history',
  SETTINGS: 'anatomy_quiz_settings',
  ACTIVE_SESSION: 'anatomy_quiz_active_session'
};

function getBookmarkKey(testId = 'anatomia') {
  return `${KEYS.BOOKMARKS_PREFIX}${testId}`;
}

function getWrongKey(testId = 'anatomia') {
  return `${KEYS.WRONG_PREFIX}${testId}`;
}

export const storage = {
  // Bookmarks
  getBookmarks(testId = 'anatomia') {
    try {
      const key = getBookmarkKey(testId);
      const data = localStorage.getItem(key);
      if (data) return JSON.parse(data);

      // Fallback to legacy key for anatomia
      if (testId === 'anatomia') {
        const legacy = localStorage.getItem(KEYS.LEGACY_BOOKMARKS);
        if (legacy) return JSON.parse(legacy);
      }
      return [];
    } catch {
      return [];
    }
  },

  isBookmarked(id, testId = 'anatomia') {
    const list = this.getBookmarks(testId);
    return list.includes(id);
  },

  toggleBookmark(id, testId = 'anatomia') {
    let list = this.getBookmarks(testId);
    if (list.includes(id)) {
      list = list.filter(item => item !== id);
    } else {
      list.push(id);
    }
    const key = getBookmarkKey(testId);
    localStorage.setItem(key, JSON.stringify(list));
    return list.includes(id);
  },

  // Wrong Questions (Mistakes tracker)
  getWrongQuestions(testId = 'anatomia') {
    try {
      const key = getWrongKey(testId);
      const data = localStorage.getItem(key);
      if (data) return JSON.parse(data);

      // Fallback to legacy key for anatomia
      if (testId === 'anatomia') {
        const legacy = localStorage.getItem(KEYS.LEGACY_WRONG);
        if (legacy) return JSON.parse(legacy);
      }
      return [];
    } catch {
      return [];
    }
  },

  recordAnswerResult(id, isCorrect, testId = 'anatomia') {
    let wrongList = this.getWrongQuestions(testId);
    if (isCorrect) {
      wrongList = wrongList.filter(item => item !== id);
    } else {
      if (!wrongList.includes(id)) {
        wrongList.push(id);
      }
    }
    const key = getWrongKey(testId);
    localStorage.setItem(key, JSON.stringify(wrongList));
  },

  clearWrongQuestions(testId = 'anatomia') {
    const key = getWrongKey(testId);
    localStorage.setItem(key, JSON.stringify([]));
  },

  // Quiz History
  getHistory(testId = null) {
    try {
      const all = JSON.parse(localStorage.getItem(KEYS.HISTORY)) || [];
      if (!testId) return all;
      return all.filter(item => (item.testId || 'anatomia') === testId);
    } catch {
      return [];
    }
  },

  saveQuizResult(result) {
    const history = this.getHistory();
    const entry = {
      id: Date.now(),
      date: new Date().toISOString(),
      testId: result.testId || 'anatomia',
      ...result
    };
    history.unshift(entry);
    // Keep last 40 tests
    if (history.length > 40) history.pop();
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
      instantFeedback: true,
      selectedTestId: 'anatomia'
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
