'use client'

import { useState, useEffect } from 'react'
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
  const [inputValue, setInputValue] = useState('')
  const { recipientAddress, validationError } = useAddrOrEns({ text: inputValue })
  const { balance, deposits, refetch } = useBalance({ address: recipientAddress })

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 font-[system-ui,sans-serif]">
      <h1 className="text-4xl font-bold mb-2">🔷 Bluestake</h1>
      <p className="text-lg mb-8 text-gray-600">earn safe, blue-chip yield in one click</p>
      
      {(balance == null || recipientAddress == null) ? (
        <div className="mb-4 w-full max-w-md">
          <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
            Recipient Address or ENS Name
          </label>
          <div className="relative">
            <input
              type="text"
              id="address"
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 
                ${validationError ? 'border-red-500' : recipientAddress ? 'border-green-500' : 'border-gray-300'}`}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Enter Ethereum address or ENS name"
            />
          </div>
          {validationError && <p className="mt-1 text-sm text-red-600">{validationError}</p>}
          {recipientAddress && (
            <p className="mt-1 text-sm text-green-600">
              {inputValue.endsWith('.eth') ? `Resolved to: ${recipientAddress}` : 'Valid Ethereum address'}
            </p>
          )}
        </div>
      ) : (
        <DepositScreen 
          address={recipientAddress}
          balance={balance}
          deposits={deposits}
          refetch={refetch}
        />
      )}
    </div>
  )
}

function useAddrOrEns({ text }: { text: string }) {
  const [result, setResult] = useState<{ recipientAddress: `0x${string}` | null, validationError: string }>({
    recipientAddress: null,
    validationError: ''
  })

  useEffect(() => {
    const validate = async () => {
      if (!text.trim()) {
        setResult({ recipientAddress: null, validationError: '' })
        return
      }

      if (isAddress(text)) {
        setResult({ recipientAddress: getAddress(text) as `0x${string}`, validationError: '' })
        return
      }

      if (text.endsWith('.eth')) {
        try {
          const address = await publicClient.getEnsAddress({ name: text.toLowerCase() })
          setResult({ 
            recipientAddress: address || null, 
            validationError: address ? '' : 'ENS name could not be resolved' 
          })
        } catch {
          setResult({ recipientAddress: null, validationError: 'Failed to resolve ENS name' })
        }
        return
      }

      setResult({ recipientAddress: null, validationError: 'Invalid Ethereum address format' })
    }

    const timer = setTimeout(validate, 500)
    return () => clearTimeout(timer)
  }, [text])

  return result
}
