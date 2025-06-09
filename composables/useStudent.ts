import { ref, Ref } from 'vue'
import { useAuth } from './useAuth.js'
import { useGraphQL } from './useGraphQL.js'

export interface Student {
    id: string
    firstName: string
    lastName: string
    email: string
    phoneNumber: string
    createdAt?: string
    updatedAt?: string
}

export function useStudent() {
    const { userId, isAuthenticated } = useAuth()
    const { getStudent, updateStudent, loading: graphqlLoading } = useGraphQL()
    
    // State
    const student: Ref<Student | null> = ref(null)
    const loading = ref(false)
    const error = ref<Error | null>(null)
    
    /**
     * Fetch student data for the current user
     */
    async function fetchStudent() {
        console.log('useStudent: fetchStudent called')
        console.log('useStudent: isAuthenticated:', isAuthenticated.value)
        console.log('useStudent: userId:', userId.value)
        
        if (!isAuthenticated.value || !userId.value) {
            console.log('useStudent: User not authenticated or no userId')
            error.value = new Error('User not authenticated')
            return
        }
        
        loading.value = true
        error.value = null
        
        try {
            console.log('useStudent: Calling getStudent with userId:', userId.value)
            // Get student from the GraphQL API
            const data = await getStudent(userId.value)
            console.log('useStudent: GraphQL response:', data)
            
            // Set the student value
            student.value = {
                id: data.id || '',
                firstName: data.firstName || '',
                lastName: data.lastName || '',
                email: data.email || '',
                phoneNumber: data.phoneNumber || '',
                createdAt: data.createdAt,
                updatedAt: data.updatedAt
            }
            
            console.log('useStudent: Student object created:', student.value)
            return student.value
            
        } catch (err) {
            console.error('Error fetching student:', err)
            
            // Add more detailed error logging for GraphQL errors
            if (err && typeof err === 'object' && 'gqlErrors' in err) {
                const gqlErrors = (err as any).gqlErrors
                console.error('GraphQL errors:', gqlErrors)
                if (Array.isArray(gqlErrors) && gqlErrors.length > 0) {
                    console.error('First GraphQL error:', gqlErrors[0])
                }
            }
            
            error.value = err instanceof Error ? err : new Error(String(err))
            student.value = null // Clear student on error
            return null
        } finally {
            loading.value = false
        }
    }

    //update student
    async function updateStudentReq(id: string, input: any) {
        if (!isAuthenticated.value || !userId.value) {
            error.value = new Error('User not authenticated')
            return
        }
        loading.value = true
        error.value = null
        try {
            const data = await updateStudent(id, input)
            return data.updateStudent
        } catch (err) {
            console.error('Error updating student:', err)
            error.value = err instanceof Error ? err : new Error(String(err))
        }
    }
    return {
        student,
        loading,
        error,
        fetchStudent,
        updateStudentReq
    }
}

