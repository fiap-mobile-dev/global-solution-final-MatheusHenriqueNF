import { AuthContext } from "@/contexts/AuthContext"
import { OperatorContext } from "@/contexts/OperatorContext"
import { clearSession } from "@/hooks/useAuthStorage"
import { reapplyOperator } from "@/lib/api"
import { Redirect, useRouter } from "expo-router"
import { useContext, useState } from "react"
import { Alert, Text, TouchableOpacity, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

const OperatorAccess = () => {
  const router = useRouter()
  const { user, setUser } = useContext(AuthContext)
  const { profile, loading, refreshProfile } = useContext(OperatorContext)
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!user) {
    return <Redirect href="/(auth)/sign-in" />
  }

  if (user.type !== "PAYLOAD_HANDLER") {
    return <Redirect href="/(tabs)" />
  }

  if (loading) {
    return null
  }

  if (profile?.status.code === "APPROVED") {
    return <Redirect href="/(tabs)" />
  }

  const handleLogout = () => {
    Alert.alert("Sair da conta", "Deseja encerrar sua sessao?", [
      {
        text: "Cancelar",
        style: "cancel",
      },
      {
        text: "Sair",
        style: "destructive",
        onPress: async () => {
          await clearSession()
          setUser(null)
          router.replace("/(auth)/sign-in")
        },
      },
    ])
  }

  const handleResubmit = async () => {
    if (!profile || isSubmitting) {
      return
    }

    try {
      setIsSubmitting(true)
      await reapplyOperator(profile.operator_id)

      await refreshProfile()
      Alert.alert(
        "Solicitacao enviada",
        "Sua nova solicitacao foi enviada para analise.",
      )
    } catch (error) {
      Alert.alert(
        "Erro ao reenviar",
        error instanceof Error
          ? error.message
          : "Nao foi possivel reenviar a solicitacao.",
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const statusCode = profile?.status.code ?? "PENDING_APPROVAL"
  const isRejected = statusCode === "REJECTED"

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F8FAFC" }}>
      <View
        style={{
          flex: 1,
          paddingHorizontal: 24,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <View
          style={{
            width: "100%",
            borderRadius: 24,
            backgroundColor: "#FFFFFF",
            paddingHorizontal: 24,
            paddingVertical: 28,
            borderWidth: 1,
            borderColor: "#E2E8F0",
          }}
        >
          <Text
            style={{
              fontSize: 24,
              fontWeight: "800",
              color: "#0F172A",
              textAlign: "center",
              marginBottom: 10,
            }}
          >
            Acesso do operador
          </Text>

          <Text
            style={{
              fontSize: 14,
              lineHeight: 20,
              color: "#64748B",
              textAlign: "center",
              marginBottom: 20,
            }}
          >
            {isRejected
              ? "Sua solicitacao foi recusada. Reenvie uma nova solicitacao para voltar para analise."
              : "Seu cadastro de operador ainda esta em analise. O acesso ao aplicativo sera liberado apos aprovacao."}
          </Text>

          <View
            style={{
              borderRadius: 16,
              backgroundColor: isRejected ? "#FFF1F2" : "#FFFBEB",
              padding: 16,
              marginBottom: 20,
            }}
          >
            <Text
              style={{
                fontSize: 12,
                fontWeight: "700",
                color: isRejected ? "#B91C1C" : "#B45309",
                marginBottom: 4,
              }}
            >
              Status atual
            </Text>
            <Text
              style={{
                fontSize: 16,
                fontWeight: "700",
                color: "#0F172A",
              }}
            >
              {profile?.status.description ?? "Em analise"}
            </Text>
          </View>

          {isRejected ? (
            <>
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => void handleResubmit()}
                disabled={isSubmitting}
                style={{
                  minHeight: 56,
                  borderRadius: 999,
                  backgroundColor: isSubmitting ? "#86C5A5" : "#059669",
                  alignItems: "center",
                  justifyContent: "center",
                  paddingHorizontal: 20,
                }}
              >
                <Text
                  style={{
                    fontSize: 15,
                    fontWeight: "700",
                    color: "#FFFFFF",
                  }}
                >
                  {isSubmitting ? "Enviando..." : "Enviar nova solicitacao"}
                </Text>
              </TouchableOpacity>
            </>
          ) : null}

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleLogout}
            style={{
              minHeight: 56,
              marginTop: 12,
              borderRadius: 999,
              borderWidth: 1,
              borderColor: "#FCA5A5",
              backgroundColor: "#FFF1F2",
              alignItems: "center",
              justifyContent: "center",
              paddingHorizontal: 20,
            }}
          >
            <Text
              style={{
                fontSize: 15,
                fontWeight: "700",
                color: "#B91C1C",
              }}
            >
              Logout
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  )
}

export default OperatorAccess
