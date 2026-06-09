export const SATELLITE_STATUS_LABELS: Record<string, string> = {
  PENDING_APPROVAL: "Aguardando aprovacao",
  REJECTED: "Rejeitado",
  AWAITING_SHIPMENT: "Aguardando envio",
  AWAITING_DISPATCH: "Aguardando despacho",
  IN_TRANSIT: "Em transito",
  PENDING_INSPECTION: "Aguardando inspecao",
  INSPECTION_REJECTED: "Reprovado na inspecao",
  READY_FOR_LAUNCH: "Pronto para lancamento",
  AWAITING_LAUNCH: "Aguardando lancamento",
  LAUNCHED: "Lancado",
}

export const getSatelliteStatusLabel = (statusCode: string) =>
  SATELLITE_STATUS_LABELS[statusCode] ?? statusCode
