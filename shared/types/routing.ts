export type TravelProfile = 'foot' | 'driving'

export interface RouteStep {
  instruction: string
  distanceM: number
  durationS: number
}

export interface RouteResponse {
  profile: TravelProfile
  profileLabel: string
  distanceM: number
  durationS: number
  geometry: Array<[number, number]>
  steps: RouteStep[]
}
