
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';

// Define types
interface User {
  id: string;
  name: string;
}

interface AuthContextType {
  users: User[];
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  loading: boolean;
  logout: () => void;
}

// Create context with a default value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// AuthProvider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUserInternal] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    async function fetchUsers() {
      try {
        const response = await fetch('/api/users');
        const data = await response.json();
        setUsers(data);

        const storedUser = localStorage.getItem('currentUser');
        if (storedUser) {
          setCurrentUserInternal(JSON.parse(storedUser));
        } else if (pathname !== '/login') {
          router.push('/login');
        }
      } catch (error) {
        console.error('Failed to fetch users:', error);
        if (pathname !== '/login') {
            router.push('/login'); // Redirect to login on error as well
        }
      } finally {
        setLoading(false);
      }
    }

    fetchUsers();
  }, [router, pathname]);

  const setCurrentUser = (user: User | null) => {
    setCurrentUserInternal(user);
    if (user) {
      localStorage.setItem('currentUser', JSON.stringify(user));
    } else {
      localStorage.removeItem('currentUser');
    }
  };

  const logout = () => {
    setCurrentUser(null);
    router.push('/login');
  };

  const value = {
    users,
    currentUser,
    setCurrentUser,
    loading,
    logout,
  };

  // If not loading and no current user, and not on login page, redirect to login
  if (!loading && !currentUser && pathname !== '/login') {
    return null; // Or a loading spinner while redirecting
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
