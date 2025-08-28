import { NextRequest } from "next/server";
import { MerchantRpc } from "porto/server";

export const runtime = "nodejs";

const handler = MerchantRpc.requestHandler({
  base: "/rpc",
  address: process.env.MERCHANT_ADDRESS as `0x${string}`,
  key: process.env.MERCHANT_PRIVATE_KEY as `0x${string}`,
  sponsor: true,
});

export async function GET(req: NextRequest) {
  return handler(req as unknown as Request);
}

export async function POST(req: NextRequest) {
  return handler(req as unknown as Request);
}
