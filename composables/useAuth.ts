import { ref, computed, readonly, watchEffect, onBeforeUnmount } from 'vue'
import type { ComputedRef } from 'vue'
import { useNuxtApp } from 'nuxt/app'
import type Keycloak from 'keycloak-js'

// Define ParsedToken interface
interface ParsedToken {
  sub?: string;
  uid?: string;
  user_id?: string;
  id?: string;
  userId?: string;
  user_identifier?: string;
  idNumber?: string;
  preferred_username?: string;
  email?: string;
  name?: string;
  given_name?: string;
  family_name?: string;
  [key: string]: any;
}

// Define AuthEvents interface for type-safety
interface AuthEvents {
  on: (event: string, callback: Function) => () => void;
  off: (event: string, callback: Function) => void;
  emit: (event: string, ...args: any[]) => void;
  listeners?: Map<string, Set<Function>>;
}

// Extract user ID from token using proper OIDC standards
const extractUserId = (tokenParsed: ParsedToken): string => {
  // Standard OpenID Connect claims hierarchy
  // 1. 'sub' is the standard subject identifier in OIDC
  if (tokenParsed.sub) {
    return tokenParsed.sub;
  }
  
  if (tokenParsed.uid || tokenParsed.user_id) {
    return tokenParsed.uid || tokenParsed.user_id || '';
  }
  
  // 3. Check for custom fields that might contain IDs
  // This supports various OIDC providers that may use custom fields
  const possibleIdFields = ['id', 'userId', 'user_identifier', 'idNumber'];
  for (const field of possibleIdFields) {
    if (tokenParsed[field]) {
      return tokenParsed[field] || '';
    }
  }
  
  // 4. Last resort: use preferred_username or email as identifier
  // Note: This should be handled with care as usernames/emails can change
  if (tokenParsed.preferred_username) {
    return tokenParsed.preferred_username;
  }
  
  if (tokenParsed.email) {
    return tokenParsed.email;
  }
  
  // If we can't find any ID, return empty string
  console.warn('Could not extract user ID from token', 
              tokenParsed ? 'Available fields: ' + Object.keys(tokenParsed).join(', ') : 'Token is empty');
  return '';
};

// Extract user name from token using proper OIDC standards
const extractUserName = (tokenParsed: ParsedToken): string => {
  // Try standard OIDC name fields in order of preference
  if (tokenParsed.name) {
    // Check if the name contains duplicated parts (like "user1 user1")
    const nameParts = tokenParsed.name.split(' ');
    if (nameParts.length >= 2 && nameParts[0] === nameParts[1]) {
      // If duplicated, just return the first part
      return nameParts[0];
    }
    return tokenParsed.name;
  }
  
  if (tokenParsed.preferred_username) {
    return tokenParsed.preferred_username;
  }
  
  if (tokenParsed.given_name) {
    const familyName = tokenParsed.family_name ? ` ${tokenParsed.family_name}` : '';
    return `${tokenParsed.given_name}${familyName}`;
  }
  
  if (tokenParsed.email) {
    // Remove domain part from email if using as name
    return tokenParsed.email.split('@')[0];
  }
  
  return '';
};

// Debug helper - only logs in development
const debugLog = (message: string, data?: any) => {
  if (process.env.NODE_ENV === 'development') {
    const logMessage = `[Auth] ${message}`;
    if (data) {
      console.log(logMessage, data);
    } else {
      console.log(logMessage);
    }
  }
};

// Define the return type for useAuth
interface AuthComposable {
  isAuthenticated: ComputedRef<boolean>;
  userId: ComputedRef<string>;
  userName: ComputedRef<string>;
  token: ComputedRef<string>;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  updateToken: (minValidity?: number) => Promise<boolean>;
  updateAuthState: () => void;
  onAuthEvent: (event: string, callback: Function) => () => void;
}

// Reactive state singleton to ensure state is shared
const _isAuthenticated = ref(false);
const _userId = ref('');
const _userName = ref('');
const _token = ref('');

// Track event handlers for cleanup
const eventCleanupCallbacks: (() => void)[] = [];

export function useAuth(): AuthComposable {
  const nuxtApp = useNuxtApp();
  
  // Get typed Keycloak instance
  const getKeycloak = (): Keycloak | null => {
    if (process.server) return null;
    return nuxtApp.$keycloak as Keycloak | null;
  };

  const kc = getKeycloak();
  const authEvents = nuxtApp.$authEvents as AuthEvents | undefined;
  
  // Reset state to unauthenticated defaults
  const resetAuthState = () => {
    _isAuthenticated.value = false;
    _userId.value = '';
    _userName.value = '';
    _token.value = '';
  };
  
  // Create empty auth object for SSR or when Keycloak is not available
  if (!kc) {
    resetAuthState();
    
    // Return empty auth object
    return {
      isAuthenticated: computed(() => false),
      userId: computed(() => ''),
      userName: computed(() => ''),
      token: computed(() => ''),
      login: async () => { console.warn('Keycloak not available'); },
      logout: async () => { console.warn('Keycloak not available'); },
      updateToken: async () => false,
      updateAuthState: () => { console.warn('Keycloak not available'); },
      onAuthEvent: () => () => {}
    };
  }

  // Setup event handlers if we have events available
  if (authEvents) {
    // Cleanup any previously registered events
    eventCleanupCallbacks.forEach(cleanup => cleanup());
    eventCleanupCallbacks.length = 0;
    
    // Register for auth success/logout events
    const onSuccessCleanup = authEvents.on('auth:success', () => {
      updateAuthState();
    });
    
    const onTokenRefreshedCleanup = authEvents.on('auth:token-refreshed', (token: string) => {
      _token.value = token || '';
      updateAuthState();
    });
    
    const onLogoutCleanup = authEvents.on('auth:logout', () => {
      resetAuthState();
    });
    
    eventCleanupCallbacks.push(onSuccessCleanup, onTokenRefreshedCleanup, onLogoutCleanup);
    
    // Cleanup on component unmount (if used in component)
    if (typeof onBeforeUnmount === 'function') {
      onBeforeUnmount(() => {
        eventCleanupCallbacks.forEach(cleanup => cleanup());
        eventCleanupCallbacks.length = 0;
      });
    }
  }
  
  // Initialize state from current Keycloak state
  const initializeState = () => {
    // Set initial state based on Keycloak
    _isAuthenticated.value = !!kc.authenticated;
    
    if (kc.authenticated) {
      const parsed = kc.idTokenParsed ?? kc.tokenParsed ?? {};
      _userId.value = extractUserId(parsed);
      _userName.value = extractUserName(parsed);
      _token.value = kc.token ?? '';
    } else {
      resetAuthState();
    }
  };
  
  // Call initialize once
  initializeState();
  
  // Simplified token parsing
  const parsed = computed<ParsedToken>(() => kc.idTokenParsed ?? kc.tokenParsed ?? {});
  
  // Login method - redirect to Keycloak login
  const login = async (): Promise<void> => {
    try {
      await kc.login({
        redirectUri: window.location.origin + '/callback'
      });
    } catch (error) {
      console.warn('Login error:', error);
    }
  };
  
  // Logout method - redirect to Keycloak logout
  const logout = async (): Promise<void> => {
    try {
      // Clean up event handlers
      eventCleanupCallbacks.forEach(cleanup => cleanup());
      eventCleanupCallbacks.length = 0;
      
      // Reset state before redirecting
      resetAuthState();
      
      // Store logout intention to differentiate from refreshes
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.setItem('intentional_logout', 'true');
      }
      
      // Log out from Keycloak
      await kc.logout({
        redirectUri: window.location.origin + '/?logout=true'
      });
    } catch (error) {
      console.warn('Logout error:', error);
    }
  };
  
  // Update token method - ensures token validity
  // This leverages the centralized refresh logic in keycloak.client.ts
  const updateToken = async (minValidity: number = 5): Promise<boolean> => {
    try {
      if (!kc.authenticated) return false;
      
      // Let Keycloak handle the token refresh
      const refreshed = await kc.updateToken(minValidity);
      
      if (refreshed) {
        // Update token value
        _token.value = kc.token ?? '';
      }
      
      return refreshed;
    } catch (error) {
      console.warn('Failed to update token:', error);
      return false;
    }
  };
  
  // Update auth state by reading current Keycloak state
  const updateAuthState = (): void => {
    if (kc.authenticated) {
      _isAuthenticated.value = true;
      _userId.value = extractUserId(parsed.value);
      _userName.value = extractUserName(parsed.value);
      _token.value = kc.token ?? '';
    } else {
      resetAuthState();
    }
  };
  
  // Register an event handler and return unsubscribe function
  const onAuthEvent = (event: string, callback: Function): (() => void) => {
    if (!authEvents) {
      console.warn('Auth events not available');
      return () => {};
    }
    
    const unsubscribe = authEvents.on(event, callback);
    eventCleanupCallbacks.push(unsubscribe);
    return unsubscribe;
  };
  
  // Return interface with properly typed values
  return {
    isAuthenticated: computed(() => _isAuthenticated.value),
    userId: computed(() => _userId.value),
    userName: computed(() => _userName.value),
    token: computed(() => _token.value),
    login,
    logout,
    updateToken,
    updateAuthState,
    onAuthEvent
  };
}