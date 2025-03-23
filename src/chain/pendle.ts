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

// const MOONWELL_COMPTROLLER_ADDR = "0xfBb21d0380beE3312B33c4353c8936a0F13EF26C";

// const PENDLE_ROUTER_ADDR = "TODO";
// const PENDLE_MARKET_ADDR = "TODO";

const MULTICALL3_ADDR = "0xcA11bde05977b3631167028862bE2a173976CA11";

// ======= ABIs =======
// Moonwell cToken mint ABI
const moonwellCTokenAbi = [
  {
    inputs: [{ name: "mintAmount", type: "uint256" }],
    name: "mint",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

// ERC20 transfer ABI
const erc20TransferAbi = [
  {
    inputs: [
      { name: "recipient", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    name: "transfer",
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

// Multicall ABI (simplified for our use case)
const multicallAbi = [
  {
    inputs: [
      {
        name: "calls",
        type: "tuple[]",
        components: [
          { name: "target", type: "address" },
          { name: "callData", type: "bytes" },
        ],
      },
    ],
    name: "aggregate",
    outputs: [
      { name: "blockNumber", type: "uint256" },
      { name: "returnData", type: "bytes[]" },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;

// ======= Exported Functions =======
/**
 * Generates a multicall transaction that mints Moonwell mUSDC
 * TODO: Wrap in Pendle to get PT tokens instead
 */
export function getMintCall({ recipientAddr }: { recipientAddr: Address }) {
  const amount = BigInt(1_000_000);

  return {
    toChain: base,
    toAddress: MULTICALL3_ADDR as Address,
    toCallData: encodeFunctionData({
      abi: multicallAbi,
      functionName: "aggregate",
      args: [
        [
          getMoonwellMintCall(amount),
          getTransferCall({
            tokenAddr: BASE_MUSDC_ADDR,
            recipientAddr,
            amount,
          }),
        ],
      ],
    }),
  };
}

// ======= Implementation Functions =======
/**
 * Generates parameters for a Moonwell mUSDC mint transaction
 */
function getMoonwellMintCall(amount: bigint) {
  return {
    target: BASE_MUSDC_ADDR,
    callData: encodeFunctionData({
      abi: moonwellCTokenAbi,
      functionName: "mint",
      args: [amount],
    }),
  };
}

/**
 * Generates parameters for an ERC20 transfer transaction
 */
function getTransferCall({
  tokenAddr,
  recipientAddr,
  amount,
}: {
  tokenAddr: Address;
  recipientAddr: Address;
  amount: bigint;
}) {
  return {
    target: tokenAddr,
    callData: encodeFunctionData({
      abi: erc20TransferAbi,
      functionName: "transfer",
      args: [recipientAddr, amount],
    }),
  };
}
