'use client'

import { useState, useEffect } from 'react'
import { DepositButton } from './DepositButton'
import { isAddress, getAddress } from 'viem'
import { createPublicClient, http } from 'viem'
import { mainnet } from 'viem/chains'

export default function Home() {
  const [inputValue, setInputValue] = useState('')
  const [recipientAddress, setRecipientAddress] = useState<`0x${string}` | null>(null)
  const [isValidating, setIsValidating] = useState(false)
  const [validationError, setValidationError] = useState('')
  const [isENS, setIsENS] = useState(false)

  // Create a public client for ENS resolution
  const publicClient = createPublicClient({
    chain: mainnet,
    transport: http(),
  })

  useEffect(() => {
    const validateAddress = async () => {
      if (!inputValue.trim()) {
        setRecipientAddress(null)
        setValidationError('')
        return
      }

      setIsValidating(true)
      setValidationError('')
      
      try {
        // Check if it's a valid address format
        if (isAddress(inputValue)) {
          setRecipientAddress(getAddress(inputValue) as `0x${string}`)
          setIsENS(false)
          setIsValidating(false)
          return
        }
        
        // Check if it's an ENS name
        if (inputValue.endsWith('.eth') || inputValue.includes('.')) {
          setIsENS(true)
          try {
            const resolvedAddress = await publicClient.getEnsAddress({
              name: inputValue.toLowerCase(),
            })
            
            if (resolvedAddress) {
              setRecipientAddress(resolvedAddress)
              setValidationError('')
            } else {
              setRecipientAddress(null)
              setValidationError('ENS name could not be resolved')
            }
          } catch (error) {
            setRecipientAddress(null)
            setValidationError('Failed to resolve ENS name')
            console.error('ENS resolution error:', error)
          }
        } else {
          setIsENS(false)
          setRecipientAddress(null)
          setValidationError('Invalid Ethereum address format')
        }
      } catch (error) {
        console.error('Validation error:', error)
        setRecipientAddress(null)
        setValidationError('Invalid address')
      }
      
      setIsValidating(false)
    }

    const debounceTimer = setTimeout(validateAddress, 500)
    return () => clearTimeout(debounceTimer)
  }, [inputValue, publicClient])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 font-[system-ui,sans-serif]">
      <h1 className="text-4xl font-bold mb-2">🔷 Bluestake</h1>
      <p className="text-lg mb-8 text-gray-600">earn safe, blue-chip yield in one click</p>
      
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
          {isValidating && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <svg className="animate-spin h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          )}
        </div>
        {validationError && <p className="mt-1 text-sm text-red-600">{validationError}</p>}
        {isENS && recipientAddress && (
          <p className="mt-1 text-sm text-green-600">Resolved to: {recipientAddress}</p>
        )}
        {!isENS && recipientAddress && (
          <p className="mt-1 text-sm text-green-600">Valid Ethereum address</p>
        )}
      </div>
      
      {recipientAddress && <DepositButton recipientAddr={recipientAddress} />}
    </div>
  )
}
