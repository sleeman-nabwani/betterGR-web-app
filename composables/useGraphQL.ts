import { useNuxtApp } from 'nuxt/app'
import { useAuth } from './useAuth.js'

// Define a type for the GraphQL client
interface GraphQLClient {
  [key: string]: any;
}

/**
 * Composable for handling GraphQL operations with authentication
 */
export function useGraphQL() {
  const { token, updateToken } = useAuth()
  const nuxtApp = useNuxtApp()

  /**
   * Get the authenticated GraphQL client
   * @returns The configured GraphQL client
   */
  async function getClient(): Promise<GraphQLClient | null> {
    // Skip if we're on the server
    if (process.server) {
      console.warn('GraphQL operations not available on server-side')
      return null
    }

    try {
      // Make sure we have a valid token
      if (!token.value) {
        try {
          await updateToken(60)
        } catch (err) {
          console.error('Failed to update token for GraphQL request:', err)
          throw new Error('Authentication token not available')
        }
      }
      
      // Get the GraphQL client from nuxt-graphql-client module
      // For nuxt-graphql-client, we don't need to set headers manually 
      // as it's configured in nuxt.config.ts
      
      // First, check if the client is available
      if (!nuxtApp.$gql) {
        throw new Error('GraphQL client not available')
      }
      
      return nuxtApp.$gql as GraphQLClient
    } catch (error) {
      console.error('Error getting GraphQL client:', error)
      throw error
    }
  }

  /**
   * Execute a GraphQL query with proper error handling
   * @param queryFn The query function to execute
   * @param variables The variables to pass to the query
   * @returns The query result
   */
  async function executeQuery<T, V>(
    queryFn: string, 
    variables: V
  ): Promise<T> {
    try {
      const client = await getClient()
      
      if (!client) {
        throw new Error('GraphQL client not available')
      }
      
      // With nuxt-graphql-client, we execute operations differently
      // The client functions are directly available on the client object
      if (!(queryFn in client)) {
        throw new Error(`GraphQL operation '${queryFn}' not found`)
      }

      // When using nuxt-graphql-client, the auth token is handled by the module configuration
      const response = await client[queryFn](variables, {
        headers: {
          'Authorization': `Bearer ${token.value}`
        }
      })
      
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
    getClient,
    executeQuery
  }
} 