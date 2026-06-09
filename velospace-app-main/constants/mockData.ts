import type { PayloadListItemResponse, PayloadStatusCode } from "@/types"

export const payloads: PayloadListItemResponse[] = [
  {
    payload_id: 1,
    name: "ORION-A1",
    tracking_code: null,
    status: {
      payload_status_id: 1,
      code: "PENDING_APPROVAL" as PayloadStatusCode,
      description: "Aguardando Aprovação",
    },
  },
  {
    payload_id: 2,
    name: "NOVA-7",
    tracking_code: null,
    status: {
      payload_status_id: 2,
      code: "AWAITING_SHIPMENT" as PayloadStatusCode,
      description: "Aguardando Postagem",
    },
  },
  {
    payload_id: 3,
    name: "CUBEX-12",
    tracking_code: "FP456723" as PayloadStatusCode,
    status: {
      payload_status_id: 3,
      code: "AWAITING_DISPATCH" as PayloadStatusCode,
      description: "Aguardando Despacho",
    },
  },
  {
    payload_id: 4,
    name: "ASTRA-MINI",
    tracking_code: "FP558412" as PayloadStatusCode,
    status: {
      payload_status_id: 4,
      code: "IN_TRANSIT" as PayloadStatusCode,
      description: "Em Trânsito",
    },
  },
  {
    payload_id: 5,
    name: "HELIOS-3",
    tracking_code: "FP882341" as PayloadStatusCode,
    status: {
      payload_status_id: 5,
      code: "RECEIVED_AT_BASE" as PayloadStatusCode,
      description: "Recebido na Base",
    },
  },
  {
    payload_id: 6,
    name: "PULSAR-X",
    tracking_code: "FP991245" as PayloadStatusCode,
    status: {
      payload_status_id: 6,
      code: "PENDING_SCREENING" as PayloadStatusCode,
      description: "Aguardando Triagem",
    },
  },
  {
    payload_id: 7,
    name: "ARGO-1",
    tracking_code: "FP334122" as PayloadStatusCode,
    status: {
      payload_status_id: 7,
      code: "READY_FOR_LAUNCH" as PayloadStatusCode,
      description: "Pronto para Lançamento",
    },
  },
  {
    payload_id: 8,
    name: "TITAN-LITE",
    tracking_code: "FP778900" as PayloadStatusCode,
    status: {
      payload_status_id: 8,
      code: "AWAITING_LAUNCH" as PayloadStatusCode,
      description: "Aguardando Lançamento",
    },
  },
  {
    payload_id: 9,
    name: "VEGA-CUBE",
    tracking_code: "FP129876" as PayloadStatusCode,
    status: {
      payload_status_id: 9,
      code: "LAUNCHED" as PayloadStatusCode,
      description: "Lançado",
    },
  },
  {
    payload_id: 10,
    name: "ION-SPARK",
    tracking_code: null,
    status: {
      payload_status_id: 10,
      code: "REJECTED" as PayloadStatusCode,
      description: "Rejeitado",
    },
  },
]

export type ApprovalRequestStatus = "PENDING" | "APPROVED" | "REJECTED"
export type ApprovalRequestPriority = "Alta" | "Media" | "Baixa"

export interface ApprovalRequest {
  request_id: number
  payload_id: number
  name: string
  company: string
  requested_at: string
  priority: ApprovalRequestPriority
  status: ApprovalRequestStatus
}

export const approvalRequests: ApprovalRequest[] = [
  {
    request_id: 101,
    payload_id: 1,
    name: "ORION-A1",
    company: "Orbital Labs",
    requested_at: "03/06/2026",
    priority: "Alta",
    status: "PENDING",
  },
  {
    request_id: 102,
    payload_id: 2,
    name: "NOVA-7",
    company: "Nova Dynamics",
    requested_at: "02/06/2026",
    priority: "Media",
    status: "PENDING",
  },
  {
    request_id: 103,
    payload_id: 5,
    name: "HELIOS-3",
    company: "Helios Space",
    requested_at: "01/06/2026",
    priority: "Baixa",
    status: "APPROVED",
  },
  {
    request_id: 104,
    payload_id: 10,
    name: "ION-SPARK",
    company: "Ion Spark",
    requested_at: "31/05/2026",
    priority: "Alta",
    status: "REJECTED",
  },
]

export type EmployeeApprovalRequestStatus = "PENDING" | "APPROVED" | "REJECTED"

export interface EmployeeApprovalRequest {
  request_id: number
  name: string
  role: string
  base: string
  requested_at: string
  status: EmployeeApprovalRequestStatus
}

export const employeeApprovalRequests: EmployeeApprovalRequest[] = [
  {
    request_id: 201,
    name: "Camila Torres",
    role: "Analista de Missao",
    base: "Base Alcantara",
    requested_at: "03/06/2026",
    status: "PENDING",
  },
  {
    request_id: 202,
    name: "Rafael Lima",
    role: "Especialista em Integracao",
    base: "Base Barreira do Inferno",
    requested_at: "02/06/2026",
    status: "PENDING",
  },
  {
    request_id: 203,
    name: "Fernanda Souza",
    role: "Coordenadora de Operacoes",
    base: "Base Alcantara",
    requested_at: "31/05/2026",
    status: "APPROVED",
  },
  {
    request_id: 204,
    name: "Lucas Martins",
    role: "Tecnico de Solo",
    base: "Base Natal",
    requested_at: "30/05/2026",
    status: "REJECTED",
  },
]
