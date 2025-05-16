<template>
  <div class="py-8">
    <!-- Authentication Status Banner (small indicator) -->
    <div v-if="checking" class="fixed top-4 right-4 bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 px-4 py-2 rounded-md shadow-md z-50 flex items-center">
      <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      Checking authentication...
    </div>

    <!-- Authentication Required Banner -->
    <div v-if="!isAuthenticated && !checking" class="mb-8 p-6 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-lg text-center">
      <h2 class="text-xl font-bold text-red-800 dark:text-red-400 mb-2">Authentication Required</h2>
      <p class="text-red-700 dark:text-red-300 mb-4">You need to be logged in to access this application.</p>
      <button 
        @click="login" 
        class="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
      >
        Log In
      </button>
    </div>

    <!-- Main Content - Only Show When Authenticated -->
    <div v-if="isAuthenticated">
      <WelcomeBanner 
        :semester-name="currentSemester.name" 
        :user-name="username"
      />
      
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
    
    <!-- Placeholder content when checking and not authenticated yet -->
    <div v-if="checking && !isAuthenticated" class="animate-pulse">
      <div class="h-40 bg-gray-200 dark:bg-gray-800 rounded-lg mb-8"></div>
      <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
        <div class="h-24 bg-gray-200 dark:bg-gray-800 rounded-lg"></div>
        <div class="h-24 bg-gray-200 dark:bg-gray-800 rounded-lg"></div>
        <div class="h-24 bg-gray-200 dark:bg-gray-800 rounded-lg"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, watch, provide, onBeforeUnmount } from 'vue'
import { BookOpen } from 'lucide-vue-next'
import { useSemester } from '~/composables/useSemester'
import WelcomeBanner from '~/components/dashboard/WelcomeBanner.vue'
import { useAuth } from '~/composables/useAuth'
import { useRouter, useRoute } from 'vue-router'

// Define interfaces for our data structures
interface Course {
  id: string;
  title: string;
  code: string;
  slug: string;
  semesterId: string;
  [key: string]: any;
}

interface Assignment {
  id: string;
  title: string;
  description?: string;
  course: string;
  courseId: string;
  dueDate: string;
  status: string;
  semesterId: string;
  [key: string]: any;
}

const router = useRouter()
const route = useRoute()
const { currentSemester, filterBySemester } = useSemester()
const auth = useAuth()

// Import sample data with proper types
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
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
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

// Authentication state
const checking = ref(true)
const isAuthenticated = ref(false)
const username = ref('')
const userId = ref('')
let tokenRefreshInterval: NodeJS.Timeout | null = null

function login() {
  auth.login()
}

function logout() {
  // Set intentional logout flag to differentiate from session timeouts
  sessionStorage.setItem('intentional_logout', 'true')
  auth.logout()
}

// Check authentication status in the background
async function checkAuth() {
  try {
    // Clean URL of error parameters
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.has('error')) {
      const errorMsg = urlParams.get('error_description') || urlParams.get('error')
      console.error('Auth error from URL:', errorMsg)
      // Clean error parameters from URL
      router.replace(window.location.pathname)
    }
    
    // First check if we can immediately set authenticated state from stored tokens
    const tokenStorage = (window as any).$nuxt?.$tokenStorage;
    const storedTokens = tokenStorage?.get();
    if (storedTokens?.token) {
      console.log('Using stored tokens for initial state');
      isAuthenticated.value = true;
      // We'll update the username and userId properly when the full auth check completes
    }
    
    // Force re-check of authentication status
    auth.updateAuthState()
    
    // Try to update token if needed
    await auth.updateToken(60)
    
    // Update UI state
    isAuthenticated.value = auth.isAuthenticated.value
    username.value = auth.userName.value
    userId.value = auth.userId.value
    
    console.log('Auth check complete:', {
      isAuthenticated: isAuthenticated.value,
      username: username.value,
      hasToken: !!auth.token.value
    })
    
    // Add minimal delay after auth check completes
    setTimeout(() => {
      checking.value = false
    }, 100)
  } catch (error) {
    console.error('Error during auth check:', error)
    isAuthenticated.value = false
    checking.value = false
  }
}

// Check if URL has logout parameter
function checkLogoutState() {
  const urlParams = new URLSearchParams(window.location.search)
  const intentionalLogout = sessionStorage.getItem('intentional_logout') === 'true'
  
  // Clean up URL if it has logout or error parameters
  if (urlParams.has('logout') || urlParams.has('error')) {
    router.replace(window.location.pathname)
  }
  
  // Don't treat auth errors as logouts
  if (urlParams.has('error')) {
    console.error('Authentication error:', urlParams.get('error'))
    return false
  }
  
  // Intentional logout or logout parameter
  if (urlParams.has('logout') || intentionalLogout) {
    console.log('User was logged out:', intentionalLogout ? 'intentionally' : 'session expired')
    sessionStorage.removeItem('intentional_logout')
    isAuthenticated.value = false
    return true
  }
  
  return false
}

// Set up periodic token refresh
function setupTokenRefresh() {
  // Clear any existing interval
  if (tokenRefreshInterval) {
    clearInterval(tokenRefreshInterval)
  }
  
  // Set up new interval (every 5 minutes)
  tokenRefreshInterval = setInterval(() => {
    if (auth.isAuthenticated.value) {
      auth.updateToken(60).catch(err => {
        console.warn('Background token refresh failed:', err)
      })
    }
  }, 5 * 60 * 1000) // 5 minutes
}

// Register auth event listeners
const unsubscribeSuccess = auth.onAuthEvent('auth:success', () => {
  isAuthenticated.value = true
  checkAuth() // Re-check auth state to get user details
})

const unsubscribeLogout = auth.onAuthEvent('auth:logout', () => {
  isAuthenticated.value = false
  checking.value = false
})

// Make auth state available to all components
provide('isAuthenticated', isAuthenticated)
provide('username', username)
provide('userId', userId)

// Navigation guard to prevent access to other pages when not authenticated
watch(isAuthenticated, (newValue) => {
  if (!newValue && route.path !== '/' && route.path !== '/callback') {
    router.push('/')
  }
})

// Improved initial loading in onMounted
onMounted(async () => {
  // Allow partial UI rendering while checking in background
  const isLogoutFlow = checkLogoutState()
  
  if (!isLogoutFlow) {
    // Use a short timeout to let the UI render first, then do auth check
    setTimeout(async () => {
      await checkAuth()
    }, 10)
  } else {
    // If in logout flow, immediately set checking to false
    checking.value = false
  }
  
  // Set up token refresh
  setupTokenRefresh()
})

onBeforeUnmount(() => {
  // Clean up token refresh interval
  if (tokenRefreshInterval) {
    clearInterval(tokenRefreshInterval)
  }
  
  // Unsubscribe from auth events
  unsubscribeSuccess()
  unsubscribeLogout()
})
</script>