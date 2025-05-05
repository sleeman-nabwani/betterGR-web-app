import { defineContentConfig, defineCollection } from '@nuxt/content'

export default defineContentConfig({
  // Define collections - this is the recommended approach
  collections: {
    courses: defineCollection({
      // Type 'page' means 1-to-1 relationship between content files and pages
      type: 'page',
      // Match all markdown files in the courses directory
      source: 'courses/**/*.md'
    })
  },
  // Keep your existing configuration
  navigation: {
    fields: ['title', 'description', 'code', 'semester', '_path']
  },
  markdown: {
    toc: {
      depth: 3,
      searchDepth: 3
    }
  },
  highlight: {
    theme: 'github-dark'
  }
}) 