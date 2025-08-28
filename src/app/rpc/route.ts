import { NextRequest } from "next/server";
import { MerchantRpc } from "porto/server";
import { getAddress, Hex } from "viem";
import { assertNotNull } from "@daimo/pay-common";

export const runtime = "nodejs";

const handler = MerchantRpc.requestHandler({
  base: "/rpc",
  address: getAddress(assertNotNull(process.env.MERCHANT_ADDRESS)),
  key: assertNotNull(process.env.MERCHANT_PRIVATE_KEY) as Hex,
  sponsor: true,
});

export async function GET(req: NextRequest) {
  return handler(req);
}

export async function POST(req: NextRequest) {
  return handler(req);
}
