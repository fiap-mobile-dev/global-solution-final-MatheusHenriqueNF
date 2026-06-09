import { AuthContext } from "@/contexts/AuthContext"
import { LaunchProviderContext } from "@/contexts/LaunchProviderContext"
import { OperatorContext } from "@/contexts/OperatorContext"
import { UserContext } from "@/contexts/UserContext"
import {
  getLaunchProviderOperators,
  getLaunchProviderSatellites,
  getSatellitePriorities,
  getShipperSatellites,
  submitSatelliteApproval,
  submitOperatorApproval,
} from "@/lib/api"
import type {
  LaunchProviderOperatorListItemResponse,
  LaunchProviderSatelliteListItemResponse,
  ShipperSatelliteListItemResponse,
  SatellitePriorityResponse,
  UserType,
} from "@/types"
import { useFocusEffect, useRouter } from "expo-router"
import { useCallback, useContext, useEffect, useRef, useState } from "react"
import { Alert } from "react-native"

export type ShipperHomeFilter = "ALL" | "PENDING" | "SHIPPED"
export type OperatorHomeFilter =
  | "ALL"
  | "PENDING"
  | "READY_FOR_LAUNCH"
  | "APPROVED"
  | "REJECTED"
export type LauncherProviderHomeFilter =
  | "ALL"
  | "PENDING"
  | "APPROVED"
  | "REJECTED"

const isSentSatellite = (item: ShipperSatelliteListItemResponse) =>
  item.status.code === "LAUNCHED"

const getOperatorSatelliteGroup = (
  item: LaunchProviderSatelliteListItemResponse,
): Exclude<OperatorHomeFilter, "ALL"> => {
  if (item.status.code === "PENDING_APPROVAL") return "PENDING"
  if (item.status.code === "READY_FOR_LAUNCH") return "READY_FOR_LAUNCH"
  if (item.status.code === "REJECTED" || item.status.code === "INSPECTION_REJECTED") {
    return "REJECTED"
  }

  return "APPROVED"
}

const getLaunchProviderOperatorGroup = (
  item: LaunchProviderOperatorListItemResponse,
): Exclude<LauncherProviderHomeFilter, "ALL"> => {
  if (item.status.code === "PENDING" || item.status.code === "PENDING_APPROVAL") {
    return "PENDING"
  }

  if (item.status.code === "REJECTED") {
    return "REJECTED"
  }

  return "APPROVED"
}

const getSatellitePriorityId = (item: LaunchProviderSatelliteListItemResponse) =>
  item.priority?.satellite_priority_id ?? item.satellite_priority_id ?? null

export const useHome = () => {
  const router = useRouter()
  const { user } = useContext(AuthContext)
  const { profile: operatorProfile, refreshProfile: refreshOperatorProfile } =
    useContext(OperatorContext)
  const {
    profile: launchProviderProfile,
    refreshProfile: refreshLaunchProviderProfile,
  } = useContext(LaunchProviderContext)
  const { profile, refreshProfile } = useContext(UserContext)

  const [shipperFilter, setShipperFilter] = useState<ShipperHomeFilter>("ALL")
  const [shipperLoading, setShipperLoading] = useState(false)
  const [shipperItems, setShipperItems] = useState<ShipperSatelliteListItemResponse[]>([])
  const [operatorLoading, setOperatorLoading] = useState(false)
  const [operatorActionSatelliteId, setOperatorActionSatelliteId] = useState<number | null>(
    null,
  )
  const [operatorFilter, setOperatorFilter] =
    useState<OperatorHomeFilter>("PENDING")
  const [launcherProviderFilter, setLauncherProviderFilter] =
    useState<LauncherProviderHomeFilter>("PENDING")
  const [operatorItems, setOperatorItems] = useState<
    LaunchProviderSatelliteListItemResponse[]
  >([])
  const [satellitePriorities, setSatellitePriorities] = useState<
    SatellitePriorityResponse[]
  >([])
  const [launchProviderLoading, setLaunchProviderLoading] = useState(false)
  const [employeeActionOperatorId, setEmployeeActionOperatorId] = useState<number | null>(
    null,
  )
  const [employeeRequests, setEmployeeRequests] = useState<
    LaunchProviderOperatorListItemResponse[]
  >([])
  const shipperRequestIdRef = useRef(0)
  const operatorRequestIdRef = useRef(0)
  const launchProviderRequestIdRef = useRef(0)

  const currentUserType =
    (user?.type as unknown as UserType | undefined) ?? "SHIPPER"
  const isPayloadHandlerHome = currentUserType === "PAYLOAD_HANDLER"
  const isLauncherProviderHome = currentUserType === "LAUNCHER_PROVIDER"

  const refreshShipperSatellites = useCallback(async () => {
    if (currentUserType !== "SHIPPER") {
      setShipperItems([])
      setShipperLoading(false)
      return
    }

    const requestId = shipperRequestIdRef.current + 1
    shipperRequestIdRef.current = requestId
    setShipperLoading(true)

    try {
      const resolvedProfile = profile ?? (await refreshProfile())

      if (!resolvedProfile?.shipper_id) {
        if (shipperRequestIdRef.current === requestId) {
          setShipperItems([])
        }
        return
      }

      const response = await getShipperSatellites(resolvedProfile.shipper_id)
      if (shipperRequestIdRef.current === requestId) {
        setShipperItems(response.items)
      }
    } catch {
      if (shipperRequestIdRef.current === requestId) {
        setShipperItems([])
      }
    } finally {
      if (shipperRequestIdRef.current === requestId) {
        setShipperLoading(false)
      }
    }
  }, [currentUserType, profile, refreshProfile])

  const refreshOperatorSatellites = useCallback(async () => {
    if (
      currentUserType !== "PAYLOAD_HANDLER" &&
      currentUserType !== "LAUNCHER_PROVIDER"
    ) {
      setOperatorItems([])
      setOperatorLoading(false)
      return
    }

    const requestId = operatorRequestIdRef.current + 1
    operatorRequestIdRef.current = requestId
    setOperatorLoading(true)

    try {
      const resolvedProfile =
        currentUserType === "PAYLOAD_HANDLER"
          ? operatorProfile ?? (await refreshOperatorProfile())
          : launchProviderProfile ?? (await refreshLaunchProviderProfile())

      const resolvedLaunchProviderId =
        currentUserType === "PAYLOAD_HANDLER"
          ? resolvedProfile?.launch_provider_id
          : resolvedProfile?.launch_provider_id

      if (!resolvedLaunchProviderId) {
        if (operatorRequestIdRef.current === requestId) {
          setOperatorItems([])
        }
        return
      }

      const response = await getLaunchProviderSatellites(
        resolvedLaunchProviderId,
      )
      if (operatorRequestIdRef.current === requestId) {
        setOperatorItems(response.items)
      }
    } catch {
      if (operatorRequestIdRef.current === requestId) {
        setOperatorItems([])
      }
    } finally {
      if (operatorRequestIdRef.current === requestId) {
        setOperatorLoading(false)
      }
    }
  }, [
    currentUserType,
    launchProviderProfile,
    operatorProfile,
    refreshLaunchProviderProfile,
    refreshOperatorProfile,
  ])

  const refreshSatellitePriorities = useCallback(async () => {
    try {
      const response = await getSatellitePriorities()
      setSatellitePriorities(response)
    } catch {
      setSatellitePriorities([])
    }
  }, [])

  const refreshHomeData = useCallback(async () => {
    if (currentUserType === "SHIPPER") {
      await refreshShipperSatellites()
      return
    }

    if (currentUserType === "PAYLOAD_HANDLER") {
      await refreshSatellitePriorities()
      await refreshOperatorSatellites()
      return
    }

    if (currentUserType === "LAUNCHER_PROVIDER") {
      const requestId = launchProviderRequestIdRef.current + 1
      launchProviderRequestIdRef.current = requestId
      setLaunchProviderLoading(true)

      try {
        await refreshSatellitePriorities()
        await refreshOperatorSatellites()

        const resolvedProfile =
          launchProviderProfile ?? (await refreshLaunchProviderProfile())

        if (!resolvedProfile?.launch_provider_id) {
          if (launchProviderRequestIdRef.current === requestId) {
            setEmployeeRequests([])
          }
          return
        }

        const response = await getLaunchProviderOperators(
          resolvedProfile.launch_provider_id,
        )

        if (launchProviderRequestIdRef.current === requestId) {
          setEmployeeRequests(response.items)
        }
      } catch {
        if (launchProviderRequestIdRef.current === requestId) {
          setEmployeeRequests([])
        }
      } finally {
        if (launchProviderRequestIdRef.current === requestId) {
          setLaunchProviderLoading(false)
        }
      }
    }
  }, [
    currentUserType,
    launchProviderProfile,
    refreshLaunchProviderProfile,
    refreshOperatorSatellites,
    refreshSatellitePriorities,
    refreshShipperSatellites,
  ])

  useEffect(() => {
    void refreshHomeData()
  }, [refreshHomeData])

  useEffect(() => {
    if (currentUserType !== "SHIPPER") return

    const intervalId = setInterval(() => {
      void refreshShipperSatellites()
    }, 5000)

    return () => {
      clearInterval(intervalId)
    }
  }, [currentUserType, refreshShipperSatellites])

  useFocusEffect(
    useCallback(() => {
      void refreshHomeData()
    }, [refreshHomeData]),
  )

  const filteredShipperItems = shipperItems.filter((item) => {
    if (shipperFilter === "PENDING") return !isSentSatellite(item)
    if (shipperFilter === "SHIPPED") return isSentSatellite(item)
    return true
  })

  const priorityLevelById = satellitePriorities.reduce<Record<number, number>>(
    (acc, item) => {
      acc[item.satellite_priority_id] = item.priority_level
      return acc
    },
    {},
  )

  const filteredOperatorItems = operatorItems.filter((item) => {
    if (operatorFilter === "ALL") return true
    return getOperatorSatelliteGroup(item) === operatorFilter
  }).sort((left, right) => {
    if (operatorFilter !== "READY_FOR_LAUNCH") return 0

    const leftPriorityId = getSatellitePriorityId(left)
    const rightPriorityId = getSatellitePriorityId(right)
    const leftPriorityLevel = leftPriorityId ? (priorityLevelById[leftPriorityId] ?? 0) : 0
    const rightPriorityLevel = rightPriorityId
      ? (priorityLevelById[rightPriorityId] ?? 0)
      : 0

    if (rightPriorityLevel !== leftPriorityLevel) {
      return rightPriorityLevel - leftPriorityLevel
    }

    return left.satellite_id - right.satellite_id
  })

  const filteredEmployeeRequests = employeeRequests.filter((item) => {
    if (launcherProviderFilter === "ALL") return true
    return getLaunchProviderOperatorGroup(item) === launcherProviderFilter
  })

  const operatorSummary = {
    pending: operatorItems.filter((item) => getOperatorSatelliteGroup(item) === "PENDING")
      .length,
    approved: operatorItems.filter((item) => getOperatorSatelliteGroup(item) === "APPROVED")
      .length,
    rejected: operatorItems.filter((item) => getOperatorSatelliteGroup(item) === "REJECTED")
      .length,
  }

  const employeeSummary = {
    pending: employeeRequests.filter((item) => getLaunchProviderOperatorGroup(item) === "PENDING")
      .length,
    approved: employeeRequests.filter((item) => getLaunchProviderOperatorGroup(item) === "APPROVED")
      .length,
    rejected: employeeRequests.filter((item) => getLaunchProviderOperatorGroup(item) === "REJECTED")
      .length,
  }

  const handleOpenPayloadDetail = (payloadId: number) => {
    router.push({
      pathname: "/package-detail",
      params: { payloadId },
    })
  }

  const handleOpenOperatorSatellite = (
    satellite: LaunchProviderSatelliteListItemResponse,
  ) => {
    if (satellite.status.code === "PENDING_INSPECTION") {
      router.push({
        pathname: "/inspection",
        params: { satelliteId: satellite.satellite_id },
      })
      return
    }

    handleOpenPayloadDetail(satellite.satellite_id)
  }

  const handleOpenInspection = (satelliteId: number) => {
    router.push({
      pathname: "/inspection",
      params: { satelliteId },
    })
  }

  const handleSatelliteApproval = useCallback(
    async (
      satelliteId: number,
      approval: boolean,
      satellitePriorityId?: number,
    ) => {
      if (operatorActionSatelliteId === satelliteId) return

      try {
        setOperatorActionSatelliteId(satelliteId)
        await submitSatelliteApproval(satelliteId, {
          approval,
          satellite_priority_id: satellitePriorityId,
        })
        await refreshOperatorSatellites()
      } catch (error) {
        Alert.alert(
          approval ? "Erro ao aprovar" : "Erro ao rejeitar",
          error instanceof Error
            ? error.message
            : "Nao foi possivel atualizar o status do satelite.",
        )
      } finally {
        setOperatorActionSatelliteId(null)
      }
    },
    [operatorActionSatelliteId, refreshOperatorSatellites],
  )

  const handleApproveSatellite = useCallback(
    async (satelliteId: number, satellitePriorityId: number) => {
      await handleSatelliteApproval(satelliteId, true, satellitePriorityId)
    },
    [handleSatelliteApproval],
  )

  const handleRejectSatellite = useCallback(
    async (satelliteId: number) => {
      await handleSatelliteApproval(satelliteId, false)
    },
    [handleSatelliteApproval],
  )

  const handleOperatorApproval = useCallback(
    async (operatorId: number, approval: boolean) => {
      if (employeeActionOperatorId === operatorId) return

      try {
        setEmployeeActionOperatorId(operatorId)
        await submitOperatorApproval(operatorId, { approval })
        await refreshHomeData()
      } catch (error) {
        Alert.alert(
          approval ? "Erro ao aprovar operador" : "Erro ao rejeitar operador",
          error instanceof Error
            ? error.message
            : "Nao foi possivel atualizar o status do operador.",
        )
      } finally {
        setEmployeeActionOperatorId(null)
      }
    },
    [employeeActionOperatorId, refreshHomeData],
  )

  const handleApproveEmployeeRequest = useCallback(
    async (operatorId: number) => {
      await handleOperatorApproval(operatorId, true)
    },
    [handleOperatorApproval],
  )

  const handleRejectEmployeeRequest = useCallback(
    async (operatorId: number) => {
      await handleOperatorApproval(operatorId, false)
    },
    [handleOperatorApproval],
  )

  return {
    userName:
      currentUserType === "PAYLOAD_HANDLER"
        ? operatorProfile?.name ?? user?.name ?? "Usuario"
        : currentUserType === "LAUNCHER_PROVIDER"
          ? launchProviderProfile?.corporate_name ?? user?.name ?? "Usuario"
          : profile?.name ?? user?.name ?? "Usuario",
    isPayloadHandlerHome,
    isLauncherProviderHome,
    shipperFilter,
    shipperLoading,
    setShipperFilter,
    shipperItems: filteredShipperItems,
    refreshShipperSatellites,
    refreshHomeData,
    operatorLoading,
    operatorFilter,
    setOperatorFilter,
    operatorRequests: filteredOperatorItems,
    operatorSummary,
    operatorActionSatelliteId,
    launcherProviderFilter,
    setLauncherProviderFilter,
    employeeRequests: filteredEmployeeRequests,
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
  }
}
