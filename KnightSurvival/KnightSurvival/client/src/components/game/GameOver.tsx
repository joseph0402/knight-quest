import { useKnightGame } from "../../lib/stores/useKnightGame";
import { Crown, Sword, RotateCcw, Home } from "lucide-react";

interface GameOverProps {
  victory: boolean;
}

export function GameOver({ victory }: GameOverProps) {
  const { score, restartGame, goToMenu } = useKnightGame();

  return (
    <div className={`w-full h-full flex items-center justify-center ${
      victory ? 'bg-gradient-to-b from-pink-800 to-purple-600' : 'bg-gradient-to-b from-red-900 to-gray-800'
    }`}>
      <div className="text-center text-white max-w-2xl mx-4">
        {victory ? (
          <>
            {/* Victory */}
            <div className="mb-8">
              <Crown className="w-24 h-24 text-yellow-400 mx-auto mb-4 animate-bounce" />
              <h1 className="text-6xl font-bold mb-4 text-yellow-400 drop-shadow-lg">
                Victory!
              </h1>
              <h2 className="text-3xl font-bold text-pink-300 mb-4">
                Princess Rescued!
              </h2>
              <p className="text-xl leading-relaxed">
                Congratulations, brave knight! You have successfully rescued the princess 
                from the evil army. The kingdom celebrates your heroic deed!
              </p>
            </div>
          </>
        ) : (
          <>
            {/* Game Over */}
            <div className="mb-8">
              <Sword className="w-24 h-24 text-red-400 mx-auto mb-4" />
              <h1 className="text-6xl font-bold mb-4 text-red-400 drop-shadow-lg">
                Game Over
              </h1>
              <h2 className="text-3xl font-bold text-gray-300 mb-4">
                Quest Failed
              </h2>
              <p className="text-xl leading-relaxed">
                The evil army has defeated you! The princess remains captured. 
                Will you try again, brave knight?
              </p>
            </div>
          </>
        )}

        {/* Final Score */}
        <div className="bg-black/30 backdrop-blur-sm rounded-lg p-6 mb-8">
          <h3 className="text-2xl font-bold mb-2 text-yellow-300">Final Score</h3>
          <div className="flex items-center justify-center gap-2 text-4xl font-bold">
            <Sword className="w-8 h-8 text-yellow-400" />
            <span>{score}</span>
          </div>
          <p className="text-sm text-gray-300 mt-2">
            Enemies Defeated: {Math.floor(score / 100)}
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={restartGame}
            className="bg-green-600 hover:bg-green-500 text-white font-bold text-xl px-6 py-3 rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2 justify-center"
          >
            <RotateCcw className="w-5 h-5" />
            Try Again
          </button>
          <button
            onClick={goToMenu}
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xl px-6 py-3 rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2 justify-center"
          >
            <Home className="w-5 h-5" />
            Main Menu
          </button>
        </div>
      </div>
    </div>
  );
}
