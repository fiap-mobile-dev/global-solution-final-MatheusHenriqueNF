import { getStoredToken } from "@/hooks/useAuthStorage"
import { API_BASE_URL } from "@/lib/api-config"
import type {
  LaunchProviderProfile,
  OperatorProfile,
  PaginatedLaunchProviderOperatorsResponse,
  PaginatedLaunchProviderSatellitesResponse,
  PaginatedLaunchProvidersResponse,
  PaginatedShipperSatellitesResponse,
  SatelliteDetailResponse,
  SatellitePriorityResponse,
  ShipperProfile,
  User,
} from "@/types"

type LoginPayload = {
  email: string
  password: string
  signInType?: User["type"] | ""
}

export type LoginResult = {
  token: string
  user: User
}

type ApiRequestOptions = RequestInit & {
  requiresAuth?: boolean
}

type PaginatedResponse<T> = {
  page: number
  total_pages: number
  total_items: number
  items: T[]
}

const buildRequestUrl = (path: string, method?: string) => {
  const normalizedMethod = (method ?? "GET").toUpperCase()

  if (normalizedMethod !== "GET" && normalizedMethod !== "HEAD") {
    return `${API_BASE_URL}${path}`
  }

  const separator = path.includes("?") ? "&" : "?"
  return `${API_BASE_URL}${path}${separator}_ts=${Date.now()}`
}

const parseResponsePayload = async (response: Response) => {
  const responseText = await response.text()

  if (!responseText) return null

  try {
    return JSON.parse(responseText) as unknown
  } catch {
    return responseText
  }
}

const appendPageParam = (path: string, page: number) => {
  const separator = path.includes("?") ? "&" : "?"
  return `${path}${separator}page=${page}`
}

const apiFetchWithMethodFallback = async (
  path: string,
  methods: string[],
  options: Omit<ApiRequestOptions, "method"> = {},
) => {
  let lastResponse: Response | null = null

  for (const method of methods) {
    const response = await apiFetch(path, {
      ...options,
      method,
    })

    if (response.status !== 405) {
      return response
    }

    lastResponse = response
  }

  return lastResponse
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

const normalizeUserType = (value: unknown): User["type"] | null => {
  if (value === "SHIPPER") return "SHIPPER"
  if (value === "LAUNCHER_PROVIDER") return "LAUNCHER_PROVIDER"
  if (value === "PAYLOAD_HANDLER") return "PAYLOAD_HANDLER"
  return null
}

const decodeJwtPayload = (token: string) => {
  const [, payload] = token.split(".")

  if (!payload) return null

  try {
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/")
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=")
    const decoded = atob(padded)
    return JSON.parse(decoded) as Record<string, unknown>
  } catch {
    return null
  }
}

const buildUserFromPayload = (
  payload: unknown,
  fallback: Pick<LoginPayload, "email" | "signInType">,
): User => {
  const candidate =
    payload && typeof payload === "object"
      ? (payload as Record<string, unknown>)
      : null

  const nestedUser =
    candidate?.user && typeof candidate.user === "object"
      ? (candidate.user as Record<string, unknown>)
      : null

  const idCandidate =
    nestedUser?.id ??
    nestedUser?.user_id ??
    candidate?.id ??
    candidate?.user_id

  const nameCandidate =
    nestedUser?.name ??
    nestedUser?.corporate_name ??
    candidate?.name ??
    candidate?.corporate_name

  const emailCandidate =
    nestedUser?.email ?? candidate?.email ?? fallback.email

  const typeCandidate = normalizeUserType(
    nestedUser?.type ?? candidate?.type ?? fallback.signInType,
  )

  return {
    id: typeof idCandidate === "number" ? idCandidate : 1,
    name:
      typeof nameCandidate === "string" && nameCandidate.trim()
        ? nameCandidate
        : fallback.email,
    email:
      typeof emailCandidate === "string" && emailCandidate.trim()
        ? emailCandidate
        : fallback.email,
    type: typeCandidate ?? "SHIPPER",
  }
}

const extractToken = (payload: unknown) => {
  if (!payload || typeof payload !== "object") return null

  const candidate = payload as Record<string, unknown>

  const tokenCandidate =
    candidate.token ??
    candidate.access_token ??
    candidate.jwt_token ??
    candidate.jwt

  return typeof tokenCandidate === "string" && tokenCandidate.trim()
    ? tokenCandidate
    : null
}

const buildHeaders = async ({
  headers,
  requiresAuth = false,
}: Pick<ApiRequestOptions, "headers" | "requiresAuth">) => {
  const resolvedHeaders = new Headers(headers)

  if (requiresAuth) {
    const token = await getStoredToken()

    if (!token) {
      throw new Error("Nenhum token de autenticacao foi encontrado.")
    }

    resolvedHeaders.set("Authorization", `Bearer ${token}`)
  }

  return resolvedHeaders
}

export const apiFetch = async (
  path: string,
  { requiresAuth = false, headers, ...init }: ApiRequestOptions = {},
) => {
  const resolvedHeaders = await buildHeaders({ headers, requiresAuth })

  resolvedHeaders.set("Cache-Control", "no-cache, no-store, must-revalidate")
  resolvedHeaders.set("Pragma", "no-cache")

  return fetch(buildRequestUrl(path, init.method), {
    ...init,
    cache: "no-store",
    headers: resolvedHeaders,
  })
}

const fetchAllPaginated = async <T>(
  path: string,
  {
    requiresAuth = false,
    errorMessage,
  }: {
    requiresAuth?: boolean
    errorMessage: string
  },
): Promise<PaginatedResponse<T>> => {
  const fetchPage = async (page: number) => {
    const response = await apiFetch(appendPageParam(path, page), {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      requiresAuth,
    })

    const payload = await parseResponsePayload(response)

    if (!response.ok) {
      throw new Error(
        extractErrorMessage(payload) ||
          (typeof payload === "string" && payload) ||
          errorMessage,
      )
    }

    if (!payload || typeof payload !== "object") {
      throw new Error("Resposta invalida ao buscar dados paginados.")
    }

    return payload as PaginatedResponse<T>
  }

  const firstPage = await fetchPage(0)
  const items = [...firstPage.items]

  for (let page = 1; page < firstPage.total_pages; page += 1) {
    const nextPage = await fetchPage(page)
    items.push(...nextPage.items)
  }

  return {
    ...firstPage,
    page: 0,
    total_items: items.length,
    items,
  }
}

export const login = async ({
  email,
  password,
  signInType,
}: LoginPayload): Promise<LoginResult> => {
  const response = await apiFetch("/api/v1/auth", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  })

  const payload = await parseResponsePayload(response)

  if (!response.ok) {
    throw new Error(
      extractErrorMessage(payload) ||
        (typeof payload === "string" && payload) ||
        "Nao foi possivel fazer login.",
    )
  }

  const token = extractToken(payload)

  if (!token) {
    throw new Error("Resposta de autenticacao sem token.")
  }

  const jwtPayload = decodeJwtPayload(token)
  const mergedPayload =
    payload && typeof payload === "object"
      ? { ...(payload as Record<string, unknown>), ...(jwtPayload ?? {}) }
      : jwtPayload

  return {
    token,
    user: buildUserFromPayload(mergedPayload, { email, signInType }),
  }
}

export const getUser = async (jwtToken: string) => {
  const payload = decodeJwtPayload(jwtToken)

  if (!payload) return null

  return buildUserFromPayload(payload, {
    email: typeof payload.email === "string" ? payload.email : "",
    signInType: normalizeUserType(payload.type) ?? undefined,
  })
}

export const getShipperProfile = async (): Promise<ShipperProfile> => {
  const response = await apiFetch("/api/v1/shippers/me", {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
    requiresAuth: true,
  })

  const payload = await parseResponsePayload(response)

  if (!response.ok) {
    throw new Error(
      extractErrorMessage(payload) ||
        (typeof payload === "string" && payload) ||
        "Nao foi possivel carregar os dados do usuario.",
    )
  }

  if (!payload || typeof payload !== "object") {
    throw new Error("Resposta invalida ao buscar dados do usuario.")
  }

  return payload as ShipperProfile
}

export const getOperatorProfile = async (): Promise<OperatorProfile> => {
  const response = await apiFetch("/api/v1/operators/me", {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
    requiresAuth: true,
  })

  const payload = await parseResponsePayload(response)

  if (!response.ok) {
    throw new Error(
      extractErrorMessage(payload) ||
        (typeof payload === "string" && payload) ||
        "Nao foi possivel carregar os dados do operador.",
    )
  }

  if (!payload || typeof payload !== "object") {
    throw new Error("Resposta invalida ao buscar dados do operador.")
  }

  return payload as OperatorProfile
}

export const getLaunchProviderProfile = async (): Promise<LaunchProviderProfile> => {
  const response = await apiFetch("/api/v1/launch-providers/me", {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
    requiresAuth: true,
  })

  const payload = await parseResponsePayload(response)

  if (!response.ok) {
    throw new Error(
      extractErrorMessage(payload) ||
        (typeof payload === "string" && payload) ||
        "Nao foi possivel carregar os dados da provedora.",
    )
  }

  if (!payload || typeof payload !== "object") {
    throw new Error("Resposta invalida ao buscar dados da provedora.")
  }

  return payload as LaunchProviderProfile
}

export const getOperatorById = async (operatorId: number): Promise<OperatorProfile> => {
  const response = await apiFetch(`/api/v1/operators/${operatorId}`, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
    requiresAuth: true,
  })

  const payload = await parseResponsePayload(response)

  if (!response.ok) {
    throw new Error(
      extractErrorMessage(payload) ||
        (typeof payload === "string" && payload) ||
        "Nao foi possivel carregar os dados do operador.",
    )
  }

  if (!payload || typeof payload !== "object") {
    throw new Error("Resposta invalida ao buscar dados do operador.")
  }

  return payload as OperatorProfile
}

export const reapplyOperator = async (operatorId: number) => {
  const response = await apiFetchWithMethodFallback(
    `/api/v1/operators/${operatorId}/reapply`,
    ["POST", "PUT", "PATCH"],
    {
      headers: {
        Accept: "application/json",
      },
      requiresAuth: true,
    },
  )

  const payload = response ? await parseResponsePayload(response) : null

  if (!response || !response.ok) {
    throw new Error(
      extractErrorMessage(payload) ||
        (typeof payload === "string" && payload) ||
        "Nao foi possivel reenviar a solicitacao do operador.",
    )
  }

  return payload
}

export const getShipperSatellites = async (
  shipperId: number,
): Promise<PaginatedShipperSatellitesResponse> => {
  return fetchAllPaginated(`/api/v1/shippers/${shipperId}/satellites`, {
    requiresAuth: true,
    errorMessage: "Nao foi possivel carregar os satelites do usuario.",
  })
}

export const getLaunchProviderSatellites = async (
  launchProviderId: number,
): Promise<PaginatedLaunchProviderSatellitesResponse> => {
  return fetchAllPaginated(
    `/api/v1/launch-providers/${launchProviderId}/satellites`,
    {
      requiresAuth: true,
      errorMessage: "Nao foi possivel carregar os satelites da provedora.",
    },
  )
}

export const getLaunchProviders = async (): Promise<PaginatedLaunchProvidersResponse> => {
  return fetchAllPaginated("/api/v1/launch-providers", {
    errorMessage: "Nao foi possivel carregar as provedoras de lancamento.",
  })
}

export const getLaunchProviderOperators = async (
  launchProviderId: number,
): Promise<PaginatedLaunchProviderOperatorsResponse> => {
  return fetchAllPaginated(
    `/api/v1/launch-providers/${launchProviderId}/operators`,
    {
      requiresAuth: true,
      errorMessage: "Nao foi possivel carregar os operadores da provedora.",
    },
  )
}

export const getSatellitePriorities = async (): Promise<SatellitePriorityResponse[]> => {
  const response = await apiFetch("/api/v1/satellite-priorities", {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
    requiresAuth: true,
  })

  const payload = await parseResponsePayload(response)

  if (!response.ok) {
    throw new Error(
      extractErrorMessage(payload) ||
        (typeof payload === "string" && payload) ||
        "Nao foi possivel carregar as prioridades de satelite.",
    )
  }

  if (!Array.isArray(payload)) {
    throw new Error("Resposta invalida ao buscar prioridades de satelite.")
  }

  return payload as SatellitePriorityResponse[]
}

export const getSatelliteDetail = async (
  satelliteId: number,
): Promise<SatelliteDetailResponse> => {
  const response = await apiFetch(`/api/v1/satellites/${satelliteId}`, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
    requiresAuth: true,
  })

  const payload = await parseResponsePayload(response)

  if (!response.ok) {
    throw new Error(
      extractErrorMessage(payload) ||
        (typeof payload === "string" && payload) ||
        "Nao foi possivel carregar os detalhes do satelite.",
    )
  }

  if (!payload || typeof payload !== "object") {
    throw new Error("Resposta invalida ao buscar detalhes do satelite.")
  }

  return payload as SatelliteDetailResponse
}

type CreateSatellitePayload = {
  launch_provider_id: number
  name: string
  height: number
  width: number
  length: number
  weight: number
  launch_justification: string
}

export const createSatellite = async (input: CreateSatellitePayload) => {
  const response = await apiFetch("/api/v1/satellites", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
    requiresAuth: true,
  })

  const payload = await parseResponsePayload(response)

  if (!response.ok) {
    throw new Error(
      extractErrorMessage(payload) ||
        (typeof payload === "string" && payload) ||
        "Nao foi possivel cadastrar o satelite.",
    )
  }

  return payload
}

type CreateInspectionPayload = {
  satellite_id: number
  measured_height: number
  measured_width: number
  measured_length: number
  measured_weight: number
}

export const createInspection = async (input: CreateInspectionPayload) => {
  const response = await apiFetch("/api/v1/inspections", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
    requiresAuth: true,
  })

  const payload = await parseResponsePayload(response)

  if (!response.ok) {
    throw new Error(
      extractErrorMessage(payload) ||
        (typeof payload === "string" && payload) ||
        "Nao foi possivel registrar a inspecao.",
    )
  }

  return payload
}

type SatelliteApprovalPayload = {
  approval: boolean
  satellite_priority_id?: number
}

type SatelliteTrackingPayload = {
  tracking_code: string
}

export const submitSatelliteApproval = async (
  satelliteId: number,
  input: SatelliteApprovalPayload,
) => {
  const response = await apiFetchWithMethodFallback(
    `/api/v1/satellites/${satelliteId}/approval`,
    ["POST", "PUT", "PATCH"],
    {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
      requiresAuth: true,
    },
  )

  const payload = response ? await parseResponsePayload(response) : null

  if (!response || !response.ok) {
    throw new Error(
      extractErrorMessage(payload) ||
        (typeof payload === "string" && payload) ||
        "Nao foi possivel atualizar a aprovacao do satelite.",
    )
  }

  return payload
}

type OperatorApprovalPayload = {
  approval: boolean
}

export const submitOperatorApproval = async (
  operatorId: number,
  input: OperatorApprovalPayload,
) => {
  const response = await apiFetchWithMethodFallback(
    `/api/v1/operators/${operatorId}/approval`,
    ["POST", "PUT", "PATCH"],
    {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
      requiresAuth: true,
    },
  )

  const payload = response ? await parseResponsePayload(response) : null

  if (!response || !response.ok) {
    throw new Error(
      extractErrorMessage(payload) ||
        (typeof payload === "string" && payload) ||
        "Nao foi possivel atualizar a aprovacao do operador.",
    )
  }

  return payload
}

export const updateSatelliteTrackingCode = async (
  satelliteId: number,
  input: SatelliteTrackingPayload,
) => {
  const response = await apiFetchWithMethodFallback(
    `/api/v1/satellites/${satelliteId}/track`,
    ["POST", "PUT", "PATCH"],
    {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
      requiresAuth: true,
    },
  )

  const payload = response ? await parseResponsePayload(response) : null

  if (!response || !response.ok) {
    throw new Error(
      extractErrorMessage(payload) ||
        (typeof payload === "string" && payload) ||
        "Nao foi possivel salvar o codigo de rastreio do satelite.",
    )
  }

  return payload
}

type UpdateShipperPayload = {
  type: string
  shipper_document: string
  name: string
  email: string
  phone: string
  password: string
}

type UpdateLaunchProviderPayload = {
  cnpj: string
  corporate_name: string
  email: string
  phone: string
  password: string
}

export const updateShipperProfile = async (
  shipperId: number,
  input: UpdateShipperPayload,
) => {
  const response = await apiFetchWithMethodFallback(
    `/api/v1/shippers/${shipperId}`,
    ["PUT", "PATCH"],
    {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
      requiresAuth: true,
    },
  )

  const payload = response ? await parseResponsePayload(response) : null

  if (!response || !response.ok) {
    throw new Error(
      extractErrorMessage(payload) ||
        (typeof payload === "string" && payload) ||
        "Nao foi possivel atualizar o perfil.",
    )
  }

  return payload
}

export const updateShipperPassword = async (
  shipperId: number,
  input: UpdateShipperPasswordPayload,
) => {
  const response = await apiFetchWithMethodFallback(
    `/api/v1/shippers/${shipperId}/password`,
    ["PUT", "PATCH"],
    {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
      requiresAuth: true,
    },
  )

  const payload = response ? await parseResponsePayload(response) : null

  if (!response || !response.ok) {
    throw new Error(
      extractErrorMessage(payload) ||
        (typeof payload === "string" && payload) ||
        "Nao foi possivel atualizar a senha.",
    )
  }

  return payload
}

export const updateLaunchProviderProfile = async (
  launchProviderId: number,
  input: UpdateLaunchProviderPayload,
) => {
  const response = await apiFetchWithMethodFallback(
    `/api/v1/launch-providers/${launchProviderId}`,
    ["PUT", "PATCH"],
    {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
      requiresAuth: true,
    },
  )

  const payload = response ? await parseResponsePayload(response) : null

  if (!response || !response.ok) {
    throw new Error(
      extractErrorMessage(payload) ||
        (typeof payload === "string" && payload) ||
        "Nao foi possivel atualizar o perfil da provedora.",
    )
  }

  if (!payload || typeof payload !== "object") {
    throw new Error("Resposta invalida ao atualizar o perfil da provedora.")
  }

  return payload as LaunchProviderProfile
}

export const updateLaunchProviderPassword = async (
  launchProviderId: number,
  input: UpdateShipperPasswordPayload,
) => {
  const response = await apiFetchWithMethodFallback(
    `/api/v1/launch-providers/${launchProviderId}/password`,
    ["PUT", "PATCH"],
    {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
      requiresAuth: true,
    },
  )

  const payload = response ? await parseResponsePayload(response) : null

  if (!response || !response.ok) {
    throw new Error(
      extractErrorMessage(payload) ||
        (typeof payload === "string" && payload) ||
        "Nao foi possivel atualizar a senha da provedora.",
    )
  }

  return payload
}

export const updateOperatorProfile = async (
  operatorId: number,
  input: OperatorProfile,
) => {
  const response = await apiFetchWithMethodFallback(
    `/api/v1/operators/${operatorId}`,
    ["PUT", "PATCH"],
    {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
      requiresAuth: true,
    },
  )

  const payload = response ? await parseResponsePayload(response) : null

  if (!response || !response.ok) {
    throw new Error(
      extractErrorMessage(payload) ||
        (typeof payload === "string" && payload) ||
        "Nao foi possivel atualizar o perfil do operador.",
    )
  }

  if (!payload || typeof payload !== "object") {
    throw new Error("Resposta invalida ao atualizar o perfil do operador.")
  }

  return payload as OperatorProfile
}

type UpdateShipperPasswordPayload = {
  current_password: string
  new_password: string
}
