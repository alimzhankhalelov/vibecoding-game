import React, { useState } from 'react';
import { GameWorld } from './components/GameWorld';
import { HUD } from './components/HUD';
import { GameState, GamePhase } from './types';

const INITIAL_STATE: GameState = {
  phase: GamePhase.INTRO,
  scrollProgress: 0,
  playerMode: 'WALKING',
  radioStation: 'LO-FI SYNTAX',
  radioVolume: 0.3,
  missions: [],
  activeMission: null,
  health: 100,
  wantedLevel: 0,
  cheats: [],
};

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(INITIAL_STATE);
  const [hasStarted, setHasStarted] = useState(false);

  const handleStart = () => {
    setHasStarted(true);
    // Force focus to canvas for keyboard events
    setTimeout(() => {
        const canvas = document.getElementById('game-canvas');
        if (canvas) canvas.focus();
    }, 100);
  };

  return (
    <div className="relative w-full h-screen bg-black text-white selection:bg-pink-500 selection:text-white overflow-hidden">
      
      {/* 3D Layer - Handles Intro & Game */}
      <div className="absolute inset-0 z-0">
         <GameWorld gameState={gameState} setGameState={setGameState} />
      </div>

      {/* UI Overlay Layer */}
      <div className="relative z-10 pointer-events-none w-full h-full">
        
        {/* CLICK TO START OVERLAY (Fixes Input Focus) */}
        {!hasStarted && (
            <div className="absolute inset-0 z-[100] flex items-center justify-center bg-black/80 pointer-events-auto backdrop-blur-sm transition-opacity duration-500"
                 onClick={handleStart}>
                <div className="text-center cursor-pointer hover:scale-105 transition-transform">
                    <h1 className="text-6xl font-jersey text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600 animate-pulse">
                        VIBECODING
                    </h1>
                    <p className="text-white/70 mt-4 text-xl font-mono blink">CLICK TO INITIALIZE</p>
                </div>
            </div>
        )}

        {/* HUD (Only visible in Game) */}
        {hasStarted && <HUD gameState={gameState} setGameState={setGameState} />}

        {/* Intro Hints */}
        {hasStarted && gameState.phase === GamePhase.INTRO && (
           <div className="absolute bottom-10 w-full text-center animate-pulse opacity-50">
              <p className="font-jersey text-xl tracking-[0.5em] text-pink-500">SCROLL TO VIBE CHECK</p>
           </div>
        )}

        {/* Transition Flash */}
        {gameState.phase === GamePhase.TRANSITION && (
            <div className="fixed inset-0 bg-white z-50 animate-[fadeOut_1s_ease-out_forwards]" 
                 style={{ animationName: 'fadeOut', animationDuration: '0.5s' }}>
            </div>
        )}
      </div>

      <style>{`
        @keyframes fadeOut {
            from { opacity: 1; }
            to { opacity: 0; pointer-events: none; }
        }
        .blink { animation: blink 1s infinite; }
        @keyframes blink { 50% { opacity: 0; } }
      `}</style>
    </div>
  );
};

export default App;