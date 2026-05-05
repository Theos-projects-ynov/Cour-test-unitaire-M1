class InputMoreThan5LettersError extends Error {
  constructor() {
    super("Le mot est trop long");
    this.name = "InputMoreThan5LettersError";
  }
}

class InputLessThan5LettersError extends Error {
  constructor() {
    super("Le mot est trop court");
    this.name = "InputLessThan5LettersError";
  }
}

class InvalidCharactersError extends Error {
  constructor() {
    super("Le mot contient des caractères invalides");
    this.name = "InvalidCharactersError";
  }
}

class GameAlreadyOverError extends Error {
  constructor() {
    super("Le jeu est déjà terminé");
    this.name = "GameAlreadyOverError";
  }
}

class WordNotInDictionaryError extends Error {
  constructor(word: string) {
    super(`"${word}" n'est pas dans le dictionnaire`);
    this.name = "WordNotInDictionaryError";
  }
}

export {
  InputMoreThan5LettersError,
  InputLessThan5LettersError,
  InvalidCharactersError,
  GameAlreadyOverError,
  WordNotInDictionaryError,
};
