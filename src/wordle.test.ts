import { describe, it, expect } from "vitest";

import {
  evaluateGuess,
  validateGuess,
  proposeGuess,
  createNewGame,
} from "./wordle.js";

import {
  InputMoreThan5LettersError,
  InvalidCharactersError,
  GameAlreadyOverError,
  InputLessThan5LettersError,
  WordNotInDictionaryError,
} from "./error.js";

import type { Word, GameState, Dictionary } from "./type.js";

const stubDictionary: Dictionary = {
  getRandomWord: () => "PICHU" as Word,
  isValidWord: (word: Word) =>
    [
      "PICHU",
      "SALUT",
      "MEWTO",
      "BULBI",
      "ARBOK",
      "SMOGO",
      "PARAS",
      "DRACO",
      "EVOLI",
      "UPICH",
      "IDIOT",
      "SALSA",
      "SSASS",
      "ZZZZZ",
    ].includes(word.toUpperCase()),
};

describe("Initialisation du jeu", () => {
  it("devrait initialiser le jeu avec un mot aléatoire", () => {
    // Given
    const initialState = createNewGame(stubDictionary);

    // Then
    expect(initialState.targetWord).toBe("PICHU");
    expect(initialState.guesses).toHaveLength(0);
    expect(initialState.feedbacks).toHaveLength(0);
    expect(initialState.status).toBe("IN_PROGRESS");
  });
});

describe("Évaluation d'un mot", () => {
  it("doit renvoyer 5 fois ABSENT quand aucune lettre ne correspond", () => {
    // Given
    const target = "ZZZZZ" as Word;
    const guess = "SALUT" as Word;

    // When
    const result = evaluateGuess(target, guess);

    // Then
    expect(result).toEqual([
      "ABSENT",
      "ABSENT",
      "ABSENT",
      "ABSENT",
      "ABSENT",
    ]);
  });

  it("doit renvoyer MISPLACED pour une lettre présente mais mal placée", () => {
    // Given
    const target = "PICHU" as Word;
    const guess = "SALUT" as Word;

    // When
    const result = evaluateGuess(target, guess);

    // Then
    expect(result).toEqual([
      "ABSENT",
      "ABSENT",
      "ABSENT",
      "MISPLACED",
      "ABSENT",
    ]);
  });

  it("doit gérer la règle des lettres multiples (doublons)", () => {
    // Given
    const target = "PICHU" as Word;
    const guess = "UUUUU" as Word;

    // When
    const result = evaluateGuess(target, guess);

    // Then
    expect(result).toEqual([
      "ABSENT",
      "ABSENT",
      "ABSENT",
      "ABSENT",
      "CORRECT",
    ]);
  });

  it("doit gérer deux lettres identiques avec une correcte et une mal placée", () => {
    // Given
    const target = "SALSA" as Word;
    const guess = "SSASS" as Word;

    // When
    const result = evaluateGuess(target, guess);

    // Then
    expect(result).toEqual([
      "CORRECT",
      "ABSENT",
      "MISPLACED",
      "CORRECT",
      "ABSENT",
    ]);
  });

  it("doit confirmer quand le mot est parfaitement trouvé (Victoire)", () => {
    // Given
    const target = "PICHU" as Word;
    const guess = "PICHU" as Word;

    // When
    const result = evaluateGuess(target, guess);

    // Then
    expect(result).toEqual([
      "CORRECT",
      "CORRECT",
      "CORRECT",
      "CORRECT",
      "CORRECT",
    ]);
  });
});

describe("Validation des entrées", () => {
  it("devrait accepter un mot valide de 5 lettres", () => {
    // Given
    const input = "PICHU";

    // When
    const isValid = validateGuess(input, stubDictionary);

    // Then
    expect(isValid).toBe(true);
  });

  it("devrait rejeter un mot trop long avec une erreur dédiée", () => {
    // Given
    const input = "PIKACHU";

    // When
    const action = () => validateGuess(input, stubDictionary);

    // Then
    expect(action).toThrow(InputMoreThan5LettersError);
  });

  it("devrait rejeter un mot trop court avec une erreur dédiée", () => {
    // Given
    const input = "MEW";

    // When
    const action = () => validateGuess(input, stubDictionary);

    // Then
    expect(action).toThrow(InputLessThan5LettersError);
  });

  it("devrait rejeter les caractères spéciaux", () => {
    // Given
    const input = "PIKA!";

    // When
    const action = () => validateGuess(input, stubDictionary);

    // Then
    expect(action).toThrow(InvalidCharactersError);
  });

  it("devrait rejeter les chiffres", () => {
    // Given
    const input = "MEW22";

    // When
    const action = () => validateGuess(input, stubDictionary);

    // Then
    expect(action).toThrow(InvalidCharactersError);
  });

  it("devrait rejeter un mot qui n'existe pas dans le dictionnaire", () => {
    // Given
    const input = "XYZZY";

    // When
    const action = () => validateGuess(input, stubDictionary);

    // Then
    expect(action).toThrow(WordNotInDictionaryError);
  });
});

describe("Gestion du jeu", () => {
  it("devrait gagner dès le début", () => {
    // Given
    const initialState = createNewGame(stubDictionary);
    const guess = "Pichu" as Word;

    // When
    const newState = proposeGuess(initialState, guess, stubDictionary);

    // Then
    expect(newState.status).toBe("WON");
    expect(newState.guesses).toHaveLength(1);
    expect(newState.feedbacks).toHaveLength(1);
    expect(newState.feedbacks[0]).toEqual([
      "CORRECT",
      "CORRECT",
      "CORRECT",
      "CORRECT",
      "CORRECT",
    ]);
  });

  it("devrait gagner dès le début même si le mot n'est pas en majuscule", () => {
    // Given
    const initialState = createNewGame(stubDictionary);
    const guess = "pichu" as Word;

    // When
    const newState = proposeGuess(initialState, guess, stubDictionary);

    // Then
    expect(newState.status).toBe("WON");
  });

  it("devrait gagner après plusieurs tentatives", () => {
    // Given
    const initialState: GameState = {
      targetWord: "PICHU" as Word,
      guesses: ["MEWTO" as Word, "BULBI" as Word, "ARBOK" as Word],
      feedbacks: [
        ["ABSENT", "ABSENT", "ABSENT", "ABSENT", "ABSENT"],
        ["ABSENT", "ABSENT", "ABSENT", "ABSENT", "ABSENT"],
        ["ABSENT", "ABSENT", "ABSENT", "ABSENT", "ABSENT"],
      ],
      status: "IN_PROGRESS",
    };
    const guess = "Pichu" as Word;

    // When
    const newState = proposeGuess(initialState, guess, stubDictionary);

    // Then
    expect(newState.status).toBe("WON");
  });

  it("devrait permettre une victoire au 6ème essai exactement", () => {
    // Given
    const initialState: GameState = {
      targetWord: "PICHU" as Word,
      guesses: [
        "MEWTO" as Word,
        "BULBI" as Word,
        "ARBOK" as Word,
        "SMOGO" as Word,
        "PARAS" as Word,
      ],
      feedbacks: [[], [], [], [], []],
      status: "IN_PROGRESS",
    };
    const guess = "Pichu" as Word;

    // When
    const newState = proposeGuess(initialState, guess, stubDictionary);

    // Then
    expect(newState.status).toBe("WON");
    expect(newState.guesses).toHaveLength(6);
  });

  it("devrait perdre si le joueur ne trouve pas le bon mot", () => {
    // Given
    const initialState: GameState = {
      targetWord: "UPICH" as Word,
      guesses: [
        "MEWTO" as Word,
        "BULBI" as Word,
        "ARBOK" as Word,
        "SMOGO" as Word,
        "PARAS" as Word,
      ],
      feedbacks: [[], [], [], [], []],
      status: "IN_PROGRESS",
    };
    const guess = "Pichu" as Word;

    // When
    const newState = proposeGuess(initialState, guess, stubDictionary);

    // Then
    expect(newState.status).toBe("LOST");
  });

  it("devrait ne pas accepter de mot si le jeu est perdu", () => {
    // Given
    const initialState: GameState = {
      targetWord: "IDIOT" as Word,
      guesses: [
        "MEWTO" as Word,
        "BULBI" as Word,
        "ARBOK" as Word,
        "SMOGO" as Word,
        "PARAS" as Word,
        "DRACO" as Word,
      ],
      feedbacks: [[], [], [], [], [], []],
      status: "LOST",
    };
    const guess = "Pichu" as Word;

    // When
    const action = () => proposeGuess(initialState, guess, stubDictionary);

    // Then
    expect(action).toThrow(GameAlreadyOverError);
  });

  it("devrait ne pas accepter de mot si le jeu est gagné", () => {
    // Given
    const initialState: GameState = {
      targetWord: "PICHU" as Word,
      guesses: [
        "MEWTO" as Word,
        "BULBI" as Word,
        "ARBOK" as Word,
        "SMOGO" as Word,
        "PARAS" as Word,
        "DRACO" as Word,
      ],
      feedbacks: [[], [], [], [], [], []],
      status: "WON",
    };
    const guess = "BULBI" as Word;

    // When
    const action = () => proposeGuess(initialState, guess, stubDictionary);

    // Then
    expect(action).toThrow(GameAlreadyOverError);
  });

  it("devrait ne pas muter l'état précédent du jeu", () => {
    // Given
    const initialState = createNewGame(stubDictionary);
    const originalGuesses = initialState.guesses;
    const originalFeedbacks = initialState.feedbacks;
    const guess = "SALUT" as Word;

    // When
    const newState = proposeGuess(initialState, guess, stubDictionary);

    // Then
    expect(initialState.guesses).toBe(originalGuesses);
    expect(initialState.feedbacks).toBe(originalFeedbacks);
    expect(initialState.status).toBe("IN_PROGRESS");
    expect(newState.guesses).not.toBe(originalGuesses);
  });
});
