import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

export type GameState = "menu" | "playing" | "gameOver" | "victory";

interface KnightGameStore {
  gameState: GameState;
  score: number;
  timeLeft: number;
  knightPosition: { x: number; y: number };

  // Actions
  startGame: () => void;
  endGame: () => void;
  setVictory: () => void;
  restartGame: () => void;
  goToMenu: () => void;
  addScore: (points: number) => void;
  setTimeLeft: (time: number) => void;
  setKnightPosition: (position: { x: number; y: number }) => void;
}

export const useKnightGame = create<KnightGameStore>()(
  subscribeWithSelector((set) => ({
    gameState: "menu",
    score: 0,
    timeLeft: 120,
    knightPosition: { x: -6, y: 0 },

    startGame: () => {
      set({
        gameState: "playing",
        score: 0,
        timeLeft: 120,
        knightPosition: { x: -6, y: 0 }
      });
    },

    endGame: () => {
      set({ gameState: "gameOver" });
    },

    setVictory: () => {
      set({ gameState: "victory" });
    },

    restartGame: () => {
      set({
        gameState: "playing",
        score: 0,
        timeLeft: 120,
        knightPosition: { x: -6, y: 0 }
      });
    },

    goToMenu: () => {
      set({ gameState: "menu" });
    },

    addScore: (points) => {
      set((state) => ({ score: state.score + points }));
    },

    setTimeLeft: (time) => {
      set({ timeLeft: time });
    },

    setKnightPosition: (position) => {
      set({ knightPosition: position });
    }
  }))
);
