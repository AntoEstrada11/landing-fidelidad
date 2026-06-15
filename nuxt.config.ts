// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['nuxt-qrcode'],
  css: ['~/assets/css/landing.css', 'leaflet/dist/leaflet.css'],

  vite: {
    optimizeDeps: {
      include: ['leaflet']
    }
  },

  runtimeConfig: {
    iglesias: {
      /** json | odoo | api */
      source: process.env.IGLESIAS_SOURCE || 'json',
      api: {
        url: process.env.IGLESIAS_API_URL || '',
        key: process.env.IGLESIAS_API_KEY || '',
        timeoutMs: Number(process.env.IGLESIAS_API_TIMEOUT_MS || 15000),
        fallbackOnError: process.env.IGLESIAS_API_FALLBACK_ON_ERROR !== 'false'
      }
    },
    odoo: {
      url: process.env.ODOO_URL || '',
      db: process.env.ODOO_DB || '',
      username: process.env.ODOO_USERNAME || '',
      password: process.env.ODOO_PASSWORD || '',
      churchModel: process.env.ODOO_CHURCH_MODEL || 'res.partner',
      churchDomain: process.env.ODOO_CHURCH_DOMAIN || '[]',
      churchNameField: process.env.ODOO_CHURCH_NAME_FIELD || 'name',
      churchLimit: Number(process.env.ODOO_CHURCH_LIMIT || 500),
      appendOtras: process.env.ODOO_APPEND_OTRAS !== 'false',
      useFallback: process.env.ODOO_USE_FALLBACK === 'true',
      fallbackOnError: process.env.ODOO_FALLBACK_ON_ERROR !== 'false'
    },
    public: {
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || '',
      localizadorUrl:
        process.env.NUXT_PUBLIC_LOCALIZADOR_URL || 'http://localhost:3000'
    },
    mercadopago: {
      accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN || '',
      sandbox: process.env.MERCADOPAGO_SANDBOX !== 'false'
    },
    analytics: {
      apiKey: process.env.ANALYTICS_API_KEY || ''
    }
  }
})
