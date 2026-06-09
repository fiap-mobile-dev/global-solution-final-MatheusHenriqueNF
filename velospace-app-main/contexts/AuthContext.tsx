import { ReactNode, createContext, useEffect, useState } from "react"

import { clearSession, getStoredToken, storeUser } from "@/hooks/useAuthStorage"
import { getUser } from "@/lib/api"
import { AuthContextType, User } from "@/types"

export const AuthContext = createContext({} as AuthContextType)

const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = await getStoredToken()

        if (token) {
          const data = await getUser(token)

          if (!data) throw new Error()

          setUser(data)
          await storeUser(data)
        }
      } catch {
        await clearSession()
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    loadUser()
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, setUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthProvider
