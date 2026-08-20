import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { isCorporateAccount } from '../lib/authConfig';

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;

    const handleSession = async (nextSession) => {
      if (nextSession && !isCorporateAccount(nextSession.user?.email)) {
        await supabase.auth.signOut();
        if (!active) return;
        setSession(null);
        setError('unauthorized-domain');
        setLoading(false);
        return;
      }
      if (!active) return;
      setSession(nextSession);
      setError(null);
      setLoading(false);
    };

    supabase.auth.getSession().then(({ data }) => handleSession(data.session));

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      handleSession(nextSession);
    });

    return () => {
      active = false;
      subscription.subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
  };

  const value = {
    session,
    user: session?.user ?? null,
    authorized: !!session,
    loading,
    error,
    signOut
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
