'use client'

import { DepositButton } from './DepositButton'

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 font-[system-ui,sans-serif]">
      <h1 className="text-4xl font-bold mb-2">🔷 Bluestake</h1>
      <p className="text-lg mb-8 text-gray-600">earn safe, blue-chip yield in one click</p>
      
      <DepositButton recipientAddr='0x0000000000000000000000000000000000000000' />
    </div>
  )
}
