import { defineNuxtPlugin, useRuntimeConfig } from 'nuxt/app'
import Keycloak from 'keycloak-js'

// Token storage constants
const TOKEN_KEY = 'betterGR_token';
const REFRESH_TOKEN_KEY = 'betterGR_refresh_token';
const TOKEN_PARSED_KEY = 'betterGR_token_parsed';
const TOKEN_EXPIRY_KEY = 'betterGR_token_expiry';

// Keycloak singleton
let kc: Keycloak | null = null;

// Event bus for auth events
const authEvents = {
  listeners: new Map<string, Set<Function>>(),
  
  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)?.add(callback);
    return () => this.off(event, callback);
  },
  
  off(event: string, callback: Function) {
    this.listeners.get(event)?.delete(callback);
  },
  
  emit(event: string, ...args: any[]) {
    this.listeners.get(event)?.forEach(callback => {
      try {
        callback(...args);
      } catch (error) {
        console.error(`Error in ${event} event handler:`, error);
      }
    });
  }
};

// Debug helper function only used in critical sections
const debugLog = (message: string, data?: any) => {
  if (process.env.NODE_ENV === 'development') {
    const logMessage = `[Keycloak] ${message}`;
    if (data) {
      console.log(logMessage, data);
    } else {
      console.log(logMessage);
    }
  }
};

// Enhanced token analysis function
const analyzeToken = (token: any) => {
  if (!token) {
    debugLog('Token is null or undefined');
    return;
  }
  
  // Log all token fields for investigation
  debugLog('Token fields available:', Object.keys(token));
  
  // Specifically check for user ID fields
  const idFields = ['sub', 'user_id', 'preferred_username', 'id', 'username'];
  debugLog('Checking for user ID fields in token:');
  
  idFields.forEach(field => {
    if (token[field]) {
      debugLog(`Field '${field}' found with value:`, token[field]);
    } else {
      debugLog(`Field '${field}' not found in token`);
    }
  });
  
  // Check for custom attributes or other potential ID locations
  if (token.attributes) {
    debugLog('Token has attributes:', token.attributes);
  }
  
  // If nothing found, log full token (careful with sensitive data in production)
  if (!idFields.some(field => token[field])) {
    debugLog('No standard ID fields found. Full token content:', token);
  }
};

// Interface for Keycloak config
interface KeycloakConfig {
  url: string;
  realm: string;
  clientId: string;
}

// Cookie utility functions
const CookieUtils = {
  set(name: string, value: string, days: number = 1): void {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = `expires=${date.toUTCString()}`;
    document.cookie = `${name}=${value}; ${expires}; path=/; SameSite=Lax`;
  },
  
  get(name: string): string | null {
    const nameEQ = `${name}=`;
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i].trim();
      if (c.indexOf(nameEQ) === 0) {
        return c.substring(nameEQ.length, c.length);
      }
    }
    return null;
  },
  
  delete(name: string): void {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  }
};

// Token storage service
const TokenStorage = {
  store(token: string, refreshToken?: string, tokenParsed?: any, expiresAt?: number): void {
    if (!token) return;
    
    try {
      const expiry = expiresAt || (Date.now() + 5 * 60 * 1000);
      
      // Store in cookies (more reliable across refreshes)
      CookieUtils.set(TOKEN_KEY, token, 1); // 1 day expiry
      
      if (refreshToken) {
        CookieUtils.set(REFRESH_TOKEN_KEY, refreshToken, 30); // 30 days for refresh token
      }
      
      if (tokenParsed) {
        CookieUtils.set(TOKEN_PARSED_KEY, JSON.stringify(tokenParsed), 1);
      }
      
      CookieUtils.set(TOKEN_EXPIRY_KEY, expiry.toString(), 1);
      
      // Also keep in localStorage as backup
      try {
        localStorage.setItem(TOKEN_KEY, token);
        if (refreshToken) localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
        if (tokenParsed) localStorage.setItem(TOKEN_PARSED_KEY, JSON.stringify(tokenParsed));
        localStorage.setItem(TOKEN_EXPIRY_KEY, expiry.toString());
      } catch (localStorageError) {
        console.warn('Failed to store tokens in localStorage (using cookies only):', localStorageError);
      }
    } catch (error) {
      console.error('Failed to store tokens:', error);
    }
  },
  
  get() {
    try {
      // Try cookies first
      let token = CookieUtils.get(TOKEN_KEY);
      
      // Fall back to localStorage if not in cookies
      if (!token) {
        token = localStorage.getItem(TOKEN_KEY);
        if (!token) return null;
      }
      
      // Check if token is expired
      const expiryStr = CookieUtils.get(TOKEN_EXPIRY_KEY) || localStorage.getItem(TOKEN_EXPIRY_KEY);
      if (expiryStr && parseInt(expiryStr, 10) < Date.now()) {
        this.clear();
        return null;
      }
      
      // Get refresh token
      const refreshToken = CookieUtils.get(REFRESH_TOKEN_KEY) || localStorage.getItem(REFRESH_TOKEN_KEY) || undefined;
      
      // Get parsed token
      let tokenParsed;
      const parsedStr = CookieUtils.get(TOKEN_PARSED_KEY) || localStorage.getItem(TOKEN_PARSED_KEY);
      if (parsedStr) {
        try {
          tokenParsed = JSON.parse(parsedStr);
        } catch (e) {
          console.error('Error parsing stored token:', e);
        }
      }
      
      return {
        token,
        refreshToken,
        tokenParsed
      };
    } catch (error) {
      console.error('Failed to retrieve tokens:', error);
      return null;
    }
  },
  
  clear(): void {
    try {
      // Clear cookies
      CookieUtils.delete(TOKEN_KEY);
      CookieUtils.delete(REFRESH_TOKEN_KEY);
      CookieUtils.delete(TOKEN_PARSED_KEY);
      CookieUtils.delete(TOKEN_EXPIRY_KEY);
      
      // Clear localStorage as well
      try {
        [TOKEN_KEY, REFRESH_TOKEN_KEY, TOKEN_PARSED_KEY, TOKEN_EXPIRY_KEY].forEach(key => {
          localStorage.removeItem(key);
        });
      } catch (e) {
        console.warn('Error clearing localStorage:', e);
      }
      
      sessionStorage.removeItem('intentional_logout');
    } catch (error) {
      console.error('Failed to clear tokens:', error);
    }
  }
};

// Debug utility to parse URL parameters
function parseUrlParams(url: string): Record<string, string> {
  const params: Record<string, string> = {};
  
  // Parse query parameters
  const queryString = url.split('?')[1];
  if (queryString) {
    const queryParams = new URLSearchParams(queryString);
    queryParams.forEach((value, key) => {
      params[key] = value;
    });
  }
  
  // Parse hash parameters if they exist
  const hashString = url.split('#')[1];
  if (hashString) {
    const hashParams = new URLSearchParams(hashString.replace(/#/g, ''));
    hashParams.forEach((value, key) => {
      params[key] = value;
    });
  }
  
  return params;
}

// Define a global error handler to log authentication issues
const handleKeycloakError = (error: any) => {
  console.error('Keycloak authentication error:', error);
  authEvents.emit('auth:error', error);
};

// Setup token refresh handling
const setupTokenRefresh = (keycloak: Keycloak) => {
  // Handle token expiration
  keycloak.onTokenExpired = () => {
    debugLog('Token expired, refreshing...');
    keycloak.updateToken(0)
      .then(refreshed => {
        if (refreshed) {
          debugLog('Token was successfully refreshed');
          authEvents.emit('auth:token-refreshed', keycloak.token);
        } else {
          debugLog('Token is still valid, not refreshed');
        }
      })
      .catch(error => {
        console.error('Failed to refresh token:', error);
        authEvents.emit('auth:token-refresh-failed', error);
      });
  };
};

// Setup auth state management
const setupAuthEventHandlers = (keycloak: Keycloak) => {
  keycloak.onAuthSuccess = () => {
    debugLog('Authentication successful');
    authEvents.emit('auth:success');
  };
  
  keycloak.onAuthError = function() {
    const error = arguments[0] || new Error('Unknown auth error');
    console.error('Authentication error occurred', error);
    authEvents.emit('auth:error', error);
  };
  
  keycloak.onAuthRefreshSuccess = () => {
    debugLog('Token refreshed successfully');
    authEvents.emit('auth:token-refreshed', keycloak.token);
  };
  
  keycloak.onAuthRefreshError = function() {
    const error = arguments[0] || new Error('Unknown refresh error');
    console.error('Token refresh error occurred', error);
    authEvents.emit('auth:token-refresh-failed', error);
  };
  
  keycloak.onAuthLogout = () => {
    debugLog('Logged out');
    authEvents.emit('auth:logout');
  };
};

export default defineNuxtPlugin(async (nuxtApp) => {
  // Skip on server-side
  if (process.server) return;

  // Return existing instance if already initialized
  if (kc) {
    nuxtApp.provide('keycloak', kc);
    nuxtApp.provide('authEvents', authEvents);
    nuxtApp.provide('tokenStorage', TokenStorage);
    return;
  }
  
  try {
    // Get Keycloak config
    const config = useRuntimeConfig();
    const keycloakConfig = config.public.keycloak as KeycloakConfig;
    
    // Validate config
    if (!keycloakConfig?.url || !keycloakConfig?.realm || !keycloakConfig?.clientId) {
      console.error('Missing Keycloak configuration');
      nuxtApp.provide('keycloak', null);
      nuxtApp.provide('authEvents', authEvents);
      nuxtApp.provide('tokenStorage', TokenStorage);
      return;
    }
    
    // Check for stored tokens early - before Keycloak init
    const storedTokens = TokenStorage.get();
    if (storedTokens?.token) {
      console.log('[Keycloak] Found stored tokens before init');
      // Emit early auth state to prevent login flicker
      authEvents.emit('auth:initialized', {
        authenticated: true,
        token: storedTokens.token
      });
    }
    
    // Create Keycloak instance
    kc = new Keycloak({
      url: keycloakConfig.url,
      realm: keycloakConfig.realm,
      clientId: keycloakConfig.clientId
    });
    
    // Setup event handlers
    setupAuthEventHandlers(kc);
    
    // Initialize with optimized options
    const initOptions = {
      onLoad: 'check-sso' as const,
      pkceMethod: 'S256' as const,
      checkLoginIframe: false,
      responseMode: 'query' as const,
      silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html',
      flow: 'standard' as const,
      promiseType: 'native' as const,
      silentCheckSsoFallback: true,
      token: storedTokens?.token || '',
      refreshToken: storedTokens?.refreshToken || '',
      enableLogging: process.env.NODE_ENV === 'development'
    };
    
    try {
      // Initialize Keycloak
      const initialized = await kc.init(initOptions);
      
      if (initialized && kc.authenticated && kc.token) {
        console.log(`[Keycloak] Initialized. Authenticated: ${kc.authenticated}`);
        
        // Store tokens for future use
        TokenStorage.store(
          kc.token,
          kc.refreshToken,
          kc.tokenParsed,
          kc.tokenParsed?.exp ? kc.tokenParsed.exp * 1000 : undefined
        );
      }
      
      // Emit final auth state
      authEvents.emit('auth:initialized', {
        authenticated: kc.authenticated,
        token: kc.token
      });
      
      // Set up background token refresh immediately
      if (kc && kc.authenticated) {
        // Try to refresh the token every 5 minutes
        const tokenRefreshInterval = setInterval(() => {
          if (kc && kc.authenticated) {
            kc.updateToken(30).then(refreshed => {
              if (refreshed && kc && kc.token) {
                console.log('[Keycloak] Token refreshed in background');
                // Store the refreshed token
                TokenStorage.store(
                  kc.token,
                  kc.refreshToken,
                  kc.tokenParsed,
                  kc.tokenParsed?.exp ? kc.tokenParsed.exp * 1000 : undefined
                );
              }
            }).catch(err => {
              console.warn('[Keycloak] Background token refresh failed', err);
            });
          }
        }, 5 * 60 * 1000); // 5 minutes
        
        // Clean up interval when page unloads
        window.addEventListener('unload', () => clearInterval(tokenRefreshInterval));
      }
    } catch (error) {
      console.error('Keycloak initialization error:', error);
      authEvents.emit('auth:init-error', error);
      
      // If init fails but we have stored tokens, try to use them
      if (storedTokens?.token) {
        console.log('[Keycloak] Using stored tokens after init failure');
        authEvents.emit('auth:initialized', {
          authenticated: true,
          token: storedTokens.token
        });
      }
    }
    
    // Provide services to Nuxt
    nuxtApp.provide('keycloak', kc);
    nuxtApp.provide('authEvents', authEvents);
    nuxtApp.provide('tokenStorage', TokenStorage);
  } catch (error) {
    console.error('Error setting up Keycloak:', error);
    nuxtApp.provide('keycloak', null);
    nuxtApp.provide('authEvents', authEvents);
    nuxtApp.provide('tokenStorage', TokenStorage);
  }
}); 