import { useEffect, useState, useCallback } from 'react'
import { createPublicClient, http, formatUnits } from 'viem'
import { base } from 'viem/chains'
import { BASE_MUSDC_ADDR } from './yield'

const publicClient = createPublicClient({
  chain: base,
  transport: http(),
})

const balanceOfAbi = [
  {
    inputs: [{ name: "account", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
] as const

export type Deposit = {
  timestamp: number
  amountUsd: string
  url: string
}

export function useBalance({ address }: { address?: `0x${string}` | null }) {
  const [balance, setBalance] = useState<string>()
  const deposits: Deposit[] = [] // TODO: implement deposits

  const fetchBalance = useCallback(async () => {
    if (!address) {
      setBalance('0')
      return
    }

    try {
      const rawBalance = await publicClient.readContract({
        address: BASE_MUSDC_ADDR,
        abi: balanceOfAbi,
        functionName: 'balanceOf',
        args: [address],
      })
      setBalance(formatUnits(rawBalance, 6)) // USDC has 6 decimals
    } catch {
      setBalance('0')
    }
  }, [address])

  useEffect(() => {
    fetchBalance()
  }, [fetchBalance])

  return { balance, deposits, refetch: fetchBalance }
} 