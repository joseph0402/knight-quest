import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { EnemyEntity, EnemyTypes } from "../../lib/gameUtils";

interface EnemyProps {
  enemy: EnemyEntity;
}

export function Enemy({ enemy }: EnemyProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const weaponRef = useRef<THREE.Mesh>(null);
  const helmetRef = useRef<THREE.Mesh>(null);
  
  const config = EnemyTypes[enemy.type];
  const healthPercent = enemy.health / enemy.maxHealth;
  
  useFrame((state, delta) => {
    if (meshRef.current && !enemy.defeated) {
      const time = state.clock.elapsedTime;
      
      // Different animations based on enemy type
      switch (enemy.type) {
        case 'soldier':
          // Simple marching animation
          meshRef.current.rotation.z = Math.sin(time * 4) * 0.15;
          break;
        case 'archer':
          // Erratic, nervous movement
          meshRef.current.rotation.z = Math.sin(time * 6) * 0.25 + Math.sin(time * 2.3) * 0.1;
          if (weaponRef.current) {
            weaponRef.current.rotation.z = Math.sin(time * 3) * 0.3; // Bow aiming
          }
          break;
        case 'berserker':
          // Aggressive, fast movement
          meshRef.current.rotation.z = Math.sin(time * 8) * 0.4;
          if (weaponRef.current) {
            weaponRef.current.rotation.z = Math.sin(time * 10) * 0.6; // Wild swinging
          }
          break;
        case 'guard':
          // Slow, steady movement
          meshRef.current.rotation.z = Math.sin(time * 2) * 0.1;
          if (helmetRef.current) {
            helmetRef.current.rotation.y = Math.sin(time * 1.5) * 0.2; // Looking around
          }
          break;
      }
    }
  });

  if (enemy.defeated) {
    return null; // Don't render defeated enemies
  }

  // Different visual styles based on enemy type
  const getWeaponGeometry = () => {
    switch (enemy.type) {
      case 'archer':
        return <boxGeometry args={[1.2, 0.06, 0.05]} />; // Bow
      case 'berserker':
        return <boxGeometry args={[1.5, 0.12, 0.08]} />; // Large axe
      case 'guard':
        return <boxGeometry args={[0.8, 0.15, 0.3]} />; // Shield
      default:
        return <boxGeometry args={[1.0, 0.08, 0.05]} />; // Standard sword
    }
  };
  
  const getHelmetGeometry = () => {
    switch (enemy.type) {
      case 'berserker':
        return <boxGeometry args={[0.6, 0.4, 0.4]} />; // Square helmet
      case 'guard':
        return <boxGeometry args={[0.7, 0.5, 0.5]} />; // Large helmet
      default:
        return <sphereGeometry args={[0.25, 8, 6]} />; // Round helmet
    }
  };

  return (
    <group position={[enemy.position.x, enemy.position.y, 0]}>
      {/* Enemy body - size and color based on type */}
      <mesh ref={meshRef}>
        <boxGeometry args={[config.size.width * 0.7, config.size.height * 0.9, 0.3]} />
        <meshStandardMaterial 
          color={config.color} 
          transparent={healthPercent < 1}
          opacity={healthPercent < 1 ? 0.7 + healthPercent * 0.3 : 1}
        />
      </mesh>
      
      {/* Health indicator - red tint when damaged */}
      {healthPercent < 1 && (
        <mesh position={[0, 0.1, 0.01]}>
          <boxGeometry args={[config.size.width * 0.8, config.size.height * 0.95, 0.32]} />
          <meshStandardMaterial 
            color="#FF0000" 
            transparent 
            opacity={0.3 * (1 - healthPercent)}
          />
        </mesh>
      )}
      
      {/* Enemy helmet */}
      <mesh ref={helmetRef} position={[0, config.size.height * 0.4, 0]}>
        {getHelmetGeometry()}
        <meshStandardMaterial color="#696969" />
      </mesh>
      
      {/* Enemy weapon */}
      <mesh ref={weaponRef} position={[-config.size.width * 0.6, 0.2, 0]}>
        {getWeaponGeometry()}
        <meshStandardMaterial color={enemy.type === 'guard' ? '#8B4513' : '#A0A0A0'} />
      </mesh>
      
      {/* Special features for specific enemy types */}
      {enemy.type === 'berserker' && (
        // Berserker spikes
        <mesh position={[0, config.size.height * 0.5, 0]}>
          <coneGeometry args={[0.1, 0.3, 4]} />
          <meshStandardMaterial color="#444444" />
        </mesh>
      )}
      
      {enemy.type === 'guard' && (
        // Guard's cape
        <mesh position={[0.3, 0, -0.1]} rotation={[0, 0, 0.3]}>
          <boxGeometry args={[0.1, config.size.height * 0.8, 0.05]} />
          <meshStandardMaterial color="#4B0082" transparent opacity={0.8} />
        </mesh>
      )}
    </group>
  );
}
