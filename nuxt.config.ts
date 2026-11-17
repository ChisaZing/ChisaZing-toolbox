import tailwindcss from '@tailwindcss/vite'
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  css: ['~/assets/main.css'],
  vite: { plugins: [tailwindcss()] },
  nitro: {
    prerender: {
      routes: [
        '/zh/',
        '/en/',
        '/zh/tools/',
        '/en/tools/',
        ...['zh', 'en'].flatMap((l) =>
          [
            'qr-code',
            'signed-converter',
            'crc',
            'crsf',
            'ascii',
            'base-converter',
            'image-converter',
            'gif-maker',
            'gamepad-test',
            'webhid',
            'web-serial',
            'keyboard-test',
          ].map((t) => `/${l}/tools/${t}/`),
        ),
      ],
    },
  },
  app: {
    baseURL: process.env.NUXT_APP_BASE_URL || '/',
    head: { meta: [{ name: 'robots', content: 'noindex,nofollow' }] },
  },
})
