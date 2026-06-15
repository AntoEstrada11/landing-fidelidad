import type { RouteResponse, RouteStep, TravelProfile } from '#shared/types/routing'

const PROFILE_LABEL: Record<TravelProfile, string> = {
  foot: 'Caminando',
  driving: 'En auto'
}

function profileLabel(profile: TravelProfile): string {
  return PROFILE_LABEL[profile]
}

type OsrmManeuver = {
  type: string
  modifier?: string
}

type OsrmStep = {
  name?: string
  distance: number
  duration: number
  maneuver: OsrmManeuver
}

type OsrmRoute = {
  distance: number
  duration: number
  geometry: {
    coordinates: [number, number][]
  }
  legs: Array<{
    steps: OsrmStep[]
  }>
}

type OsrmResponse = {
  code: string
  routes?: OsrmRoute[]
}

const MODIFIER_ES: Record<string, string> = {
  left: 'izquierda',
  right: 'derecha',
  'sharp left': 'izquierda',
  'sharp right': 'derecha',
  'slight left': 'izquierda',
  'slight right': 'derecha',
  straight: 'recto',
  uturn: 'u'
}

function formatManeuver(step: OsrmStep): string {
  const type = step.maneuver.type
  const modifier = step.maneuver.modifier
  const street = step.name?.trim()
  const streetLabel = street ? ` por ${street}` : ''

  if (type === 'depart') return street ? `Sal por ${street}` : 'Inicia tu ruta'
  if (type === 'arrive') return 'Has llegado a tu templo'
  if (type === 'roundabout' || type === 'rotary') return `Toma la glorieta${streetLabel}`
  if (type === 'merge' || type === 'ramp' || type === 'fork') {
    const dir = modifier ? MODIFIER_ES[modifier] : ''
    return dir ? `Incorpórate a la ${dir}${streetLabel}` : `Sigue${streetLabel}`
  }
  if (type === 'turn' || type === 'end of road') {
    const dir = modifier ? MODIFIER_ES[modifier] : 'recto'
    return `Gira a la ${dir}${streetLabel}`
  }
  if (type === 'continue' || type === 'new name') {
    return street ? `Continúa por ${street}` : 'Continúa en la misma dirección'
  }
  return street ? `Sigue por ${street}` : 'Continúa'
}

export function parseOsrmRoute(profile: TravelProfile, data: OsrmResponse): RouteResponse | null {
  const route = data.routes?.[0]
  if (!route) return null

  const steps: RouteStep[] =
    route.legs[0]?.steps.map((step) => ({
      instruction: formatManeuver(step),
      distanceM: step.distance,
      durationS: step.duration
    })) ?? []

  const geometry = route.geometry.coordinates.map(
    ([lng, lat]) => [lat, lng] as [number, number]
  )

  return {
    profile,
    profileLabel: profileLabel(profile),
    distanceM: route.distance,
    durationS: route.duration,
    geometry,
    steps
  }
}

export type { OsrmResponse }
