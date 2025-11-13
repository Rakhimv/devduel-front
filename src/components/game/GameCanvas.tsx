import React from 'react';
import { motion } from 'framer-motion';

interface GameCanvasProps {
  width?: number;
  height?: number;
  player1Level?: number;
  player2Level?: number;
  player1Username?: string;
  player2Username?: string;
  player1Avatar?: string;
  player2Avatar?: string;
}

const GameCanvas: React.FC<GameCanvasProps> = ({
  player1Level = 0,
  player2Level = 0,
  player1Username = 'Player 1',
  player2Username = 'Player 2',
  player1Avatar,
  player2Avatar
}) => {
  const totalLevels = 3;

  const p1Progress = Math.min((player1Level - 1) / (totalLevels - 1), 1);
  const p2Progress = Math.min((player2Level - 1) / (totalLevels - 1), 1);

  const getPlayerPosition = (progress: number, isLeft: boolean): { x: number; y: number } => {
    const startX = isLeft ? 20 : 80;
    const midX = isLeft ? 35 : 65;
    const topX = 50;
    
    const startY = 80;
    const midY = 50;
    const topY = 20;
    
    if (progress <= 0.5) {
      const localProgress = progress / 0.5;
      return {
        x: startX + (midX - startX) * localProgress,
        y: startY - (startY - midY) * localProgress
      };
      } else {
      const localProgress = (progress - 0.5) / 0.5;
      return {
        x: midX + (topX - midX) * localProgress,
        y: midY - (midY - topY) * localProgress
      };
    }
  };

  const p1Pos = getPlayerPosition(p1Progress, true);
  const p2Pos = getPlayerPosition(p2Progress, false);

  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:6047';


  return (
    <div className="w-full h-full relative overflow-hidden" style={{ background: '#0a0e27' }}>
      <div className="absolute inset-0 opacity-20" 
        style={{
          backgroundImage: `
            linear-gradient(rgba(0, 255, 0, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 255, 0, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }}
      />

      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'repeating-linear-gradient(0deg, rgba(0, 255, 0, 0.03) 0px, transparent 2px)',
        }}
        animate={{
          y: [0, 100, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'linear'
        }}
      />

      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-green-400 rounded-full"
          initial={{
            x: Math.random() * 100 + '%',
            y: -20,
            opacity: 0,
          }}
          animate={{
            y: '120%',
            opacity: [0, 0.3, 0],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 2,
            ease: 'linear',
          }}
          style={{
            boxShadow: '0 0 10px rgba(0, 255, 0, 0.5)',
          }}
        />
      ))}

      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at center, rgba(0, 255, 0, 0.05) 0%, transparent 70%)',
        }}
        animate={{
          opacity: [0.5, 1, 0.5],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      <svg className="absolute inset-0 w-full h-full" style={{ pointerEvents: 'none' }}>
        <path
          d={`M 20% 80% L 35% 50% L 50% 20%`}
          fill="none"
          stroke="#1a4d1a"
          strokeWidth="2"
          strokeDasharray="5,5"
        />
        
        <path
          d={`M 80% 80% L 65% 50% L 50% 20%`}
          fill="none"
          stroke="#1a4d1a"
          strokeWidth="2"
          strokeDasharray="5,5"
        />

        <circle cx="20%" cy="80%" r="15" fill="rgba(0, 255, 0, 0.3)" />
        <circle cx="20%" cy="80%" r="12" fill="#0f0" />
        <circle cx="20%" cy="80%" r="5" fill="#2f2" />
        
        <circle cx="80%" cy="80%" r="15" fill="rgba(0, 255, 0, 0.3)" />
        <circle cx="80%" cy="80%" r="12" fill="#0f0" />
        <circle cx="80%" cy="80%" r="5" fill="#2f2" />
        
        <circle cx="35%" cy="50%" r="12" fill="rgba(0, 255, 0, 0.2)" />
        <circle cx="35%" cy="50%" r="10" fill="#0f0" />
        <circle cx="35%" cy="50%" r="4" fill="#2f2" />
        
        <circle cx="65%" cy="50%" r="12" fill="rgba(0, 255, 0, 0.2)" />
        <circle cx="65%" cy="50%" r="10" fill="#0f0" />
        <circle cx="65%" cy="50%" r="4" fill="#2f2" />
        
        <circle cx="50%" cy="20%" r="18" fill="rgba(255, 215, 0, 0.4)" />
        <circle cx="50%" cy="20%" r="15" fill="#ffd700" />
        <circle cx="50%" cy="20%" r="6" fill="#fff" />
      </svg>

      <motion.div
        className="absolute"
        initial={false}
        animate={{
          left: `${p1Pos.x}%`,
          top: `${p1Pos.y}%`,
        }}
        transition={{ duration: 1, ease: [0.4, 0, 0.2, 1] }}
        style={{ x: '-50%', y: '-50%' }}
      >
        <div className="relative">
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{ 
              background: 'radial-gradient(circle, rgba(59, 130, 246, 0.4) 0%, transparent 70%)',
              width: '80px',
              height: '80px',
              margin: '-20px'
            }}
          />
          
          <div className="relative w-10 h-10 rounded-full border-3 border-blue-500 bg-blue-500 overflow-hidden">
            {player1Avatar ? (
              <img 
                src={player1Avatar.startsWith('http') ? player1Avatar : `${backendUrl}${player1Avatar}`}
                alt={player1Username}
                className="w-full h-full object-cover"
                onError={(e) => {
                  console.error('Failed to load avatar:', player1Avatar);
                  e.currentTarget.style.display = 'none';
                }}
              />
            ) : (
              <div className="w-full h-full bg-blue-500" />
            )}
          </div>
          
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 text-xs font-mono font-bold text-green-400 whitespace-nowrap">
            {player1Username}
          </div>
          
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 text-xs font-mono font-bold text-green-400 whitespace-nowrap">
            Lv.{Math.floor(player1Level)}/{totalLevels}
          </div>
        </div>
      </motion.div>

      <motion.div
        className="absolute"
        initial={false}
        animate={{
          left: `${p2Pos.x}%`,
          top: `${p2Pos.y}%`,
        }}
        transition={{ duration: 1, ease: [0.4, 0, 0.2, 1] }}
        style={{ x: '-50%', y: '-50%' }}
      >
        <div className="relative">
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{ 
              background: 'radial-gradient(circle, rgba(239, 68, 68, 0.4) 0%, transparent 70%)',
              width: '80px',
              height: '80px',
              margin: '-20px'
            }}
          />
          
          <div className="relative w-10 h-10 rounded-full border-3 border-red-500 bg-red-500 overflow-hidden">
            {player2Avatar ? (
              <img 
                src={player2Avatar.startsWith('http') ? player2Avatar : `${backendUrl}${player2Avatar}`}
                alt={player2Username}
                className="w-full h-full object-cover"
                onError={(e) => {
                  console.error('Failed to load avatar:', player2Avatar);
                  e.currentTarget.style.display = 'none';
                }}
              />
            ) : (
              <div className="w-full h-full bg-red-500" />
            )}
          </div>
          
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 text-xs font-mono font-bold text-green-400 whitespace-nowrap">
            {player2Username}
          </div>
          
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 text-xs font-mono font-bold text-green-400 whitespace-nowrap">
            Lv.{Math.floor(player2Level)}/{totalLevels}
          </div>
        </div>
      </motion.div>

      <motion.div
        className="absolute w-2 h-2 rounded-full bg-green-400"
        initial={{ left: '35%', top: '75%', opacity: 0 }}
        animate={{ 
          left: '50%', 
          top: '25%',
          opacity: [0, 1, 0],
        }}
        transition={{ 
          duration: 2, 
          repeat: Infinity,
          ease: 'easeInOut'
        }}
        style={{
          boxShadow: '0 0 10px rgba(0, 255, 0, 0.8)'
        }}
      />
    </div>
  );
};

export default GameCanvas;
