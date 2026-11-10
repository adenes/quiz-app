import anatomiaData from './anatomia.json';
import gerinctreningData from './gerinctrening.json';

// Test Configurations
export const TESTS = {
  anatomia: {
    id: 'anatomia',
    title: 'Anatómia és Élettan',
    shortTitle: 'Anatómia',
    badge: '100 kérdés',
    description: '100 kérdés, 11 témakör, Latin & Magyar orvosi terminológia',
    icon: '🫀',
    totalQuestions: anatomiaData.total_questions || anatomiaData.questions.length,
    questions: anatomiaData.questions,
    defaultCounts: [10, 20, 50, 100]
  },
  gerinctrening: {
    id: 'gerinctrening',
    title: 'Gerinctréning',
    shortTitle: 'Gerinctréning',
    badge: '50 kérdés',
    description: '50 kérdés, gerinc biomechanika, porckorongok, mély stabilizáció és tartásjavítás',
    icon: '🧘',
    totalQuestions: gerinctreningData.total_questions || gerinctreningData.questions.length,
    questions: gerinctreningData.questions,
    defaultCounts: [10, 20, 30, 50]
  }
};

export const AVAILABLE_TESTS = Object.values(TESTS);

export function getTest(testId = 'anatomia') {
  return TESTS[testId] || TESTS.anatomia;
}

export function getCategoriesForTest(testId = 'anatomia') {
  const test = getTest(testId);
  const cats = new Set();
  test.questions.forEach(q => {
    if (q.category) cats.add(q.category);
  });
  return ['Összes témakör', ...Array.from(cats)];
}

export function getQuestionsForTest(testId = 'anatomia', category = 'Összes témakör') {
  const test = getTest(testId);
  if (!category || category === 'Összes témakör') {
    return [...test.questions];
  }
  return test.questions.filter(q => q.category === category);
}

// Fisher-Yates shuffle
export function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Prepare questions with shuffled answers if requested
export function prepareQuizQuestions(questionsList, shuffleQuestions = false, shuffleOptions = false) {
  let list = shuffleQuestions ? shuffleArray(questionsList) : [...questionsList];
  return list.map(q => {
    let answers = [...q.answers];
    if (shuffleOptions) {
      answers = shuffleArray(answers);
    }
    return {
      ...q,
      answers
    };
  });
}

// Backward compatibility exports
export const quizTitle = TESTS.anatomia.title;
export const totalQuestionsCount = TESTS.anatomia.totalQuestions;
export const allQuestions = TESTS.anatomia.questions;
export const categories = getCategoriesForTest('anatomia');
export function getQuestionsByCategory(category) {
  return getQuestionsForTest('anatomia', category);
}
