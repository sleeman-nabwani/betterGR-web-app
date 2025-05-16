<template>
  <div>
    <ClientOnly>
      <!-- This only renders on client side, avoiding hydration mismatch -->
      <button @click="toggleColorMode" class="rounded-md p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700">
        <SunIcon v-if="isDark" class="h-5 w-5" />
        <MoonIcon v-else class="h-5 w-5" />
      </button>
      
      <!-- Fallback for server rendering -->
      <template #fallback>
        <button class="rounded-md p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700">
          <div class="h-5 w-5 bg-transparent"></div>
        </button>
      </template>
    </ClientOnly>
  </div>
</template>

<script setup>
import { SunIcon, MoonIcon } from 'lucide-vue-next'
import { ref, onMounted } from 'vue'

// Simplified approach - manage dark mode state locally
const isDark = ref(false)

onMounted(() => {
  // Check initial state
  isDark.value = document.documentElement.classList.contains('dark')
  
  // Listen for system changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', updateTheme)
})

function toggleColorMode() {
  isDark.value = !isDark.value
  
  // Toggle dark class on html element
  if (isDark.value) {
    document.documentElement.classList.add('dark')
    localStorage.setItem('nuxt-color-mode', 'dark')
  } else {
    document.documentElement.classList.remove('dark')
    localStorage.setItem('nuxt-color-mode', 'light')
  }
}

function updateTheme(e) {
  isDark.value = e.matches
}
</script> 