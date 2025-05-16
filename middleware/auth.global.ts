// Import from Nuxt app
import { useNuxtApp, defineNuxtRouteMiddleware, navigateTo } from 'nuxt/app'
import type Keycloak from 'keycloak-js'

// Public paths that don't require authentication
// Store this as a Set for more efficient lookups
const PUBLIC_PATHS = new Set([
  '/',            // Home page is public but will show auth required banner
  '/callback',
  '/assets',
  '/_nuxt',
  '/api', // For public API endpoints
  '/login', // For custom login pages
  '/favicon.ico',
  '/robots.txt'
])

// Check if a path should be publicly accessible
const isPublicPath = (path: string): boolean => {
  // Direct match for public paths
  if (PUBLIC_PATHS.has(path)) return true
  
  // Check for path prefixes
  return Array.from(PUBLIC_PATHS).some(publicPath => 
    path.startsWith(publicPath + '/'))
}

// Check if URL has OAuth2 standard authentication parameters
const hasAuthParams = (url: string): boolean => {
  // Look for standard OAuth2 parameters
  // See: https://datatracker.ietf.org/doc/html/rfc6749#section-4.1.2
  return url.includes('code=') || 
         url.includes('session_state=') || 
         url.includes('state=') ||
         url.includes('token=') ||
         url.includes('access_token=')
}

// Check if URL has logout parameters
const hasLogoutParams = (url: string): boolean => {
  return url.includes('logout=true') || 
         url.includes('kc_action=logout');
}

// Check if we're in an intentional logout flow
const isIntentionalLogout = (): boolean => {
  if (typeof sessionStorage === 'undefined') return false;
  return sessionStorage.getItem('intentional_logout') === 'true';
}

// Middleware debug helper
const debugLog = (message: string, data?: any) => {
  if (process.env.NODE_ENV === 'development') {
    const logMessage = `[AuthMiddleware] ${message}`;
    if (data) {
      console.log(logMessage, data);
    } else {
      console.log(logMessage);
    }
  }
};

// @ts-ignore - Nuxt automatically provides this function
export default defineNuxtRouteMiddleware(async (to, from) => {
  // Skip on server-side
  if (process.server) return

  // Skip for public paths
  if (isPublicPath(to.path)) {
    return
  }

  // Skip if we're in the auth flow (have auth parameters in URL)
  if (typeof window !== 'undefined' && hasAuthParams(window.location.href)) {
    debugLog('Auth parameters detected in URL, skipping auth check')
    return
  }
  
  // Skip if we're in the logout flow
  if (typeof window !== 'undefined' && 
     (hasLogoutParams(window.location.href) || isIntentionalLogout())) {
    debugLog('Logout flow detected, skipping auth check')
    return
  }

  // Get authentication state using our enhanced useAuth composable
  try {
    // Use Keycloak directly from nuxtApp
    const nuxtApp = useNuxtApp()
    const keycloak = nuxtApp.$keycloak as Keycloak | undefined
    
    // If no keycloak or not on client side, continue
    if (!keycloak || process.server) return
    
    // First, try to refresh token if needed
    try {
      // Always try to refresh the token with a short validity window (10 seconds)
      // This ensures we get a fresh token before checking authentication
      const refreshed = await keycloak.updateToken(10);
      if (refreshed) {
        debugLog('Token was successfully refreshed in middleware');
      }
    } catch (refreshError) {
      // If token refresh fails, user might be unauthenticated
      debugLog('Failed to refresh token in middleware', refreshError);
      
      // Only redirect if not already on home or callback
      if (to.path !== '/' && to.path !== '/callback') {
        debugLog('Redirecting to home page for authentication');
        return navigateTo('/');
      }
      return;
    }
    
    // After potential refresh, check authentication status
    if (keycloak.authenticated) {
      // Get token info for detailed logging in dev mode
      if (process.env.NODE_ENV === 'development') {
        const tokenInfo = keycloak.tokenParsed || keycloak.idTokenParsed || {};
        
        // Extract user name, checking for duplicates
        let userName = tokenInfo.name || tokenInfo.preferred_username || '';
        
        // Check if the name contains duplicated parts (like "user1 user1")
        if (userName) {
          const nameParts = userName.split(' ');
          if (nameParts.length >= 2 && nameParts[0] === nameParts[1]) {
            // If duplicated, just use the first part
            userName = nameParts[0];
          }
        }
        
        debugLog('User authenticated:', {
          userId: tokenInfo.sub || tokenInfo.user_id || tokenInfo.preferred_username || '',
          userName: userName
        });
      }
      
      // User is authenticated, allow navigation
      return;
    }
    
    // User is not authenticated
    debugLog('User not authenticated');
    
    // Store current path for redirect after login
    if (typeof window !== 'undefined') {
      debugLog('Storing redirect path:', to.fullPath);
      sessionStorage.setItem('login_redirect_path', to.fullPath);
    }
    
    // If not on home, redirect to home page which will show the auth banner
    if (to.path !== '/') {
      debugLog('Redirecting to home page for authentication');
      return navigateTo('/');
    }
    
    // Already on the home page, let the page handle showing the auth banner
    debugLog('On home page, showing authentication required banner');
    return;
    
  } catch (error) {
    console.error('Auth middleware error:', error);
    // In case of error, redirect to home page
    return navigateTo('/');
  }
}); 