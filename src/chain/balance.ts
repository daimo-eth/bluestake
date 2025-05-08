import { useCallback, useEffect, useState } from "react";
import { formatUnits, getAbiItem } from "viem";
import { base } from "viem/chains";
import { usePublicClient } from "wagmi";
import {
  BASE_AUSDC_ADDR,
  BASE_DEPOSIT_CONTRACT_ADDR,
  BASE_WITHDRAW_CONTRACT_ADDR,
  DEPOSIT_CONTRACT_ABI,
  BASE_USDC_ADDR,
} from "./yield";

const balanceOfAbi = [
  {
    inputs: [{ name: "account", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

// Aave Withdraw event
const withdrawEventAbi = [
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "reserve", type: "address" },
      { indexed: true, name: "user", type: "address" },
      { indexed: true, name: "to", type: "address" },
      { indexed: false, name: "amount", type: "uint256" },
    ],
    name: "Withdraw",
    type: "event",
  },
] as const;

export type TransactionType = "deposit" | "withdraw";

export type Transaction = {
  timestamp: number;
  amountUsd: number;
  url: string;
  type: TransactionType;
};

export function useBalance({ address }: { address?: `0x${string}` | null }) {
  const [balance, setBalance] = useState<number>();
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const publicClient = usePublicClient({ chainId: base.id });

  const fetchBalanceAndTransactions = useCallback(async () => {
    if (!address || !publicClient) {
      setBalance(undefined);
      setTransactions([]);
      return;
    }

    try {
      console.log(`fetching balance for ${address}`);

      const [rawBalance, depositLogs, withdrawLogs] = await Promise.all([
        // Get aUSDC balance
        publicClient.readContract({
          address: BASE_AUSDC_ADDR,
          abi: balanceOfAbi,
          functionName: "balanceOf",
          args: [address],
        }),

        // Get deposit events
        publicClient.getLogs({
          address: BASE_DEPOSIT_CONTRACT_ADDR,
          event: getAbiItem({ abi: DEPOSIT_CONTRACT_ABI, name: "Deposited" }),
          args: { recipientAddr: address },
          strict: true,
          fromBlock: BigInt(27990000),
        }),

        // Get withdraw events where user is the one withdrawing
        publicClient.getLogs({
          address: BASE_WITHDRAW_CONTRACT_ADDR,
          event: getAbiItem({ abi: withdrawEventAbi, name: "Withdraw" }),
          args: {
            reserve: BASE_USDC_ADDR,
            user: address,
            to: address,
          },
          strict: true,
          fromBlock: BigInt(27990000),
        }),
      ]);

      const formattedBalance = formatUnits(rawBalance, 6); // USDC has 6 decimals
      setBalance(Number(formattedBalance));

      // Process deposit logs
      const deposits: Transaction[] = depositLogs.map((log) => {
        const timestamp = getTimestampFromBlockHeight(log.blockNumber);
        // Make sure we can access the amount property safely
        let amountUsd = 0;
        try {
          if (log.args && log.args.amount) {
            amountUsd = Number(formatUnits(log.args.amount as bigint, 6));
          }
        } catch (e) {
          console.error("Error processing deposit amount:", e);
        }

        return {
          timestamp,
          amountUsd,
          url: `https://basescan.org/tx/${log.transactionHash}`,
          type: "deposit",
        };
      });

      // Process withdrawal logs
      const withdrawals: Transaction[] = withdrawLogs.map((log) => {
        const timestamp = getTimestampFromBlockHeight(log.blockNumber);
        // Make sure we can access the amount property safely
        let amountUsd = 0;
        try {
          if (log.args && log.args.amount) {
            amountUsd = Number(formatUnits(log.args.amount as bigint, 6));
          }
        } catch (e) {
          console.error("Error processing withdrawal amount:", e);
        }

        return {
          timestamp,
          amountUsd,
          url: `https://basescan.org/tx/${log.transactionHash}`,
          type: "withdraw",
        };
      });

      // Combine and sort all transactions
      const allTransactions = [...deposits, ...withdrawals].sort(
        (a, b) => b.timestamp - a.timestamp
      );

      setTransactions(allTransactions);

      console.log(
        `balance: ${formattedBalance}, transactions: ${allTransactions.length} (${deposits.length} deposits, ${withdrawals.length} withdrawals)`
      );
    } catch (error) {
      console.error("Error fetching balance or transactions:", error);
      setBalance(undefined);
      setTransactions([]);
    }
  }, [address, publicClient]);

  useEffect(() => {
    fetchBalanceAndTransactions();
  }, [fetchBalanceAndTransactions]);

  return { balance, transactions, refetch: fetchBalanceAndTransactions };
}

/**
 * Gets timestamp for a block on Base
 * Base has 1s block time, so we can calculate directly
 */
export function getTimestampFromBlockHeight(blockNum: bigint): number {
  return 1686789347 + Number(blockNum) * 2;
}
