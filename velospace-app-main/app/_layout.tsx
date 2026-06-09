import "../global.css"

import { QueryClientProvider } from "@tanstack/react-query"
import AuthProvider from "@/contexts/AuthContext"
import LaunchProviderProvider from "@/contexts/LaunchProviderContext"
import OperatorProvider from "@/contexts/OperatorContext"
import UserProvider from "@/contexts/UserContext"
import "@/lib/nativewind"
import { queryClient } from "@/lib/query-client"
import { Slot } from "expo-router"

const RootLayout = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <UserProvider>
          <OperatorProvider>
            <LaunchProviderProvider>
              <Slot />
            </LaunchProviderProvider>
          </OperatorProvider>
        </UserProvider>
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default RootLayout
