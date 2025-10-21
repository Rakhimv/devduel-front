export interface GameInvite {
  id: string;
  fromUserId: number;
  fromUsername: string;
  toUserId: number;
  toUsername: string;
  timestamp: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired' | 'abandoned';
}

export interface GameSession {
  id: string;
  player1: {
    id: number;
    username: string;
    isReady: boolean;
  };
  player2: {
    id: number;
    username: string;
    isReady: boolean;
  };
  status: 'waiting' | 'ready' | 'in_progress' | 'finished';
  startTime?: string;
  endTime?: string;
  duration: number; 
  timeRemaining: number;
  winner?: {
    id: number;
    username: string;
  };
  gameResult?: 'timeout' | 'player_left' | 'completed';
}

export interface GameTimer {
  minutes: number;
  seconds: number;
  isActive: boolean;
}
