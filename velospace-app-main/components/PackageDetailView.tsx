import type { PackageDetailViewModel } from "@/hooks/usePackageDetail"
import { Ionicons } from "@expo/vector-icons"
import { ScrollView, Text, TouchableOpacity, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

interface PackageDetailViewProps {
  packageDetail: PackageDetailViewModel | null
  loading: boolean
  notFound: boolean
  onBack: () => void
}

const infoCardStyle = {
  borderRadius: 20,
  backgroundColor: "#FFFFFF",
  padding: 18,
  borderWidth: 1,
  borderColor: "#E2E8F0",
}

const PackageDetailView = ({
  packageDetail,
  loading,
  notFound,
  onBack,
}: PackageDetailViewProps) => {
  const statusDescription =
    packageDetail?.status?.description ?? "Status nao informado"
  const priorityDescription =
    packageDetail?.priority?.description ?? "Prioridade nao informada"

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#F8FAFC" }}>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <Text style={{ fontSize: 16, fontWeight: "700", color: "#0F172A" }}>
            Carregando detalhes do satelite...
          </Text>
        </View>
      </SafeAreaView>
    )
  }

  if (notFound || !packageDetail) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#F8FAFC" }}>
        <View style={{ flex: 1, paddingHorizontal: 20, paddingTop: 20 }}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={onBack}
            style={{
              alignSelf: "flex-start",
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
              marginBottom: 24,
            }}
          >
            <Ionicons name="arrow-back" size={18} color="#0F172A" />
            <Text style={{ fontSize: 14, fontWeight: "700", color: "#0F172A" }}>
              Voltar
            </Text>
          </TouchableOpacity>

          <View
            style={{
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
              paddingHorizontal: 24,
            }}
          >
            <View
              style={{
                width: 78,
                height: 78,
                borderRadius: 999,
                backgroundColor: "#E2E8F0",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 18,
              }}
            >
              <Ionicons name="alert-circle-outline" size={36} color="#475569" />
            </View>

            <Text
              style={{
                fontSize: 22,
                fontWeight: "800",
                color: "#0F172A",
                marginBottom: 8,
              }}
            >
              Satelite nao encontrado
            </Text>

            <Text
              style={{
                fontSize: 14,
                lineHeight: 20,
                color: "#64748B",
                textAlign: "center",
              }}
            >
              O identificador informado nao corresponde a nenhum satelite disponivel.
            </Text>
          </View>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F8FAFC" }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 20,
          paddingBottom: 110,
          gap: 18,
        }}
      >
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={onBack}
          style={{
            alignSelf: "flex-start",
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
          }}
        >
          <Ionicons name="arrow-back" size={18} color="#0F172A" />
          <Text style={{ fontSize: 14, fontWeight: "700", color: "#0F172A" }}>
            Voltar
          </Text>
        </TouchableOpacity>

        <View
          style={{
            borderRadius: 28,
            backgroundColor: packageDetail.accentColor,
            padding: 22,
            overflow: "hidden"
          }}
        >
          <View
            style={{
              position: "absolute",
              width: 180,
              height: 180,
              borderRadius: 999,
              backgroundColor: "rgba(255,255,255,0.10)",
              top: -60,
              right: -40,
            }}
          />

          <Text
            style={{
              fontSize: 13,
              fontWeight: "700",
              color: "rgba(255,255,255,0.82)",
              marginBottom: 6,
            }}
          >
            Satelite #{packageDetail.satellite_id}
          </Text>

          <Text
            style={{
              fontSize: 28,
              fontWeight: "800",
              color: "#FFFFFF",
              marginBottom: 6,
            }}
          >
            {packageDetail.name}
          </Text>

          <Text
            style={{
              fontSize: 14,
              lineHeight: 21,
              color: "rgba(255,255,255,0.88)",
              marginBottom: 16,
              maxWidth: 280,
            }}
          >
            {packageDetail.launch_justification}
          </Text>

          <View
            style={{
              alignSelf: "flex-start",
              paddingHorizontal: 14,
              paddingVertical: 8,
              borderRadius: 999,
              backgroundColor: "rgba(255,255,255,0.18)",
              marginBottom: 18,
            }}
          >
            <Text style={{ fontSize: 12, fontWeight: "700", color: "#FFFFFF" }}>
              {statusDescription}
            </Text>
          </View>

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 8,
            }}
          >
            <Text style={{ fontSize: 13, fontWeight: "700", color: "#FFFFFF" }}>
              Progresso da missao
            </Text>
            <Text style={{ fontSize: 13, fontWeight: "700", color: "#FFFFFF" }}>
              {packageDetail.progressPercent}%
            </Text>
          </View>

          <View
            style={{
              height: 10,
              borderRadius: 999,
              backgroundColor: "rgba(255,255,255,0.22)",
              overflow: "hidden",
            }}
          >
            <View
              style={{
                width: `${packageDetail.progressPercent}%`,
                height: "100%",
                borderRadius: 999,
                backgroundColor: "#FFFFFF",
              }}
            />
          </View>
        </View>

        <View style={{ ...infoCardStyle }}>
          <Text
            style={{
              fontSize: 18,
              fontWeight: "800",
              color: "#0F172A",
              marginBottom: 14,
            }}
          >
            Resumo operacional
          </Text>

          <View style={{ flexDirection: "row", gap: 12, marginBottom: 12 }}>
            <View
              style={{
                flex: 1,
                borderRadius: 18,
                backgroundColor: packageDetail.accentSoftColor,
                padding: 14,
              }}
            >
              <Text style={{ fontSize: 12, color: "#64748B", marginBottom: 5 }}>
                Prioridade
              </Text>
              <Text style={{ fontSize: 15, fontWeight: "700", color: "#0F172A" }}>
                {priorityDescription}
              </Text>
            </View>

            <View
              style={{
                flex: 1,
                borderRadius: 18,
                backgroundColor: "#F8FAFC",
                padding: 14,
              }}
            >
              <Text style={{ fontSize: 12, color: "#64748B", marginBottom: 5 }}>
                Codigo
              </Text>
              <Text style={{ fontSize: 15, fontWeight: "700", color: "#0F172A" }}>
                {packageDetail.tracking_code ?? "Nao enviado"}
              </Text>
            </View>
          </View>

          <View style={{ flexDirection: "row", gap: 12, marginBottom: 12 }}>
            <View
              style={{
                flex: 1,
                borderRadius: 18,
                backgroundColor: "#F8FAFC",
                padding: 14,
              }}
            >
              <Text style={{ fontSize: 12, color: "#64748B", marginBottom: 5 }}>
                Expedidor
              </Text>
              <Text style={{ fontSize: 15, fontWeight: "700", color: "#0F172A" }}>
                #{packageDetail.shipper_id}
              </Text>
            </View>

            <View
              style={{
                flex: 1,
                borderRadius: 18,
                backgroundColor: "#F8FAFC",
                padding: 14,
              }}
            >
              <Text style={{ fontSize: 12, color: "#64748B", marginBottom: 5 }}>
                Provedora
              </Text>
              <Text style={{ fontSize: 15, fontWeight: "700", color: "#0F172A" }}>
                #{packageDetail.launch_provider_id}
              </Text>
            </View>
          </View>

          <View
            style={{
              borderRadius: 18,
              backgroundColor: "#F8FAFC",
              padding: 14,
            }}
          >
            <Text
              style={{
                fontSize: 12,
                color: "#64748B",
                marginBottom: 10,
              }}
            >
              Dimensoes e peso
            </Text>

            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                gap: 10,
              }}
            >
              {[
                `${packageDetail.height} cm alt.`,
                `${packageDetail.width} cm larg.`,
                `${packageDetail.length} cm comp.`,
                `${packageDetail.weight} kg`,
              ].map((item) => (
                <View
                  key={item}
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    borderRadius: 999,
                    backgroundColor: "#FFFFFF",
                    borderWidth: 1,
                    borderColor: "#E2E8F0",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: "700",
                      color: "#334155",
                    }}
                  >
                    {item}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        <View style={{ ...infoCardStyle }}>
          <Text
            style={{
              fontSize: 18,
              fontWeight: "800",
              color: "#0F172A",
              marginBottom: 14,
            }}
          >
            Linha do tempo
          </Text>

          {packageDetail.timeline.map((step, index) => (
            <View
              key={step.key}
              style={{
                flexDirection: "row",
                alignItems: "flex-start",
                gap: 12,
                paddingBottom: index === packageDetail.timeline.length - 1 ? 0 : 18,
              }}
            >
              <View style={{ alignItems: "center" }}>
                <View
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: 999,
                    backgroundColor: step.current
                      ? packageDetail.accentColor
                      : step.completed
                        ? "#16A34A"
                        : "#CBD5E1",
                    borderWidth: step.current ? 4 : 0,
                    borderColor: step.current ? packageDetail.accentSoftColor : "transparent",
                  }}
                />

                {index < packageDetail.timeline.length - 1 && (
                  <View
                    style={{
                      width: 2,
                      flex: 1,
                      minHeight: 38,
                      marginTop: 6,
                      backgroundColor: step.completed ? "#86EFAC" : "#E2E8F0",
                    }}
                  />
                )}
              </View>

              <View style={{ flex: 1 }}>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 12,
                    marginBottom: 4,
                  }}
                >
                  <Text
                    style={{
                      flex: 1,
                      fontSize: 15,
                      fontWeight: "700",
                      color: "#0F172A",
                    }}
                  >
                    {step.title}
                  </Text>

                </View>

                <Text
                  style={{
                    fontSize: 13,
                    lineHeight: 19,
                    color: "#64748B",
                  }}
                >
                  {step.description}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default PackageDetailView
