export interface GameEntity {
  position: { x: number; y: number };
  size: { width: number; height: number };
}

export type EnemyType = 'soldier' | 'archer' | 'berserker' | 'guard';

export interface EnemyEntity extends GameEntity {
  id: string;
  type: EnemyType;
  health: number;
  maxHealth: number;
  speed: number;
  defeated: boolean;
  attackCooldown: number;
  direction: number; // 1 for up, -1 for down, 0 for straight
  aggressionLevel: number; // 0-1, affects behavior intensity
}

export function checkCollision(entity1: GameEntity, entity2: GameEntity): boolean {
  const e1Left = entity1.position.x - entity1.size.width / 2;
  const e1Right = entity1.position.x + entity1.size.width / 2;
  const e1Top = entity1.position.y + entity1.size.height / 2;
  const e1Bottom = entity1.position.y - entity1.size.height / 2;

  const e2Left = entity2.position.x - entity2.size.width / 2;
  const e2Right = entity2.position.x + entity2.size.width / 2;
  const e2Top = entity2.position.y + entity2.size.height / 2;
  const e2Bottom = entity2.position.y - entity2.size.height / 2;

  return (
    e1Left < e2Right &&
    e1Right > e2Left &&
    e1Top > e2Bottom &&
    e1Bottom < e2Top
  );
}

export function generateRandomPosition(minX: number, maxX: number, minY: number, maxY: number) {
  return {
    x: Math.random() * (maxX - minX) + minX,
    y: Math.random() * (maxY - minY) + minY
  };
}

// Enemy type definitions with behavior characteristics
export const EnemyTypes: Record<EnemyType, {
  health: number;
  speed: number;
  size: { width: number; height: number };
  color: string;
  aggressionLevel: number;
  description: string;
}> = {
  soldier: {
    health: 1,
    speed: 2.5,
    size: { width: 1, height: 1.5 },
    color: "#DC143C", // Red
    aggressionLevel: 0.5,
    description: "Basic enemy, moves straight"
  },
  archer: {
    health: 1,
    speed: 1.8,
    size: { width: 0.8, height: 1.4 },
    color: "#228B22", // Green
    aggressionLevel: 0.3,
    description: "Moves erratically, tries to keep distance"
  },
  berserker: {
    health: 2,
    speed: 3.5,
    size: { width: 1.2, height: 1.8 },
    color: "#8B0000", // Dark red
    aggressionLevel: 0.9,
    description: "Fast and aggressive, charges at knight"
  },
  guard: {
    health: 3,
    speed: 1.5,
    size: { width: 1.3, height: 2.0 },
    color: "#4B0082", // Indigo
    aggressionLevel: 0.2,
    description: "Slow but tough, defensive movements"
  }
};

// AI behavior functions for different enemy types
export function updateEnemyAI(enemy: EnemyEntity, knightPosition: { x: number; y: number }, delta: number): EnemyEntity {
  let updatedEnemy = { ...enemy };
  
  // Reduce attack cooldown
  if (updatedEnemy.attackCooldown > 0) {
    updatedEnemy.attackCooldown -= delta;
  }

  switch (enemy.type) {
    case 'soldier':
      updatedEnemy = updateSoldierAI(updatedEnemy, knightPosition, delta);
      break;
    case 'archer':
      updatedEnemy = updateArcherAI(updatedEnemy, knightPosition, delta);
      break;
    case 'berserker':
      updatedEnemy = updateBerserkerAI(updatedEnemy, knightPosition, delta);
      break;
    case 'guard':
      updatedEnemy = updateGuardAI(updatedEnemy, knightPosition, delta);
      break;
  }

  return updatedEnemy;
}

function updateSoldierAI(enemy: EnemyEntity, knightPosition: { x: number; y: number }, delta: number): EnemyEntity {
  // Basic soldier: moves straight with slight wobbling
  const wobbleAmount = Math.sin(Date.now() * 0.003) * 0.5;
  return {
    ...enemy,
    position: {
      ...enemy.position,
      y: enemy.position.y + wobbleAmount * delta
    }
  };
}

function updateArcherAI(enemy: EnemyEntity, knightPosition: { x: number; y: number }, delta: number): EnemyEntity {
  // Archer: tries to maintain distance, moves erratically
  const distanceToKnight = Math.abs(enemy.position.y - knightPosition.y);
  const targetDistance = 2.5;
  
  let direction = 0;
  if (distanceToKnight < targetDistance) {
    // Too close, move away
    direction = enemy.position.y > knightPosition.y ? 1 : -1;
  } else if (distanceToKnight > targetDistance + 1) {
    // Too far, move closer
    direction = enemy.position.y > knightPosition.y ? -1 : 1;
  }
  
  // Add erratic movement
  const erraticMovement = Math.sin(Date.now() * 0.008) * 0.8;
  
  return {
    ...enemy,
    direction,
    position: {
      ...enemy.position,
      y: Math.max(-3, Math.min(3, enemy.position.y + (direction * 1.5 + erraticMovement) * delta))
    }
  };
}

function updateBerserkerAI(enemy: EnemyEntity, knightPosition: { x: number; y: number }, delta: number): EnemyEntity {
  // Berserker: charges aggressively toward knight
  const distanceY = knightPosition.y - enemy.position.y;
  const direction = Math.sign(distanceY);
  const moveSpeed = 2.5 * enemy.aggressionLevel;
  
  return {
    ...enemy,
    direction,
    position: {
      ...enemy.position,
      y: Math.max(-3, Math.min(3, enemy.position.y + direction * moveSpeed * delta))
    }
  };
}

function updateGuardAI(enemy: EnemyEntity, knightPosition: { x: number; y: number }, delta: number): EnemyEntity {
  // Guard: slow defensive movements, slight tracking
  const distanceY = knightPosition.y - enemy.position.y;
  const direction = Math.sign(distanceY) * 0.3; // Very slow tracking
  const defensiveMovement = Math.sin(Date.now() * 0.002) * 0.3;
  
  return {
    ...enemy,
    direction,
    position: {
      ...enemy.position,
      y: Math.max(-3, Math.min(3, enemy.position.y + (direction + defensiveMovement) * delta))
    }
  };
}

// Factory function to create different enemy types
export function createEnemy(type: EnemyType, position: { x: number; y: number }): EnemyEntity {
  const config = EnemyTypes[type];
  return {
    id: `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type,
    position,
    size: config.size,
    health: config.health,
    maxHealth: config.health,
    speed: config.speed,
    defeated: false,
    attackCooldown: 0,
    direction: 0,
    aggressionLevel: config.aggressionLevel
  };
}
