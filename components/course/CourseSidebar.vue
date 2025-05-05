<template>
  <div class="rounded-lg border bg-card overflow-hidden sticky top-4">
    <div class="bg-muted/50 px-4 py-3 font-medium border-b">
      {{ title }}
    </div>
    <nav class="p-2">
      <ul class="space-y-1">
        <li v-for="item in visibleItems" :key="item.id">
          <button 
            @click="handleSectionClick(item.id)"
            class="w-full text-left flex items-center gap-2 px-3 py-2 rounded-md text-sm hover:bg-muted transition-colors"
            :class="{ 'bg-muted/70': activeSection === item.id }"
          >
            <component :is="getIconForSection(item.id)" class="h-4 w-4" />
            <span>{{ item.title || item.label }}</span>
          </button>
        </li>
      </ul>
    </nav>
  </div>
</template>

<script setup>
import { 
  BookOpen, 
  FileText, 
  ClipboardList, 
  Bell, 
  BookMarked, 
  BarChart3,
  Users,
  Calendar,
  HelpCircle,
  MessageSquare,
  Link
} from 'lucide-vue-next'
import { ref, computed, onMounted, onUnmounted } from 'vue'

// Define emits
const emit = defineEmits(['section-click'])

// Icon mapping
const sectionIcons = {
  'overview': BookOpen,
  'materials': FileText,
  'assignments': ClipboardList,
  'announcements': Bell,
  'syllabus': BookMarked,
  'grades': BarChart3,
  'schedule': Calendar,
  'instructors': Users,
  'faq': HelpCircle,
  'discussions': MessageSquare,
  'resources': Link
}

const props = defineProps({
  // Title for the sidebar
  title: {
    type: String,
    default: 'Course Navigation'
  },
  // List of section objects to include
  sections: {
    type: Array,
    default: () => []
  },
  // Whether to highlight the currently active section
  trackActive: {
    type: Boolean,
    default: true
  }
})

// Track the active section
const activeSection = ref('')

// Compute which items should be visible based on props
const visibleItems = computed(() => {
  if (props.sections && props.sections.length > 0) {
    return props.sections
  }
  return []
})

// Get the appropriate icon for a section
function getIconForSection(sectionId) {
  return sectionIcons[sectionId] || BookOpen
}

// Handle section click
function handleSectionClick(sectionId) {
  activeSection.value = sectionId
  emit('section-click', sectionId)
}

// Track scroll position to highlight the active section
const updateActiveSection = () => {
  if (!props.trackActive) return
  
  const sections = visibleItems.value.map(item => document.getElementById(item.id)).filter(Boolean)
  
  for (let i = sections.length - 1; i >= 0; i--) {
    const section = sections[i]
    const rect = section.getBoundingClientRect()
    
    // Consider a section "active" when it's close to the top of the viewport
    if (rect.top <= 100) {
      activeSection.value = section.id
      return
    }
  }
  
  // If no section is found (at the very top), default to the first one
  if (sections.length > 0) {
    activeSection.value = sections[0].id
  }
}

// Set up and clean up scroll listener
onMounted(() => {
  if (props.trackActive) {
    window.addEventListener('scroll', updateActiveSection)
    // Initial check
    updateActiveSection()
  }
})

onUnmounted(() => {
  if (props.trackActive) {
    window.removeEventListener('scroll', updateActiveSection)
  }
})
</script> 