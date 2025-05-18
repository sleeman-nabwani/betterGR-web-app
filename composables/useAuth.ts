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
  
  // Get Keycloak instance from the Nuxt app provided by the plugin
  const keycloak = nuxtApp.$keycloak as Keycloak | undefined;
  
  // Fallback to Vue injection if not found in nuxtApp (for compatibility)
  const injectedKeycloak = inject('keycloak') as Keycloak | undefined;
  
  // Use whichever instance is available
  const kc = keycloak || injectedKeycloak;
  
  // Add debug for injection issues (only in development)
  if (!kc && process.env.NODE_ENV === 'development') {
    console.warn('Keycloak injection not found in useAuth(). Check plugin configuration.');
  }

  // Reactive authentication state
  const isAuthenticated = computed(() => kc?.authenticated ?? false)
  
  // User information from token
  const userId = computed(() => kc?.idTokenParsed?.sub || '')
  const userName = computed(() => {
    return kc?.idTokenParsed?.preferred_username || 
           kc?.idTokenParsed?.name || 
           ''
  })
  
  // Token access
  const token = computed(() => kc?.token || '')

  // Helper to check if we need to restore authentication after a refresh
  const checkAuthentication = () => {
    if (!kc || kc.authenticated) {
      return; // Already authenticated or no keycloak instance
    }
      
    // Try to update the token (will use saved tokens automatically)
    return kc.updateToken(10).catch(error => {
      console.warn('Failed to restore authentication after refresh:', error);
    });
  };
  
  // If we're in a browser context, try to restore auth
  if (typeof window !== 'undefined') {
    // Set a small delay to allow Keycloak to fully initialize
    setTimeout(checkAuthentication, 500);
  }

  /**
   * Trigger login flow
   */
  const login = () => {
    if (!kc) {
      console.error('Keycloak not initialized');
      alert('Login is unavailable. Keycloak is not properly initialized. Please check your configuration.');
      return Promise.reject(new Error('Keycloak not initialized'));
    }
    
    // Construct redirect URI (default to origin if not specified)
    const redirectUri = window.location.origin;
    
    try {
      return kc.login({
        redirectUri,
        prompt: 'login', // Force login prompt even if already authenticated
      });
    } catch (error) {
      console.error('Login error:', error);
      return Promise.reject(error);
    }
  }

  /**
   * Trigger logout flow
   */
  const logout = () => {
    if (!kc) {
      console.error('Keycloak not initialized');
      return Promise.reject(new Error('Keycloak not initialized'));
    }
    
    // Store a flag to indicate intentional logout (vs. session timeout)
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem('intentional_logout', 'true');
    }
    
    const redirectUri = `${window.location.origin}?logout=true`;
    
    try {
      return kc.logout({
        redirectUri
      });
    } catch (error) {
      console.error('Logout error:', error);
      return Promise.reject(error);
    }
  }

  /**
   * Update token if it's about to expire
   * @param minValidity Minimum validity in seconds
   */
  const updateToken = async (minValidity = 10) => {
    if (!kc) {
      console.error('Keycloak not initialized');
      return Promise.reject(new Error('Keycloak not initialized'));
    }
    
    if (!kc.authenticated) {
      console.warn('Cannot update token - not authenticated');
      return false;
    }
    
    try {
      return await kc.updateToken(minValidity);
    } catch (error) {
      console.error('Failed to update token:', error);
      throw error;
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
    
    // This is a simple wrapper around the internal state
    // Just to provide a consistent interface
    return {
      isAuthenticated: kc.authenticated ?? false,
      token: kc.token ?? '',
      userId: kc.idTokenParsed?.sub ?? '',
      userName: kc.idTokenParsed?.preferred_username || kc.idTokenParsed?.name || ''
    }
  }

  /**
   * Register a callback for a Keycloak event
   * @param event Event name (auth:success, auth:logout, etc.)
   * @param callback Function to call when event is fired
   */
  const onAuthEvent = (event: string, callback: Function) => {
    if (!kc) {
      console.warn(`Cannot register event ${event} - Keycloak not initialized`);
      return () => {}; // Return empty unsubscribe function
    }
    
    // Map our simplified event names to Keycloak event handlers
    if (event === 'auth:success') {
      const originalOnAuthSuccess = kc.onAuthSuccess || (() => {});
      kc.onAuthSuccess = (...args) => {
        originalOnAuthSuccess.apply(kc, args);
        callback(...args);
      };
    } else if (event === 'auth:logout') {
      const originalOnAuthLogout = kc.onAuthLogout || (() => {});
      kc.onAuthLogout = (...args) => {
        originalOnAuthLogout.apply(kc, args);
        callback(...args);
      };
    }
    
    // Return function to unsubscribe (unimplemented but kept for API consistency)
    return () => {
      // In a real implementation, we would restore the original handler
    };
  }

  // Return the auth API
  return {
    // State
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
    onAuthEvent
  }
}