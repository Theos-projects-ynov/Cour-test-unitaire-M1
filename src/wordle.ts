import {
  InputMoreThan5LettersError,
  InputLessThan5LettersError,
  InvalidCharactersError,
  GameAlreadyOverError,
  WordNotInDictionaryError,
} from "./error.js";
import type {
  Word,
  LetterFeedback,
  GameStatus,
  GameState,
  Dictionary,
} from "./type.js";

export function evaluateGuess(target: Word, guess: Word): LetterFeedback[] {
  const normalizedTarget = target.toUpperCase();
  const normalizedGuess = guess.toUpperCase();

  const result: LetterFeedback[] = Array(5).fill("ABSENT");
  const targetLetters: (string | null)[] = normalizedTarget.split("");

  for (let i = 0; i < 5; i++) {
    if (normalizedGuess[i] === normalizedTarget[i]) {
      result[i] = "CORRECT";
      targetLetters[i] = null;
    }
  }

  for (let i = 0; i < 5; i++) {
    if (result[i] !== "CORRECT") {
      const guessedLetter = normalizedGuess[i];
      const indexInTarget = targetLetters.indexOf(guessedLetter);
      if (indexInTarget !== -1) {
        result[i] = "MISPLACED";
        targetLetters[indexInTarget] = null;
      }
    }
  }

  return result;
}

export function validateGuess(input: string, dictionary: Dictionary): boolean {
  input = input.toUpperCase();
  if (input.length > 5) {
    throw new InputMoreThan5LettersError();
  }
  if (input.length < 5) {
    throw new InputLessThan5LettersError();
  }
  const alphabetRegex = /^[A-Za-z]+$/;
  if (!alphabetRegex.test(input)) {
    throw new InvalidCharactersError();
  }
  if (!dictionary.isValidWord(input.toUpperCase() as Word)) {
    throw new WordNotInDictionaryError(input);
  }
  return true;
}

export function proposeGuess(
  state: GameState,
  guess: Word,
  dictionary: Dictionary,
): GameState {
  if (state.status !== "IN_PROGRESS") {
    throw new GameAlreadyOverError();
  }

  validateGuess(guess.toString(), dictionary);

  const feedback = evaluateGuess(state.targetWord, guess);
  const isVictory = feedback.every((f) => f === "CORRECT");
  const isLastTry = state.guesses.length === 5;

  let nextStatus: GameStatus = "IN_PROGRESS";
  if (isVictory) {
    nextStatus = "WON";
  } else if (isLastTry) {
    nextStatus = "LOST";
  }

  return {
    ...state,
    guesses: [...state.guesses, guess],
    feedbacks: [...state.feedbacks, feedback],
    status: nextStatus,
  };
}

export function createNewGame(dictionary: Dictionary): GameState {
  return {
    targetWord: dictionary.getRandomWord(),
    guesses: [],
    feedbacks: [],
    status: "IN_PROGRESS",
  };
}
