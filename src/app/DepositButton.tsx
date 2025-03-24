"use client";

import { DaimoPayButton, DaimoPayCompletedEvent } from "@daimo/pay";
import { BASE_USDC_ADDR, getDepositCall } from "../chain/yield";

type Props = {
  recipientAddr: `0x${string}`;
  refetch: () => void;
  onPaymentSucceeded?: (e: DaimoPayCompletedEvent) => void;
  showMore: boolean;
};

export function DepositButton({
  recipientAddr,
  refetch,
  onPaymentSucceeded,
  showMore,
}: Props) {
  const { toChain, toAddress, toCallData } = getDepositCall({ recipientAddr });

  return (
    <DaimoPayButton.Custom
      appId="pay-demo"
      toChain={toChain.id}
      toToken={BASE_USDC_ADDR}
      toAddress={toAddress}
      toCallData={toCallData}
      intent="Deposit"
      onPaymentCompleted={(e: DaimoPayCompletedEvent) => {
        refetch();
        onPaymentSucceeded?.(e);
      }}
    >
      {({ show }) => (
        <button
          onClick={show}
          className="w-full px-8 py-4 bg-blue-500 text-white text-lg font-medium rounded-lg hover:bg-blue-600 transition-colors"
        >
          {showMore ? "Stake More" : "Stake"}
        </button>
      )}
    </DaimoPayButton.Custom>
  );
}
