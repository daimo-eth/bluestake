import { useEffect, useState, useCallback } from "react";
import { createPublicClient, http, formatUnits, getAbiItem } from "viem";
import { base } from "viem/chains";
import {
  BASE_MUSDC_ADDR,
  BASE_DEPOSIT_CONTRACT_ADDR,
  DEPOSIT_CONTRACT_ABI,
} from "./yield";

const publicClient = createPublicClient({
  chain: base,
  transport: http(),
});

const balanceOfAbi = [
  {
    inputs: [{ name: "account", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

export type Deposit = {
  timestamp: number;
  amountUsd: number;
  url: string;
};

export function useBalance({ address }: { address?: `0x${string}` | null }) {
  const [balance, setBalance] = useState<string>();
  const [deposits, setDeposits] = useState<Deposit[]>([]);

  const fetchBalanceAndDeposits = useCallback(async () => {
    if (!address) {
      setBalance("0");
      setDeposits([]);
      return;
    }

    try {
      console.log(`fetching balance for ${address}`);

      const [rawBalance, logs] = await Promise.all([
        publicClient.readContract({
          address: BASE_MUSDC_ADDR,
          abi: balanceOfAbi,
          functionName: "balanceOf",
          args: [address],
        }),
        publicClient.getLogs({
          address: BASE_DEPOSIT_CONTRACT_ADDR,
          event: getAbiItem({ abi: DEPOSIT_CONTRACT_ABI, name: "Deposited" }),
          args: { recipientAddr: address },
          strict: true,
          fromBlock: BigInt(27990000),
        }),
      ]);

      const formattedBalance = formatUnits(rawBalance, 6); // USDC has 6 decimals
      setBalance(formattedBalance);

      const depositLogs = logs.map((log) => {
        const timestamp = getTimestampFromBlockHeight(log.blockNumber);
        return {
          timestamp,
          amountUsd: Number(formatUnits(log.args.amount as bigint, 6)),
          url: `https://basescan.org/tx/${log.transactionHash}`,
        };
      });
      setDeposits(depositLogs);

      console.log(
        `balance: ${formattedBalance}, num deposits: ${depositLogs.length}`
      );
    } catch {
      setBalance(undefined);
      setDeposits([]);
    }
  }, [address]);

  useEffect(() => {
    fetchBalanceAndDeposits();
  }, [fetchBalanceAndDeposits]);

  return { balance, deposits, refetch: fetchBalanceAndDeposits };
}

/**
 * Gets timestamp for a block on Base
 * Base has 1s block time, so we can calculate directly
 */
export function getTimestampFromBlockHeight(blockNum: bigint): number {
  return 1686789347 + Number(blockNum) * 2;
}
