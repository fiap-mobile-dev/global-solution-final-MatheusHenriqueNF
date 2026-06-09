import { AuthContext } from "@/contexts/AuthContext"
import { Redirect, Slot } from "expo-router"
import { useContext } from "react"

const AuthLayout = () => {
  const { user, loading } = useContext(AuthContext)

  if (loading) {
    return null
  }

  if (user) {
    return <Redirect href="/(tabs)" />
  }

  return <Slot />
}

export default AuthLayout
