
import { NextResponse, type NextRequest } from 'next/server';
import { getAuthenticatedUser } from '@/lib/firebase/server';

export const runtime = 'nodejs';

export const config = {
  matcher: ['/dashboard/:path*'],
};

export async function middleware(request: NextRequest) {
  const user = await getAuthenticatedUser();
  const { pathname } = request.nextUrl;

  if (!user) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }
  
  return NextResponse.next();
}
