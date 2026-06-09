import { Redirect } from "expo-router"
import { useContext } from "react"

import TabBar from "@/components/TabBar"
import { AuthContext } from "@/contexts/AuthContext"
import { OperatorContext } from "@/contexts/OperatorContext"

const TabsLayout = () => {
  const { user, loading } = useContext(AuthContext)
  const { profile, loading: operatorLoading } = useContext(OperatorContext)

  if (loading) {
    return null
  }

  if (!user) {
    return <Redirect href="/(auth)/sign-in" />
  }

  if (user.type === "PAYLOAD_HANDLER") {
    if (operatorLoading) {
      return null
    }

    if (profile?.status.code !== "APPROVED") {
      return <Redirect href="/operator-access" />
    }
  }

  return <TabBar />
}

export default TabsLayout
