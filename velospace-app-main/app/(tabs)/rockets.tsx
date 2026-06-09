import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import CustomTextInput from "@/components/ui/CustomTextInput"
import { AuthContext } from "@/contexts/AuthContext"
import { deleteRocket, getRockets, searchRockets } from "@/lib/rocket-api"
import { Ionicons } from "@expo/vector-icons"
import { Redirect, useRouter } from "expo-router"
import { useContext, useState } from "react"
import { Alert, FlatList, Text, TouchableOpacity, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

const Rockets = () => {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { user, loading } = useContext(AuthContext)
  const [searchTerm, setSearchTerm] = useState("")
  const [appliedSearchTerm, setAppliedSearchTerm] = useState("")

  const rocketsQuery = useQuery({
    queryKey: ["rockets", appliedSearchTerm],
    queryFn: () =>
      appliedSearchTerm.trim()
        ? searchRockets(appliedSearchTerm)
        : getRockets(),
  })

  const deleteRocketMutation = useMutation({
    mutationFn: deleteRocket,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["rockets"] })
    },
  })

  const handleSearch = () => {
    setAppliedSearchTerm(searchTerm.trim())
  }

  const handleClearSearch = () => {
    setSearchTerm("")
    setAppliedSearchTerm("")
  }

  const handleDeleteRocket = (rocketId: number) => {
    Alert.alert("Apagar foguete", "Deseja apagar este foguete?", [
      {
        text: "Cancelar",
        style: "cancel",
      },
      {
        text: "Apagar",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteRocketMutation.mutateAsync(rocketId)
          } catch (error) {
            Alert.alert(
              "Erro ao apagar foguete",
              error instanceof Error
                ? error.message
                : "Nao foi possivel apagar o foguete.",
            )
          }
        },
      },
    ])
  }

  if (loading) {
    return null
  }

  if (!user || user.type !== "PAYLOAD_HANDLER") {
    return <Redirect href="/(tabs)" />
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F8FAFC" }}>
      <View style={{ flex: 1, paddingHorizontal: 20, paddingTop: 20 }}>
        <View style={{ marginBottom: 20 }}>
          <Text
            style={{
              fontSize: 28,
              fontWeight: "800",
              color: "#0F172A",
              marginBottom: 6,
            }}
          >
            Foguetes
          </Text>
          <Text
            style={{
              fontSize: 14,
              lineHeight: 20,
              color: "#64748B",
            }}
          >
            Consulte, pesquise e cadastre foguetes disponiveis para operacao.
          </Text>
        </View>

        <CustomTextInput
          label="Pesquisar foguete"
          placeholder="Digite o nome do foguete"
          value={searchTerm}
          onChangeText={setSearchTerm}
        />

        <View
          style={{
            flexDirection: "row",
            gap: 12,
            marginBottom: 18,
          }}
        >
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleSearch}
            style={{
              flex: 1,
              minHeight: 52,
              borderRadius: 999,
              backgroundColor: rocketsQuery.isFetching ? "#86C5A5" : "#059669",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ color: "#FFFFFF", fontWeight: "700" }}>
              {rocketsQuery.isFetching ? "Pesquisando..." : "Pesquisar"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => void handleClearSearch()}
            style={{
              flex: 1,
              minHeight: 52,
              borderRadius: 999,
              borderWidth: 1,
              borderColor: "#CBD5E1",
              backgroundColor: "#FFFFFF",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ color: "#475569", fontWeight: "700" }}>Limpar</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => router.push("/rocket-detail")}
          style={{
            minHeight: 54,
            borderRadius: 20,
            marginBottom: 18,
            backgroundColor: "#0F172A",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ color: "#FFFFFF", fontWeight: "700", fontSize: 15 }}>
            Cadastrar novo foguete
          </Text>
        </TouchableOpacity>

        <FlatList
          data={rocketsQuery.data ?? []}
          keyExtractor={(item) => String(item.rocketId)}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100, gap: 14 }}
          ListEmptyComponent={
            <View
              style={{
                backgroundColor: "#FFFFFF",
                borderRadius: 20,
                paddingVertical: 30,
                paddingHorizontal: 20,
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "700",
                  color: "#0F172A",
                  marginBottom: 6,
                }}
              >
                {rocketsQuery.isLoading ? "Carregando foguetes" : "Nenhum foguete encontrado"}
              </Text>

              <Text
                style={{
                  fontSize: 13,
                  color: "#64748B",
                  textAlign: "center",
                }}
              >
                {rocketsQuery.isLoading
                  ? "Buscando os foguetes cadastrados na base."
                  : "Ajuste a pesquisa ou cadastre um novo foguete."}
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <View
              style={{
                backgroundColor: "#FFFFFF",
                borderRadius: 20,
                padding: 16,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.08,
                shadowRadius: 10,
                elevation: 3,
              }}
            >
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() =>
                  router.push({
                    pathname: "/rocket-detail",
                    params: { rocketId: item.rocketId },
                  })
                }
              >
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <View
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: 16,
                      backgroundColor: "#ECFDF5",
                      alignItems: "center",
                      justifyContent: "center",
                      marginRight: 14,
                    }}
                  >
                    <Ionicons name="rocket-outline" size={28} color="#059669" />
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: "800",
                        color: "#0F172A",
                        marginBottom: 4,
                      }}
                    >
                      {item.name}
                    </Text>

                    <Text
                      style={{
                        fontSize: 12,
                        color: "#64748B",
                        marginBottom: 2,
                      }}
                    >
                      ID #{item.rocketId} | Status #{item.rocketStatusId}
                    </Text>

                    <Text
                      style={{
                        fontSize: 12,
                        color: "#64748B",
                      }}
                    >
                      Capacidade {item.capacityWeight}kg
                    </Text>
                  </View>

                  <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
                </View>
              </TouchableOpacity>

              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "flex-end",
                  marginTop: 14,
                }}
              >
                <View
                  style={{
                    minHeight: 42,
                    borderRadius: 999,
                    borderWidth: 1,
                    borderColor: "#FCA5A5",
                    backgroundColor: "#FFF1F2",
                    alignItems: "center",
                    justifyContent: "center",
                    paddingHorizontal: 16,
                  }}
                >
                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={() => handleDeleteRocket(item.rocketId)}
                  >
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: "700",
                        color: "#B91C1C",
                      }}
                    >
                      Apagar foguete
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        />
      </View>
    </SafeAreaView>
  )
}

export default Rockets
