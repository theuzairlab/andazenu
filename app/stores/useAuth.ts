import { create } from 'zustand';

interface User {
  id: string;
  email: string;
  name: string | null;
  isAdmin: boolean;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: User) => void;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
}

const useAuth = create<AuthState>()(set => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  login: user => {
    set({ user, isAuthenticated: true });
  },

  logout: async () => {
    try {
      const response = await fetch('/api/logout', {
        method: 'POST',
      });

      if (response.ok) {
        set({ user: null, isAuthenticated: false });
        // Redirect to home page after logout
        window.location.href = '/';
      } else {
        console.error('Logout failed:', await response.text());
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  },

  checkSession: async () => {
    try {
      set({ isLoading: true });
      const response = await fetch('/api/session');

      if (response.ok) {
        const data = await response.json();
        if (data.isAuthenticated) {
          set({
            user: data.user,
            isAuthenticated: true,
            isLoading: false,
          });
        } else {
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      } else {
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    } catch (error) {
      console.error('Session check error:', error);
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },
}));

export default useAuth;
