export interface GameInvite {
  id: string;
  fromUserId: number;
  fromUsername: string;
  fromAvatar?: string | null;
  toUserId: number;
  toUsername: string;
  toAvatar?: string | null;
  timestamp: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired' | 'abandoned';
}

export interface GameSession {
  id: string;
  player1: {
    id: number;
    username: string;
    avatar?: string;
    isReady: boolean;
  };
  player2: {
    id: number;
    username: string;
    avatar?: string;
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
  player1Level?: number;
  player2Level?: number;
  currentLevel?: number;
}

export interface GameTimer {
  minutes: number;
  seconds: number;
  isActive: boolean;
}

export interface Task {
  id: number;
  title: string;
  description: string;
  input_example: string;
  output_example: string;
  difficulty: 'easy' | 'medium' | 'hard';
  level: number;
  code_templates: { [language: string]: string };
  function_signature: string;
}

export interface GameTask {
  task: Task;
  solvedByPlayer1: boolean;
  solvedByPlayer2: boolean;
}

export interface GameProgress {
  currentLevel: number;
  playerLevel: number;
  opponentLevel: number;
  currentTask: Task;
  solvedTasks: number[];
}
