import { ReactNode, createContext, useCallback, useContext, useEffect, useState } from "react"

import { AuthContext } from "@/contexts/AuthContext"
import { getLaunchProviderProfile } from "@/lib/api"
import type { LaunchProviderContextType, LaunchProviderProfile } from "@/types"

export const LaunchProviderContext = createContext({} as LaunchProviderContextType)

const LaunchProviderProvider = ({ children }: { children: ReactNode }) => {
  const { user, loading: authLoading } = useContext(AuthContext)
  const [profile, setProfile] = useState<LaunchProviderProfile | null>(null)
  const [loading, setLoading] = useState(true)

  const clearProfile = useCallback(() => {
    setProfile(null)
  }, [])

  const refreshProfile = useCallback(async () => {
    if (!user || user.type !== "LAUNCHER_PROVIDER") {
      setProfile(null)
      setLoading(false)
      return null
    }

    setLoading(true)

    try {
      const nextProfile = await getLaunchProviderProfile()
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
    <LaunchProviderContext.Provider
      value={{
        profile,
        loading,
        refreshProfile,
        clearProfile,
      }}
    >
      {children}
    </LaunchProviderContext.Provider>
  )
}

export default LaunchProviderProvider
