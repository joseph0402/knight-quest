import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface ObstacleProps {
  position: { x: number; y: number };
}

export function Obstacle({ position }: ObstacleProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (meshRef.current) {
      // Simple rotation animation
      meshRef.current.rotation.y += delta;
    }
  });

  return (
    <group position={[position.x, position.y, 0]}>
      {/* Rock obstacle */}
      <mesh ref={meshRef}>
        <dodecahedronGeometry args={[0.5]} />
        <meshStandardMaterial color="#708090" />
      </mesh>
    </group>
  );
}
