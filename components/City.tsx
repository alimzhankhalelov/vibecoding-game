import React, { useMemo } from 'react';
import { useBox } from '@react-three/cannon';
import * as THREE from 'three';
import { TEXTURES } from '../utils/textureGen';
import { CONSTANTS } from '../types';

interface BuildingProps {
  position: [number, number, number];
  height: number;
}

const Building: React.FC<BuildingProps> = ({ position, height }) => {
  const [ref] = useBox(() => ({
    mass: 0,
    position: [position[0], height / 2, position[2]],
    args: [CONSTANTS.BLOCK_SIZE * 0.9, height, CONSTANTS.BLOCK_SIZE * 0.9],
    type: 'Static',
  }));

  return (
    <mesh ref={ref as any} castShadow receiveShadow>
      <boxGeometry args={[CONSTANTS.BLOCK_SIZE * 0.9, height, CONSTANTS.BLOCK_SIZE * 0.9]} />
      <meshStandardMaterial color="#333" roughness={0.2} metalness={0.5} />
      
      {/* Procedural Windows (Grid pattern using nested meshes for performance vs texture overhead) */}
      {/* Front Face Windows */}
      <mesh position={[0, 0, CONSTANTS.BLOCK_SIZE * 0.46]}>
         <planeGeometry args={[CONSTANTS.BLOCK_SIZE * 0.8, height * 0.9]} />
         <meshStandardMaterial color="#111" emissive="#00ffff" emissiveIntensity={0.2} />
         {/* Window Grills */}
         <mesh position={[0,0,0.01]}>
             <planeGeometry args={[CONSTANTS.BLOCK_SIZE * 0.8, height * 0.9, 4, Math.floor(height/2)]} />
             <meshBasicMaterial color="#000" wireframe />
         </mesh>
      </mesh>

      {/* Neon Trim */}
      <mesh position={[0, height/2 - 0.1, 0]}>
        <boxGeometry args={[CONSTANTS.BLOCK_SIZE * 0.92, 0.5, CONSTANTS.BLOCK_SIZE * 0.92]} />
        <meshBasicMaterial color={Math.random() > 0.5 ? "#ff00ff" : "#00ffff"} toneMapped={false} />
      </mesh>
      {/* Roof Detail */}
      <mesh position={[0, height/2 + 0.1, 0]} rotation={[-Math.PI/2, 0, 0]}>
         <planeGeometry args={[CONSTANTS.BLOCK_SIZE * 0.8, CONSTANTS.BLOCK_SIZE * 0.8]} />
         <meshStandardMaterial map={TEXTURES.roof} color="#333" />
      </mesh>
    </mesh>
  );
};

const RoadTile: React.FC<{ position: [number, number, number] }> = ({ position }) => {
    // Static physics body for the road segment
    useBox(() => ({
        type: 'Static',
        position: [position[0], -0.1, position[2]],
        rotation: [-Math.PI / 2, 0, 0],
        args: [CONSTANTS.BLOCK_SIZE, CONSTANTS.BLOCK_SIZE, 0.2]
    }));

    return (
        <group position={[position[0], 0.05, position[2]]}>
            {/* Asphalt Base - No more emoji texture, pure dark procedural material */}
            <mesh rotation={[-Math.PI/2, 0, 0]} receiveShadow>
                <planeGeometry args={[CONSTANTS.BLOCK_SIZE, CONSTANTS.BLOCK_SIZE]} />
                <meshStandardMaterial 
                    color="#1a1a1a" 
                    roughness={0.9} 
                    metalness={0.1} 
                />
            </mesh>

            {/* Road Markings (Double Yellow Line) */}
            <mesh position={[0, 0.01, 0]} rotation={[-Math.PI/2, 0, 0]}>
                <planeGeometry args={[0.2, CONSTANTS.BLOCK_SIZE]} />
                <meshStandardMaterial color="#fbbf24" roughness={0.5} />
            </mesh>
            <mesh position={[0.4, 0.01, 0]} rotation={[-Math.PI/2, 0, 0]}>
                <planeGeometry args={[0.2, CONSTANTS.BLOCK_SIZE]} />
                <meshStandardMaterial color="#fbbf24" roughness={0.5} />
            </mesh>

            {/* Crosswalk lines (Procedural decoration) */}
            {Math.random() > 0.8 && (
                <group position={[0, 0.02, 0]}>
                    <mesh position={[2, 0, 0]} rotation={[-Math.PI/2, 0, 0]}>
                        <planeGeometry args={[0.5, CONSTANTS.BLOCK_SIZE * 0.8]} />
                         <meshStandardMaterial color="#fff" opacity={0.5} transparent />
                    </mesh>
                    <mesh position={[-2, 0, 0]} rotation={[-Math.PI/2, 0, 0]}>
                        <planeGeometry args={[0.5, CONSTANTS.BLOCK_SIZE * 0.8]} />
                         <meshStandardMaterial color="#fff" opacity={0.5} transparent />
                    </mesh>
                </group>
            )}
        </group>
    );
};

export const City: React.FC = () => {
  // Generate a procedural grid
  const cityMap = useMemo(() => {
    const elements = [];
    const size = 12; // Grid radius (12x12 blocks)
    const blockSize = CONSTANTS.BLOCK_SIZE;

    for (let x = -size; x <= size; x++) {
      for (let z = -size; z <= size; z++) {
        const posX = x * blockSize;
        const posZ = z * blockSize;

        // Grid Logic: Create streets every 3 blocks to form city blocks
        const isStreetX = x % 3 === 0;
        const isStreetZ = z % 3 === 0;

        // Center "Runway" logic for the intro transition
        const isCenterRunway = Math.abs(x) < 2;

        if (isStreetX || isStreetZ || isCenterRunway) {
            elements.push(<RoadTile key={`road-${x}-${z}`} position={[posX, 0, posZ]} />);
        } else {
            // It's a building block
            const height = 10 + Math.random() * 30;
            elements.push(<Building key={`build-${x}-${z}`} position={[posX, 0, posZ]} height={height} />);
        }
      }
    }
    return elements;
  }, []);

  return (
    <group>
      {cityMap}
      {/* Ensure a floor exists below everything to catch physics glitches */}
      <mesh rotation={[-Math.PI/2, 0, 0]} position={[0, -0.5, 0]}>
          <planeGeometry args={[1000, 1000]} />
          <meshBasicMaterial color="#050505" />
      </mesh>
    </group>
  );
};