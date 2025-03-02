import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';

// Get environment variables with fallbacks to prevent errors
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://rxqzhnolthjyazjoxsdv.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ4cXpobm9sdGhqeWF6am94c2R2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA4OTIxOTcsImV4cCI6MjA1NjQ2ODE5N30.yYimTamZo4wd_g0g-hXxMB9aBgc2f64DVBjPgs7YtQc';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

export async function signUp(email: string, password: string, fullName: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  });
  
  return { data, error };
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  return { data, error };
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  return { error };
}

export async function getCurrentUser() {
  const { data, error } = await supabase.auth.getUser();
  return { user: data.user, error };
}

export async function updateUserPreferences(userId: string, preferences: any) {
  try {
    console.log("Updating preferences for user:", userId);
    
    // First check if the profile exists
    const { data: existingProfile, error: fetchError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single();
    
    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error("Supabase request failed", fetchError);
      return { error: fetchError };
    }
    
    // If profile doesn't exist, create it first
    if (!existingProfile) {
      console.log("Profile doesn't exist, creating new profile");
      const { data: userData } = await supabase.auth.getUser();
      
      if (userData && userData.user) {
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: userId,
            email: userData.user.email || 'unknown@example.com',
            full_name: userData.user.user_metadata?.full_name || null,
            preferences: preferences,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
        
        if (insertError) {
          console.error("Error inserting profile:", insertError);
          return { error: insertError };
        }
        
        return { data: { id: userId }, error: null };
      }
    }
    
    // Update the existing profile
    const { data, error: updateError } = await supabase
      .from('profiles')
      .update({ 
        preferences,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);
    
    if (updateError) {
      console.error("Error updating profile:", updateError);
    }
    
    return { data, error: updateError };
  } catch (error) {
    console.error("Unexpected error in updateUserPreferences:", error);
    return { error };
  }
}

export async function getUserProfile(userId: string) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error("Error fetching user profile:", error);
    }
    
    return { profile: data, error };
  } catch (error) {
    console.error("Unexpected error in getUserProfile:", error);
    return { profile: null, error };
  }
}