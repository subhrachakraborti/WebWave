
'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { onIdTokenChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { createSessionCookie } from '@/lib/actions/auth';
import { Loader2 } from 'lucide-react';
import { usePathname } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
});

// List of routes that do not require the loading spinner
const unauthenticatedRoutes = ['/login'];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onIdTokenChanged(auth, async (newUser) => {
      setUser(newUser);
      setLoading(false);
      if (newUser) {
        const idToken = await newUser.getIdToken();
        await createSessionCookie(idToken);
      }
    });

    return () => unsubscribe();
  }, []);

  const showLoader = loading && !unauthenticatedRoutes.includes(pathname);

  if (showLoader) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }
  
  return <AuthContext.Provider value={{ user, loading }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};
