import { computed, ref, inject, getCurrentInstance } from 'vue'
import { useNuxtApp } from 'nuxt/app'
import type Keycloak from 'keycloak-js'

/**
 * Auth composable for managing Keycloak authentication
 * 
 * Provides simple reactive access to auth state and methods to login, logout, and refresh tokens
 */
export function useAuth() {
  const nuxtApp = useNuxtApp()
  
  // Reactive states
  const isInitialized = ref(false)
  const authenticated = ref(false)
  const keycloakToken = ref('')
  const keycloakUserId = ref('')
  const keycloakUserName = ref('')
  
  // Access Keycloak instance
  let kc: Keycloak | undefined
  
  // Initialize immediately if we're on client-side
  if (process.client) {
    // Get Keycloak instance from the Nuxt app provided by the plugin
    kc = nuxtApp.$keycloak as Keycloak | undefined
    
    // Fallback to Vue injection if not found in nuxtApp (for compatibility)
    if (!kc) {
      kc = inject('keycloak') as Keycloak | undefined
    }
    
    // Add debug for injection issues (only in development)
    if (!kc && process.env.NODE_ENV === 'development') {
      console.warn('Keycloak injection not found in useAuth(). Check plugin configuration.')
    } else if (kc) {
      // Update reactive state based on Keycloak instance
      updateReactiveState()
      isInitialized.value = true
    }
  
    // If we're in a browser context, try to restore auth
    setTimeout(() => {
      checkAuthentication()
    }, 500)
  }
  
  // Update all the reactive state from the Keycloak instance
  function updateReactiveState() {
    if (!kc) return
    
    authenticated.value = !!kc.authenticated
    keycloakToken.value = kc.token || ''
    keycloakUserId.value = kc.idTokenParsed?.sub || ''
    keycloakUserName.value = kc.idTokenParsed?.preferred_username || 
                             kc.idTokenParsed?.name || ''
  }

  // Reactive authentication state
  const isAuthenticated = computed(() => authenticated.value)
  
  // User information from token
  const userId = computed(() => keycloakUserId.value)
  const userName = computed(() => keycloakUserName.value)
  
  // Token access
  const token = computed(() => keycloakToken.value)

  // Helper to check if we need to restore authentication after a refresh
  const checkAuthentication = () => {
    if (!kc || kc.authenticated) {
      return; // Already authenticated or no keycloak instance
    }
      
    // Try to update the token (will use saved tokens automatically)
    return kc.updateToken(10)
      .then(() => {
        updateReactiveState()
        return true
      })
      .catch(error => {
        console.warn('Failed to restore authentication after refresh:', error)
        return false
      })
  }
  
  /**
   * Trigger login flow
   */
  const login = () => {
    if (!kc) {
      console.error('Keycloak not initialized')
      alert('Login is unavailable. Keycloak is not properly initialized. Please check your configuration.')
      return Promise.reject(new Error('Keycloak not initialized'))
    }
    
    // Construct redirect URI (default to origin if not specified)
    const redirectUri = window.location.origin
    
    try {
      return kc.login({
        redirectUri,
        prompt: 'login', // Force login prompt even if already authenticated
      })
    } catch (error) {
      console.error('Login error:', error)
      return Promise.reject(error)
    }
  }

  /**
   * Trigger logout flow
   */
  const logout = () => {
    if (!kc) {
      console.error('Keycloak not initialized')
      return Promise.reject(new Error('Keycloak not initialized'))
    }
    
    // Store a flag to indicate intentional logout (vs. session timeout)
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem('intentional_logout', 'true')
    }
    
    const redirectUri = `${window.location.origin}?logout=true`
    
    try {
      return kc.logout({
        redirectUri
      })
    } catch (error) {
      console.error('Logout error:', error)
      return Promise.reject(error)
    }
  }

  /**
   * Updates the token if necessary
   * @param minValidity Minimum validity time in seconds
   * @returns Promise that resolves to true if the token was refreshed
   */
  const updateToken = async (minValidity = 10) => {
    if (!kc) {
      return Promise.reject(new Error('Keycloak not initialized'))
    }
    
    if (!kc.authenticated) {
      return false
    }

    try {
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Token update timeout')), 10000)
      })
      
      const updatePromise = kc.updateToken(minValidity)
      
      const updated = await Promise.race([updatePromise, timeoutPromise]) as boolean
      
      if (updated) {
        updateReactiveState()
      }
      
      return updated
    } catch (error) {
      // If token update fails, the user might need to re-authenticate
      if (error instanceof Error && (error.message?.includes('timeout') || error.message?.includes('expired'))) {
        console.warn('Token expired or update timed out - user may need to re-authenticate')
      }
      throw error
    }
  }

  /**
   * Force update of authentication state from Keycloak
   */
  const updateAuthState = () => {
    if (!kc) {
      return {
        isAuthenticated: false,
        token: '',
        userId: '',
        userName: ''
      }
    }
    
    updateReactiveState()
    
    // Return the current state
    return {
      isAuthenticated: authenticated.value,
      token: keycloakToken.value,
      userId: keycloakUserId.value,
      userName: keycloakUserName.value
    }
  }

  /**
   * Register a callback for a Keycloak event
   * @param event Event name (auth:success, auth:logout, etc.)
   * @param callback Function to call when event is fired
   */
  const onAuthEvent = (event: string, callback: Function) => {
    if (!kc) {
      console.warn(`Cannot register event ${event} - Keycloak not initialized`)
      return () => {} // Return empty unsubscribe function
    }
    
    // Map our simplified event names to Keycloak event handlers
    if (event === 'auth:success') {
      const originalOnAuthSuccess = kc.onAuthSuccess || (() => {})
      kc.onAuthSuccess = (...args) => {
        updateReactiveState()
        originalOnAuthSuccess.apply(kc, args)
        callback(...args)
      }
    } else if (event === 'auth:logout') {
      const originalOnAuthLogout = kc.onAuthLogout || (() => {})
      kc.onAuthLogout = (...args) => {
        updateReactiveState()
        originalOnAuthLogout.apply(kc, args)
        callback(...args)
      }
    }
    
    // Return function to unsubscribe (unimplemented but kept for API consistency)
    return () => {
      // In a real implementation, we would restore the original handler
    }
  }

  /**
   * Force clear all cached tokens and re-authenticate
   * This helps resolve token synchronization issues
   */
  const forceReAuthentication = async () => {
    try {
      // Clear browser storage
      if (typeof localStorage !== 'undefined') {
        const keysToRemove = []
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i)
          if (key && (key.includes('kc_') || key.includes('keycloak'))) {
            keysToRemove.push(key)
          }
        }
        keysToRemove.forEach(key => {
          localStorage.removeItem(key)
        })
      }
      
      if (typeof sessionStorage !== 'undefined') {
        const keysToRemove = []
        for (let i = 0; i < sessionStorage.length; i++) {
          const key = sessionStorage.key(i)
          if (key && (key.includes('kc_') || key.includes('keycloak'))) {
            keysToRemove.push(key)
          }
        }
        keysToRemove.forEach(key => {
          sessionStorage.removeItem(key)
        })
      }
      
      // Clear Keycloak state
      if (kc) {
        kc.clearToken()
        
        // Reset reactive state
        authenticated.value = false
        keycloakToken.value = ''
        keycloakUserId.value = ''
        keycloakUserName.value = ''
        
        // Force fresh login
        return login()
      }
    } catch (error) {
      console.error('Error during force re-authentication:', error)
      throw error
    }
  }

  // Return the auth API
  return {
    // State
    isInitialized,
    isAuthenticated,
    userId,
    userName,
    token,
    
    // Methods
    login,
    logout,
    updateToken,
    updateAuthState,
    checkAuthentication,
    onAuthEvent,
    forceReAuthentication
  }
}