import rawData from './questions.json';

export const quizTitle = rawData.title;
export const totalQuestionsCount = rawData.total_questions;
export const allQuestions = rawData.questions;

// Unique categories
export const categories = [
  'Összes témakör',
  'Síkok és irányok',
  'Csontok és ízületek',
  'Gerincoszlop és mellkas',
  'Medence és izomtan',
  'Hátizmok',
  'Hasizmok',
  'Mellizmok',
  'Vállizmok és rotátorköpeny',
  'Kar és alkar',
  'Alsó végtag',
  'Core izomzat'
];

// Helper to get questions for category
export function getQuestionsByCategory(category) {
  if (!category || category === 'Összes témakör') {
    return [...allQuestions];
  }
  return allQuestions.filter(q => q.category === category);
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
