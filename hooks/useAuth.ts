
import { useState, useEffect } from 'react';
import { verifyToken } from '@/backend/lib/auth';

// This is a mock of what a real useAuth hook might look like.
// It tries to get the token from cookies. This will not work in a real
// app because cookies are not accessible directly in client components in this way.
// A real implementation would use a client-side library or a dedicated API route.

interface AuthUser {
    id: string;
    email: string;
    name: string;
    role: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    // This is a simplified approach for demonstration purposes.
    // In a real Next.js app, you might use a library like next-auth
    // or manage this through a context provider that gets initialized from a server component.
    const getCookie = (name: string) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(';').shift();
    };

    const token = getCookie('token');
    if (token) {
        const decodedUser = verifyToken(token);
        if(decodedUser) {
             setUser({
                id: decodedUser.userId,
                email: decodedUser.email,
                name: decodedUser.name,
                role: decodedUser.role
            });
        }
    }
  }, []);

  return { user };
};

