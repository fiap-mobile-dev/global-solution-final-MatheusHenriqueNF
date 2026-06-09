import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import CustomTextInput from "@/components/ui/CustomTextInput"
import { AuthContext } from "@/contexts/AuthContext"
import { createRocket, deleteRocket, getRocketById, updateRocket } from "@/lib/rocket-api"
import { formatDecimal, validateForm, validateNumber, validatePositive, validateRequired } from "@/utils/masks"
import { Ionicons } from "@expo/vector-icons"
import { Redirect, useLocalSearchParams, useRouter } from "expo-router"
import { useMemo, useState, useContext, useEffect } from "react"
import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

const initialData = {
  name: "",
  capacityHeight: "",
  capacityWidth: "",
  capacityLength: "",
  capacityWeight: "",
  rocketStatusId: "1",
}

const initialErrors = {
  name: "",
  capacityHeight: "",
  capacityWidth: "",
  capacityLength: "",
  capacityWeight: "",
  rocketStatusId: "",
}

const RocketDetail = () => {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { user, loading: authLoading } = useContext(AuthContext)
  const { rocketId } = useLocalSearchParams<{ rocketId?: string }>()
  const parsedRocketId = Number(rocketId)
  const isEditing = Number.isFinite(parsedRocketId) && parsedRocketId > 0
  const [data, setData] = useState(initialData)
  const [errors, setErrors] = useState(initialErrors)

  const rocketQuery = useQuery({
    queryKey: ["rocket", parsedRocketId],
    queryFn: () => getRocketById(parsedRocketId),
    enabled: isEditing,
  })

  const saveRocketMutation = useMutation({
    mutationFn: async (payload: {
      name: string
      capacityHeight: number
      capacityWidth: number
      capacityLength: number
      capacityWeight: number
      rocketStatusId: number
    }) => {
      if (isEditing) {
        return updateRocket(parsedRocketId, payload)
      }

      return createRocket(payload)
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["rockets"] })
      if (isEditing) {
        await queryClient.invalidateQueries({ queryKey: ["rocket", parsedRocketId] })
      }
    },
  })

  const deleteRocketMutation = useMutation({
    mutationFn: deleteRocket,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["rockets"] })
    },
  })

  useEffect(() => {
    if (!rocketQuery.data) return

    setData({
      name: rocketQuery.data.name,
      capacityHeight: String(rocketQuery.data.capacityHeight),
      capacityWidth: String(rocketQuery.data.capacityWidth),
      capacityLength: String(rocketQuery.data.capacityLength),
      capacityWeight: String(rocketQuery.data.capacityWeight),
      rocketStatusId: String(rocketQuery.data.rocketStatusId),
    })
  }, [rocketQuery.data])

  useEffect(() => {
    if (!rocketQuery.error) return

    Alert.alert(
      "Erro ao carregar foguete",
      rocketQuery.error instanceof Error
        ? rocketQuery.error.message
        : "Nao foi possivel carregar o foguete.",
      [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ],
    )
  }, [rocketQuery.error, router])

  const validations = useMemo(
    () => ({
      name: [validateRequired],
      capacityHeight: [validateRequired, validateNumber, validatePositive],
      capacityWidth: [validateRequired, validateNumber, validatePositive],
      capacityLength: [validateRequired, validateNumber, validatePositive],
      capacityWeight: [validateRequired, validateNumber, validatePositive],
      rocketStatusId: [validateRequired, validateNumber, validatePositive],
    }),
    [],
  )

  const buildPayload = () => {
    const [validatedData, nextErrors] = validateForm(data, validations)
    setErrors(nextErrors)

    if (Object.values(nextErrors).some(Boolean)) {
      return null
    }

    return {
      name: validatedData.name,
      capacityHeight: Number(validatedData.capacityHeight),
      capacityWidth: Number(validatedData.capacityWidth),
      capacityLength: Number(validatedData.capacityLength),
      capacityWeight: Number(validatedData.capacityWeight),
      rocketStatusId: Number(validatedData.rocketStatusId),
    }
  }

  const handleSave = async () => {
    if (saveRocketMutation.isPending) return

    const payload = buildPayload()

    if (!payload) return

    try {
      await saveRocketMutation.mutateAsync(payload)

      Alert.alert(
        isEditing ? "Foguete atualizado" : "Foguete cadastrado",
        isEditing
          ? "Os dados do foguete foram atualizados com sucesso."
          : "O foguete foi cadastrado com sucesso.",
        [
          {
            text: "OK",
            onPress: () => router.replace("/rockets"),
          },
        ],
      )
    } catch (error) {
      Alert.alert(
        "Erro ao salvar foguete",
        error instanceof Error ? error.message : "Nao foi possivel salvar o foguete.",
      )
    }
  }

  const handleDelete = () => {
    if (!isEditing || deleteRocketMutation.isPending || saveRocketMutation.isPending) return

    Alert.alert("Excluir foguete", "Deseja excluir este foguete?", [
      {
        text: "Cancelar",
        style: "cancel",
      },
      {
        text: "Excluir",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteRocketMutation.mutateAsync(parsedRocketId)
            Alert.alert("Foguete excluido", "O foguete foi removido com sucesso.", [
              {
                text: "OK",
                onPress: () => router.replace("/rockets"),
              },
            ])
          } catch (error) {
            Alert.alert(
              "Erro ao excluir",
              error instanceof Error ? error.message : "Nao foi possivel excluir o foguete.",
            )
          }
        },
      },
    ])
  }

  if (authLoading) {
    return null
  }

  if (!user || user.type !== "PAYLOAD_HANDLER") {
    return <Redirect href="/(tabs)" />
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F8FAFC" }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 20,
          paddingBottom: 100,
        }}
      >
        <View
          style={{
            width: "100%",
            backgroundColor: "#059669",
            borderRadius: 24,
            paddingHorizontal: 20,
            paddingVertical: 24,
            marginBottom: 24,
            overflow: "hidden",
          }}
        >
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.back()}
            style={{
              width: 38,
              height: 38,
              borderRadius: 999,
              backgroundColor: "rgba(255,255,255,0.18)",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 18,
            }}
          >
            <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
          </TouchableOpacity>

          <Text style={{ fontSize: 26, fontWeight: "800", color: "#FFFFFF", marginBottom: 8 }}>
            {isEditing ? "Detalhe do foguete" : "Novo foguete"}
          </Text>
          <Text style={{ fontSize: 14, lineHeight: 20, color: "#D1FAE5" }}>
            {isEditing
              ? "Atualize as caracteristicas do foguete e acompanhe os dados cadastrados."
              : "Cadastre um novo foguete para disponibilizar no fluxo operacional."}
          </Text>
        </View>

        <View
          style={{
            width: "100%",
            borderRadius: 24,
            backgroundColor: "#FFFFFF",
            paddingHorizontal: 20,
            paddingVertical: 24,
            borderWidth: 1,
            borderColor: "#E2E8F0",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.08,
            shadowRadius: 14,
            elevation: 4,
          }}
        >
          <CustomTextInput
            label="Nome"
            placeholder="Digite o nome do foguete"
            value={data.name}
            error={errors.name}
            onChangeText={(value) => setData((prev) => ({ ...prev, name: value }))}
          />

          <CustomTextInput
            label="Altura suportada"
            placeholder="Informe a altura"
            value={data.capacityHeight}
            error={errors.capacityHeight}
            onChangeText={(value) =>
              setData((prev) => ({ ...prev, capacityHeight: value }))
            }
            dataMask={formatDecimal}
            keyboardType="decimal-pad"
          />

          <CustomTextInput
            label="Largura suportada"
            placeholder="Informe a largura"
            value={data.capacityWidth}
            error={errors.capacityWidth}
            onChangeText={(value) =>
              setData((prev) => ({ ...prev, capacityWidth: value }))
            }
            dataMask={formatDecimal}
            keyboardType="decimal-pad"
          />

          <CustomTextInput
            label="Comprimento suportado"
            placeholder="Informe o comprimento"
            value={data.capacityLength}
            error={errors.capacityLength}
            onChangeText={(value) =>
              setData((prev) => ({ ...prev, capacityLength: value }))
            }
            dataMask={formatDecimal}
            keyboardType="decimal-pad"
          />

          <CustomTextInput
            label="Peso suportado"
            placeholder="Informe o peso"
            value={data.capacityWeight}
            error={errors.capacityWeight}
            onChangeText={(value) =>
              setData((prev) => ({ ...prev, capacityWeight: value }))
            }
            dataMask={formatDecimal}
            keyboardType="decimal-pad"
          />

          <CustomTextInput
            label="Status do foguete"
            placeholder="Informe o status id"
            value={data.rocketStatusId}
            error={errors.rocketStatusId}
            onChangeText={(value) =>
              setData((prev) => ({ ...prev, rocketStatusId: value }))
            }
            dataMask={formatDecimal}
            keyboardType="number-pad"
          />

          {isEditing && !rocketQuery.isLoading ? (
            <Text
              style={{
                fontSize: 12,
                color: "#64748B",
                marginBottom: 16,
              }}
            >
              ID do foguete: #{parsedRocketId}
            </Text>
          ) : null}

          <View style={{ gap: 12 }}>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => void handleSave()}
              disabled={saveRocketMutation.isPending || rocketQuery.isLoading}
              style={{
                minHeight: 56,
                borderRadius: 999,
                backgroundColor:
                  saveRocketMutation.isPending || rocketQuery.isLoading
                    ? "#86C5A5"
                    : "#059669",
                alignItems: "center",
                justifyContent: "center",
                paddingHorizontal: 20,
              }}
            >
              <Text style={{ fontSize: 16, fontWeight: "700", color: "#FFFFFF" }}>
                {rocketQuery.isLoading
                  ? "Carregando..."
                  : saveRocketMutation.isPending
                    ? "Salvando..."
                    : isEditing
                      ? "Salvar alteracoes"
                      : "Cadastrar foguete"}
              </Text>
            </TouchableOpacity>

            {isEditing ? (
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={handleDelete}
                disabled={
                  deleteRocketMutation.isPending ||
                  saveRocketMutation.isPending ||
                  rocketQuery.isLoading
                }
                style={{
                  minHeight: 56,
                  borderRadius: 999,
                  borderWidth: 1,
                  borderColor: "#FCA5A5",
                  backgroundColor: "#FFF1F2",
                  alignItems: "center",
                  justifyContent: "center",
                  paddingHorizontal: 20,
                  opacity:
                    deleteRocketMutation.isPending ||
                    saveRocketMutation.isPending ||
                    rocketQuery.isLoading
                      ? 0.65
                      : 1,
                }}
              >
                <Text style={{ fontSize: 16, fontWeight: "700", color: "#B91C1C" }}>
                  Excluir foguete
                </Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default RocketDetail
