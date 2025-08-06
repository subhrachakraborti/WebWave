
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import Logo from '@/components/icons/logo';
import { LogIn } from 'lucide-react';

export default function LoginPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  const handleLogin = () => {
    window.open('https://user.subhrachakraborti.com', '_blank');
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background">
      <div className="mx-auto flex w-full max-w-sm flex-col items-center justify-center space-y-6">
        <div className="flex flex-col items-center space-y-2 text-center">
            <Logo className="h-20 w-20 text-primary" />
          <h1 className="text-3xl font-bold">Welcome to WebWave</h1>
          <p className="text-muted-foreground">
            Please log in to access the chat application.
          </p>
        </div>
        <div className="w-full">
            <Button onClick={handleLogin} className="w-full" size="lg">
                <LogIn className="mr-2 h-5 w-5" />
                Login with External Service
            </Button>
        </div>
         <p className="px-8 text-center text-sm text-muted-foreground">
          By clicking continue, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}
