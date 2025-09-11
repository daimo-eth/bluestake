import { Route } from "porto/server";
import { getAddress } from "viem";
import { assertNotNull } from "@daimo/pay-common";
import { Hex } from "viem";

const MERCHANT_ADDRESS = getAddress(
  assertNotNull(process.env.MERCHANT_ADDRESS)
);
const MERCHANT_PRIVATE_KEY = assertNotNull(
  process.env.MERCHANT_PRIVATE_KEY
) as Hex;
const route = Route.merchant({
  address: MERCHANT_ADDRESS,
  key: MERCHANT_PRIVATE_KEY,
});

export const GET = route.fetch;
export const OPTIONS = route.fetch;
export const POST = route.fetch;
