import { ReactNode, createContext, useCallback, useContext, useEffect, useState } from "react"

import { AuthContext } from "@/contexts/AuthContext"
import { getShipperProfile } from "@/lib/api"
import type { ShipperProfile, UserContextType } from "@/types"

export const UserContext = createContext({} as UserContextType)

const UserProvider = ({ children }: { children: ReactNode }) => {
  const { user, loading: authLoading } = useContext(AuthContext)
  const [profile, setProfile] = useState<ShipperProfile | null>(null)
  const [loading, setLoading] = useState(true)

  const clearProfile = useCallback(() => {
    setProfile(null)
  }, [])

  const refreshProfile = useCallback(async () => {
    if (!user || user.type !== "SHIPPER") {
      setProfile(null)
      setLoading(false)
      return null
    }

    setLoading(true)

    try {
      const nextProfile = await getShipperProfile()
      setProfile(nextProfile)
      return nextProfile
    } catch {
      setProfile(null)
      return null
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (authLoading) return

    void refreshProfile()
  }, [authLoading, refreshProfile])

  return (
    <UserContext.Provider
      value={{
        profile,
        loading,
        refreshProfile,
        clearProfile,
      }}
    >
      {children}
    </UserContext.Provider>
  )
}

export default UserProvider
