"use client";

import { DaimoPayButton } from "@daimo/pay";
import { type Address } from "viem";
import { BASE_USDC_ADDR, getDepositCall } from "../chain/yield";

interface DepositButtonProps {
  recipientAddr: Address;
}

export function DepositButton({ recipientAddr }: DepositButtonProps) {
  const { toChain, toAddress, toCallData } = getDepositCall({ recipientAddr });

  return (
    <DaimoPayButton
      appId="pay-demo"
      toChain={toChain.id}
      toToken={BASE_USDC_ADDR}
      toAddress={toAddress}
      toCallData={toCallData}
      intent="Deposit"
      onPaymentStarted={(e) => console.log(e)}
      onPaymentCompleted={(e) => console.log(e)}
    />
  );
}
