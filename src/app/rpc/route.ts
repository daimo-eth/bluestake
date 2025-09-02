import { NextRequest } from "next/server";
import { MerchantRpc } from "porto/server";
import { getAddress, Hex } from "viem";
import { assertNotNull } from "@daimo/pay-common";

export const runtime = "nodejs";

const MERCHANT_ADDRESS = getAddress(
  assertNotNull(process.env.MERCHANT_ADDRESS)
);
const MERCHANT_PRIVATE_KEY = assertNotNull(
  process.env.MERCHANT_PRIVATE_KEY
) as Hex;

const handler = MerchantRpc.requestHandler({
  base: "/rpc",
  address: MERCHANT_ADDRESS,
  key: MERCHANT_PRIVATE_KEY,
  sponsor: true,
});

function getCorsHeaders(req: NextRequest): Headers {
  const origin = req.headers.get("origin") || "*";
  const requestHeaders =
    req.headers.get("access-control-request-headers") || "content-type";

  const headers = new Headers();
  headers.set("Access-Control-Allow-Origin", origin);
  headers.set("Vary", "Origin");
  headers.set("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  headers.set("Access-Control-Allow-Headers", requestHeaders);
  // If credentials are needed in future, set Allow-Credentials and restrict origin
  // headers.set("Access-Control-Allow-Credentials", "true");
  return headers;
}

async function respond(req: NextRequest): Promise<Response> {
  const startedAtMs = Date.now();
  const method = req.method || "GET";
  const path = req.nextUrl?.pathname || "/rpc";
  let reqBody: unknown = undefined;
  if (method === "POST") {
    try {
      reqBody = await req.clone().json();
    } catch {}
  }

  const res = await handler(req);
  const cors = getCorsHeaders(req);
  const headers = new Headers(res.headers);
  cors.forEach((value, key) => headers.set(key, value));

  try {
    const bodyText = await res.clone().text();
    const elapsedMs = Date.now() - startedAtMs;
    if (method === "POST") {
      console.log(
        `[MerchantRPC] ${method} ${path} ${res.status} ${elapsedMs}ms`,
        reqBody ? JSON.stringify(reqBody) : ""
      );
    } else {
      console.log(
        `[MerchantRPC] ${method} ${path} ${res.status} ${elapsedMs}ms`,
        bodyText
      );
    }
  } catch {}

  return new Response(res.body, { status: res.status, headers });
}

export async function OPTIONS(req: NextRequest) {
  return new Response(null, {
    status: 204,
    headers: getCorsHeaders(req),
  });
}

export async function GET(req: NextRequest) {
  return respond(req);
}

export async function POST(req: NextRequest) {
  return respond(req);
}
