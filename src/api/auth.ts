import axios from "axios"
import type { LoginCredentials, RegisterCredentials, User } from "../types/auth"

const API_URL = import.meta.env.VITE_API_URL

export const register = async (data: RegisterCredentials): Promise<User> => {
  const res = await axios.post(`${API_URL}/auth/register`, data)
  return res.data
}


export const login = async (data: LoginCredentials): Promise<User> => {
  const res = await axios.post(`${API_URL}/auth/login`, data)
  return res.data
}

export const getUser = async (token: string): Promise<User> => {
  const res = await axios.get(`${API_URL}/auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  return res.data
}

