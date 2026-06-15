const userLat = ref<number | null>(null)
const userLng = ref<number | null>(null)

export function useUserLocation() {
  const hasLocation = computed(
    () => userLat.value !== null && userLng.value !== null && Number.isFinite(userLat.value)
  )

  function setLocation(lat: number, lng: number) {
    userLat.value = lat
    userLng.value = lng
  }

  function clearLocation() {
    userLat.value = null
    userLng.value = null
  }

  async function requestLocation(): Promise<{ lat: number; lng: number } | null> {
    if (!import.meta.client) return null

    if (hasLocation.value) {
      return { lat: userLat.value!, lng: userLng.value! }
    }

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        if (!navigator.geolocation) {
          reject(new Error('Tu navegador no permite usar ubicación'))
          return
        }

        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 60000
        })
      })

      setLocation(position.coords.latitude, position.coords.longitude)
      return { lat: position.coords.latitude, lng: position.coords.longitude }
    } catch (err) {
      if (err instanceof GeolocationPositionError && err.code === err.PERMISSION_DENIED) {
        throw new Error('Activa la ubicación en tu celular para ver el mapa.')
      }
      throw new Error('No pudimos obtener tu ubicación. Intenta de nuevo.')
    }
  }

  return {
    userLat,
    userLng,
    hasLocation,
    setLocation,
    clearLocation,
    requestLocation
  }
}
