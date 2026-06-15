export interface MapLinks {
  google: string
  googleSatellite: string | null
  openStreetMap: string
  waze: string | null
}

export interface GeoPoint {
  lat: number
  lng: number
}

export type NavigationTravelMode = 'foot' | 'driving'

export interface NavigationContext {
  origin: GeoPoint
  destination: GeoPoint & { name?: string }
  travelMode: NavigationTravelMode
  geometry?: Array<[number, number]>
}

export interface NavigationLinks {
  googleMaps: string
  waze: string
  appleMaps: string
}

function hasValidCoords(point: GeoPoint): boolean {
  return (
    typeof point.lat === 'number' &&
    typeof point.lng === 'number' &&
    !Number.isNaN(point.lat) &&
    !Number.isNaN(point.lng)
  )
}

function formatCoord(point: GeoPoint): string {
  return `${point.lat},${point.lng}`
}

export function buildNavigationLinks(context: NavigationContext): NavigationLinks {
  const { origin, destination, travelMode } = context
  const originStr = formatCoord(origin)
  const destStr = formatCoord(destination)
  const googleTravelMode = travelMode === 'foot' ? 'walking' : 'driving'
  const appleDirFlag = travelMode === 'foot' ? 'w' : 'd'

  const googleParams = new URLSearchParams({
    api: '1',
    origin: originStr,
    destination: destination.name?.trim() || destStr,
    travelmode: googleTravelMode
  })

  const googleMaps = `https://www.google.com/maps/dir/?${googleParams.toString()}`
  const waze = `https://waze.com/ul?ll=${destStr}&navigate=yes`
  const appleDest = destination.name?.trim() || destStr
  const appleMaps = `https://maps.apple.com/?saddr=${originStr}&daddr=${encodeURIComponent(appleDest)}&dirflg=${appleDirFlag}`

  return { googleMaps, waze, appleMaps }
}

export function buildNavigationLinksFromContext(
  context: NavigationContext | null | undefined
): NavigationLinks | null {
  if (!context) return null
  if (!hasValidCoords(context.origin) || !hasValidCoords(context.destination)) return null
  return buildNavigationLinks(context)
}

export function buildMapLinks(opts: {
  lat?: number
  lng?: number
  direccion?: string
  nombre?: string
}): MapLinks {
  const hasCoords =
    typeof opts.lat === 'number' &&
    typeof opts.lng === 'number' &&
    !Number.isNaN(opts.lat) &&
    !Number.isNaN(opts.lng)

  const query = hasCoords
    ? `${opts.lat},${opts.lng}`
    : encodeURIComponent([opts.nombre, opts.direccion].filter(Boolean).join(', '))

  return {
    google: `https://www.google.com/maps?q=${query}`,
    googleSatellite: hasCoords
      ? `https://www.google.com/maps/@${opts.lat},${opts.lng},18z/data=!3m1!1e3`
      : null,
    openStreetMap: hasCoords
      ? `https://www.openstreetmap.org/?mlat=${opts.lat}&mlon=${opts.lng}#map=18/${opts.lat}/${opts.lng}`
      : `https://www.openstreetmap.org/search?query=${query}`,
    waze: hasCoords ? `https://waze.com/ul?ll=${opts.lat},${opts.lng}&navigate=yes` : null
  }
}
