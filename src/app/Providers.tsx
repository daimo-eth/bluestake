"use client";

import React, { useEffect, useState } from "react";
import { DaimoPayProvider, getDefaultConfig } from "@daimo/pay";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider, createConfig, http } from "wagmi";
import { arbitrum, base, mainnet, optimism, polygon } from "viem/chains";
import { FarcasterProvider } from "./FarcasterContext";
import { farcasterFrame } from "@farcaster/frame-wagmi-connector";
import { FarcasterSolanaProvider } from "@farcaster/mini-app-solana";
import { porto } from "porto/wagmi";

const alchemyKey = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY;;

// Create Daimo config with base settings
const daimoConfig = getDefaultConfig({
  appName: "Bluestake",
  transports: {
    [mainnet.id]: http(`https://eth-mainnet.g.alchemy.com/v2/${alchemyKey}`),
    [base.id]: http(`https://base-mainnet.g.alchemy.com/v2/${alchemyKey}`),
    [optimism.id]: http(`https://opt-mainnet.g.alchemy.com/v2/${alchemyKey}`),
    [arbitrum.id]: http(`https://arb-mainnet.g.alchemy.com/v2/${alchemyKey}`),
    [polygon.id]: http(`https://polygon-mainnet.g.alchemy.com/v2/${alchemyKey}`)
  },
  additionalConnectors: [porto({
    merchantRpcUrl: "https://bluestake.vercel.app/rpc"
  })]
});

// Create the final Wagmi config with Farcaster connector
const config = createConfig({
  ...daimoConfig,
  connectors: [
    ...(daimoConfig.connectors || []),
    farcasterFrame()
  ]
});

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <FarcasterSolanaProvider endpoint={"https://api.mainnet-beta.solana.com"}>
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <DaimoPayProvider >
          <FarcasterProvider>
            {mounted && children}
          </FarcasterProvider>
        </DaimoPayProvider>
      </QueryClientProvider>
    </WagmiProvider>
    </FarcasterSolanaProvider>
  );
}
