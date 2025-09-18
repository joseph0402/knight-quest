import { useFrame } from "@react-three/fiber";
import { useRef, useState, useEffect } from "react";
import { Knight } from "./Knight";
import { Enemy } from "./Enemy";
import { Obstacle } from "./Obstacle";
import { useKnightGame } from "../../lib/stores/useKnightGame";
import { useAudio } from "../../lib/stores/useAudio";
import { checkCollision, GameEntity, EnemyEntity, createEnemy, updateEnemyAI, EnemyType } from "../../lib/gameUtils";
import * as THREE from "three";

interface ObstacleEntity extends GameEntity {
  id: string;
}

export function GameScene() {
  const {
    knightPosition,
    setKnightPosition,
    timeLeft,
    setTimeLeft,
    score,
    addScore,
    endGame,
    setVictory
  } = useKnightGame();
  
  const { playHit, playSuccess, playDamage } = useAudio();
  
  const [enemies, setEnemies] = useState<EnemyEntity[]>([]);
  const [obstacles, setObstacles] = useState<ObstacleEntity[]>([]);
  const [isAttacking, setIsAttacking] = useState(false);
  
  // Use refs for real-time game state simulation
  const enemiesRef = useRef<EnemyEntity[]>([]);
  const obstaclesRef = useRef<ObstacleEntity[]>([]);
  const gameSpeed = useRef(2);
  const spawnTimer = useRef(0);
  const gameTimer = useRef(0);
  
  // Sync refs with state
  enemiesRef.current = enemies;
  obstaclesRef.current = obstacles;
  
  // Knight entity for collision detection
  const knightEntity: GameEntity = {
    position: { x: knightPosition.x, y: knightPosition.y },
    size: { width: 1, height: 1.5 }
  };

  // Batch state updates to avoid render conflicts
  const pendingUpdates = useRef({
    scoreToAdd: 0,
    gameEnded: false,
    victoryAchieved: false,
    timeUpdate: false,
    newTimeLeft: 0,
    needsStateUpdate: false
  });

  // Process pending updates after frame with dependencies to ensure they run
  useEffect(() => {
    if (pendingUpdates.current.scoreToAdd > 0) {
      addScore(pendingUpdates.current.scoreToAdd);
      pendingUpdates.current.scoreToAdd = 0;
    }
    
    if (pendingUpdates.current.timeUpdate) {
      setTimeLeft(pendingUpdates.current.newTimeLeft);
      pendingUpdates.current.timeUpdate = false;
    }
    
    if (pendingUpdates.current.victoryAchieved) {
      setVictory();
      playSuccess();
      pendingUpdates.current.victoryAchieved = false;
    }
    
    if (pendingUpdates.current.gameEnded) {
      endGame();
      pendingUpdates.current.gameEnded = false;
    }
  }, [enemies, obstacles]); // Dependencies ensure this runs after state updates

  useFrame((state, delta) => {
    // Update game timer
    gameTimer.current += delta;
    if (gameTimer.current >= 1) {
      gameTimer.current = 0;
      const newTimeLeft = Math.max(0, timeLeft - 1);
      pendingUpdates.current.newTimeLeft = newTimeLeft;
      pendingUpdates.current.timeUpdate = true;
      
      if (newTimeLeft <= 0) {
        pendingUpdates.current.victoryAchieved = true;
        return;
      }
    }

    // Work with current ref arrays in memory
    let nextEnemies = [...enemiesRef.current];
    let nextObstacles = [...obstaclesRef.current];
    let needsUpdate = false;

    // Spawn enemies and obstacles
    spawnTimer.current += delta;
    if (spawnTimer.current >= 2) {
      spawnTimer.current = 0;
      needsUpdate = true;
      
      // 60% chance to spawn enemy, 40% chance to spawn obstacle
      if (Math.random() < 0.6) {
        // Spawn enemy - randomly choose enemy type based on game progression
        const enemyTypes: EnemyType[] = ['soldier', 'archer', 'berserker', 'guard'];
        const timeProgress = (120 - timeLeft) / 120; // 0 to 1 progression
        
        // Early game: more soldiers, late game: more variety and tougher enemies
        let selectedType: EnemyType;
        const rand = Math.random();
        if (timeProgress < 0.3) {
          // Early game: 70% soldiers, 20% archers, 10% others
          selectedType = rand < 0.7 ? 'soldier' : rand < 0.9 ? 'archer' : enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
        } else if (timeProgress < 0.7) {
          // Mid game: more variety
          selectedType = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
        } else {
          // Late game: more tough enemies
          selectedType = rand < 0.4 ? 'berserker' : rand < 0.7 ? 'guard' : enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
        }
        
        const newEnemy = createEnemy(selectedType, { x: 15, y: Math.random() * 4 - 2 });
        nextEnemies.push(newEnemy);
      } else {
        // Spawn obstacle
        const newObstacle: ObstacleEntity = {
          id: `obstacle-${Date.now()}`,
          position: { x: 15, y: Math.random() * 4 - 2 },
          size: { width: 1, height: 1 }
        };
        nextObstacles.push(newObstacle);
      }
    }

    // Move enemies with AI and check collisions
    const updatedEnemies = nextEnemies.map(enemy => {
      // Apply AI movement pattern
      const aiUpdatedEnemy = updateEnemyAI(enemy, knightPosition, delta);
      
      // Move enemy horizontally (all enemies move left)
      const movedEnemy = {
        ...aiUpdatedEnemy,
        position: { 
          ...aiUpdatedEnemy.position, 
          x: aiUpdatedEnemy.position.x - (gameSpeed.current * aiUpdatedEnemy.speed / 2.5) * delta 
        }
      };

      // Check collisions if not defeated
      if (!enemy.defeated) {
        // Check if knight attacks enemy
        if (isAttacking && checkCollision(knightEntity, movedEnemy)) {
          const updatedHealth = movedEnemy.health - 1;
          if (updatedHealth <= 0) {
            // Enemy defeated
            pendingUpdates.current.scoreToAdd += 100 * movedEnemy.maxHealth; // More points for tougher enemies
            playHit();
            return { ...movedEnemy, health: 0, defeated: true };
          } else {
            // Enemy damaged but not defeated
            playHit();
            return { ...movedEnemy, health: updatedHealth };
          }
        }
        // Only check enemy damage if knight is NOT attacking (prevents unfair death during combat)
        else if (checkCollision(knightEntity, movedEnemy)) {
          pendingUpdates.current.gameEnded = true;
          playDamage(); // Play damage sound when enemy hits knight
        }
      }

      return movedEnemy;
    }).filter(enemy => enemy.position.x > -10);

    // Move obstacles and check collisions
    const updatedObstacles = nextObstacles.map(obstacle => ({
      ...obstacle,
      position: { ...obstacle.position, x: obstacle.position.x - gameSpeed.current * delta }
    })).filter(obstacle => obstacle.position.x > -10);

    // Check obstacle collisions
    updatedObstacles.forEach(obstacle => {
      if (checkCollision(knightEntity, obstacle)) {
        pendingUpdates.current.gameEnded = true;
        playDamage(); // Play damage sound when knight hits obstacle
      }
    });

    // Always update state to ensure positions are rendered
    setEnemies(updatedEnemies);
    setObstacles(updatedObstacles);
  });

  return (
    <group>
      {/* Background elements - simple planes for ground and sky */}
      <mesh position={[0, -3, -1]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[50, 20]} />
        <meshBasicMaterial color="#90EE90" />
      </mesh>
      
      {/* Knight */}
      <Knight 
        position={knightPosition}
        onPositionChange={setKnightPosition}
        isAttacking={isAttacking}
        onAttackChange={setIsAttacking}
      />
      
      {/* Enemies */}
      {enemies.map(enemy => (
        <Enemy
          key={enemy.id}
          enemy={enemy}
        />
      ))}
      
      {/* Obstacles */}
      {obstacles.map(obstacle => (
        <Obstacle
          key={obstacle.id}
          position={obstacle.position}
        />
      ))}
    </group>
  );
}
