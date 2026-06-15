import type { NearbyIglesiaResult } from '#shared/utils/geo'
import type { UserArea } from '#shared/types/geo'

type NearbyResponse = {
  userArea: UserArea
  iglesias: NearbyIglesiaResult[]
}

export function useNearbyIglesias() {
  const loading = ref(false)
  const error = ref('')
  const userArea = ref<UserArea | null>(null)
  const nearby = ref<NearbyIglesiaResult[]>([])

  async function locate(): Promise<NearbyIglesiaResult[]> {
    if (!import.meta.client) return []

    loading.value = true
    error.value = ''
    nearby.value = []
    userArea.value = null

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        if (!navigator.geolocation) {
          reject(new Error('Tu navegador no permite usar ubicación'))
          return
        }

        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 120000
        })
      })

      const { latitude, longitude } = position.coords
      const { setLocation } = useUserLocation()
      setLocation(latitude, longitude)

      const data = await $fetch<NearbyResponse>('/api/geo/nearby-iglesias', {
        query: { lat: latitude, lng: longitude }
      })

      userArea.value = data.userArea
      nearby.value = data.iglesias

      if (data.iglesias.length === 0) {
        error.value = 'No encontramos templos cerca. Busca tu iglesia manualmente.'
      }

      return data.iglesias
    } catch (err) {
      if (err instanceof GeolocationPositionError) {
        if (err.code === err.PERMISSION_DENIED) {
          error.value = 'Activa la ubicación en tu celular o busca tu iglesia manualmente.'
        } else {
          error.value = 'No pudimos obtener tu ubicación. Intenta de nuevo o busca manualmente.'
        }
      } else if (err instanceof Error) {
        error.value = err.message
      } else {
        error.value = 'Ocurrió un error al buscar templos cercanos.'
      }
      return []
    } finally {
      loading.value = false
    }
  }

  function reset() {
    loading.value = false
    error.value = ''
    userArea.value = null
    nearby.value = []
  }

  return {
    loading,
    error,
    userArea,
    nearby,
    locate,
    reset
  }
}
