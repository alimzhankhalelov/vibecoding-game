import * as THREE from 'three';

export const createEmojiTexture = (emoji: string, bgColor: string, size: number = 256) => {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  
  if (ctx) {
    // Background
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, size, size);
    
    // Emoji
    ctx.font = `${size * 0.8}px serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(emoji, size / 2, size / 2 + size * 0.1);
    
    // Add noise/grit
    ctx.fillStyle = 'rgba(0,0,0,0.1)';
    for(let i=0; i<100; i++) {
        ctx.fillRect(Math.random() * size, Math.random() * size, 4, 4);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
};

export const createBillboardTexture = () => {
  const width = 512;
  const height = 256;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    // Base
    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, width, height);

    // Border
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 10;
    ctx.strokeRect(0, 0, width, height);

    // Title
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 40px Arial';
    ctx.fillText('THE SEMANTIC SHIFT', 20, 60);

    // Body
    ctx.fillStyle = '#aaa';
    ctx.font = '20px monospace';
    ctx.fillText('> SYSTEM.INIT(2025)', 20, 100);
    ctx.fillText('> SYNTAX.INVALIDATE()', 20, 130);
    ctx.fillText('The user does not scroll.', 20, 170);
    ctx.fillText('They traverse the gap.', 20, 200);

    // Decay/Grunge
    ctx.fillStyle = 'rgba(255, 0, 255, 0.1)';
    for(let i=0; i<500; i++) {
      ctx.fillRect(Math.random() * width, Math.random() * height, 2, 2);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
};

// Procedural textures
export const TEXTURES = {
  road: createEmojiTexture('🛣️', '#333'),
  building: createEmojiTexture('🏢', '#222'),
  grass: createEmojiTexture('🌱', '#1a472a'),
  roof: createEmojiTexture('🔋', '#111'),
  billboard: createBillboardTexture(),
};