export interface User {
    id: number;
    name: string;
    login: string;
    email: string;
    avatar: string | null;
    provider: string;
    role: string;
    password: string;
    online?: boolean;
    games_count?: number;
    wins_count?: number;
}



export interface LoginCredentials {
  loginOrEmail: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  login: string;
  email: string;
  password: string;
}