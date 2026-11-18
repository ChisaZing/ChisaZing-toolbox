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
    head: {
      meta: [{ name: 'robots', content: 'noindex,nofollow' }],
      script:
        process.env.NODE_ENV === 'production' && process.env.NUXT_ANALYTICS_DISABLED !== 'true'
          ? [
              {
                key: 'cloudflare-web-analytics',
                type: 'module',
                src: 'https://static.cloudflareinsights.com/beacon.min.js',
                'data-cf-beacon': JSON.stringify({
                  token: 'bb31255b8dce4638b128b2a4a031b215',
                  spa: true,
                }),
              },
            ]
          : [],
    },
  },
})
