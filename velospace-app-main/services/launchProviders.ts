import { apiFetch } from "@/lib/api"

export interface CreateLaunchProviderInput {
  cnpj: string
  corporate_name: string
  email: string
  phone: string
  password: string
}

const extractErrorMessage = (payload: unknown) => {
  if (!payload || typeof payload !== "object") return null

  const candidate = payload as Record<string, unknown>

  if (typeof candidate.message === "string") return candidate.message
  if (typeof candidate.error === "string") return candidate.error

  for (const value of Object.values(candidate)) {
    if (typeof value === "string" && value.trim()) return value
  }

  return null
}

export const createLaunchProvider = async (
  input: CreateLaunchProviderInput,
) => {
  const response = await apiFetch("/api/v1/launch-providers", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  })

  const responseText = await response.text()
  let payload: unknown = null

  if (responseText) {
    try {
      payload = JSON.parse(responseText)
    } catch {
      payload = responseText
    }
  }

  if (!response.ok) {
    throw new Error(
      extractErrorMessage(payload) ||
        (typeof payload === "string" && payload) ||
        "Nao foi possivel concluir o cadastro.",
    )
  }

  return payload
}
