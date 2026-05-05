export type Word = string & { readonly _brand: "Word" };

export type LetterFeedback = "CORRECT" | "MISPLACED" | "ABSENT";

export type GameStatus = "IN_PROGRESS" | "WON" | "LOST";

export type GameState = {
  readonly targetWord: Word;
  readonly guesses: Word[];
  readonly feedbacks: LetterFeedback[][];
  readonly status: GameStatus;
};

export interface Dictionary {
  getRandomWord(): Word;
  isValidWord(word: Word): boolean;
}
