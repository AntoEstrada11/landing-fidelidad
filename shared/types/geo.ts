export interface UserArea {
  city: string
  municipality: string
  state: string
  suburb: string
  displayName: string
}

export interface GeocodedPlace {
  lat: number
  lng: number
  label: string
}

export interface MapIglesiaPoint {
  id: string
  name: string
  bloque: string
  bloqueId: string
  direccion?: string
  lat: number
  lng: number
  distanceKm: number
}

export interface NearbyMapResponse {
  user: { lat: number; lng: number }
  userArea: UserArea
  iglesias: MapIglesiaPoint[]
  nearestId?: string | null
}
