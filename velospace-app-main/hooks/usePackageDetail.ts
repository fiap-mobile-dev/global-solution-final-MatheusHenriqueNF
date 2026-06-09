import { getSatelliteDetail } from "@/lib/api"
import type { SatelliteDetailResponse } from "@/types"
import { useRouter } from "expo-router"
import { useEffect, useState } from "react"

const PACKAGE_DETAIL_ACCENT_COLOR = "#078C4B"
const PACKAGE_DETAIL_ACCENT_SOFT_COLOR = "#DCFCE7"

interface PackageTimelineStep {
  key: string
  title: string
  description: string
  completed: boolean
  current: boolean
}

export interface PackageDetailViewModel extends SatelliteDetailResponse {
  timeline: PackageTimelineStep[]
  progressPercent: number
  accentColor: string
  accentSoftColor: string
}

const timelineTemplate = [
  {
    key: "PENDING_APPROVAL",
    title: "Solicitacao recebida",
    description: "O satelite aguarda aprovacao inicial.",
  },
  {
    key: "AWAITING_SHIPMENT",
    title: "Aguardando envio",
    description: "O envio fisico do satelite ainda nao foi realizado.",
  },
  {
    key: "AWAITING_DISPATCH",
    title: "Aguardando despacho",
    description: "O satelite foi enviado e aguarda despacho logistico.",
  },
  {
    key: "IN_TRANSIT",
    title: "Em transito",
    description: "O satelite esta em deslocamento para a base.",
  },
  {
    key: "PENDING_INSPECTION",
    title: "Aguardando inspecao",
    description: "O satelite aguarda inspecao tecnica na base.",
  },
  {
    key: "READY_FOR_LAUNCH",
    title: "Pronto para lancamento",
    description: "O satelite foi aprovado para entrar na fila de lancamento.",
  },
  {
    key: "AWAITING_LAUNCH",
    title: "Aguardando lancamento",
    description: "O satelite aguarda a janela de lancamento.",
  },
  {
    key: "LAUNCHED",
    title: "Lancado",
    description: "O satelite foi lancado com sucesso.",
  },
]

const blockedStatuses = new Set(["REJECTED", "INSPECTION_REJECTED"])
const progressOrder = timelineTemplate.map((step) => step.key)
const autoRefreshStatuses = new Set([
  "AWAITING_SHIPMENT",
  "AWAITING_DISPATCH",
  "IN_TRANSIT",
])

const buildTimeline = (statusCode: string): PackageTimelineStep[] => {
  if (blockedStatuses.has(statusCode)) {
    return [
      {
        ...timelineTemplate[0],
        completed: true,
        current: false,
      },
      {
        key: statusCode,
        title:
          statusCode === "REJECTED"
            ? "Solicitacao rejeitada"
            : "Inspecao reprovada",
        description:
          statusCode === "REJECTED"
            ? "O satelite foi rejeitado na etapa inicial."
            : "O satelite nao passou pela inspecao tecnica.",
        completed: false,
        current: true,
      },
    ]
  }

  const currentIndex = progressOrder.indexOf(statusCode)

  return timelineTemplate.map((step, index) => ({
    ...step,
    completed: currentIndex >= 0 ? index < currentIndex : false,
    current: currentIndex >= 0 ? index === currentIndex : false,
  }))
}

export const usePackageDetail = (satelliteId?: string) => {
  const router = useRouter()
  const [packageDetail, setPackageDetail] = useState<PackageDetailViewModel | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!packageDetail || !autoRefreshStatuses.has(packageDetail.status.code)) {
      return
    }

    const intervalId = setInterval(async () => {
      const parsedId = Number(satelliteId)

      if (!Number.isFinite(parsedId) || parsedId <= 0) {
        return
      }

      try {
        const satellite = await getSatelliteDetail(parsedId)
        const timeline = buildTimeline(satellite.status.code)
        const currentIndex = progressOrder.indexOf(satellite.status.code)
        const progressBase = blockedStatuses.has(satellite.status.code)
          ? 15
          : currentIndex >= 0
            ? ((currentIndex + 1) / progressOrder.length) * 100
            : 0

        setPackageDetail({
          ...satellite,
          timeline,
          progressPercent: Math.round(progressBase),
          accentColor: PACKAGE_DETAIL_ACCENT_COLOR,
          accentSoftColor: PACKAGE_DETAIL_ACCENT_SOFT_COLOR,
        })
      } catch {
        return
      }
    }, 5000)

    return () => {
      clearInterval(intervalId)
    }
  }, [packageDetail, satelliteId])

  useEffect(() => {
    const loadSatelliteDetail = async () => {
      const parsedId = Number(satelliteId)

      if (!Number.isFinite(parsedId) || parsedId <= 0) {
        setPackageDetail(null)
        setNotFound(true)
        setLoading(false)
        return
      }

      setLoading(true)
      setNotFound(false)

      try {
        const satellite = await getSatelliteDetail(parsedId)
        const timeline = buildTimeline(satellite.status.code)
        const currentIndex = progressOrder.indexOf(satellite.status.code)
        const progressBase = blockedStatuses.has(satellite.status.code)
          ? 15
          : currentIndex >= 0
            ? ((currentIndex + 1) / progressOrder.length) * 100
            : 0

        setPackageDetail({
          ...satellite,
          timeline,
          progressPercent: Math.round(progressBase),
          accentColor: PACKAGE_DETAIL_ACCENT_COLOR,
          accentSoftColor: PACKAGE_DETAIL_ACCENT_SOFT_COLOR,
        })
      } catch {
        setPackageDetail(null)
        setNotFound(true)
      } finally {
        setLoading(false)
      }
    }

    void loadSatelliteDetail()
  }, [satelliteId])

  const handleBack = () => {
    router.back()
  }

  return {
    packageDetail,
    loading,
    notFound,
    handleBack,
  }
}

export type { PackageTimelineStep }
