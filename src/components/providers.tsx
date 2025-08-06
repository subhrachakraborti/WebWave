
'use client';

import { AuthProvider } from '@/hooks/use-auth';
import React from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
