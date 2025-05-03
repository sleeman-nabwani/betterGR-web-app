<template>
  <div>
    <!-- Breadcrumb navigation -->
    <div class="border-b mb-8">
      <div class="container py-4">
        <div class="flex items-center gap-1 text-sm text-muted-foreground mb-2">
          <NuxtLink to="/" class="hover:text-foreground transition-colors">Home</NuxtLink>
          <ChevronRight class="h-4 w-4" />
          <NuxtLink to="/courses" class="hover:text-foreground transition-colors">Courses</NuxtLink>
          <ChevronRight class="h-4 w-4" />
          <!-- Show loading or title -->
          <span class="text-foreground">{{ isLoading ? 'Loading...' : (courseContent?.title || 'Course Details') }}</span>
        </div>
      </div>
    </div>
    
    <div class="container pb-8">
      <!-- Loading State -->
      <div v-if="isLoading" class="py-8 text-center">
        <div class="inline-block animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mb-4"></div>
        <p>Loading course content...</p>
      </div>
      
      <!-- Error State -->
      <div v-else-if="error || loadError" class="p-8 border rounded bg-destructive/10 text-destructive">
        <h2 class="text-xl font-bold mb-2">Error Loading Course</h2>
        <p>{{ loadError || (error && error.message) || 'An unknown error occurred.' }}</p>
        <div class="mt-4">
          <NuxtLink to="/courses" class="text-primary hover:underline">Back to Courses</NuxtLink>
        </div>
      </div>
      
      <!-- Content Display -->
      <div v-else-if="courseContent" class="course-content">
        <!-- Course metadata from meta.courseMeta block -->
        <div class="mb-8">
          <h1 class="text-3xl font-bold tracking-tight mb-4">{{ courseContent.title }}</h1>
          <div class="flex flex-wrap gap-6 text-sm text-muted-foreground">
            <div class="flex items-center gap-1" v-if="courseContent.meta?.courseMeta?.semester">
              <Calendar class="h-4 w-4" />
              <span>{{ courseContent.meta.courseMeta.semester }}</span>
            </div>
            <div class="flex items-center gap-1" v-if="courseContent.meta?.courseMeta?.instructor">
              <User class="h-4 w-4" />
              <span>{{ courseContent.meta.courseMeta.instructor }}</span>
            </div>
            <div class="flex items-center gap-1" v-if="courseContent.meta?.courseMeta?.credits">
              <GraduationCap class="h-4 w-4" />
              <span>{{ courseContent.meta.courseMeta.credits }} Credits</span>
            </div>
          </div>
        </div>
        
        <!-- Two-column layout: Sidebar and Content -->
        <div class="flex flex-col lg:flex-row gap-8">
          <!-- Sidebar -->
          <div class="lg:w-1/4 relative">
            <div class="sticky top-20">
              <CourseSidebar 
                :sections="courseSections" 
                @section-click="scrollToSection"
              />
            </div>
          </div>
          
          <!-- Main Content Area -->
          <div class="lg:w-3/4 prose dark:prose-invert max-w-none">
            <!-- Use ContentRenderer to render the markdown body -->
            <ContentRenderer :value="courseContent" />
            
            <!-- Debug info -->
            <details class="mt-8 p-4 border rounded bg-muted text-xs">
              <summary class="font-medium cursor-pointer">Debug Information</summary>
              <pre class="overflow-auto mt-2">{{ JSON.stringify(courseContent, null, 2) }}</pre>
            </details>
          </div>
        </div>
      </div>
      
      <!-- Fallback if no content and no error -->
      <div v-else class="p-8 border rounded bg-muted text-center">
        <p class="text-muted-foreground">No course information found for this slug.</p>
        <NuxtLink to="/courses" class="mt-4 inline-block text-primary hover:underline">View All Courses</NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Calendar, User, GraduationCap, ChevronRight } from 'lucide-vue-next'
import { useRoute } from '#imports'
import { computed, ref } from 'vue'

// Define page metadata
definePageMeta({
  name: 'course-detail'
})

// Get the route parameter
const route = useRoute()
const slug = computed(() => {
  // Ensure slug is always a string, taking the first element if it's an array
  return Array.isArray(route.params.slug) ? route.params.slug[0] : route.params.slug
})

// State for loading and errors
const isLoading = ref(true)
const loadError = ref(null)

// Fetch course content using queryCollection (Nuxt Content v3+ API)
const { data: courseContent, error } = await useAsyncData(
  `course-${slug.value}`,
  async () => {
    isLoading.value = true
    loadError.value = null
    try {
      if (!slug.value) {
        throw new Error('Invalid course slug')
      }
      // Construct the expected path based on the slug
      // Nuxt Content v3 paths usually don't have the leading slash in query
      const targetPath = `/courses/${slug.value}`
      console.log(`Attempting to query collection 'courses' using path: ${targetPath}`)
      
      // Use queryCollection with .path().first() as per migration guide
      const content = await queryCollection('courses')
                            .path(targetPath)
                            .first()
      
      if (!content) {
        console.error(`Course content not found in collection 'courses' for path: ${targetPath}`)
        throw new Error(`Course content not found for '${slug.value}'`)
      }
      
      console.log('Successfully loaded course content:', content)
      return content
    } catch (err) {
      console.error('Error fetching course content with queryCollection.path:', err)
      loadError.value = err.message || 'Failed to load course content'
      // Return null or an empty object in case of error to prevent breaking the template
      return null 
    } finally {
      isLoading.value = false
    }
  }
)

// Computed property for sections, accessing sections within meta.courseMeta
const courseSections = computed(() => {
  // Check the nested structure: courseContent.meta.courseMeta.sections
  if (!courseContent.value || 
      !courseContent.value.meta || 
      !courseContent.value.meta.courseMeta || 
      !courseContent.value.meta.courseMeta.sections) {
    console.warn('Sections not found in courseContent.meta.courseMeta')
    return []
  }
  // Ensure courseMeta.sections is an array before mapping
  const sections = Array.isArray(courseContent.value.meta.courseMeta.sections) 
    ? courseContent.value.meta.courseMeta.sections 
    : []
    
  return sections.map(section => ({
    id: section, // Assuming section ID is the string itself
    title: typeof section === 'string' 
      ? section.charAt(0).toUpperCase() + section.slice(1)
      : 'Section' // Fallback title
  }))
})

// Function to scroll to a section when clicked in sidebar
function scrollToSection(sectionId) {
  // Ensure the element exists before trying to scroll
  const element = document.getElementById(sectionId)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' })
  } else {
    console.warn(`Element with ID '${sectionId}' not found for scrolling.`)
  }
}
</script> 