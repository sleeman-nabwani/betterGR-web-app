import { useNuxtApp } from 'nuxt/app'

/**
 * Composable for handling GraphQL operations using auto-generated Gql functions
 * 
 * This composable provides access to the GraphQL client directly using the 
 * automatically generated Gql functions by the nuxt-graphql-client module.
 */
export function useGraphQL() {
  const nuxtApp = useNuxtApp()
  
  /**
   * Get the GraphQL client
   * Uses the auto-generated global Gql functions from nuxt-graphql-client
   */
  const client = nuxtApp.$gql || {}
  
  /**
   * Execute a GraphQL query with proper error handling
   * 
   * @deprecated This method is deprecated. Use the automatically generated GqlXxx functions directly.
   * @param operationName The GraphQL operation name (e.g., 'GqlStudentCourses')
   * @param variables The variables to pass to the query
   * @returns The query result
   */
  async function executeQuery<T, V>(
    operationName: string, 
    variables: V
  ): Promise<T> {
    try {
      if (!nuxtApp.$gql) {
        console.error('GraphQL client not available. Is nuxt-graphql-client configured properly?')
        throw new Error('GraphQL client not available')
      }
      
      // Check if the operation exists on the nuxtApp
      const gqlFunction = nuxtApp[operationName];
      if (!gqlFunction || typeof gqlFunction !== 'function') {
        throw new Error(`GraphQL operation '${operationName}' not found. Make sure to use the full name (e.g., 'GqlStudentCourses')`)
      }

      // Execute the operation
      const response = await gqlFunction(variables)
      
      if (response.error) {
        console.error('GraphQL error:', response.error)
        throw new Error(response.error?.message || 'GraphQL operation failed')
      }
      
      return response.data as T
    } catch (error) {
      console.error('Error executing GraphQL query:', error)
      throw error
    }
  }

  return {
    // Legacy method for backward compatibility
    executeQuery,
    
    // Direct client access for advanced use cases
    client
  }
} 