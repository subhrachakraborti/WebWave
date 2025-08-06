import {type NextRequest, NextResponse} from 'next/server';
import {getAuth} from 'firebase-admin/auth';
import {getFirebaseAdminApp} from './lib/firebase/server';

const PROTECTED_PATHS = ['/dashboard'];

// This forces the middleware to run on the Node.js runtime.
// https://nextjs.org/docs/app/api-reference/file-conventions/middleware#runtime
export const runtime = 'nodejs';

getFirebaseAdminApp();

function isPathProtected(path: string) {
  return PROTECTED_PATHS.some((protectedPath) =>
    path.startsWith(protectedPath)
  );
}

export async function middleware(request: NextRequest) {
  const {pathname, origin} = request.nextUrl;

  const sessionCookie =
    request.cookies.get('session')?.value ||
    request.headers.get('Authorization')?.split('Bearer ')[1];

  if (isPathProtected(pathname)) {
    if (!sessionCookie) {
      return NextResponse.redirect(`${origin}/login`);
    }

    try {
      // Initialize Firebase Admin App if not already initialized
      getFirebaseAdminApp();
      await getAuth().verifySessionCookie(sessionCookie, true);
    } catch (error) {
      console.error('Session cookie verification failed:', error);
      const response = NextResponse.redirect(`${origin}/login`);
      response.cookies.delete('session');
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/dashboard/:path*',
};
