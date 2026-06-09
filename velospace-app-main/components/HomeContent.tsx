import Banner from "@/components/Banner"
import TrackingCodeModal from "@/components/TrackingCodeModal"
import ModalSelect, { type Option } from "@/components/ui/ModalSelect"
import { getSatelliteStatusLabel } from "@/constants/satellite-status"
import type {
  LauncherProviderHomeFilter,
  OperatorHomeFilter,
  ShipperHomeFilter,
} from "@/hooks/useHome"
import type {
  LaunchProviderOperatorListItemResponse,
  LaunchProviderSatelliteListItemResponse,
  ShipperSatelliteListItemResponse,
} from "@/types"
import { Ionicons } from "@expo/vector-icons"
import { useState } from "react"
import { FlatList, Text, TouchableOpacity, View } from "react-native"

interface HomeContentProps {
  isPayloadHandlerHome: boolean
  isLauncherProviderHome: boolean
  shipperFilter: ShipperHomeFilter
  shipperLoading: boolean
  setShipperFilter: (filter: ShipperHomeFilter) => void
  shipperItems: ShipperSatelliteListItemResponse[]
  refreshShipperSatellites: () => void | Promise<void>
  operatorLoading: boolean
  operatorFilter: OperatorHomeFilter
  setOperatorFilter: (filter: OperatorHomeFilter) => void
  operatorRequests: LaunchProviderSatelliteListItemResponse[]
  operatorActionSatelliteId: number | null
  operatorSummary: {
    pending: number
    approved: number
    rejected: number
  }
  launcherProviderFilter: LauncherProviderHomeFilter
  setLauncherProviderFilter: (filter: LauncherProviderHomeFilter) => void
  employeeRequests: LaunchProviderOperatorListItemResponse[]
  employeeSummary: {
    pending: number
    approved: number
    rejected: number
  }
  launchProviderLoading: boolean
  employeeActionOperatorId: number | null
  handleOpenPayloadDetail: (payloadId: number) => void
  handleOpenOperatorSatellite: (
    satellite: LaunchProviderSatelliteListItemResponse,
  ) => void
  handleOpenInspection: (satelliteId: number) => void
  handleApproveSatellite: (
    satelliteId: number,
    satellitePriorityId: number,
  ) => void | Promise<void>
  handleRejectSatellite: (satelliteId: number) => void | Promise<void>
  handleApproveEmployeeRequest: (requestId: number) => void | Promise<void>
  handleRejectEmployeeRequest: (requestId: number) => void | Promise<void>
}

const shouldShowTrackingCodeAction = (
  item: ShipperSatelliteListItemResponse,
) => item.status.code === "AWAITING_SHIPMENT"

type ReviewStatus = "PENDING" | "APPROVED" | "REJECTED"

const statusStyles: Record<
  ReviewStatus,
  {
    label: string
    backgroundColor: string
    color: string
  }
> = {
  PENDING: {
    label: "Pendente",
    backgroundColor: "#FEF3C7",
    color: "#B45309",
  },
  APPROVED: {
    label: "Aprovado",
    backgroundColor: "#DCFCE7",
    color: "#15803D",
  },
  REJECTED: {
    label: "Recusado",
    backgroundColor: "#FEE2E2",
    color: "#B91C1C",
  },
}

const filterButtonStyle = (isActive: boolean) => ({
  paddingHorizontal: 18,
  paddingVertical: 9,
  borderRadius: 999,
  backgroundColor: isActive ? "#059669" : "#FFFFFF",
  borderWidth: isActive ? 0 : 1,
  borderColor: "#E2E8F0",
})

const filterButtonTextStyle = (isActive: boolean) => ({
  fontSize: 13,
  fontWeight: isActive ? ("700" as const) : ("600" as const),
  color: isActive ? "#FFFFFF" : "#475569",
})

const listContentStyle = {
  paddingBottom: 100,
  gap: 14,
}

const satellitePriorityOptions: Option[] = [
  { id: 1, label: "Baixa" },
  { id: 2, label: "Media" },
  { id: 3, label: "Alta" },
]

const summaryCard = (label: string, value: number) => (
  <View
    style={{
      flex: 1,
      backgroundColor: "#FFFFFF",
      borderRadius: 18,
      padding: 14,
    }}
  >
    <Text
      style={{
        fontSize: 12,
        color: "#64748B",
        marginBottom: 4,
      }}
    >
      {label}
    </Text>
    <Text
      style={{
        fontSize: 24,
        fontWeight: "800",
        color: "#0F172A",
      }}
    >
      {value}
    </Text>
  </View>
)

const headerConfigByRole = {
  shipper: {
    title: (
      <>
        Meu <Text style={{ color: "#F97316" }}>Envio</Text>
      </>
    ),
    description:
      "Acompanhe o andamento dos satelites cadastrados e consulte cada etapa do envio.",
  },
  payloadHandler: {
    title: (
      <>
        Pedidos de <Text style={{ color: "#F97316" }}>Satelite</Text>
      </>
    ),
    description:
      "Analise as solicitacoes recebidas e aprove novos satelites para seguir o fluxo.",
  },
  launcherProvider: {
    title: (
      <>
        Aprovar <Text style={{ color: "#F97316" }}>Funcionario</Text>
      </>
    ),
    description:
      "Revise os pedidos de acesso da equipe e aceite novos funcionarios no fluxo operacional.",
  },
}

const HomeContent = ({
  isPayloadHandlerHome,
  isLauncherProviderHome,
  shipperFilter,
  shipperLoading,
  setShipperFilter,
  shipperItems,
  refreshShipperSatellites,
  operatorLoading,
  operatorFilter,
  setOperatorFilter,
  operatorRequests,
  operatorActionSatelliteId,
  operatorSummary,
  launcherProviderFilter,
  setLauncherProviderFilter,
  employeeRequests,
  employeeSummary,
  launchProviderLoading,
  employeeActionOperatorId,
  handleOpenPayloadDetail,
  handleOpenOperatorSatellite,
  handleOpenInspection,
  handleApproveSatellite,
  handleRejectSatellite,
  handleApproveEmployeeRequest,
  handleRejectEmployeeRequest,
}: HomeContentProps) => {
  const [priorityModalSatelliteId, setPriorityModalSatelliteId] = useState<number | null>(
    null,
  )
  const [launcherProviderSection, setLauncherProviderSection] = useState<
    "SATELLITES" | "OPERATORS"
  >("SATELLITES")
  const [trackingModalSatellite, setTrackingModalSatellite] =
    useState<ShipperSatelliteListItemResponse | null>(null)
  const [selectedPriorities, setSelectedPriorities] = useState<
    Record<number, Option | undefined>
  >({})

  const homeRole = isLauncherProviderHome
    ? "launcherProvider"
    : isPayloadHandlerHome
      ? "payloadHandler"
      : "shipper"

  const headerConfig = headerConfigByRole[homeRole]

  const headerBlock = (
    <>
      <Banner />

      <View
        style={{
          alignItems: "center",
          paddingTop: 8,
          paddingBottom: 8,
        }}
      >
        <Text
          style={{
            fontSize: 20,
            fontWeight: "700",
            color: "#059669",
            marginBottom: 6,
          }}
        >
          {headerConfig.title}
        </Text>

        <Text
          style={{
            fontSize: 13,
            lineHeight: 19,
            color: "#64748B",
            textAlign: "center",
            maxWidth: 300,
          }}
        >
          {headerConfig.description}
        </Text>
      </View>
    </>
  )

  if (homeRole === "shipper") {
    return (
      <View style={{ flex: 1, paddingHorizontal: 20 }}>
        <FlatList
          data={shipperItems}
          keyExtractor={(item) => String(item.satellite_id)}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={listContentStyle}
          ListHeaderComponent={
            <>
              {headerBlock}

              <View
                style={{
                  flexDirection: "row",
                  gap: 10,
                  marginBottom: 18,
                }}
              >
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => setShipperFilter("ALL")}
                  style={filterButtonStyle(shipperFilter === "ALL")}
                >
                  <Text style={filterButtonTextStyle(shipperFilter === "ALL")}>
                    Todos
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => setShipperFilter("PENDING")}
                  style={filterButtonStyle(shipperFilter === "PENDING")}
                >
                  <Text
                    style={filterButtonTextStyle(shipperFilter === "PENDING")}
                  >
                    Pendente
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => setShipperFilter("SHIPPED")}
                  style={filterButtonStyle(shipperFilter === "SHIPPED")}
                >
                  <Text
                    style={filterButtonTextStyle(shipperFilter === "SHIPPED")}
                  >
                    Enviado
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          }
          ListEmptyComponent={
            <View
              style={{
                backgroundColor: "#FFFFFF",
                borderRadius: 18,
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
                {shipperLoading ? "Carregando satelites" : "Nenhum envio encontrado"}
              </Text>

              <Text
                style={{
                  fontSize: 13,
                  color: "#64748B",
                  textAlign: "center",
                }}
              >
                {shipperLoading
                  ? "Buscando os satelites cadastrados para este usuario."
                  : "Ajuste o filtro para visualizar outros satelites do seu historico."}
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <View
              style={{
                minHeight: 94,
                backgroundColor: "#FFFFFF",
                borderRadius: 18,
                padding: 14,
                shadowColor: "#000",
                shadowOffset: {
                  width: 0,
                  height: 4,
                },
                shadowOpacity: 0.08,
                shadowRadius: 10,
                elevation: 3,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <View
                  style={{
                    width: 58,
                    height: 58,
                    borderRadius: 16,
                    backgroundColor: "#ECFDF5",
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: 14,
                  }}
                >
                  <Ionicons name="cube-outline" size={30} color="#059669" />
                </View>

                <View style={{ flex: 1 }}>
                  <Text
                    numberOfLines={1}
                    style={{
                      fontSize: 16,
                      fontWeight: "700",
                      color: "#0F172A",
                      marginBottom: 4,
                    }}
                  >
                    {item.name}
                  </Text>

                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: "600",
                      color: "#F97316",
                      marginBottom: 2,
                    }}
                  >
                    {getSatelliteStatusLabel(item.status.code)}
                  </Text>

                  <Text
                    style={{
                      fontSize: 12,
                      color: "#64748B",
                    }}
                  >
                    ID #{item.satellite_id}
                  </Text>
                </View>

                <View
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 7,
                    borderRadius: 999,
                    backgroundColor: "#F1F5F9",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 11,
                      fontWeight: "700",
                      color: "#475569",
                    }}
                  >
                    {getSatelliteStatusLabel(item.status.code)}
                  </Text>
                </View>
              </View>

              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "flex-end",
                  gap: 10,
                  marginTop: 14,
                }}
              >
                {shouldShowTrackingCodeAction(item) ? (
                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={() => setTrackingModalSatellite(item)}
                    style={{
                      minHeight: 42,
                      borderRadius: 999,
                      backgroundColor: "#059669",
                      alignItems: "center",
                      justifyContent: "center",
                      paddingHorizontal: 16,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: "700",
                        color: "#FFFFFF",
                      }}
                    >
                      Adicionar Codigo de Rastreio
                    </Text>
                  </TouchableOpacity>
                ) : null}

                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => handleOpenPayloadDetail(item.satellite_id)}
                  style={{
                    minHeight: 42,
                    borderRadius: 999,
                    borderWidth: 1,
                    borderColor: "#CBD5E1",
                    alignItems: "center",
                    justifyContent: "center",
                    paddingHorizontal: 16,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: "700",
                      color: "#475569",
                    }}
                  >
                    Ver detalhe
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />

        <TrackingCodeModal
          visible={Boolean(trackingModalSatellite)}
          satelliteId={trackingModalSatellite?.satellite_id ?? null}
          satelliteName={trackingModalSatellite?.name ?? "o satelite"}
          onTrackingUpdated={() => refreshShipperSatellites()}
          onClose={() => setTrackingModalSatellite(null)}
        />
      </View>
    )
  }

  if (homeRole === "payloadHandler") {
    return (
      <View style={{ flex: 1, paddingHorizontal: 20 }}>
        <FlatList
          data={operatorRequests}
          keyExtractor={(item) => String(item.satellite_id)}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={listContentStyle}
          ListHeaderComponent={
            <>
              {headerBlock}

              <View
                style={{
                  flexDirection: "row",
                  gap: 12,
                  marginBottom: 18,
                }}
              >
                {summaryCard("Pendentes", operatorSummary.pending)}
                {summaryCard("Aprovados", operatorSummary.approved)}
              </View>

              <View
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  gap: 10,
                  marginBottom: 18,
                }}
              >
                {[
                  { key: "PENDING", label: "Pendentes" },
                  { key: "READY_FOR_LAUNCH", label: "Prontos" },
                  { key: "APPROVED", label: "Aprovados" },
                  { key: "REJECTED", label: "Recusados" },
                  { key: "ALL", label: "Todos" },
                ].map((filter) => (
                  <TouchableOpacity
                    key={filter.key}
                    activeOpacity={0.8}
                    onPress={() =>
                      setOperatorFilter(filter.key as OperatorHomeFilter)
                    }
                    style={filterButtonStyle(operatorFilter === filter.key)}
                  >
                    <Text
                      style={filterButtonTextStyle(operatorFilter === filter.key)}
                    >
                      {filter.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          }
          ListEmptyComponent={
            <View
              style={{
                backgroundColor: "#FFFFFF",
                borderRadius: 18,
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
                {operatorLoading
                  ? "Carregando satelites"
                  : "Nenhum satelite neste filtro"}
              </Text>

              <Text
                style={{
                  fontSize: 13,
                  color: "#64748B",
                  textAlign: "center",
                }}
              >
                {operatorLoading
                  ? "Buscando os satelites vinculados a esta provedora."
                  : "Selecione outro status para revisar outros satelites da fila."}
              </Text>
            </View>
          }
          renderItem={({ item }) => {
            const reviewStatus: ReviewStatus =
              item.status.code === "PENDING_APPROVAL"
                ? "PENDING"
                : item.status.code === "REJECTED" ||
                    item.status.code === "INSPECTION_REJECTED"
                  ? "REJECTED"
                  : "APPROVED"
            const badgeStyle = statusStyles[reviewStatus]
            const isPendingApproval = item.status.code === "PENDING_APPROVAL"
            const canInspectSatellite = item.status.code === "PENDING_INSPECTION"
            const isSubmittingAction =
              operatorActionSatelliteId === item.satellite_id
            const selectedPriority = selectedPriorities[item.satellite_id]

            return (
              <View
                style={{
                  backgroundColor: "#FFFFFF",
                  borderRadius: 20,
                  padding: 16,
                  shadowColor: "#000",
                  shadowOffset: {
                    width: 0,
                    height: 4,
                  },
                  shadowOpacity: 0.08,
                  shadowRadius: 10,
                  elevation: 3,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "flex-start",
                    marginBottom: 14,
                  }}
                >
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
                    <Ionicons
                      name="rocket-outline"
                      size={28}
                      color="#059669"
                    />
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
                        fontSize: 13,
                        fontWeight: "600",
                        color: "#F97316",
                        marginBottom: 3,
                      }}
                    >
                      {getSatelliteStatusLabel(item.status.code)}
                    </Text>

                    <Text
                      style={{
                        fontSize: 12,
                        color: "#64748B",
                      }}
                    >
                      ID #{item.satellite_id} | Provedora #{item.launch_provider_id}
                    </Text>
                  </View>

                  <View
                    style={{
                      paddingHorizontal: 12,
                      paddingVertical: 7,
                      borderRadius: 999,
                      backgroundColor: badgeStyle.backgroundColor,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 11,
                        fontWeight: "700",
                        color: badgeStyle.color,
                      }}
                    >
                      {badgeStyle.label}
                    </Text>
                  </View>
                </View>

                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "flex-end",
                    gap: 10,
                    marginBottom: isPendingApproval ? 0 : 14,
                  }}
                >
                  {canInspectSatellite ? (
                    <TouchableOpacity
                      activeOpacity={0.85}
                      onPress={() => handleOpenInspection(item.satellite_id)}
                      style={{
                        minHeight: 42,
                        borderRadius: 999,
                        backgroundColor: "#059669",
                        alignItems: "center",
                        justifyContent: "center",
                        paddingHorizontal: 16,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 12,
                          fontWeight: "700",
                          color: "#FFFFFF",
                        }}
                      >
                        Inspecionar
                      </Text>
                    </TouchableOpacity>
                  ) : null}

                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => handleOpenOperatorSatellite(item)}
                    style={{
                      minHeight: 42,
                      borderRadius: 999,
                      borderWidth: 1,
                      borderColor: "#CBD5E1",
                      alignItems: "center",
                      justifyContent: "center",
                      paddingHorizontal: 16,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: "700",
                        color: "#475569",
                      }}
                    >
                      Ver detalhe
                    </Text>
                  </TouchableOpacity>
                </View>

                {isPendingApproval ? (
                  <View
                    style={{
                      marginTop: 14,
                    }}
                  >
                    <View style={{ marginBottom: 12 }}>
                      <ModalSelect
                        title="Prioridade"
                        visible={priorityModalSatelliteId === item.satellite_id}
                        value={selectedPriority ?? null}
                        options={satellitePriorityOptions}
                        openModal={() => setPriorityModalSatelliteId(item.satellite_id)}
                        closeModal={() => setPriorityModalSatelliteId(null)}
                        optionSelected={(option) =>
                          setSelectedPriorities((prev) => ({
                            ...prev,
                            [item.satellite_id]: option,
                          }))
                        }
                      />
                    </View>

                    <View
                      style={{
                        flexDirection: "row",
                        gap: 10,
                      }}
                    >
                    <TouchableOpacity
                      activeOpacity={0.85}
                      onPress={() => void handleRejectSatellite(item.satellite_id)}
                      disabled={isSubmittingAction}
                      style={{
                        flex: 1,
                        minHeight: 46,
                        borderRadius: 999,
                        borderWidth: 1,
                        borderColor: "#FCA5A5",
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: "#FFFFFF",
                        opacity: isSubmittingAction ? 0.65 : 1,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 13,
                          fontWeight: "700",
                          color: "#B91C1C",
                        }}
                      >
                        Rejeitar
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      activeOpacity={0.85}
                      onPress={() =>
                        selectedPriority
                          ? void handleApproveSatellite(
                              item.satellite_id,
                              Number(selectedPriority.id),
                            )
                          : undefined
                      }
                      disabled={isSubmittingAction || !selectedPriority}
                      style={{
                        flex: 1,
                        minHeight: 46,
                        borderRadius: 999,
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: selectedPriority ? "#059669" : "#86C5A5",
                        opacity: isSubmittingAction ? 0.65 : 1,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 13,
                          fontWeight: "700",
                          color: "#FFFFFF",
                        }}
                      >
                        {isSubmittingAction ? "Enviando..." : "Aceitar"}
                      </Text>
                    </TouchableOpacity>
                    </View>
                  </View>
                ) : null}
              </View>
            )
          }}
        />
      </View>
    )
  }

  if (homeRole === "launcherProvider" && launcherProviderSection === "SATELLITES") {
    return (
      <View style={{ flex: 1, paddingHorizontal: 20 }}>
        <FlatList
          data={operatorRequests}
          keyExtractor={(item) => String(item.satellite_id)}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={listContentStyle}
          ListHeaderComponent={
            <>
              {headerBlock}

              <View
                style={{
                  flexDirection: "row",
                  gap: 10,
                  marginBottom: 18,
                }}
              >
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => setLauncherProviderSection("SATELLITES")}
                  style={filterButtonStyle(true)}
                >
                  <Text
                    style={filterButtonTextStyle(true)}
                  >
                    Satelites
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => setLauncherProviderSection("OPERATORS")}
                  style={filterButtonStyle(false)}
                >
                  <Text
                    style={filterButtonTextStyle(false)}
                  >
                    Operadores
                  </Text>
                </TouchableOpacity>
              </View>

              <View
                style={{
                  flexDirection: "row",
                  gap: 12,
                  marginBottom: 18,
                }}
              >
                {summaryCard("Pendentes", operatorSummary.pending)}
                {summaryCard("Prontos", operatorRequests.filter((item) => item.status.code === "READY_FOR_LAUNCH").length)}
              </View>

              <View
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  gap: 10,
                  marginBottom: 18,
                }}
              >
                {[
                  { key: "PENDING", label: "Pendentes" },
                  { key: "READY_FOR_LAUNCH", label: "Prontos" },
                  { key: "APPROVED", label: "Aprovados" },
                  { key: "REJECTED", label: "Recusados" },
                  { key: "ALL", label: "Todos" },
                ].map((filter) => (
                  <TouchableOpacity
                    key={filter.key}
                    activeOpacity={0.8}
                    onPress={() =>
                      setOperatorFilter(filter.key as OperatorHomeFilter)
                    }
                    style={filterButtonStyle(operatorFilter === filter.key)}
                  >
                    <Text
                      style={filterButtonTextStyle(operatorFilter === filter.key)}
                    >
                      {filter.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          }
          ListEmptyComponent={
            <View
              style={{
                backgroundColor: "#FFFFFF",
                borderRadius: 18,
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
                {operatorLoading
                  ? "Carregando satelites"
                  : "Nenhum satelite neste filtro"}
              </Text>

              <Text
                style={{
                  fontSize: 13,
                  color: "#64748B",
                  textAlign: "center",
                }}
              >
                {operatorLoading
                  ? "Buscando os satelites vinculados a esta provedora."
                  : "Selecione outro status para revisar outros satelites da fila."}
              </Text>
            </View>
          }
          renderItem={({ item }) => {
            const reviewStatus: ReviewStatus =
              item.status.code === "PENDING_APPROVAL"
                ? "PENDING"
                : item.status.code === "REJECTED" ||
                    item.status.code === "INSPECTION_REJECTED"
                  ? "REJECTED"
                  : "APPROVED"
            const badgeStyle = statusStyles[reviewStatus]

            return (
              <View
                style={{
                  backgroundColor: "#FFFFFF",
                  borderRadius: 20,
                  padding: 16,
                  shadowColor: "#000",
                  shadowOffset: {
                    width: 0,
                    height: 4,
                  },
                  shadowOpacity: 0.08,
                  shadowRadius: 10,
                  elevation: 3,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "flex-start",
                    marginBottom: 14,
                  }}
                >
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
                    <Ionicons
                      name="rocket-outline"
                      size={28}
                      color="#059669"
                    />
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
                        fontSize: 13,
                        fontWeight: "600",
                        color: "#F97316",
                        marginBottom: 3,
                      }}
                    >
                      {getSatelliteStatusLabel(item.status.code)}
                    </Text>

                    <Text
                      style={{
                        fontSize: 12,
                        color: "#64748B",
                      }}
                    >
                      ID #{item.satellite_id} | Provedora #{item.launch_provider_id}
                    </Text>
                  </View>

                  <View
                    style={{
                      paddingHorizontal: 12,
                      paddingVertical: 7,
                      borderRadius: 999,
                      backgroundColor: badgeStyle.backgroundColor,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 11,
                        fontWeight: "700",
                        color: badgeStyle.color,
                      }}
                    >
                      {badgeStyle.label}
                    </Text>
                  </View>
                </View>

                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "flex-end",
                  }}
                >
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => handleOpenPayloadDetail(item.satellite_id)}
                    style={{
                      minHeight: 42,
                      borderRadius: 999,
                      borderWidth: 1,
                      borderColor: "#CBD5E1",
                      alignItems: "center",
                      justifyContent: "center",
                      paddingHorizontal: 16,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: "700",
                        color: "#475569",
                      }}
                    >
                      Ver detalhe
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )
          }}
        />
      </View>
    )
  }

  return (
    <View style={{ flex: 1, paddingHorizontal: 20 }}>
      <FlatList
        data={employeeRequests}
        keyExtractor={(item) => String(item.operator_id)}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={listContentStyle}
        ListHeaderComponent={
          <>
            {headerBlock}

            <View
              style={{
                flexDirection: "row",
                gap: 10,
                marginBottom: 18,
              }}
            >
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setLauncherProviderSection("SATELLITES")}
                style={filterButtonStyle(launcherProviderSection === "SATELLITES")}
              >
                <Text
                  style={filterButtonTextStyle(
                    launcherProviderSection === "SATELLITES",
                  )}
                >
                  Satelites
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setLauncherProviderSection("OPERATORS")}
                style={filterButtonStyle(launcherProviderSection === "OPERATORS")}
              >
                <Text
                  style={filterButtonTextStyle(
                    launcherProviderSection === "OPERATORS",
                  )}
                >
                  Operadores
                </Text>
              </TouchableOpacity>
            </View>

            <View
              style={{
                flexDirection: "row",
                gap: 12,
                marginBottom: 18,
              }}
            >
              {summaryCard("Pendentes", employeeSummary.pending)}
              {summaryCard("Aprovados", employeeSummary.approved)}
            </View>

            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                gap: 10,
                marginBottom: 18,
              }}
            >
              {[
                { key: "PENDING", label: "Pendentes" },
                { key: "APPROVED", label: "Aprovados" },
                { key: "REJECTED", label: "Recusados" },
                { key: "ALL", label: "Todos" },
              ].map((filter) => (
                <TouchableOpacity
                  key={filter.key}
                  activeOpacity={0.8}
                  onPress={() =>
                    setLauncherProviderFilter(
                      filter.key as LauncherProviderHomeFilter,
                    )
                  }
                  style={filterButtonStyle(launcherProviderFilter === filter.key)}
                >
                  <Text
                    style={filterButtonTextStyle(
                      launcherProviderFilter === filter.key,
                    )}
                  >
                    {filter.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        }
        ListEmptyComponent={
          <View
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: 18,
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
              {launchProviderLoading
                ? "Carregando operadores"
                : "Nenhum operador neste filtro"}
            </Text>

            <Text
              style={{
                fontSize: 13,
                color: "#64748B",
                textAlign: "center",
              }}
            >
              {launchProviderLoading
                ? "Buscando os operadores vinculados a esta provedora."
                : "Troque o filtro para revisar outros operadores da sua empresa."}
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const reviewStatus: ReviewStatus =
            item.status.code === "APPROVED"
              ? "APPROVED"
              : item.status.code === "REJECTED"
                ? "REJECTED"
                : "PENDING"
          const badgeStyle = statusStyles[reviewStatus]
          const isPending =
            item.status.code === "PENDING" ||
            item.status.code === "PENDING_APPROVAL"
          const isSubmittingAction = employeeActionOperatorId === item.operator_id

          return (
            <View
              style={{
                backgroundColor: "#FFFFFF",
                borderRadius: 20,
                padding: 16,
                shadowColor: "#000",
                shadowOffset: {
                  width: 0,
                  height: 4,
                },
                shadowOpacity: 0.08,
                shadowRadius: 10,
                elevation: 3,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "flex-start",
                  marginBottom: 14,
                }}
              >
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
                  <Ionicons
                    name="people-outline"
                    size={28}
                    color="#059669"
                  />
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
                      fontSize: 13,
                      fontWeight: "600",
                      color: "#334155",
                      marginBottom: 3,
                    }}
                  >
                    Operador de lancamento
                  </Text>

                  <Text
                    style={{
                      fontSize: 12,
                      color: "#64748B",
                    }}
                  >
                    ID #{item.operator_id} | Provedora #{item.launch_provider_id}
                  </Text>
                </View>

                <View
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 7,
                    borderRadius: 999,
                    backgroundColor: badgeStyle.backgroundColor,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 11,
                      fontWeight: "700",
                      color: badgeStyle.color,
                    }}
                  >
                    {badgeStyle.label}
                  </Text>
                </View>
              </View>

              {isPending ? (
                <View
                  style={{
                    flexDirection: "row",
                    gap: 10,
                  }}
                >
                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={() => void handleRejectEmployeeRequest(item.operator_id)}
                    disabled={isSubmittingAction}
                    style={{
                      flex: 1,
                      minHeight: 46,
                      borderRadius: 999,
                      borderWidth: 1,
                      borderColor: "#FCA5A5",
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: "#FFFFFF",
                      opacity: isSubmittingAction ? 0.65 : 1,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 13,
                        fontWeight: "700",
                        color: "#B91C1C",
                      }}
                    >
                      Recusar
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={() => void handleApproveEmployeeRequest(item.operator_id)}
                    disabled={isSubmittingAction}
                    style={{
                      flex: 1,
                      minHeight: 46,
                      borderRadius: 999,
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: "#059669",
                      opacity: isSubmittingAction ? 0.65 : 1,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 13,
                        fontWeight: "700",
                        color: "#FFFFFF",
                      }}
                    >
                      {isSubmittingAction ? "Enviando..." : "Aceitar"}
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <Text
                  style={{
                    fontSize: 12,
                    lineHeight: 18,
                    color: "#64748B",
                  }}
                >
                  {item.status.code === "APPROVED"
                    ? "Operador aprovado e liberado para seguir no fluxo da operacao."
                    : "Operador rejeitado pela provedora de lancamento."}
                </Text>
              )}
            </View>
          )
        }}
      />
    </View>
  )
}

export default HomeContent
