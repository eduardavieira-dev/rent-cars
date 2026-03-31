import { type NextRequest, NextResponse } from 'next/server';

const PUBLIC_PATHS = ['/login', '/cadastro'];

export function middleware(request: NextRequest) {
    const token = request.cookies.get('access_token')?.value;
    const { pathname } = request.nextUrl;

    const isPublicPath =
        pathname === '/' ||
        PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));

    if (!token && !isPublicPath) {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
    }

    if (token && (pathname === '/login' || pathname.startsWith('/cadastro'))) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon\\.ico|.*\\.png$).*)'],
};
