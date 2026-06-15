import type { TravelProfile } from '#shared/types/routing'

const PROFILE_LABEL: Record<TravelProfile, string> = {
  foot: 'Caminando',
  driving: 'En auto'
}

export function profileLabel(profile: TravelProfile): string {
  return PROFILE_LABEL[profile]
}

export function formatDuration(seconds: number): string {
  const mins = Math.max(1, Math.round(seconds / 60))
  if (mins < 60) return `${mins} min`
  const hours = Math.floor(mins / 60)
  const rest = mins % 60
  return rest ? `${hours} h ${rest} min` : `${hours} h`
}

export function formatMeters(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)} m`
  return `${(meters / 1000).toFixed(1)} km`
}

export const TRAVEL_PROFILES: TravelProfile[] = ['foot', 'driving']

export const TRAVEL_PROFILE_ICONS: Record<TravelProfile, string> = {
  foot: '🚶',
  driving: '🚗'
}

export const TRAVEL_PROFILE_SHORT: Record<TravelProfile, string> = {
  foot: 'A pie',
  driving: 'Auto'
}

export const TRANSIT_NOTE =
  'Rutas de Metro, Metrobús y autobús requieren datos de transporte público. Usa A pie o Auto por ahora.'
