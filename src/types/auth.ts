export interface User {
  id: string;
  email: string;
  name: string;
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