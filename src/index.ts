import * as readline from "readline";
import { createNewGame, proposeGuess } from "./wordle.js";
import { LocalDictionary } from "./local-dictionary.js";
import type { Word } from "./type.js";

const dictionary = new LocalDictionary();
let state = createNewGame(dictionary);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

console.log("=== Pokémon Wordle ===");
console.log("Devine le mot de 5 lettres en 6 essais !\n");

function displayFeedback(feedback: string[]) {
  const correctSquare = feedback.map((f) => {
    if (f === "CORRECT") return "🟩";
    if (f === "MISPLACED") return "🟨";
    return "⬛";
  });
  console.log(correctSquare.join(" ")); 
}

function askGuess() {
  if (state.status !== "IN_PROGRESS") {
    if (state.status === "WON") {
      console.log("\nBravo, tu as gagné !");
    } else {
      console.log("\nPerdu... Le mot était : " + state.targetWord); 
    }
    rl.close();
    return;
  }

  rl.question(`Essai ${state.guesses.length + 1}/6 : `, (input) => {
    try {
      const guess = input.trim() as Word;
      state = proposeGuess(state, guess, dictionary);

      const lastFeedback = state.feedbacks[state.feedbacks.length - 1];
      console.log(input.toUpperCase());
      displayFeedback(lastFeedback);

      if (state.status !== "IN_PROGRESS") {
        if (state.status === "WON") {
          console.log("\nBravo, tu as gagné !");
        } else {
          console.log("\nPerdu... Le mot était : " + state.targetWord);
        }
        rl.close();
        return;
      }

      askGuess();
    } catch (err: any) {
      console.log("Erreur : " + err.message + "\n");
      askGuess();
    }
  });
}

askGuess();
