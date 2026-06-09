import AsyncStorage from "@react-native-async-storage/async-storage"

import type { User } from "@/types"

export const AUTH_TOKEN_STORAGE_KEY = "jwt_token"
export const AUTH_USER_STORAGE_KEY = "auth_user"

export type AuthSession = {
  token: string
  user: User
}

export const getStoredToken = async () =>
  AsyncStorage.getItem(AUTH_TOKEN_STORAGE_KEY)

export const getStoredUser = async () =>
  AsyncStorage.getItem(AUTH_USER_STORAGE_KEY)

export const storeSession = async ({ token, user }: AuthSession) => {
  await AsyncStorage.multiSet([
    [AUTH_TOKEN_STORAGE_KEY, token],
    [AUTH_USER_STORAGE_KEY, JSON.stringify(user)],
  ])
}

export const storeUser = async (user: User) => {
  await AsyncStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(user))
}

export const clearSession = async () => {
  await AsyncStorage.multiRemove([
    AUTH_TOKEN_STORAGE_KEY,
    AUTH_USER_STORAGE_KEY,
  ])
}

export const useAuthStorage = () => ({
  clearSession,
  getStoredToken,
  getStoredUser,
  storeUser,
  storeSession,
})
