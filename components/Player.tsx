import React, { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useSphere, useBox } from '@react-three/cannon';
import { useKeyboardControls } from '@react-three/drei';
import * as THREE from 'three';
import { GameState, GamePhase, CONSTANTS } from '../types';

interface PlayerProps {
  gameState: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
}

export const Player: React.FC<PlayerProps> = ({ gameState, setGameState }) => {
  const { camera } = useThree();
  const [sub, get] = useKeyboardControls();
  
  // Physics bodies
  const [sphereRef, sphereApi] = useSphere(() => ({
    mass: 1,
    position: [0, 5, 0], // Drop in
    args: [0.5],
    fixedRotation: true,
    linearDamping: 0.9,
  }));

  const [carRef, carApi] = useBox(() => ({
    mass: 20,
    position: [8, 2, 5],
    args: [2, 1, 4],
    linearDamping: 0.95, // High damping for snappy stops (no sliding)
    angularDamping: 0.95, // No spinning out
    friction: 0.1, // Tires grip
  }));

  // Wake up physics on mount to prevent "frozen" controls
  useEffect(() => {
    sphereApi.wakeUp();
    carApi.wakeUp();
  }, [sphereApi, carApi]);

  // Handle interaction (Enter/Exit Car)
  useEffect(() => {
    return sub(
      (state) => state.interact,
      (pressed) => {
        if (pressed) {
          setGameState(prev => {
            if (prev.playerMode === 'WALKING') {
               return { ...prev, playerMode: 'DRIVING' };
            } else {
               return { ...prev, playerMode: 'WALKING' };
            }
          });
        }
      }
    );
  }, [sub, setGameState]);

  useFrame(() => {
    if (gameState.phase !== GamePhase.PLAYING) return;

    const { forward, backward, left, right, brake } = get();
    let targetPos = new THREE.Vector3();

    if (gameState.playerMode === 'WALKING') {
      const fwdVal = forward ? 1 : 0;
      const bwdVal = backward ? 1 : 0;
      const lftVal = left ? 1 : 0;
      const rgtVal = right ? 1 : 0;

      const direction = new THREE.Vector3(rgtVal - lftVal, 0, bwdVal - fwdVal);
      if (direction.length() > 0) direction.normalize().multiplyScalar(CONSTANTS.WALK_SPEED);
      
      sphereApi.velocity.set(direction.x, -5, direction.z);

      // Camera: Strict Top-Down View
      if (sphereRef.current) {
         // @ts-ignore
         targetPos.copy(sphereRef.current.position);
         // Position camera high above
         const camPos = new THREE.Vector3(targetPos.x, 40, targetPos.z); 
         // FAST Lerp for responsiveness
         camera.position.lerp(camPos, 0.25);
         // Look straight down
         camera.lookAt(targetPos);
         // Lock rotation to be strictly top-down
         camera.rotation.set(-Math.PI / 2, 0, 0); 
      }

    } else {
      // DRIVING LOGIC
      const speed = CONSTANTS.CAR_SPEED;
      const turnSpeed = 3.5; // Snappy turning

      // Apply local forces
      if (forward) carApi.applyLocalImpulse([0, 0, -speed], [0, 0, 0]);
      if (backward) carApi.applyLocalImpulse([0, 0, speed], [0, 0, 0]);
      
      if (left) carApi.angularVelocity.set(0, turnSpeed, 0);
      if (right) carApi.angularVelocity.set(0, -turnSpeed, 0);
      
      if (brake) {
          // Hard brake
          carApi.velocity.set(0,0,0);
          carApi.angularVelocity.set(0,0,0);
      }

      if (carRef.current) {
          // @ts-ignore
          targetPos.copy(carRef.current.position);
          
          // Move player sphere with car so you don't lose it
          sphereApi.position.set(targetPos.x + 3, targetPos.y + 2, targetPos.z);
          sphereApi.velocity.set(0, 0, 0);

          // Camera: Strict Top-Down
          const camPos = new THREE.Vector3(targetPos.x, 50, targetPos.z);
          // FAST Lerp for responsiveness
          camera.position.lerp(camPos, 0.25);
          camera.lookAt(targetPos);
          camera.rotation.set(-Math.PI / 2, 0, 0);
      }
    }
  });

  return (
    <>
      <mesh ref={sphereRef as any} visible={gameState.playerMode === 'WALKING'} castShadow>
        <sphereGeometry args={[0.5]} />
        <meshStandardMaterial color="hotpink" emissive="#ff00ff" emissiveIntensity={0.5} />
        <pointLight color="hotpink" distance={5} intensity={2} />
      </mesh>

      <mesh ref={carRef as any} castShadow receiveShadow>
        <boxGeometry args={[2, 1, 4]} />
        <meshStandardMaterial color={gameState.playerMode === 'DRIVING' ? "#00ffff" : "#333"} metalness={0.8} roughness={0.2} />
        
        <mesh position={[0, 0.6, -0.2]}>
             <boxGeometry args={[1.8, 0.6, 2]} />
             <meshStandardMaterial color="#111" />
        </mesh>

        <group position={[0, 0, -2]}>
            {/* SpotLights for headlights */}
            <spotLight 
                position={[0.6, 0, 0]} 
                color="#fff" 
                intensity={gameState.playerMode === 'DRIVING' ? 50 : 0} 
                distance={50} 
                angle={0.6} 
                penumbra={0.5} 
                castShadow 
                target-position={[0.6, -2, -10]}
            />
            <spotLight 
                position={[-0.6, 0, 0]} 
                color="#fff" 
                intensity={gameState.playerMode === 'DRIVING' ? 50 : 0} 
                distance={50} 
                angle={0.6} 
                penumbra={0.5} 
                castShadow 
                target-position={[-0.6, -2, -10]}
            />
            
            <mesh position={[0.6, 0, 0]}>
                <boxGeometry args={[0.4, 0.2, 0.1]} />
                <meshStandardMaterial color="#fff" emissive="#fff" emissiveIntensity={5} />
            </mesh>
            <mesh position={[-0.6, 0, 0]}>
                <boxGeometry args={[0.4, 0.2, 0.1]} />
                <meshStandardMaterial color="#fff" emissive="#fff" emissiveIntensity={5} />
            </mesh>
        </group>

        <group position={[0, 0, 2]}>
            <mesh position={[0.6, 0, 0]}>
                <boxGeometry args={[0.4, 0.2, 0.1]} />
                <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={3} />
            </mesh>
            <mesh position={[-0.6, 0, 0]}>
                <boxGeometry args={[0.4, 0.2, 0.1]} />
                <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={3} />
            </mesh>
        </group>
      </mesh>
    </>
  );
};