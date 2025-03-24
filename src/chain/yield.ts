import { encodeFunctionData, getAddress, type Address } from "viem";
import { base } from "viem/chains";

// ======= Constants =======
export const BASE_CHAIN_ID = base.id;
export const BASE_USDC_ADDR = getAddress(
  "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"
);
export const BASE_AUSDC_ADDR = getAddress(
  "0x4e65fE4DbA92790696d040ac24Aa414708F5c0AB"
);
export const BASE_DEPOSIT_CONTRACT_ADDR = getAddress(
  "0x2380f715c3A990c30a69Ed871992B0B10187d4C4"
);

export const DEPOSIT_CONTRACT_ABI = [
  {
    inputs: [{ name: "recipientAddr", type: "address" }],
    name: "deposit",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "recipientAddr", type: "address" },
      { indexed: false, name: "amount", type: "uint256" }
    ],
    name: "Deposited",
    type: "event"
  }
] as const;

/**
 * Generates a transaction to deposit USDC into mUSDC
 */
export function getDepositCall({ recipientAddr }: { recipientAddr: Address }) {
  return {
    toChain: base,
    toAddress: BASE_DEPOSIT_CONTRACT_ADDR,
    toCallData: encodeFunctionData({
      abi: DEPOSIT_CONTRACT_ABI,
      functionName: "deposit",
      args: [recipientAddr],
    }),
  };
}
