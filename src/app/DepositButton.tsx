"use client";

import { DaimoPayButton } from "@daimo/pay";
import { BASE_USDC_ADDR, getDepositCall } from "../chain/yield";
import { useFarcaster } from "./FarcasterContext";

type Props = {
  recipientAddr: `0x${string}`;
  refetch: () => void;
  onPaymentSucceeded?: () => void;
  showMore: boolean;
};

export function DepositButton({
  recipientAddr,
  refetch,
  onPaymentSucceeded,
  showMore,
}: Props) {
  const { toChain, toAddress, toCallData } = getDepositCall({ recipientAddr });
  const { isConnected } = useFarcaster();

  const paymentOptions: (
    | "Coinbase"
    | "Solana"
    | "CashApp"
    | "Revolut"
    | "Venmo"
    | "Wise"
    | "MercadoPago"
    | "Daimo"
    | "RampNetwork"
    | "Binance"
    | "ExternalChains"
    | "Lemon"
  )[] = isConnected
    ? ["Solana"]
    : ["Coinbase", "CashApp", "Revolut", "Venmo", "Wise", "MercadoPago", "Solana"];

  return (
    <DaimoPayButton.Custom
      appId="pay-demo"
      toChain={toChain.id}
      toToken={BASE_USDC_ADDR}
      toAddress={toAddress}
      toCallData={toCallData}
      paymentOptions={paymentOptions}
      redirectReturnUrl="https://bluestake.vercel.app/"
      intent="Earn More"
      connectedWalletOnly={isConnected}
      onPaymentCompleted={() => {
        refetch();
        onPaymentSucceeded?.();
      }}
    >
      {({ show }) => (
        <button
          onClick={show}
          className="w-full px-8 py-4 bg-blue-500 text-white text-lg font-medium rounded-lg hover:bg-blue-600 transition-colors cursor-pointer"
        >
          {showMore ? "Earn More" : "Earn"}
        </button>
      )}
    </DaimoPayButton.Custom>
  );
}
