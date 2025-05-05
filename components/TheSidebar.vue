<template>
  <div class="flex h-full w-[280px] flex-col border-r bg-card">
    <div class="flex flex-col gap-4 p-6">
      <div class="flex items-center gap-2 px-2">
        <img
          src="https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=32&h=32&dpr=2"
          alt="Profile"
          class="h-8 w-8 rounded-full"
        />
        <div class="flex flex-col">
          <span class="text-sm font-medium">John Doe</span>
          <span class="text-xs text-muted-foreground">Computer Science</span>
        </div>
      </div>
      <div class="space-y-1">
        <NuxtLink
          v-for="route in routes"
          :key="route.path"
          :to="route.path"
          class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-muted"
          :class="route.path === currentPath ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'text-muted-foreground hover:text-foreground'"
        >
          <component :is="route.icon" class="h-4 w-4" />
          {{ route.label }}
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { BookOpen, GraduationCap, Home, ScrollText, Users2 } from 'lucide-vue-next'
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const currentPath = computed(() => route.path)

const routes = [
  {
    label: 'Dashboard',
    icon: Home,
    path: '/'
  },
  {
    label: 'Courses',
    icon: BookOpen,
    path: '/courses'
  },
  {
    label: 'Assignments',
    icon: ScrollText,
    path: '/assignments'
  },
  {
    label: 'Grades',
    icon: GraduationCap,
    path: '/grades'
  },
  {
    label: 'Staff',
    icon: Users2,
    path: '/staff'
  }
]
</script>