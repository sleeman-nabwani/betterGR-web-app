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
                @section-click="selectSection"
              />
            </div>
          </div>
          
          <!-- Main Content Area -->
          <div class="lg:w-3/4 prose dark:prose-invert max-w-none">
            <!-- Use ContentRenderer with the filtered content -->
            <ContentRenderer :value="activeSectionContent" />
            
            <!-- Debug info -->
            <details class="mt-8 p-4 border rounded bg-muted text-xs">
              <summary class="font-medium cursor-pointer">Debug Information (Full Content)</summary>
              <pre class="overflow-auto mt-2">{{ JSON.stringify(courseContent, null, 2) }}</pre>
            </details>
             <details class="mt-2 p-4 border rounded bg-muted text-xs">
              <summary class="font-medium cursor-pointer">Debug Information (Active Section Content)</summary>
              <pre class="overflow-auto mt-2">{{ JSON.stringify(activeSectionContent, null, 2) }}</pre>
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
import { computed, ref, watch } from 'vue'

// Define page metadata
definePageMeta({
  name: 'course-detail'
})

// Get the route parameter
const route = useRoute()
const slug = computed(() => {
  return Array.isArray(route.params.slug) ? route.params.slug[0] : route.params.slug
})

// State for loading and errors
const isLoading = ref(true)
const loadError = ref(null)
const activeSectionId = ref(null) // ID of the section to display

// Fetch course content using queryCollection (Nuxt Content v3+ API)
const { data: courseContent, error } = await useAsyncData(
  `course-${slug.value}`,
  async () => {
    isLoading.value = true
    activeSectionId.value = null // Reset active section on new fetch
    loadError.value = null
    try {
      if (!slug.value) {
        throw new Error('Invalid course slug')
      }
      const targetPath = `/courses/${slug.value}`
      console.log(`Attempting to query collection 'courses' using path: ${targetPath}`)
      const content = await queryCollection('courses')
                            .path(targetPath)
                            .first()
      if (!content) {
        console.error(`Course content not found for path: ${targetPath}`)
        throw new Error(`Course content not found for '${slug.value}'`)
      }
      console.log('Successfully loaded course content:', content)
      return content
    } catch (err) {
      console.error('Error fetching course content:', err)
      loadError.value = err.message || 'Failed to load course content'
      return null 
    } finally {
      isLoading.value = false
    }
  },
  { watch: [slug] } // Refetch when slug changes
)

// Computed property for sections for the sidebar
const courseSections = computed(() => {
  if (!courseContent.value?.meta?.courseMeta?.sections) {
    return []
  }
  const sections = Array.isArray(courseContent.value.meta.courseMeta.sections) 
    ? courseContent.value.meta.courseMeta.sections 
    : []
  return sections.map(section => ({
    id: section,
    title: typeof section === 'string' 
      ? section.charAt(0).toUpperCase() + section.slice(1)
      : 'Section' 
  }))
})

// Set the default active section when content and sections load
watch(courseSections, (newSections) => {
  if (newSections && newSections.length > 0 && !activeSectionId.value) {
    activeSectionId.value = newSections[0].id
  }
}, { immediate: true })


// Computed property to get ONLY the content for the active section
const activeSectionContent = computed(() => {
  if (!courseContent.value?.body?.value || !activeSectionId.value) {
    // Return the whole content if no section selected or body missing (or provide a default)
    return courseContent.value
  }

  const bodyNodes = courseContent.value.body.value
  const activeNodes = []
  let capturing = false
  let currentHeadingLevel = 0

  for (const node of bodyNodes) {
    const tag = node[0]
    const props = node[1] || {}
    const isHeading = tag.match(/^h[1-6]$/)
    const level = isHeading ? parseInt(tag[1], 10) : 0

    if (isHeading && props.id === activeSectionId.value) {
      // Found the start of the active section
      capturing = true
      currentHeadingLevel = level
      activeNodes.push(node) // Include the heading itself
    } else if (capturing) {
      if (isHeading && level <= currentHeadingLevel) {
        // Found the next heading of the same or higher level, stop capturing
        capturing = false
        break
      } else {
        // It's content within the active section
        activeNodes.push(node)
      }
    } 
  }

  // If no nodes were found for the active section (e.g., bad ID), maybe return full content or empty
  if (activeNodes.length === 0) {
      console.warn(`No content nodes found for active section ID: ${activeSectionId.value}. Returning full content.`);
      return courseContent.value; // Fallback to full content
  }

  // Return a new content object containing only the active section's nodes
  return {
    ...courseContent.value,
    body: {
      ...courseContent.value.body,
      // Crucially, replace the body value with ONLY the filtered nodes
      value: activeNodes 
    }
  }
})

// Function to update the active section and scroll (optional)
function selectSection(sectionId) {
  activeSectionId.value = sectionId
  // Optional: Scroll to the top of the content area after selecting a new section
  // Or try scrolling to the heading within the *newly rendered* content
  // Using nextTick ensures the DOM is updated before scrolling
  nextTick(() => {
      const contentArea = document.querySelector('.course-content .prose') // Adjust selector if needed
      if(contentArea){
          contentArea.scrollTop = 0; // Scroll main content area to top
           // Try scrolling to the specific heading after render
           const element = document.getElementById(sectionId);
           if (element) {
               element.scrollIntoView({ behavior: 'smooth', block: 'start' });
           } else {
               console.warn(`Element with ID '${sectionId}' not found after selecting section.`);
           }
      }
      
  })
}

// Keep the old function if needed, but prefer selectSection now
function scrollToSection(sectionId) {
  const element = document.getElementById(sectionId)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' })
  } else {
    console.warn(`Element with ID '${sectionId}' not found for scrolling.`)
  }
}
</script> 