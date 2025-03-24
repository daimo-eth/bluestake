import { useEffect, useState } from 'react'
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

type Deposit = {
  amount: string
  timestamp: number
}

export function useBalance({ address }: { address?: `0x${string}` | null }) {
  const [balance, setBalance] = useState<string>('0')
  const deposits: Deposit[] = [] // TODO: implement deposits

  useEffect(() => {
    const fetchBalance = async () => {
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
        // USDC has 6 decimals
        setBalance(formatUnits(rawBalance, 6)) 
      } catch {
        setBalance('0')
      }
    }

    fetchBalance()
  }, [address])

  return { balance, deposits }
} 