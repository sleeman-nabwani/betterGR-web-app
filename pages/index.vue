<template>
  <div class="py-8">
    <WelcomeBanner :semester-name="currentSemester.name" />
    
    <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
      <DashboardMetrics 
        :courses-count="filteredCourses.length"
        :pending-assignments="pendingAssignmentsCount"
        :upcoming-deadlines="upcomingDeadlinesCount"
      />
    </div>
    
    <!-- Upcoming Assignments Section -->
    <div class="mb-8">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-xl font-semibold tracking-tight">Upcoming Assignments</h2>
        <NuxtLink to="/assignments" class="text-sm text-primary hover:underline">View all</NuxtLink>
      </div>
      <div class="rounded-lg border bg-card">
        <div v-if="upcomingAssignments.length > 0">
          <div class="p-4 border-b grid grid-cols-12 items-center">
            <div class="col-span-5">Assignment</div>
            <div class="col-span-3">Course</div>
            <div class="col-span-2">Due Date</div>
            <div class="col-span-2">Status</div>
          </div>
          <div 
            v-for="assignment in upcomingAssignments" 
            :key="assignment.id" 
            class="p-4 border-b last:border-b-0 grid grid-cols-12 items-center"
          >
            <div class="col-span-5">
              <div class="font-medium">{{ assignment.title }}</div>
              <div class="text-sm text-muted-foreground line-clamp-1">{{ assignment.description }}</div>
            </div>
            <div class="col-span-3 text-sm">{{ assignment.course }}</div>
            <div class="col-span-2 text-sm">{{ assignment.dueDate }}</div>
            <div class="col-span-2">
              <span 
                :class="{
                  'bg-blue-100 text-blue-800 dark:bg-blue-800/20 dark:text-blue-400': assignment.status === 'pending',
                  'bg-red-100 text-red-800 dark:bg-red-800/20 dark:text-red-400': assignment.status === 'overdue',
                }"
                class="inline-block rounded-full px-2 py-1 text-xs font-semibold"
              >
                {{ assignment.status.charAt(0).toUpperCase() + assignment.status.slice(1) }}
              </span>
            </div>
          </div>
        </div>
        <div v-else class="p-6 text-center text-muted-foreground">
          No upcoming assignments for {{ currentSemester.name }}
        </div>
      </div>
    </div>
    
    <!-- Courses Overview Section -->
    <div class="mb-8">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-xl font-semibold tracking-tight">My Courses</h2>
        <NuxtLink to="/courses" class="text-sm text-primary hover:underline">View all</NuxtLink>
      </div>
      <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <NuxtLink 
          v-for="course in filteredCourses.slice(0, 3)" 
          :key="course.id"
          :to="`/courses/${course.slug}`"
          class="rounded-lg border bg-card p-4 hover:border-primary/50 hover:bg-muted/20 transition-colors"
        >
          <div class="flex items-center gap-3 mb-2">
            <div class="rounded-md bg-primary/10 p-2">
              <BookOpen class="h-4 w-4 text-primary" />
            </div>
            <div>
              <div class="font-medium">{{ course.title }}</div>
              <div class="text-xs text-muted-foreground">{{ course.code }}</div>
            </div>
          </div>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { BookOpen } from 'lucide-vue-next'
import { useSemester } from '~/composables/useSemester'
import WelcomeBanner from '~/components/dashboard/WelcomeBanner.vue'

const { currentSemester, filterBySemester } = useSemester()

// Import sample data - this would come from an API in a real app
import { courses } from '~/data/courses'
import { assignments } from '~/data/assignments'

// Filter courses by semester
const filteredCourses = computed(() => filterBySemester(courses))

// Filter assignments by semester and only pending or overdue
const filteredAssignments = computed(() => {
  return assignments.filter(assignment => 
    assignment.semesterId === currentSemester.value.id && 
    (assignment.status === 'pending' || assignment.status === 'overdue')
  )
})

// Sort assignments by due date and limit to 5
const upcomingAssignments = computed(() => {
  return filteredAssignments.value
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, 5)
})

// Statistics for dashboard metrics
const pendingAssignmentsCount = computed(() => 
  assignments.filter(a => 
    a.semesterId === currentSemester.value.id && 
    a.status === 'pending'
  ).length
)

const upcomingDeadlinesCount = computed(() => {
  const now = new Date()
  const oneWeekLater = new Date()
  oneWeekLater.setDate(now.getDate() + 7)
  
  return assignments.filter(a => {
    const dueDate = new Date(a.dueDate)
    return a.semesterId === currentSemester.value.id && 
           a.status === 'pending' && 
           dueDate >= now && 
           dueDate <= oneWeekLater
  }).length
})
</script>