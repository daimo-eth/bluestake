'use client'

import { optimismUSDC } from '@daimo/contract'
import { DaimoPayButton } from '@daimo/pay'
import { getAddress, type Address } from 'viem'

interface DepositButtonProps {
  recipientAddr: Address
}

export function DepositButton({ recipientAddr }: DepositButtonProps) {
  return (
    <DaimoPayButton
      appId="pay-demo"
      toChain={optimismUSDC.chainId}
      toUnits="0.12"
      toToken={getAddress(optimismUSDC.token)}
      toAddress={recipientAddr}
      intent="Deposit"
      onPaymentStarted={(e) => console.log(e)}
      onPaymentCompleted={(e) => console.log(e)}
    />
  )
} 