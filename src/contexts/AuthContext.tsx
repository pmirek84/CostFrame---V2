import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import type { User } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  error: null
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      // Check current auth status
      const initAuth = async () => {
        try {
          const { data: { session }, error: sessionError } = await supabase.auth.getSession();
          if (sessionError) {
            console.error('Error checking auth status:', sessionError);
            setError('Błąd podczas sprawdzania statusu logowania');
            setUser(null);
          } else {
            setUser(session?.user ?? null);
          }
        } catch (err) {
          console.error('Error in auth initialization:', err);
          setError('Błąd podczas inicjalizacji autoryzacji');
          setUser(null);
        } finally {
          setIsLoading(false);
        }
      };

      initAuth();

      // Listen for auth changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null);
        setIsLoading(false);
      });

      return () => {
        subscription.unsubscribe();
      };
    } catch (err) {
      console.error('Critical auth error:', err);
      setError('Krytyczny błąd autoryzacji');
      setUser(null);
      setIsLoading(false);
    }
  }, []);

  // Provide default context value with proper typing
  const contextValue: AuthContextType = {
    user,
    isLoading,
    error
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}