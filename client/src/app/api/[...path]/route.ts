import { NextRequest } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8080';

async function proxyRequest(request: NextRequest, pathSegments: string[]) {
    const targetUrl = new URL(pathSegments.join('/'), `${BACKEND_URL}/`);
    targetUrl.search = request.nextUrl.search;

    const headers = new Headers(request.headers);
    headers.delete('host');
    headers.delete('content-length');

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

export async function PATCH(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
    const { path } = await context.params;
    return proxyRequest(request, path);
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
    const { path } = await context.params;
    return proxyRequest(request, path);
}

export async function OPTIONS(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
    const { path } = await context.params;
    return proxyRequest(request, path);
}
