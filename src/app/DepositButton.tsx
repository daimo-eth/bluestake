'use client'

import { DaimoPayButton } from '@daimo/pay'
import { type Address } from 'viem'
import { BASE_USDC_ADDR, getMintCall } from '../chain/pendle'

interface DepositButtonProps {
  recipientAddr: Address
}

export function DepositButton({ recipientAddr }: DepositButtonProps) {
  const { toChain, toAddress, toCallData } = getMintCall({ recipientAddr })

  return (
    <DaimoPayButton
      appId="pay-demo"
      toChain={toChain.id}
      toUnits="1.00"
      toToken={BASE_USDC_ADDR}
      toAddress={toAddress}
      toCallData={toCallData}
      intent="Deposit"
      onPaymentStarted={(e) => console.log(e)}
      onPaymentCompleted={(e) => console.log(e)}
    />
  )
} 