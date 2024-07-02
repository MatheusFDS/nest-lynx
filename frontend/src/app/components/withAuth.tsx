'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';

interface WithAuthProps {
  requiredRole?: string;
}

const withAuth = (WrappedComponent: React.ComponentType, { requiredRole }: WithAuthProps = {}) => {
  const ComponentWithAuth = (props: any) => {
    const { isLoggedIn } = useAuth();
    const router = useRouter();

    useEffect(() => {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const userRole = JSON.parse(atob(token.split('.')[1])).role;
      if (requiredRole && userRole !== requiredRole) {
        router.push('/login');
        return;
      }
    }, [isLoggedIn, router]);

    if (!isLoggedIn) {
      return null; // Render null while redirecting
    }

    return <WrappedComponent {...props} />;
  };

  return ComponentWithAuth;
};

export default withAuth;
