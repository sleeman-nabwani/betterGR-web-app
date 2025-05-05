import { ref, computed } from 'vue'

// Create a single instance of the semester state with Spring 2025 as default
const selectedSemesterId = ref('spring2025')

export function useSemester() {
  // Semester data that will eventually come from API
  const semesters = [
    { id: 'spring2025', name: 'Spring 2025' },
    { id: 'winter2024', name: 'Winter 2024' },
    { id: 'fall2023', name: 'Fall 2023' },
    { id: 'spring2023', name: 'Spring 2023' }
  ]
  
  // Current semester details
  const currentSemester = computed(() => {
    return semesters.find(semester => semester.id === selectedSemesterId.value) || semesters[0]
  })
  
  // Function to set the semester
  const setSemester = (semesterId: string) => {
    selectedSemesterId.value = semesterId
  }
  
  // Filter function that can be used for filtering arrays by semester
  const filterBySemester = <T extends { semesterId: string }>(items: T[]): T[] => {
    return items.filter(item => item.semesterId === selectedSemesterId.value)
  }
  
  return {
    semesters,
    selectedSemesterId,
    currentSemester,
    setSemester,
    filterBySemester
  }
} 