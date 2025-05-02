<template>
  <div class="py-8">
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <!-- Each card is a NuxtLink making the whole card clickable -->
      <NuxtLink 
        v-for="dashboard in dashboardCards" 
        :key="dashboard.title"
        :to="dashboard.to"
        class="group flex flex-col border rounded-lg overflow-hidden transition-colors hover:border-primary focus:border-primary hover:bg-muted/20"
      >
        <div class="bg-muted/40 p-6">
          <div class="flex items-center gap-4">
            <div class="rounded-lg bg-primary/10 p-3 text-primary">
              <component :is="dashboard.icon" class="h-5 w-5" />
            </div>
            <div>
              <h3 class="font-semibold tracking-tight">{{ dashboard.title }}</h3>
              <p class="text-sm text-muted-foreground">{{ dashboard.description }}</p>
            </div>
          </div>
        </div>
        <div class="px-6 py-4 bg-card flex-1 flex flex-col">
          <div class="text-sm text-muted-foreground space-y-3 flex-1">
            <div v-for="stat in dashboard.stats" :key="stat.label" class="flex items-center justify-between">
              <span>{{ stat.label }}</span>
              <span class="font-medium text-foreground">{{ stat.value }}</span>
            </div>
          </div>
          <!-- No View button needed since the whole card is clickable -->
        </div>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup>
import { 
  BookOpen, 
  FileSpreadsheet, 
  GraduationCap 
} from 'lucide-vue-next'

const dashboardCards = [
  {
    title: 'Courses',
    description: 'View and manage your enrolled courses',
    icon: BookOpen,
    to: '/courses',
    stats: [
      { label: 'Enrolled', value: '6' },
      { label: 'In Progress', value: '4' },
      { label: 'Completed', value: '2' }
    ]
  },
  {
    title: 'Assignments',
    description: 'Track your upcoming assignments',
    icon: FileSpreadsheet,
    to: '/assignments',
    stats: [
      { label: 'Pending', value: '3' },
      { label: 'Submitted', value: '12' },
      { label: 'Late', value: '1' }
    ]
  },
  {
    title: 'Grades',
    description: 'View your academic performance',
    icon: GraduationCap,
    to: '/grades',
    stats: [
      { label: 'Average GPA', value: '91.2' },
      { label: 'Top Grade', value: '98' },
      { label: 'Lowest Grade', value: '82' }
    ]
  }
]
</script> 