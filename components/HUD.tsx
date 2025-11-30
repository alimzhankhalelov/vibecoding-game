import React, { useEffect, useState } from 'react';
import { GameState, Mission } from '../types';
import { Radio, ShieldAlert, Crosshair, Music, Terminal } from 'lucide-react';

interface HUDProps {
  gameState: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
}

export const HUD: React.FC<HUDProps> = ({ gameState, setGameState }) => {
  const [cheatInput, setCheatInput] = useState('');
  
  // Cheat Code Listener
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
        if (gameState.phase !== 'PLAYING') return;
        
        // Simple buffer for cheat codes
        const char = e.key.toUpperCase();
        if (char.length === 1 && /[A-Z]/.test(char)) {
            setCheatInput(prev => {
                const next = (prev + char).slice(-10); // Keep last 10 chars
                
                if (next.includes("HESOYAM")) {
                    // Activate cheat
                    console.log("CHEAT ACTIVATED: HEALTH");
                    return '';
                }
                if (next.includes("VIBECHECK")) {
                   document.body.style.filter = "invert(1)";
                   setTimeout(() => document.body.style.filter = "invert(0)", 1000);
                   return '';
                }
                return next;
            });
        }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [gameState.phase]);

  if (gameState.phase !== 'PLAYING') return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-10 p-6 flex flex-col justify-between">
      {/* Top Left: Status */}
      <div className="flex gap-4">
        <div className="bg-black/50 backdrop-blur border border-white/20 p-2 rounded flex items-center gap-2 text-green-400 font-jersey text-2xl">
          <ShieldAlert className="w-6 h-6" />
          <span>$1,000,000</span>
        </div>
        <div className="bg-black/50 backdrop-blur border border-white/20 p-2 rounded flex items-center gap-2 text-pink-500 font-jersey text-2xl">
          <Terminal className="w-6 h-6" />
          <span>WANTED: {gameState.wantedLevel}*</span>
        </div>
      </div>

      {/* Top Right: Radio */}
      <div className="absolute top-6 right-6">
         <div className="w-48 bg-gray-900 border-4 border-gray-700 rounded-full h-48 flex items-center justify-center relative shadow-xl">
            <div className="absolute inset-2 border border-gray-600 rounded-full opacity-50"></div>
            <div className="text-center">
                <Music className={`w-8 h-8 mx-auto mb-2 ${gameState.playerMode === 'DRIVING' ? 'text-pink-500 animate-pulse' : 'text-gray-500'}`} />
                <h3 className="text-xs text-gray-400 font-bold uppercase tracking-widest">Station</h3>
                <h2 className="text-lg text-white font-jersey">LO-FI SYNTAX</h2>
                <p className="text-[10px] text-pink-400">{gameState.playerMode === 'DRIVING' ? 'VOL: 100%' : 'VOL: 30%'}</p>
            </div>
            {/* Click Wheel Aesthetic */}
            <div className="absolute bottom-4 w-12 h-12 bg-gray-800 rounded-full border border-gray-600"></div>
         </div>
      </div>

      {/* Bottom Left: Mission */}
      <div className="max-w-sm">
         <div className="bg-yellow-500 text-black p-1 font-bold transform -skew-x-12 inline-block px-4 mb-2">
            CURRENT OBJECTIVE
         </div>
         <div className="bg-black/80 border-l-4 border-yellow-500 p-4 text-white font-mono text-sm">
            <h4 className="font-bold mb-1">THE SEMANTIC SHIFT</h4>
            <p className="opacity-80">Drive to the Vibe Sector. Avoid the Syntax Police.</p>
         </div>
      </div>

      {/* Bottom Right: Controls */}
      <div className="text-right font-jersey text-xl text-white/50">
        <p>WASD to Move</p>
        <p>F to {gameState.playerMode === 'WALKING' ? 'Jack Car' : 'Exit Car'}</p>
        <p>SPACE to Brake</p>
        {cheatInput && <p className="text-xs text-gray-700 mt-2 tracking-widest">{cheatInput}</p>}
      </div>

      {/* Center Reticle (if walking) */}
      {gameState.playerMode === 'WALKING' && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-50">
             <Crosshair className="w-8 h-8 text-white" />
        </div>
      )}
    </div>
  );
};