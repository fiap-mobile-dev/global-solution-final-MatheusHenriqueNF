export interface UserAccountProfile {
  user_account_id: number
  email: string
  phone: string
}

export interface ShipperProfile {
  shipper_id: number
  type: string
  shipper_document: string
  name: string
  user_account: UserAccountProfile
}

export interface LaunchProviderProfile {
  launch_provider_id: number
  cnpj: string
  corporate_name: string
  user_account: UserAccountProfile
}

export interface OperatorStatusProfile {
  operator_status_id: number
  code: "PENDING_APPROVAL" | "APPROVED" | "REJECTED" | string
  description: string
}

export interface OperatorProfile {
  operator_id: number
  launch_provider_id: number
  cpf: string
  name: string
  user_account: UserAccountProfile
  status: OperatorStatusProfile
}
