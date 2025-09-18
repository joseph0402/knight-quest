import { useKnightGame } from "../../lib/stores/useKnightGame";
import { Crown, Sword, Shield, Clock } from "lucide-react";

export function GameMenu() {
  const { startGame } = useKnightGame();

  return (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-b from-blue-900 to-blue-600">
      <div className="text-center text-white max-w-2xl mx-4">
        {/* Title */}
        <div className="mb-8">
          <h1 className="text-6xl font-bold mb-4 text-yellow-400 drop-shadow-lg">
            Knight's Quest
          </h1>
          <div className="flex items-center justify-center gap-2 text-2xl">
            <Crown className="w-8 h-8 text-pink-400" />
            <span>Rescue the Princess</span>
            <Crown className="w-8 h-8 text-pink-400" />
          </div>
        </div>

        {/* Mission briefing */}
        <div className="bg-black/30 backdrop-blur-sm rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4 text-yellow-300">Your Quest</h2>
          <p className="text-lg mb-4 leading-relaxed">
            The evil army has captured the princess! As a brave knight, you must survive 
            their attacks for <span className="text-yellow-300 font-bold">120 seconds</span> to 
            rescue her from their fortress.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-400" />
              <span>Avoid obstacles</span>
            </div>
            <div className="flex items-center gap-2">
              <Sword className="w-5 h-5 text-yellow-400" />
              <span>Defeat enemies (+100 pts)</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-green-400" />
              <span>Survive 120 seconds</span>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-black/30 backdrop-blur-sm rounded-lg p-6 mb-8">
          <h3 className="text-xl font-bold mb-3 text-yellow-300">Controls</h3>
          <div className="flex justify-center gap-8 text-sm">
            <div className="flex items-center gap-2">
              <kbd className="px-2 py-1 bg-gray-700 rounded">↑↓</kbd>
              <span>Move Up/Down</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="px-2 py-1 bg-gray-700 rounded">SPACE</kbd>
              <span>Swing Sword</span>
            </div>
          </div>
        </div>

        {/* Start button */}
        <button
          onClick={startGame}
          className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold text-xl px-8 py-4 rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          Begin Your Quest
        </button>
      </div>
    </div>
  );
}
