export enum GamePhase {
  INTRO = 'INTRO',
  TRANSITION = 'TRANSITION',
  PLAYING = 'PLAYING',
  GAME_OVER = 'GAME_OVER'
}

export type PlayerMode = 'WALKING' | 'DRIVING';

export interface Mission {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  position: [number, number, number];
}

export interface GameState {
  phase: GamePhase;
  scrollProgress: number;
  playerMode: PlayerMode;
  radioStation: string;
  radioVolume: number;
  missions: Mission[];
  activeMission: Mission | null;
  health: number;
  wantedLevel: number;
  cheats: string[];
}

export const CONSTANTS = {
  CITY_SIZE: 20,
  BLOCK_SIZE: 10,
  CAR_SPEED: 12,
  WALK_SPEED: 5,
};