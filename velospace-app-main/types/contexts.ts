import type { Dispatch, SetStateAction } from "react"

import type { User } from "./auth"
import type {
  LaunchProviderProfile,
  OperatorProfile,
  ShipperProfile,
} from "./user-profile"

export interface AuthContextType {
  user: User | null
  loading: boolean
  setUser: Dispatch<SetStateAction<User | null>>
}

export interface UserContextType {
  profile: ShipperProfile | null
  loading: boolean
  refreshProfile: () => Promise<ShipperProfile | null>
  clearProfile: () => void
}

export interface OperatorContextType {
  profile: OperatorProfile | null
  loading: boolean
  refreshProfile: () => Promise<OperatorProfile | null>
  clearProfile: () => void
}

export interface LaunchProviderContextType {
  profile: LaunchProviderProfile | null
  loading: boolean
  refreshProfile: () => Promise<LaunchProviderProfile | null>
  clearProfile: () => void
}
