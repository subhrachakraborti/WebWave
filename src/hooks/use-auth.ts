'use client';

import { useAuthContext } from '@/components/providers/auth-provider';

export const useAuth = () => {
  return useAuthContext();
};
