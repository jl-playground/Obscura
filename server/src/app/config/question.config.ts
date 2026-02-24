/**
 * Question Feature Configuration
 * Centralized settings for question & daily question logic
 */

export const questionConfig = {
  // Daily question limit - number of unanswered questions to show per day
  DAILY_QUESTION_LIMIT: 3,

  // Whether to randomize questions (true: RAND(), false: ORDER BY id)
  RANDOMIZE_QUESTIONS: true,

  // Question types enum
  QUESTION_TYPES: {
    MULTIPLE_CHOICE: 'MULTIPLE_CHOICE',
    TEXT: 'TEXT',
    SCALE: 'SCALE',
  },

  // Default question type for new questions
  DEFAULT_QUESTION_TYPE: 'MULTIPLE_CHOICE',
} as const;
