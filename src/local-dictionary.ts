import { Dictionary, Word } from "./type.js";
import data from "./data/words_fr.json" with { type: "json" };

export class LocalDictionary implements Dictionary {
  getRandomWord(): Word {
    const words = data.words;
    const randomIndex = Math.floor(Math.random() * words.length);
    const rawWord = words[randomIndex];
    const cleanWord = rawWord
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // C'est pour les accents et les caractères spéciaux (merci https://stackoverflow.com/questions/286921/efficiently-replace-all-accented-characters-in-a-string)
      .toUpperCase();

    return cleanWord as Word;
  }

  isValidWord(word: Word): boolean {
    const clean = word
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toUpperCase();
    return data.words.some(
      (w) =>
        w.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase() ===
        clean
    );
  }
}
