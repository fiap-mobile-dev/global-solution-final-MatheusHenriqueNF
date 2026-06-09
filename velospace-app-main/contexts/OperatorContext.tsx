import { ReactNode, createContext, useCallback, useContext, useEffect, useState } from "react"

import { AuthContext } from "@/contexts/AuthContext"
import { getOperatorProfile } from "@/lib/api"
import type { OperatorContextType, OperatorProfile } from "@/types"

export const OperatorContext = createContext({} as OperatorContextType)

const OperatorProvider = ({ children }: { children: ReactNode }) => {
  const { user, loading: authLoading } = useContext(AuthContext)
  const [profile, setProfile] = useState<OperatorProfile | null>(null)
  const [loading, setLoading] = useState(true)

  const clearProfile = useCallback(() => {
    setProfile(null)
  }, [])

  const refreshProfile = useCallback(async () => {
    if (!user || user.type !== "PAYLOAD_HANDLER") {
      setProfile(null)
      setLoading(false)
      return null
    }

    setLoading(true)

    try {
      const nextProfile = await getOperatorProfile()
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
    <OperatorContext.Provider
      value={{
        profile,
        loading,
        refreshProfile,
        clearProfile,
      }}
    >
      {children}
    </OperatorContext.Provider>
  )
}

export default OperatorProvider
