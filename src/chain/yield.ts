import { encodeFunctionData, getAddress, type Address } from "viem";
import { base } from "viem/chains";

// ======= Constants =======
export const BASE_CHAIN_ID = base.id;
export const BASE_USDC_ADDR = getAddress(
  "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"
);
export const BASE_MUSDC_ADDR = getAddress(
  "0xEdc817A28E8B93B03976FBd4a3dDBc9f7D176c22"
);
export const BASE_DEPOSIT_CONTRACT_ADDR = getAddress(
  "0x700535ee0AD7E17705fb44f271F9bD939f0957B4"
);

const depositAbi = [
  {
    inputs: [{ name: "recipientAddr", type: "address" }],
    name: "deposit",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

/**
 * Generates a transaction to deposit USDC into mUSDC
 */
export function getDepositCall({ recipientAddr }: { recipientAddr: Address }) {
  return {
    toChain: base,
    toAddress: BASE_DEPOSIT_CONTRACT_ADDR,
    toCallData: encodeFunctionData({
      abi: depositAbi,
      functionName: "deposit",
      args: [recipientAddr],
    }),
  };
} 