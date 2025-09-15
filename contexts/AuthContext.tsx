import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { supabase } from '../services/supabase';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password?: string) => Promise<any>;
  signOut: () => Promise<any>;
  profileGroup: (userId: string) => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      setLoading(true);
      const { data } = await supabase.auth.getSession();
      if (data && data.session) {
        setUser(data.session.user);
      }
      setLoading(false);
    };

    checkSession();
  }, []);

  const singUp = async (email: string, password?: string, fullName?: string, phone?: string) => {
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: fullName, Phone: phone } } });
    if (data.user) {
      setUser(data.user);
    }
    setLoading(false);
    return { data, error };
  };

  const signIn = async (email: string, password?: string) => {
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (data.user) {
      setUser(data.user);
    }
    setLoading(false);
    return { data, error };
  };

  const signOut = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signOut();
    setUser(null);
    setLoading(false);
    return { error };
  };

  const profileGroup = async (userId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("profile_groups")
        .select("group_id")
        .eq("profile_id", userId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setLoading(false);
      return { data, error: null };
    } catch (error) {
      console.error("Error fetching profile groups by group:", error);
      return { data: null, error };
    }
  };

  const deleteUserById = async (userId: string) => {
    setLoading(true);
    const { error } = await supabase.auth.admin.deleteUser(userId);
    setUser(null);
    setLoading(false);
    return { error };
  };

  const value = {
    user,
    loading,
    signIn,
    signOut,
    singUp,
    deleteUserById,
    profileGroup
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
