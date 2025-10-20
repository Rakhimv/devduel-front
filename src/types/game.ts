export interface GameInvite {
  id: string;
  fromUserId: number;
  fromUsername: string;
  toUserId: number;
  toUsername: string;
  timestamp: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
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
  duration: number; 
  timeRemaining: number;
}

export interface GameTimer {
  minutes: number;
  seconds: number;
  isActive: boolean;
}
