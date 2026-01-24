'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Redirect /signup to /login with signup tab active
export default function SignupRedirect() {
  const router = useRouter();
  
  useEffect(() => {
    // Redirect to login page with a query param to show signup tab
    router.replace('/login?tab=signup');
  }, [router]);
  
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500" />
    </div>
  );
}
