<template>
  <header class="sticky top-0 z-40 w-full border-b bg-background shadow-sm">
    <div class="w-full max-w-[1600px] mx-auto h-16 grid items-center" style="grid-template-columns: 1fr auto 1fr;">
      <!-- Left: Technion Portal -->
      <div class="pl-4">
        <NuxtLink to="/" class="flex items-center font-bold">
          <span class="text-lg tracking-tight">Technion Portal</span>
        </NuxtLink>
      </div>
      
      <!-- Center: Navigation - perfectly centered -->
      <nav class="flex items-center space-x-8 px-6">
        <NuxtLink 
          to="/" 
          class="px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 hover:bg-muted"
          :class="route.path === '/' ? 'text-primary bg-primary/5' : 'text-muted-foreground'"
        >
          <div class="flex items-center gap-1.5">
            <LayoutDashboard class="h-4 w-4" />
            <span>Dashboard</span>
          </div>
        </NuxtLink>
        <NuxtLink 
          to="/courses" 
          class="px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 hover:bg-muted"
          :class="route.path.startsWith('/courses') ? 'text-primary bg-primary/5' : 'text-muted-foreground'"
        >
          <div class="flex items-center gap-1.5">
            <BookOpen class="h-4 w-4" />
            <span>Courses</span>
          </div>
        </NuxtLink>
        <NuxtLink 
          to="/assignments" 
          class="px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 hover:bg-muted"
          :class="route.path.startsWith('/assignments') ? 'text-primary bg-primary/5' : 'text-muted-foreground'"
        >
          <div class="flex items-center gap-1.5">
            <ClipboardList class="h-4 w-4" />
            <span>Assignments</span>
          </div>
        </NuxtLink>
        <NuxtLink 
          to="/grades" 
          class="px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 hover:bg-muted"
          :class="route.path.startsWith('/grades') ? 'text-primary bg-primary/5' : 'text-muted-foreground'"
        >
          <div class="flex items-center gap-1.5">
            <Award class="h-4 w-4" />
            <span>Grades</span>
          </div>
        </NuxtLink>
      </nav>
      
      <!-- Right: User controls -->
      <div class="flex items-center justify-end space-x-6 pr-4">
        <SemesterSelector class="w-48" />
        <ColorModeToggle />
        <div class="h-6 w-px bg-border"></div>
        <UserDropdown />
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { LayoutDashboard, BookOpen, ClipboardList, Award } from 'lucide-vue-next'
import { useRoute } from 'vue-router'

const route = useRoute()
</script>