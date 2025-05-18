import { ref, Ref, computed } from 'vue'
import { useCourses } from './useCourses.js'

/**
 * Semester data model
 */
export interface Semester {
  id: string;
  name: string;
  [key: string]: any;
}

/**
 * Composable for managing semester data
 */
export function useSemesters() {
  const { courses } = useCourses()
  
  // State
  const semesters: Ref<Semester[]> = ref([])
  const currentSemester = ref<Semester>({
    id: 'current',
    name: 'Current Semester'
  })

  /**
   * Extract unique semesters from courses
   */
  const extractSemesters = computed(() => {
    const semesterMap = new Map<string, Semester>()
    
    // Always include the current semester
    semesterMap.set(currentSemester.value.id, currentSemester.value)
    
    // Extract semesters from courses
    courses.value.forEach(course => {
      if (course.semester && course.semesterId) {
        semesterMap.set(course.semesterId, {
          id: course.semesterId,
          name: course.semester
        })
      }
    })
    
    return Array.from(semesterMap.values())
  })

  /**
   * Set the current semester
   */
  function setCurrentSemester(semesterId: string) {
    const semester = semesters.value.find(s => s.id === semesterId)
    if (semester) {
      currentSemester.value = semester
    }
  }

  // Update semesters when computed value changes
  function updateSemesters() {
    semesters.value = extractSemesters.value
  }

  return {
    semesters,
    currentSemester,
    setCurrentSemester,
    updateSemesters
  }
} 