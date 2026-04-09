import { type NextRequest, NextResponse } from 'next/server';

const PUBLIC_PATHS = ['/login', '/cadastro'];

function isTokenValid(token: string): boolean {
    try {
        const payload = JSON.parse(atob(token.split('.')[1])) as { exp: number };
        return payload.exp * 1000 > Date.now();
    } catch {
        return false;
    }
}

export function proxy(request: NextRequest) {
    const rawToken = request.cookies.get('access_token')?.value;
    const token = rawToken && isTokenValid(rawToken) ? rawToken : null;
    const { pathname } = request.nextUrl;

    const isPublicPath =
        pathname === '/' ||
        PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));

    if (rawToken && !token && !isPublicPath) {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('redirect', pathname);
        const response = NextResponse.redirect(loginUrl);
        response.cookies.delete('access_token');
        return response;
    }

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
