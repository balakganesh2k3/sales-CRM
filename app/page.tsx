'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/lib/auth';
import LoginForm from '@/components/auth/LoginForm';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    if (authService.isAuthenticated()) {
      const user = authService.getUser();
      // Role-based redirect for already authenticated users
      if (user?.role === 'manager') {
        router.push('/dashboard');
      } else {
        router.push('/leads');
      }
    }
  }, [router]);

  return <LoginForm />;
}