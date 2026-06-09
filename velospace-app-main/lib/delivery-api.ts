import type { DeliverySimulationSendResponse } from "@/types"

const DELIVERY_API_BASE_URL =
  "https://delivery-simulation-api-production.up.railway.app"

const parseDeliveryPayload = async (response: Response) => {
  const responseText = await response.text()

  if (!responseText) return null

  try {
    return JSON.parse(responseText) as unknown
  } catch {
    return responseText
  }
}

const extractDeliveryErrorMessage = (payload: unknown) => {
  if (!payload || typeof payload !== "object") return null

  const candidate = payload as Record<string, unknown>

  if (typeof candidate.message === "string") return candidate.message
  if (typeof candidate.error === "string") return candidate.error
  if (typeof candidate.detail === "string") return candidate.detail

  for (const value of Object.values(candidate)) {
    if (typeof value === "string" && value.trim()) return value
  }

  return null
}

const deliveryFetch = async (path: string, init?: RequestInit) => {
  return fetch(`${DELIVERY_API_BASE_URL}${path}`, init)
}

export const generateTrackingCode = async (): Promise<DeliverySimulationSendResponse> => {
  const response = await deliveryFetch("/send", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      to_dispatch: 1,
      to_deliver: 1,
    }),
  })

  const payload = await parseDeliveryPayload(response)

  if (!response.ok) {
    throw new Error(
      extractDeliveryErrorMessage(payload) ||
        (typeof payload === "string" && payload) ||
        "Nao foi possivel gerar o codigo de rastreio.",
    )
  }

  if (!payload || typeof payload !== "object") {
    throw new Error("Resposta invalida ao gerar o codigo de rastreio.")
  }

  return payload as DeliverySimulationSendResponse
}
