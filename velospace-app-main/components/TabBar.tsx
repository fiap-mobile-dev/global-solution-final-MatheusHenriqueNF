import { Ionicons } from "@expo/vector-icons"
import { Tabs } from "expo-router"
import { useContext } from "react"

import { AuthContext } from "@/contexts/AuthContext"

const CustomButton = () => {
  const { user } = useContext(AuthContext)
  const isShipper = user?.type === "SHIPPER"
  const isPayloadHandler = user?.type === "PAYLOAD_HANDLER"

  return (
    <Tabs
      screenOptions={{
        headerShown: false,

        tabBarActiveTintColor: "#059669",
        tabBarInactiveTintColor: "#94A3B8",

        tabBarStyle: {
          height: 72,
          backgroundColor: "#FFFFFF",
          borderTopWidth: 1,
          borderTopColor: "#E2E8F0",
          paddingTop: 8,
          paddingBottom: 10,
        },

        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="new-package"
        options={{
          title: "Novo Envio",
          href: isShipper ? undefined : null,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="rocket-outline" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="rockets"
        options={{
          title: "Foguetes",
          href: isPayloadHandler ? undefined : null,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="planet-outline" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Perfil",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="package-detail"
        options={{
          href: null,
        }}
      />

      <Tabs.Screen
        name="inspection"
        options={{
          href: null,
        }}
      />

      <Tabs.Screen
        name="rocket-detail"
        options={{
          href: null,
        }}
      />
    </Tabs>
  )
}

export default CustomButton
