import { useKnightGame } from "../../lib/stores/useKnightGame";
import { useAudio } from "../../lib/stores/useAudio";
import { Sword, Volume2, VolumeX, Crown } from "lucide-react";

export function GameUI() {
  const { score, timeLeft } = useKnightGame();
  const { isMuted, toggleMute } = useAudio();

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
      {/* Top HUD */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-start pointer-events-auto">
        {/* Score */}
        <div className="bg-black/70 backdrop-blur-sm text-white px-4 py-2 rounded-lg flex items-center gap-2">
          <Sword className="w-5 h-5 text-yellow-400" />
          <span className="font-bold text-lg">{score}</span>
        </div>

        {/* Timer */}
        <div className="bg-black/70 backdrop-blur-sm text-white px-4 py-2 rounded-lg flex items-center gap-2">
          <Crown className="w-5 h-5 text-pink-400" />
          <span className="font-bold text-lg">{formatTime(timeLeft)}</span>
        </div>

        {/* Mute button */}
        <button
          onClick={toggleMute}
          className="bg-black/70 backdrop-blur-sm text-white p-2 rounded-lg hover:bg-black/80 transition-colors"
        >
          {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
        </button>
      </div>

      {/* Controls help */}
      <div className="absolute bottom-4 left-4 bg-black/70 backdrop-blur-sm text-white px-4 py-2 rounded-lg text-sm">
        <div>↑↓ Move • SPACE Attack • Rescue the Princess!</div>
      </div>

      {/* Mission reminder */}
      <div className="absolute bottom-4 right-4 bg-pink-600/70 backdrop-blur-sm text-white px-4 py-2 rounded-lg text-sm">
        <div className="flex items-center gap-2">
          <Crown className="w-4 h-4" />
          <span>Save the Princess!</span>
        </div>
      </div>
    </div>
  );
}
