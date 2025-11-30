import React, { useState, useEffect } from 'react';
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

  useEffect(() => {
    const handleScroll = () => {
      if (!hasStarted) {
        handleStart();
      }
    };

    window.addEventListener('wheel', handleScroll);
    return () => {
      window.removeEventListener('wheel', handleScroll);
    };
  }, [hasStarted]);

  return (
    <div className="relative w-full h-screen bg-black text-white selection:bg-pink-500 selection:text-white overflow-hidden">
      {!hasStarted ? (
        <div className="absolute inset-0 z-0">
          <video
            src="https://res.cloudinary.com/da2siqgcu/video/upload/v1764495515/hero_section_kyxepb.mp4"
            autoPlay
            loop
            muted
            className="absolute w-full h-full object-cover"
          />
        </div>
      ) : (
        <>
          {/* 3D Layer - Renders only when the game has started */}
          <div className="absolute inset-0 z-0">
            <GameWorld gameState={gameState} setGameState={setGameState} />
          </div>

          {/* UI Overlay Layer */}
          <div className="relative z-10 pointer-events-none w-full h-full">
            {/* HUD (Only visible in Game) */}
            <HUD gameState={gameState} setGameState={setGameState} />

            {/* Intro Hints */}
            {gameState.phase === GamePhase.INTRO && (
              <div className="absolute bottom-10 w-full text-center animate-pulse opacity-50">
                <p className="font-jersey text-xl tracking-[0.5em] text-pink-500">SCROLL TO VIBE CHECK</p>
              </div>
            )}

            {/* Transition Flash */}
            {gameState.phase === GamePhase.TRANSITION && (
              <div
                className="fixed inset-0 bg-white z-50 animate-[fadeOut_1s_ease-out_forwards]"
                style={{ animationName: 'fadeOut', animationDuration: '0.5s' }}
              ></div>
            )}
          </div>
        </>
      )}

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