import InspectionForm from "@/components/InspectionForm"
import { useLocalSearchParams, useRouter } from "expo-router"
import { ScrollView, Text, TouchableOpacity, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

const Inspection = () => {
  const router = useRouter()
  const { satelliteId } = useLocalSearchParams<{ satelliteId?: string }>()
  const parsedSatelliteId = Number(satelliteId)
  const hasValidSatelliteId =
    Number.isFinite(parsedSatelliteId) && parsedSatelliteId > 0

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F8FAFC" }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 24,
          paddingBottom: 100,
        }}
      >
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => router.back()}
          style={{
            alignSelf: "flex-start",
            marginBottom: 20,
          }}
        >
          <Text
            style={{
              fontSize: 14,
              fontWeight: "700",
              color: "#059669",
            }}
          >
            Voltar
          </Text>
        </TouchableOpacity>

        <View
          style={{
            alignItems: "center",
            marginBottom: 24,
          }}
        >
          <Text
            style={{
              fontSize: 26,
              fontWeight: "800",
              color: "#0F172A",
              marginBottom: 8,
            }}
          >
            Inspecao
          </Text>

          <Text
            style={{
              maxWidth: 320,
              textAlign: "center",
              fontSize: 14,
              lineHeight: 20,
              color: "#64748B",
            }}
          >
            Registre as medidas aferidas do satelite antes de seguir com o fluxo.
          </Text>
        </View>

        {hasValidSatelliteId ? (
          <InspectionForm satelliteId={parsedSatelliteId} />
        ) : (
          <View
            style={{
              borderRadius: 24,
              backgroundColor: "#FFFFFF",
              paddingHorizontal: 20,
              paddingVertical: 24,
              borderWidth: 1,
              borderColor: "#E2E8F0",
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontWeight: "800",
                color: "#0F172A",
                marginBottom: 8,
              }}
            >
              Satelite invalido
            </Text>

            <Text
              style={{
                fontSize: 14,
                lineHeight: 20,
                color: "#64748B",
              }}
            >
              Nao foi possivel identificar o satelite para registrar a inspecao.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

export default Inspection
