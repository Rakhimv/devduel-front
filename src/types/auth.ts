export interface User {
    id: number;
    name: string;
    login: string;
    email: string;
    avatar: string | null;
    provider: string;
    role: string;
    password: string;
    online?: boolean
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