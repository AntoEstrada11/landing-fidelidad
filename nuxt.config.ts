// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['nuxt-qrcode'],
  css: ['~/assets/css/landing.css'],

  runtimeConfig: {
    iglesias: {
      /** json = server/data/iglesias-bloques.json · odoo = consulta Odoo */
      source: process.env.IGLESIAS_SOURCE || 'json'
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
      useFallback: process.env.ODOO_USE_FALLBACK === 'true', // legacy, prefer IGLESIAS_SOURCE=json
      /** Si Odoo falla en runtime, devolver listado local en lugar de 502 */
      fallbackOnError: process.env.ODOO_FALLBACK_ON_ERROR !== 'false'
    }
  }
})