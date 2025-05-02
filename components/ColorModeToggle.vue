<template>
  <button 
    @click="toggleColorMode" 
    class="flex h-8 w-8 items-center justify-center rounded-md hover:bg-muted transition-colors"
    aria-label="Toggle color mode"
  >
    <Sun v-if="$colorMode.preference === 'dark'" class="h-5 w-5" />
    <Moon v-else class="h-5 w-5" />
  </button>
</template>

<script setup lang="ts">
import { Sun, Moon } from 'lucide-vue-next'
import { useColorMode } from '#imports'

// Get direct access to colorMode for more reliable toggling
const colorMode = useColorMode()

const toggleColorMode = () => {
  // Toggle between light and dark
  colorMode.preference = colorMode.preference === 'dark' ? 'light' : 'dark'
}
</script> 