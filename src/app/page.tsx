'use client'

import { useState } from 'react'
import { isAddress, getAddress } from 'viem'
import { createPublicClient, http } from 'viem'
import { mainnet } from 'viem/chains'
import { useBalance } from '../chain/balance'
import { DepositScreen } from './DepositScreen'

const publicClient = createPublicClient({
  chain: mainnet,
  transport: http(),
})

export default function Home() {
  const [addrName, setAddrName] = useState('')
  const [addr, setAddr] = useState<`0x${string}` | null>(null)
  const [error, setError] = useState('')
  const { balance, deposits, refetch } = useBalance({ address: addr })

  async function validateAndSetAddr(text: string) {
    if (!text.trim()) {
      setError('Please enter an address or ENS name')
      return
    }

    if (isAddress(text)) {
      setAddr(getAddress(text) as `0x${string}`)
      setAddrName(text)
      setError('')
      return
    }

    if (text.endsWith('.eth')) {
      try {
        const address = await publicClient.getEnsAddress({ name: text.toLowerCase() })
        if (!address) {
          setError('ENS name could not be resolved')
          return
        }
        setAddr(address)
        setAddrName(text)
        setError('')
      } catch {
        setError('Failed to resolve ENS name')
      }
      return
    }

    setError('Invalid Ethereum address format')
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 font-[system-ui,sans-serif]">
      <h1 className="text-4xl font-bold mb-2">🔷 Bluestake</h1>
      <p className="text-lg mb-8 text-gray-600">earn safe, blue-chip yield in one click</p>
      
      {!addr ? (
        <div className="w-full max-w-md">
          <div className="flex gap-2">
            <input
              type="text"
              className="flex-1 px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={addrName}
              onChange={(e) => setAddrName(e.target.value)}
              placeholder="Enter ENS or address"
            />
            <button
              onClick={() => validateAndSetAddr(addrName)}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Enter
            </button>
          </div>
          {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        </div>
      ) : (
        <DepositScreen 
          address={addr}
          addressName={addrName}
          balance={balance || '0'}
          deposits={deposits}
          refetch={refetch}
        />
      )}
    </div>
  )
}
