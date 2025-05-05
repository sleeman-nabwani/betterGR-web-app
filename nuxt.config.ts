import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxtjs/color-mode',
    '@nuxt/content'
  ],

  typescript: {
    strict: true,
    typeCheck: false,
    shim: false
  },

  content: {
    documentDriven: true,
    navigation: {
      fields: ['title', 'description', 'code', 'semester', '_path']
    },
    markdown: {
      toc: {
        depth: 3,
        searchDepth: 3
      },
      remarkPlugins: ['remark-emoji'],
      rehypePlugins: [],
      components: {
        'course-sidebar': 'components/course/CourseSidebar.vue'
      }
    },
    highlight: {
      theme: 'github-dark'
    },
    experimental: {
      clientDB: false,
      stripQueryParameters: false
    }
  },

  colorMode: {
    preference: 'system',
    fallback: 'light',
    hid: 'nuxt-color-mode-script',
    globalName: '__NUXT_COLOR_MODE__',
    componentName: 'ColorScheme',
    classPrefix: '',
    classSuffix: '',
    storageKey: 'nuxt-color-mode'
  },

  app: {
    head: {
      title: 'Technion Academic Portal',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Academic management system for Technion students and staff' }
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
      ]
    }
  },

  css: [
    '~/assets/css/tailwind.css'
  ],

  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },

  compatibilityDate: '2025-04-23',

  devtools: {
    enabled: true
  },

  build: { 
    transpile: ['lucide-vue-next'] 
  },

  nitro: {
    externals: {
      inline: ['@nuxt/content']
    },
    // @ts-ignore - Property exists at runtime but not in types
    bundledDependencies: ['@nuxt/content']
  },

  components: {
    global: true,
    dirs: ['~/components']
  }
}) as any