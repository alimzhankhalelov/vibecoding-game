import React, { useRef, useLayoutEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Text3D, useScroll, Center } from '@react-three/drei';
import * as THREE from 'three';
import { GameState, GamePhase } from '../types';
import { TEXTURES } from '../utils/textureGen';

interface HeroSceneProps {
  gameState: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
}

const HELICOPTER_COUNT = 3;

interface HelicopterProps {
  offset: number;
  speed: number;
  height: number;
}

const Helicopter: React.FC<HelicopterProps> = ({ offset, speed, height }) => {
  const group = useRef<THREE.Group>(null);
  const rotor = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!group.current || !rotor.current) return;
    const t = state.clock.getElapsedTime();
    
    group.current.position.x = Math.sin(t * speed + offset) * 30;
    group.current.position.z = Math.cos(t * speed + offset) * 10 - 20;
    group.current.position.y = height + Math.sin(t * 2 + offset) * 1;
    group.current.rotation.y = -(t * speed + offset) + Math.PI;
    group.current.rotation.z = 0.1;

    rotor.current.rotation.y += 0.5;
  });

  return (
    <group ref={group}>
      <mesh receiveShadow castShadow>
        <boxGeometry args={[2, 1, 4]} />
        <meshStandardMaterial color="#111" roughness={0.3} metalness={0.8} />
      </mesh>
      <mesh position={[0, 0.5, 3]}>
        <boxGeometry args={[0.5, 0.5, 4]} />
        <meshStandardMaterial color="#000" />
      </mesh>
      <mesh ref={rotor} position={[0, 1, 0]}>
        <boxGeometry args={[8, 0.1, 0.5]} />
        <meshStandardMaterial color="#222" metalness={1} />
      </mesh>
      <pointLight position={[0, -1, 1]} color="#ff0000" intensity={5} distance={20} decay={2} />
    </group>
  );
};

export const HeroScene: React.FC<HeroSceneProps> = ({ gameState, setGameState }) => {
  const scroll = useScroll();
  const { camera } = useThree();
  const pivotGroup = useRef<THREE.Group>(null);
  const vibeTextRef = useRef<THREE.Group>(null);
  const codingTextRef = useRef<any>(null);
  const terrainRef = useRef<THREE.Mesh>(null);

  // Animation Constants
  const START_CAM_POS = new THREE.Vector3(0, 2, 35);
  // End position matches the Player spawn [8, 0, 5] but high up [8, 60, 5] for top down view
  const END_CAM_POS = new THREE.Vector3(8, 60, 5); 

  // Deform the terrain to look like a Hollywood Ridge
  useLayoutEffect(() => {
      if (terrainRef.current) {
          const geo = terrainRef.current.geometry;
          const pos = geo.attributes.position;
          for (let i = 0; i < pos.count; i++) {
              const x = pos.getX(i);
              const y = pos.getY(i); 
              
              // NEW TERRAIN LOGIC: Smooth & Massive
              
              // 1. Calculate distance from center X (horizontal)
              const absX = Math.abs(x);
              
              // 2. Create a "Stage" area. If we are within X=[-15, 15] and Y=[-10, 10], keep it flat.
              // We use a smoothstep function to blend the flat area into the mountain.
              const isCenter = Math.max(0, 1 - (Math.sqrt(x*x + y*y) / 20)); // 0 to 1 (1 at center)
              
              // 3. Low Frequency Noise for rolling hills (not spikes)
              // Multiply by 0.1 instead of 0.5 to make waves huge and wide
              const rollingHills = (Math.sin(x * 0.15) + Math.cos(y * 0.1)) * 4;
              
              // 4. The Ridge Wall.
              // We want the mountain to rise up BEHIND the text.
              // The plane is rotated -Math.PI/2.5. So "Y" in local space is roughly "Z" (distance) in world space.
              // We want vertices with high Y (background) to be tall.
              const ridgeHeight = Math.max(0, y + 5) * 1.5;

              // Combine:
              // Flatten the center where text is.
              // Allow mountains to rise outside the center.
              const flatness = 1 - Math.pow(isCenter, 2); // 0 at center, 1 at edges
              
              const z = (rollingHills + ridgeHeight) * flatness;
              
              pos.setZ(i, z);
          }
          geo.computeVertexNormals();
      }
  }, []);

  useFrame((state) => {
    if (gameState.phase !== GamePhase.INTRO && gameState.phase !== GamePhase.TRANSITION) return;

    const r1 = scroll.range(0, 1);
    
    // 1. Camera Movement: Smooth Lerp to Top-Down View above Player
    camera.position.lerpVectors(START_CAM_POS, END_CAM_POS, r1);
    
    // LookAt Logic: Transition from looking at Text to looking at Ground (Player spawn)
    const lookAtStart = new THREE.Vector3(0, 5, 0);
    const lookAtEnd = new THREE.Vector3(8, 0, 5); // Player spawn target
    const currentLookAt = new THREE.Vector3().lerpVectors(lookAtStart, lookAtEnd, r1);
    camera.lookAt(currentLookAt);

    // 2. The Shift
    if (pivotGroup.current) {
        // Tilt the mountain back slightly as we fly over it
        pivotGroup.current.rotation.x = THREE.MathUtils.lerp(0, -Math.PI / 4, r1);
    }

    // 3. Vibe Sign Float
    if (vibeTextRef.current) {
        const t = state.clock.getElapsedTime();
        vibeTextRef.current.position.y = 4.2 + Math.sin(t * 3) * 0.1;
    }

    // Phase Change logic
    if (r1 > 0.98 && gameState.phase === GamePhase.INTRO) {
        setGameState(prev => ({ ...prev, phase: GamePhase.TRANSITION }));
        
        setTimeout(() => {
             // Snap camera to perfect top-down orientation for gameplay
             camera.rotation.set(-Math.PI/2, 0, 0);
             camera.position.set(8, 60, 5); // Ensure alignment
             setGameState(prev => ({ ...prev, phase: GamePhase.PLAYING }));
        }, 500);
    }
  });

  return (
    <group>
      <group ref={pivotGroup}>
        {/* The Mountain Ridge - NEON CYAN - Moved back to Z=-20 */}
        <mesh ref={terrainRef as any} position={[0, -10, -25]} rotation={[-Math.PI / 2.5, 0, 0]} receiveShadow>
            <planeGeometry args={[120, 100, 64, 64]} />
            <meshStandardMaterial 
                color="#00ffff" 
                emissive="#004444"
                emissiveIntensity={0.2}
                roughness={0.4} 
                metalness={0.6}
                wireframe={false}
            />
        </mesh>
        
        {/* Wireframe Grid Overlay for that Synthwave look */}
         <mesh position={[0, -9.9, -25]} rotation={[-Math.PI / 2.5, 0, 0]}>
            <planeGeometry args={[120, 100, 64, 64]} />
            <meshBasicMaterial color="#00ffff" wireframe={true} transparent opacity={0.15} />
        </mesh>

        {/* Uplighting for the Text/Hill */}
        <spotLight 
            position={[0, -20, 30]}
            target={terrainRef.current || undefined}
            color="#00ffff"
            intensity={10}
            angle={1}
            penumbra={1}
            castShadow
        />

        {/* "CODING" Text - Moved forward to Z=5 to guarantee it sits in front of any terrain bumps */}
        <Center position={[0, 0, 5]} rotation={[0,0,0]}>
            <Text3D 
                ref={codingTextRef}
                font="https://threejs.org/examples/fonts/helvetiker_bold.typeface.json"
                size={5}
                height={2}
                curveSegments={12}
                bevelEnabled
                bevelThickness={0.1}
                bevelSize={0.02}
                bevelOffset={0}
                bevelSegments={5}
                castShadow
                receiveShadow
            >
                CODING
                <meshStandardMaterial color="#fff" roughness={0.1} metalness={0.1} />
            </Text3D>
        </Center>

        {/* "VIBE" Neon Sign - Overlapping CODING */}
        <group ref={vibeTextRef} position={[0, 2.5, 6]} rotation={[0, 0, 0.1]}>
             <Center>
                <Text3D
                    font="https://threejs.org/examples/fonts/helvetiker_bold.typeface.json"
                    size={4}
                    height={0.2}
                    curveSegments={12}
                >
                    Vibe
                    <meshStandardMaterial 
                        color="#ff00ff" 
                        emissive="#ff00ff" 
                        emissiveIntensity={4} 
                        toneMapped={false}
                    />
                </Text3D>
             </Center>
        </group>
        
        {/* Billboard - Moved to X=20, Z=4 to be clearly visible */}
        <group position={[22, 2, 4]} rotation={[0, -0.4, 0]}>
             <mesh castShadow>
                <boxGeometry args={[12, 7, 0.5]} />
                <meshStandardMaterial map={TEXTURES.billboard} />
             </mesh>
             <mesh position={[0, -4, 0]}>
                <cylinderGeometry args={[0.2, 0.2, 6]} />
                <meshStandardMaterial color="#222" />
             </mesh>
        </group>
      </group>

      {[...Array(HELICOPTER_COUNT)].map((_, i) => (
          <Helicopter key={i} offset={i * (Math.PI * 2 / HELICOPTER_COUNT)} speed={0.4} height={20 + i * 5} />
      ))}
    </group>
  );
};