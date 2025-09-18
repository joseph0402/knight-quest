import { Canvas } from "@react-three/fiber";
import { Suspense, useEffect, useState } from "react";
import { KeyboardControls } from "@react-three/drei";
import { useAudio } from "./lib/stores/useAudio";
import { useKnightGame } from "./lib/stores/useKnightGame";
import { GameScene } from "./components/game/GameScene";
import { GameUI } from "./components/game/GameUI";
import { GameMenu } from "./components/game/GameMenu";
import { GameOver } from "./components/game/GameOver";
import "@fontsource/inter";

// Define control keys for the game
const controls = [
  { name: "up", keys: ["ArrowUp", "KeyW"] },
  { name: "down", keys: ["ArrowDown", "KeyS"] },
  { name: "attack", keys: ["Space"] },
];

function App() {
  const { gameState } = useKnightGame();
  const { initializeAudio, playBackgroundMusic, stopBackgroundMusic, isMuted } = useAudio();
  const [showCanvas, setShowCanvas] = useState(false);

  // Initialize audio and show the canvas once everything is loaded
  useEffect(() => {
    initializeAudio();
    setShowCanvas(true);
  }, [initializeAudio]);

  // Handle background music based on game state and mute status
  useEffect(() => {
    if (gameState === 'playing' && !isMuted) {
      playBackgroundMusic();
    } else {
      stopBackgroundMusic();
    }
  }, [gameState, isMuted, playBackgroundMusic, stopBackgroundMusic]);

  if (!showCanvas) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-black text-white">
        <div>Loading Knight's Quest...</div>
      </div>
    );
  }

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden', backgroundColor: '#1a1a1a' }}>
      <KeyboardControls map={controls}>
        {gameState === 'menu' && <GameMenu />}
        
        {gameState === 'victory' && <GameOver victory={true} />}
        
        {gameState === 'gameOver' && <GameOver victory={false} />}

        {gameState === 'playing' && (
          <>
            <Canvas
              shadows
              camera={{
                position: [0, 0, 10],
                fov: 45,
                near: 0.1,
                far: 1000
              }}
              gl={{
                antialias: true,
                powerPreference: "default"
              }}
            >
              <color attach="background" args={["#87CEEB"]} />

              {/* Lighting */}
              <ambientLight intensity={0.6} />
              <directionalLight position={[10, 10, 5]} intensity={0.8} />

              <Suspense fallback={null}>
                <GameScene />
              </Suspense>
            </Canvas>
            <GameUI />
          </>
        )}
      </KeyboardControls>
    </div>
  );
}

export default App;
