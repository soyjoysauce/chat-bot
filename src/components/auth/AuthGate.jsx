import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import LoginScreen from './LoginScreen';

const AuthGate = ({ children }) => {
  const { loading, authorized } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!authorized) {
    return <LoginScreen />;
  }

  return children;
};

export default AuthGate;
