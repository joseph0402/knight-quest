import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { useKeyboardControls } from "@react-three/drei";
import * as THREE from "three";

interface KnightProps {
  position: { x: number; y: number };
  onPositionChange: (position: { x: number; y: number }) => void;
  isAttacking: boolean;
  onAttackChange: (attacking: boolean) => void;
}

export function Knight({ position, onPositionChange, isAttacking, onAttackChange }: KnightProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const swordRef = useRef<THREE.Mesh>(null);
  const helmetRef = useRef<THREE.Mesh>(null);
  const handleRef = useRef<THREE.Mesh>(null);
  const [, getState] = useKeyboardControls();
  const attackTimer = useRef(0);
  const isMoving = useRef(false);
  const movementDirection = useRef(0); // -1 for down, 1 for up, 0 for none

  useFrame((state, delta) => {
    const controls = getState();
    
    // Handle movement
    let newY = position.y;
    const moveSpeed = 5;
    let currentlyMoving = false;
    let currentDirection = 0;
    
    if (controls.up) {
      newY = Math.min(2, position.y + moveSpeed * delta);
      currentlyMoving = true;
      currentDirection = 1;
    }
    if (controls.down) {
      newY = Math.max(-2, position.y - moveSpeed * delta);
      currentlyMoving = true;
      currentDirection = -1;
    }
    
    // Update movement state
    isMoving.current = currentlyMoving;
    movementDirection.current = currentDirection;
    
    if (newY !== position.y) {
      onPositionChange({ x: position.x, y: newY });
    }

    // Handle attack
    if (controls.attack && !isAttacking) {
      onAttackChange(true);
      attackTimer.current = 0.6; // Slightly longer attack duration for better animation
    }

    if (isAttacking) {
      attackTimer.current -= delta;
      if (attackTimer.current <= 0) {
        onAttackChange(false);
      }
    }

    // Enhanced knight body animations
    if (meshRef.current) {
      const time = state.clock.elapsedTime;
      let bodyRotation = 0;
      let bodyPositionY = 0;
      let bodyScale = 1;
      
      if (isAttacking) {
        // Attack animation: lean forward and add impact
        const attackProgress = THREE.MathUtils.clamp(1 - (attackTimer.current / 0.6), 0, 1);
        const leanIntensity = Math.sin(attackProgress * Math.PI) * 0.3;
        bodyRotation = leanIntensity;
        
        // Add slight scale effect during attack
        bodyScale = 1 + Math.sin(attackProgress * Math.PI) * 0.1;
      } else if (isMoving.current) {
        // Movement animation: body tilt and walking bob
        const walkBob = Math.sin(time * 8) * 0.05;
        const tilt = movementDirection.current * 0.15;
        
        bodyRotation = tilt;
        bodyPositionY = walkBob;
        bodyScale = 1;
      } else {
        // Idle animation: gentle breathing
        const breathe = Math.sin(time * 2) * 0.03;
        bodyRotation = THREE.MathUtils.lerp(meshRef.current.rotation.z, breathe, delta * 3);
        bodyPositionY = THREE.MathUtils.lerp(meshRef.current.position.y, breathe * 0.5, delta * 3);
        bodyScale = THREE.MathUtils.lerp(meshRef.current.scale.x, 1, delta * 5);
      }
      
      // Apply animations to body
      meshRef.current.rotation.z = bodyRotation;
      meshRef.current.position.y = bodyPositionY;
      meshRef.current.scale.setScalar(bodyScale);
    }

    // Enhanced helmet animation - follow body movements
    if (helmetRef.current && meshRef.current) {
      const time = state.clock.elapsedTime;
      
      // Helmet follows body position, rotation, and scale
      helmetRef.current.position.y = 0.9 + (meshRef.current.position.y || 0);
      helmetRef.current.scale.copy(meshRef.current.scale);
      
      if (isAttacking) {
        // Helmet slight delay during attack
        const attackProgress = THREE.MathUtils.clamp(1 - (attackTimer.current / 0.6), 0, 1);
        helmetRef.current.rotation.z = meshRef.current.rotation.z + Math.sin(attackProgress * Math.PI) * 0.1;
      } else if (isMoving.current) {
        // Helmet bob during movement - follow body rotation plus small addition
        helmetRef.current.rotation.z = meshRef.current.rotation.z + Math.sin(time * 8) * 0.08 * movementDirection.current;
      } else {
        // Idle helmet sway - follow body plus small addition
        helmetRef.current.rotation.z = meshRef.current.rotation.z + Math.sin(time * 1.5) * 0.02;
      }
    }

    // Enhanced handle animation - follow body movements
    if (handleRef.current && meshRef.current) {
      // Handle follows body position, rotation, and scale
      handleRef.current.position.y = 0.2 + (meshRef.current.position.y || 0);
      handleRef.current.rotation.z = meshRef.current.rotation.z;
      handleRef.current.scale.copy(meshRef.current.scale);
    }

    // Enhanced sword animation - follow body movements
    if (swordRef.current && meshRef.current) {
      const time = state.clock.elapsedTime;
      
      // Sword follows body scale and base position
      swordRef.current.scale.copy(meshRef.current.scale);
      const baseY = 0.2 + (meshRef.current.position.y || 0);
      
      if (isAttacking) {
        // More dynamic sword swing - additive to body transforms
        const attackProgress = THREE.MathUtils.clamp(1 - (attackTimer.current / 0.6), 0, 1);
        const swingAngle = attackProgress < 0.5 
          ? -Math.PI * 0.3 * Math.sin(attackProgress * 2 * Math.PI) 
          : -Math.PI * 0.2 * Math.sin((attackProgress - 0.5) * 4 * Math.PI);
        
        // Compose body rotation with swing
        swordRef.current.rotation.z = meshRef.current.rotation.z + swingAngle;
        
        // Add position animation during swing
        swordRef.current.position.x = 0.7 + Math.sin(attackProgress * Math.PI) * 0.3;
        swordRef.current.position.y = baseY + Math.sin(attackProgress * Math.PI) * 0.2;
      } else {
        // Return sword to normal position, preserving body transforms
        const targetRotation = meshRef.current.rotation.z;
        const targetY = baseY;
        
        swordRef.current.rotation.z = THREE.MathUtils.lerp(swordRef.current.rotation.z, targetRotation, delta * 8);
        swordRef.current.position.x = THREE.MathUtils.lerp(swordRef.current.position.x, 0.7, delta * 6);
        swordRef.current.position.y = THREE.MathUtils.lerp(swordRef.current.position.y, targetY, delta * 6);
        
        // Deterministic sword movement during walking - additive to body transforms
        if (isMoving.current) {
          swordRef.current.rotation.z = meshRef.current.rotation.z + Math.sin(time * 6) * 0.05;
        }
      }
    }
  });

  return (
    <group position={[position.x, position.y, 0]}>
      {/* Knight body */}
      <mesh ref={meshRef}>
        <boxGeometry args={[0.8, 1.5, 0.3]} />
        <meshStandardMaterial color="#4169E1" />
      </mesh>
      
      {/* Knight helmet */}
      <mesh ref={helmetRef} position={[0, 0.9, 0]}>
        <sphereGeometry args={[0.3, 8, 6]} />
        <meshStandardMaterial color="#C0C0C0" />
      </mesh>
      
      {/* Sword */}
      <mesh ref={swordRef} position={[0.7, 0.2, 0]}>
        <boxGeometry args={[1.2, 0.1, 0.05]} />
        <meshStandardMaterial color="#FFD700" />
      </mesh>
      
      {/* Sword handle */}
      <mesh ref={handleRef} position={[0.1, 0.2, 0]}>
        <boxGeometry args={[0.3, 0.2, 0.1]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
    </group>
  );
}
