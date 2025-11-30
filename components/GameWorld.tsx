import React, { Suspense, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { Physics } from '@react-three/cannon';
import { ScrollControls, KeyboardControls, Environment, Stars } from '@react-three/drei';
import { EffectComposer, Bloom, Noise, Vignette } from '@react-three/postprocessing';
import { City } from './City';
import { Player } from './Player';
import { HeroScene } from './HeroScene';
import { GameState, GamePhase } from '../types';

interface GameWorldProps {
  gameState: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
}

enum Controls {
  forward = 'forward',
  backward = 'backward',
  left = 'left',
  right = 'right',
  brake = 'brake',
  interact = 'interact',
}

export const GameWorld: React.FC<GameWorldProps> = ({ gameState, setGameState }) => {
  const isIntro = gameState.phase === GamePhase.INTRO || gameState.phase === GamePhase.TRANSITION;

  const map = useMemo(() => [
    { name: Controls.forward, keys: ['ArrowUp', 'KeyW'] },
    { name: Controls.backward, keys: ['ArrowDown', 'KeyS'] },
    { name: Controls.left, keys: ['ArrowLeft', 'KeyA'] },
    { name: Controls.right, keys: ['ArrowRight', 'KeyD'] },
    { name: Controls.brake, keys: ['Space'] },
    { name: Controls.interact, keys: ['KeyF'] },
  ], []);

  const handleCanvasClick = () => {
    const canvas = document.getElementById('game-canvas');
    if (canvas) canvas.focus();
  };

  return (
    <div className="absolute inset-0 w-full h-full z-0 bg-black" onClick={handleCanvasClick}>
      <KeyboardControls map={map}>
        <Canvas 
            id="game-canvas"
            shadows 
            camera={{ position: [0, 5, 20], fov: 50 }}
            tabIndex={0}
            onCreated={(state) => state.gl.domElement.focus()}
        >
          {/* Atmosphere & Lighting - Vice City Palette */}
          <color attach="background" args={['#240024']} />
          {/* Reduced fog density so mountains are visible */}
          <fog attach="fog" args={['#240024', 20, 100]} />
          
          <ambientLight intensity={0.5} color="#ff00cc" />
          <directionalLight 
            position={[50, 50, 25]} 
            intensity={2} 
            color="#ffaa00"
            castShadow 
            shadow-mapSize={[1024, 1024]} 
          />
          
          <Environment preset="sunset" blur={0.5} background={false} />
          <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

          <Suspense fallback={null}>
            <Physics gravity={[0, -9.8, 0]}>
              
              {isIntro ? (
                <ScrollControls pages={4} damping={0.3}>
                  <HeroScene gameState={gameState} setGameState={setGameState} />
                  {/* Hide City during intro to avoid clipping with mountain */}
                  <group position={[0, -100, -100]} visible={false}>
                      <City />
                  </group>
                </ScrollControls>
              ) : (
                <>
                  <City />
                  <Player gameState={gameState} setGameState={setGameState} />
                </>
              )}

            </Physics>

            <EffectComposer disableNormalPass multisampling={0}>
              <Bloom 
                luminanceThreshold={0.8} 
                mipmapBlur 
                intensity={1.5} 
                radius={0.6} 
              />
              <Noise opacity={0.05} />
              <Vignette eskil={false} offset={0.1} darkness={1.1} />
            </EffectComposer>
          </Suspense>
        </Canvas>
      </KeyboardControls>
    </div>
  );
};