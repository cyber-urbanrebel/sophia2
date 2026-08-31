import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

const AUTH_TOKEN_KEY = 'sophia-auth-token';
const ONBOARDING_KEY = 'sophia-onboarding-complete';

export default function AuthGuard({ children }) {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  const onboarded = localStorage.getItem(ONBOARDING_KEY) === 'true';

  if (!isAuthenticated || !token) {
    return <Navigate to="/auth" replace />;
  }

  if (!onboarded) {
    return <Navigate to="/onboarding" replace />;
  }

  return children;
}
