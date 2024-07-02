// src/app/login/page.tsx
'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LoginForm from '../components/LoginForm';

const LoginPage = () => {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      router.push('/statistics');
    }
  }, [router]);

  return <LoginForm />;
};

export default LoginPage;
