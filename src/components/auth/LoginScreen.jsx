import React, { useState } from 'react';
import { Chrome, AlertCircle, Zap } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { ALLOWED_EMAIL_DOMAIN } from '../../lib/authConfig';
import { useAuth } from '../../contexts/AuthContext';

const LoginScreen = () => {
  const { error: authError } = useAuth();
  const [oauthError, setOauthError] = useState(null);
  const [signingIn, setSigningIn] = useState(false);

  const handleGoogleSignIn = async () => {
    setSigningIn(true);
    setOauthError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
        queryParams: { hd: ALLOWED_EMAIL_DOMAIN }
      }
    });
    if (error) {
      setOauthError(error.message);
      setSigningIn(false);
    }
  };

  const displayError = authError === 'unauthorized-domain'
    ? `Only ${ALLOWED_EMAIL_DOMAIN} accounts can access this app.`
    : oauthError;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg mb-4">
            <Zap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Neural Bridge</h1>
          <p className="text-gray-600 text-sm mt-1">Sign in to continue</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          {displayError && (
            <div className="mb-6 flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{displayError}</span>
            </div>
          )}

          <button
            onClick={handleGoogleSignIn}
            disabled={signingIn}
            className="w-full flex items-center justify-center gap-3 px-6 py-3 rounded-lg font-medium text-white bg-gradient-to-r from-blue-500 to-indigo-600 shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <Chrome className="w-5 h-5" />
            {signingIn ? 'Redirecting…' : 'Sign in with Google'}
          </button>

          <p className="mt-4 text-xs text-center text-gray-500">
            Access is restricted to {ALLOWED_EMAIL_DOMAIN} accounts.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
