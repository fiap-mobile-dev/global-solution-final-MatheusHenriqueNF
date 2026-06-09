import { getStoredToken } from "@/hooks/useAuthStorage"
import { ROCKET_API_BASE_URL } from "@/lib/rocket-api-config"
import type { Rocket } from "@/types"

type RocketRequestOptions = RequestInit

type RocketListEnvelope = {
  items?: Rocket[]
  totalPages?: number
  total_pages?: number
}

type RocketPayload = {
  name: string
  capacityHeight: number
  capacityWidth: number
  capacityLength: number
  capacityWeight: number
  rocketStatusId: number
}

const buildRocketUrl = (path: string, method?: string) => {
  const normalizedMethod = (method ?? "GET").toUpperCase()

  if (normalizedMethod !== "GET" && normalizedMethod !== "HEAD") {
    return `${ROCKET_API_BASE_URL}${path}`
  }

  const separator = path.includes("?") ? "&" : "?"
  return `${ROCKET_API_BASE_URL}${path}${separator}_ts=${Date.now()}`
}

const parseRocketPayload = async (response: Response) => {
  const responseText = await response.text()

  if (!responseText) return null

  try {
    return JSON.parse(responseText) as unknown
  } catch {
    return responseText
  }
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

const buildRocketHeaders = async (headers?: HeadersInit) => {
  const token = await getStoredToken()

  if (!token) {
    throw new Error("Nenhum token de autenticacao foi encontrado.")
  }

  return {
    Accept: "application/json",
    Authorization: `Bearer ${token}`,
    ...headers,
  }
}

const rocketFetch = async (
  path: string,
  { headers, ...init }: RocketRequestOptions = {},
) =>
  fetch(buildRocketUrl(path, init.method), {
    ...init,
    cache: "no-store",
    headers: await buildRocketHeaders(headers),
  })

const appendPageParam = (path: string, page: number) => {
  const separator = path.includes("?") ? "&" : "?"
  return `${path}${separator}page=${page}`
}

const normalizeRocketItems = (payload: unknown) => {
  if (Array.isArray(payload)) return payload as Rocket[]

  if (payload && typeof payload === "object" && Array.isArray((payload as RocketListEnvelope).items)) {
    return (payload as RocketListEnvelope).items as Rocket[]
  }

  return []
}

const normalizeRocketTotalPages = (payload: unknown) => {
  if (!payload || typeof payload !== "object") return 1

  const candidate = payload as RocketListEnvelope
  const totalPages = candidate.totalPages ?? candidate.total_pages ?? 1

  return typeof totalPages === "number" && totalPages > 0 ? totalPages : 1
}

const fetchRocketCollection = async (path: string, errorMessage: string) => {
  const fetchPage = async (page: number) => {
    const response = await rocketFetch(appendPageParam(path, page), {
      method: "GET",
    })

    const payload = await parseRocketPayload(response)

    if (!response.ok) {
      throw new Error(
        extractErrorMessage(payload) ||
          (typeof payload === "string" && payload) ||
          errorMessage,
      )
    }

    return payload
  }

  const firstPagePayload = await fetchPage(0)
  const items = [...normalizeRocketItems(firstPagePayload)]
  const totalPages = normalizeRocketTotalPages(firstPagePayload)

  for (let page = 1; page < totalPages; page += 1) {
    const nextPagePayload = await fetchPage(page)
    items.push(...normalizeRocketItems(nextPagePayload))
  }

  return items
}

export const getRockets = async () =>
  fetchRocketCollection("/api/Rocket", "Nao foi possivel carregar os foguetes.")

export const searchRockets = async (searchTerm: string) => {
  const normalizedSearchTerm = searchTerm.trim()

  if (!normalizedSearchTerm) {
    return getRockets()
  }

  const searchPaths = [
    `/api/Rocket/search?query=${encodeURIComponent(normalizedSearchTerm)}`,
    `/api/Rocket/search?name=${encodeURIComponent(normalizedSearchTerm)}`,
    `/api/Rocket/search?term=${encodeURIComponent(normalizedSearchTerm)}`,
  ]

  let lastResult: Rocket[] = []

  for (const path of searchPaths) {
    try {
      const items = await fetchRocketCollection(
        path,
        "Nao foi possivel pesquisar os foguetes.",
      )

      lastResult = items

      if (items.length > 0) {
        return items
      }
    } catch {
      continue
    }
  }

  return lastResult
}

export const getRocketById = async (rocketId: number) => {
  const response = await rocketFetch(`/api/Rocket/${rocketId}`, {
    method: "GET",
  })

  const payload = await parseRocketPayload(response)

  if (!response.ok) {
    throw new Error(
      extractErrorMessage(payload) ||
        (typeof payload === "string" && payload) ||
        "Nao foi possivel carregar o foguete.",
    )
  }

  if (!payload || typeof payload !== "object") {
    throw new Error("Resposta invalida ao buscar o foguete.")
  }

  return payload as Rocket
}

export const createRocket = async (input: RocketPayload) => {
  const response = await rocketFetch("/api/Rocket", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  })

  const payload = await parseRocketPayload(response)

  if (!response.ok) {
    throw new Error(
      extractErrorMessage(payload) ||
        (typeof payload === "string" && payload) ||
        "Nao foi possivel cadastrar o foguete.",
    )
  }

  return payload
}

export const updateRocket = async (rocketId: number, input: RocketPayload) => {
  const response = await rocketFetch(`/api/Rocket/${rocketId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  })

  const payload = await parseRocketPayload(response)

  if (!response.ok) {
    throw new Error(
      extractErrorMessage(payload) ||
        (typeof payload === "string" && payload) ||
        "Nao foi possivel atualizar o foguete.",
    )
  }

  return payload
}

export const deleteRocket = async (rocketId: number) => {
  const response = await rocketFetch(`/api/Rocket/${rocketId}`, {
    method: "DELETE",
  })

  const payload = await parseRocketPayload(response)

  if (!response.ok) {
    throw new Error(
      extractErrorMessage(payload) ||
        (typeof payload === "string" && payload) ||
        "Nao foi possivel excluir o foguete.",
    )
  }

  return payload
}
