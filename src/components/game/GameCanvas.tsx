import React, { useEffect, useRef } from 'react';
import * as PIXI from 'pixi.js';

interface GameCanvasProps {
  width?: number;
  height?: number;
}

const GameCanvas: React.FC<GameCanvasProps> = ({ 
  width = 800, 
  height = 600 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const appRef = useRef<PIXI.Application | null>(null);
  const animationIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (!canvasRef.current) {
      console.warn('Canvas element is not available');
      return;
    }

    let app: PIXI.Application | null = null;

    try {
      const parentElement = canvasRef.current.parentElement;
      let canvasWidth = width;
      let canvasHeight = height;

      if (parentElement) {
        const rect = parentElement.getBoundingClientRect();
        canvasWidth = Math.min(width, rect.width - 32); 
        canvasHeight = Math.min(height, rect.height - 32);
      }

      app = new PIXI.Application({
        view: canvasRef.current,
        width: canvasWidth,
        height: canvasHeight,
        backgroundColor: 0x1a1a1a,
        antialias: true,
      });

      appRef.current = app;

      const gameContainer = new PIXI.Container();
      app.stage.addChild(gameContainer);

      const gameField = new PIXI.Graphics();
      gameField.beginFill(0x2a2a2a);
      gameField.drawRect(0, 0, canvasWidth, canvasHeight);
      gameField.endFill();
      gameContainer.addChild(gameField);

      const border = new PIXI.Graphics();
      border.lineStyle(2, 0x444444);
      border.drawRect(0, 0, canvasWidth, canvasHeight);
      gameContainer.addChild(border);

      const style = new PIXI.TextStyle({
        fontFamily: 'Arial',
        fontSize: 24,
        fill: 0xffffff,
        align: 'center',
      });

      const gameText = new PIXI.Text('Игровое поле', style);
      gameText.x = canvasWidth / 2 - gameText.width / 2;
      gameText.y = canvasHeight / 2 - gameText.height / 2;
      gameContainer.addChild(gameText);

      let time = 0;
      const animate = () => {
        time += 0.01;
        gameText.alpha = 0.5 + Math.sin(time) * 0.3;
      };

      if (app.ticker && typeof app.ticker.add === 'function') {
        app.ticker.add(animate);
      } else {
        const animateLoop = () => {
          animate();
          animationIdRef.current = requestAnimationFrame(animateLoop);
        };
        animationIdRef.current = requestAnimationFrame(animateLoop);
      }

      return () => {
        try {
          if (app?.ticker && typeof app.ticker.remove === 'function') {
            app.ticker.remove(animate);
          }

          if (animationIdRef.current) {
            cancelAnimationFrame(animationIdRef.current);
            animationIdRef.current = null;
          }

          if (app && typeof app.destroy === 'function') {
            app.destroy(true);
            app = null;
            appRef.current = null;
          }
        } catch (error) {
          console.warn('Error during PIXI cleanup:', error);
        }
      };
    } catch (error) {
      console.error('Error creating PIXI application:', error);
    }
  }, [width, height]);

  return (
    <div className="w-full h-full bg-gray-900 flex items-center justify-center p-4 relative">
      <canvas 
        ref={canvasRef} 
        className="border border-gray-600 rounded-lg max-w-full max-h-full" 
        style={{ maxWidth: '100%', maxHeight: '100%' }}
      />
      <div className="absolute inset-0 flex items-center justify-center text-white text-lg pointer-events-none">
        Игровое поле
      </div>
    </div>
  );
};

export default GameCanvas;