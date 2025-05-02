<template>
  <div class="relative">
    <button
      @click="isOpen = !isOpen"
      class="flex items-center gap-2 rounded-full focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
    >
      <div class="relative w-8 h-8 overflow-hidden rounded-full bg-gradient-to-br from-primary/20 to-primary/10 border border-border">
        <img
          src="https://api.dicebear.com/7.x/avataaars/svg?seed=technion"
          alt="User avatar"
          class="w-full h-full object-cover"
        />
        <div class="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-background"></div>
      </div>
      <div class="hidden md:block text-left">
        <div class="text-sm font-medium">Student</div>
      </div>
      <ChevronDown class="hidden sm:block h-4 w-4 text-muted-foreground transition-transform" :class="{ 'rotate-180': isOpen }" />
    </button>
    
    <div
      v-if="isOpen" 
      @click="isOpen = false"
      class="fixed inset-0 z-30"
    ></div>
    
    <transition
      enter-active-class="transition ease-out duration-100"
      enter-from-class="transform opacity-0 scale-95"
      enter-to-class="transform opacity-100 scale-100"
      leave-active-class="transition ease-in duration-75"
      leave-from-class="transform opacity-100 scale-100"
      leave-to-class="transform opacity-0 scale-95"
    >
      <div
        v-if="isOpen"
        class="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-card border z-40"
      >
        <div class="p-2 flex flex-col text-sm">
          <div class="p-2 mb-1 border-b">
            <div class="font-medium">Student User</div>
            <div class="text-xs text-muted-foreground">student@technion.ac.il</div>
          </div>
          <a href="#" class="flex items-center gap-2 rounded px-2 py-1.5 hover:bg-muted transition-colors">
            <User class="h-4 w-4" />
            <span>Profile</span>
          </a>
          <a href="#" class="flex items-center gap-2 rounded px-2 py-1.5 hover:bg-muted transition-colors">
            <Settings class="h-4 w-4" />
            <span>Settings</span>
          </a>
          <a href="#" class="flex items-center gap-2 rounded px-2 py-1.5 hover:bg-muted transition-colors">
            <HelpCircle class="h-4 w-4" />
            <span>Help & Support</span>
          </a>
          <div class="border-t my-1"></div>
          <a href="#" class="flex items-center gap-2 rounded px-2 py-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors">
            <LogOut class="h-4 w-4" />
            <span>Log out</span>
          </a>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ChevronDown, User, Settings, HelpCircle, LogOut } from 'lucide-vue-next'

const isOpen = ref(false)

// When implementing GraphQL, you'll likely have a setup like this:
/*
const { result: userData } = useQuery(gql`
  query GetUserProfile {
    currentUser {
      name
      email
      avatar
      status
    }
  }
`)
*/
</script> 