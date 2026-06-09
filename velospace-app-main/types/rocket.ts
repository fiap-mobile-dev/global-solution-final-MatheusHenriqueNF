export interface Rocket {
  rocketId: number
  name: string
  capacityHeight: number
  capacityWidth: number
  capacityLength: number
  capacityWeight: number
  launchDate?: string | null
  rocketStatusId: number
}

export interface RocketFormData {
  name: string
  capacityHeight: string
  capacityWidth: string
  capacityLength: string
  capacityWeight: string
  rocketStatusId: string
}
