import { cookies } from 'next/headers';

// Type for a user session
export interface UserSession {
  user: {
    id: string;
    email: string;
    name?: string;
    isAdmin: boolean;
  } | null;
  isAuthenticated: boolean;
}

// Get the current user session from the auth cookie
export async function auth(): Promise<UserSession> {
  try {
    const cookieStore = await cookies();
    const authCookie = cookieStore.get('auth-server-cookie');
    
    if (!authCookie?.value) {
      return {
        user: null,
        isAuthenticated: false
      };
    }
    
    const authData = JSON.parse(authCookie.value);
    
    if (authData.isAuthenticated && authData.user) {
      return {
        user: {
          id: authData.user.id,
          email: authData.user.email,
          name: authData.user.name,
          isAdmin: authData.user.isAdmin
        },
        isAuthenticated: true
      };
    }
  } catch (error) {
    console.error('Error parsing auth cookie:', error);
  }
  
  return {
    user: null,
    isAuthenticated: false
  };
} 