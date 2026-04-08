import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

const AuthContext = createContext({});

const missingSupabaseError = {
  message:
    'Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_KEY to expense-frontend/.env and restart dev server.',
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = (email, password) =>
    supabase
      ? supabase.auth.signUp({ email, password })
      : Promise.resolve({ data: null, error: missingSupabaseError });

  const signIn = (email, password) =>
    supabase
      ? supabase.auth.signInWithPassword({ email, password })
      : Promise.resolve({ data: null, error: missingSupabaseError });

  const signOut = () =>
    supabase
      ? supabase.auth.signOut()
      : Promise.resolve({ error: missingSupabaseError });

  return (
    <AuthContext.Provider value={{ user, signUp, signIn, signOut, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
