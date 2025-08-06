import {type NextRequest, NextResponse} from 'next/server';
import {getAuth} from 'firebase-admin/auth';
import {getFirebaseAdminApp} from './lib/firebase/server';

const PROTECTED_PATHS = ['/dashboard'];

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
      await getAuth().verifySessionCookie(sessionCookie, true);
    } catch (error) {
      console.error('Session cookie verification failed:', error);
      const response = NextResponse.redirect(`${origin}/login`);
      response.cookies.delete('session');
      return response;
    }
  }

  return NextResponse.next();