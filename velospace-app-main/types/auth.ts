export type UserType = "SHIPPER" | "LAUNCHER_PROVIDER" | "PAYLOAD_HANDLER"

export interface User {
  id: number
  name: string
  email: string
  type: UserType
}
