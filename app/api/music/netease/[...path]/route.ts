import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 30;

function corsHeaders(): Record<string, string> {
    return {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Cache-Control": "no-store",
    };
}

const DEFAULT_UPSTREAM = "https://api-enhanced-delta-sable.vercel.app";

function getUpstreamBase(): string {
    const raw = process.env.NETEASE_API_UPSTREAM || DEFAULT_UPSTREAM;
    return raw.trim().replace(/\/+$/, "");
}

async function handleProxy(req: any, context: { params: Promise<{ path?: string[] }> | { path?: string[] } }) {
    const resolvedParams = await Promise.resolve(context?.params);
    const pathArray = resolvedParams?.path || [];
    const subPath = pathArray.map((seg) => encodeURIComponent(seg)).join("/");
    const upstreamBase = getUpstreamBase();

    const url = new URL(req.url);
    const search = url.search || "";
    const targetUrl = `${upstreamBase}/${subPath}${search}`;

    try {
        const headers = new Headers();
        req.headers.forEach((val: string, key: string) => {
            const lower = key.toLowerCase();
            if (lower !== "host" && lower !== "connection" && lower !== "content-length") {
                headers.set(key, val);
            }
        });

        const init: RequestInit = {
            method: req.method,
            headers,
            cache: "no-store",
        };

        if (req.method === "POST" && req.body) {
            init.body = await req.arrayBuffer();
        }

        const resp = await fetch(targetUrl, init);
        const data = await resp.arrayBuffer();

        const respHeaders = new Headers(corsHeaders());
        const contentType = resp.headers.get("content-type");
        if (contentType) respHeaders.set("content-type", contentType);

        const setCookie = resp.headers.get("set-cookie");
        if (setCookie) respHeaders.set("set-cookie", setCookie);

        return new NextResponse(data, {
            status: resp.status,
            statusText: resp.statusText,
            headers: respHeaders,
        });
    } catch (e) {
        return NextResponse.json(
            {
                code: 500,
                error: "proxy_failed",
                message: e instanceof Error ? e.message : "请求上游网易云服务失败",
            },
            { status: 500, headers: corsHeaders() }
        );
    }
}

export async function GET(req: any, context: any) {
    return handleProxy(req, context);
}

export async function POST(req: any, context: any) {
    return handleProxy(req, context);
}

export async function OPTIONS() {
    return new NextResponse(null, { status: 204, headers: corsHeaders() });
}
