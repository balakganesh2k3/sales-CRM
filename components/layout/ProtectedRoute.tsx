'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/lib/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'rep' | 'manager' | 'admin';
  allowedRoles?: ('rep' | 'manager' | 'admin')[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole, allowedRoles }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = () => {
      if (!authService.isAuthenticated()) {
        router.push('/');
        return;
      }

      const user = authService.getUser();
      if (!user) {
        router.push('/');
        return;
      }

      if (requiredRole) {
        if (user.role !== requiredRole) {
          // Redirect to appropriate page based on user role
          if (user.role === 'manager') {
            router.push('/dashboard');
          } else {
            router.push('/leads');
          }
          return;
        }
      }

      if (allowedRoles && allowedRoles.length > 0) {
        if (!allowedRoles.includes(user.role)) {
          // Redirect to appropriate page based on user role
          if (user.role === 'manager') {
            router.push('/dashboard');
          } else {
            router.push('/leads');
          }
          return;
        }
      }

      setIsAuthorized(true);
      setIsLoading(false);
    };

    checkAuth();
  }, [router, requiredRole, allowedRoles]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;