import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, getCurrentUser, getUserProfile } from '../utils/supabaseClient';
import { User } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  profile: any | null;
  isLoading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  isLoading: true,
  error: null,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check for current session
    const checkUser = async () => {
      try {
        setIsLoading(true);
        const { user, error } = await getCurrentUser();
        
        if (error) {
          throw error;
        }
        
        if (user) {
          setUser(user);
          
          // Fetch user profile
          const { profile, error: profileError } = await getUserProfile(user.id);
          
          if (profileError) {
            console.error('Error fetching profile:', profileError);
          } else {
            setProfile(profile);
          }
        }
      } catch (err) {
        console.error('Error checking auth:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    checkUser();

    // Set up auth state change listener
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          setUser(session.user);
          
          // Fetch user profile
          const { profile } = await getUserProfile(session.user.id);
          setProfile(profile);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setProfile(null);
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, profile, isLoading, error }}>
      {children}
    </AuthContext.Provider>
  );
};