import { NextRequest } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8080';

function isPublicVehicleReadRoute(method: string, pathSegments: string[]): boolean {
    if (method !== 'GET') return false;
    if (pathSegments.length === 1 && pathSegments[0] === 'vehicles') return true;
    if (pathSegments.length === 2 && pathSegments[0] === 'vehicles') return true;
    return false;
}

async function proxyRequest(request: NextRequest, pathSegments: string[]) {
    const targetUrl = new URL(pathSegments.join('/'), `${BACKEND_URL}/`);
    targetUrl.search = request.nextUrl.search;

    const headers = new Headers(request.headers);
    headers.delete('host');
    headers.delete('content-length');

    // Public vehicle reads should work even with stale/invalid client token.
    if (isPublicVehicleReadRoute(request.method, pathSegments)) {
        headers.delete('authorization');
    } else if (!headers.has('authorization')) {
        const token = request.cookies.get('access_token')?.value;
        if (token) {
            headers.set('authorization', `Bearer ${token}`);
        }
    }

    const hasBody = !['GET', 'HEAD'].includes(request.method);
    const body = hasBody ? await request.arrayBuffer() : undefined;

    const upstreamResponse = await fetch(targetUrl, {
        method: request.method,
        headers,
        body,
        redirect: 'manual',
    });

    const responseHeaders = new Headers(upstreamResponse.headers);
    responseHeaders.delete('transfer-encoding');
    responseHeaders.delete('www-authenticate');

    return new Response(upstreamResponse.body, {
        status: upstreamResponse.status,
        headers: responseHeaders,
    });
}

export async function GET(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
    const { path } = await context.params;
    return proxyRequest(request, path);
}

export async function POST(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
    const { path } = await context.params;
    return proxyRequest(request, path);
}

export async function PUT(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
    const { path } = await context.params;
    return proxyRequest(request, path);
}

export async function PATCH(
    request: NextRequest,
    context: { params: Promise<{ path: string[] }> }
) {
    const { path } = await context.params;
    return proxyRequest(request, path);
}

export async function DELETE(
    request: NextRequest,
    context: { params: Promise<{ path: string[] }> }
) {
    const { path } = await context.params;
    return proxyRequest(request, path);
}

export async function OPTIONS(
    request: NextRequest,
    context: { params: Promise<{ path: string[] }> }
) {
    const { path } = await context.params;
    return proxyRequest(request, path);
}
