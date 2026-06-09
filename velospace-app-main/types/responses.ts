import type { OperatorStatusProfile } from "./user-profile"

export enum PayloadStatusCode {
  PENDING_APPROVAL = "PENDING_APPROVAL",
  REJECTED = "REJECTED",
  AWAITING_SHIPMENT = "AWAITING_SHIPMENT",
  AWAITING_DISPATCH = "AWAITING_DISPATCH",
  IN_TRANSIT = "IN_TRANSIT",
  PENDING_INSPECTION = "PENDING_INSPECTION",
  INSPECTION_REJECTED = "INSPECTION_REJECTED",
  READY_FOR_LAUNCH = "READY_FOR_LAUNCH",
  AWAITING_LAUNCH = "AWAITING_LAUNCH",
  LAUNCHED = "LAUNCHED",
}

export interface PayloadStatusResponse {
  payload_status_id: number
  code: PayloadStatusCode
  description: string
}

export interface PayloadListItemResponse {
  payload_id: number
  name: string
  tracking_code: string | null
  status: PayloadStatusResponse
}

export interface SatelliteStatusResponse {
  satellite_status_id: number
  code: string
  description: string
}

export interface SatellitePriorityResponse {
  satellite_priority_id: number
  priority_level: number
  description: string
}

export interface ShipperSatelliteListItemResponse {
  satellite_id: number
  launch_provider_id: number
  name: string
  status: SatelliteStatusResponse
  satellite_priority_id?: number | null
  priority?: SatellitePriorityResponse | null
}

export interface PaginatedShipperSatellitesResponse {
  page: number
  total_pages: number
  total_items: number
  items: ShipperSatelliteListItemResponse[]
}

export interface LaunchProviderSatelliteListItemResponse
  extends ShipperSatelliteListItemResponse {}

export interface PaginatedLaunchProviderSatellitesResponse {
  page: number
  total_pages: number
  total_items: number
  items: LaunchProviderSatelliteListItemResponse[]
}

export interface LaunchProviderListItemResponse {
  launch_provider_id: number
  corporate_name: string
}

export interface PaginatedLaunchProvidersResponse {
  page: number
  total_pages: number
  total_items: number
  items: LaunchProviderListItemResponse[]
}

export interface LaunchProviderOperatorListItemResponse {
  operator_id: number
  launch_provider_id: number
  name: string
  status: OperatorStatusProfile
}

export interface PaginatedLaunchProviderOperatorsResponse {
  page: number
  total_pages: number
  total_items: number
  items: LaunchProviderOperatorListItemResponse[]
}

export interface SatelliteDetailResponse {
  satellite_id: number
  shipper_id: number
  launch_provider_id: number
  name: string
  height: number
  width: number
  length: number
  weight: number
  launch_justification: string
  status: SatelliteStatusResponse
  priority: SatellitePriorityResponse
  tracking_code: string | null
}

export interface DeliverySimulationSendResponse {
  id: number
  code: string
  dispatched_at: string
  delivered_at: string
  created_at: string
}

export interface DeliverySimulationTrackResponse {
  id: number
  code: string
  status: string
  dispatched_at: string
  delivered_at: string
}
