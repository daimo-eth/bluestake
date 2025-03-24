"use client";

import React, { useEffect, useState } from "react";
import { DaimoPayProvider, getDefaultConfig } from "@daimo/pay";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider, createConfig, http } from "wagmi";
import { arbitrum, base, mainnet, optimism, polygon } from "viem/chains";

const alchemyKey = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY;;

const config = createConfig(
  getDefaultConfig({
    appName: "Bluestake",
    transports: {
      [mainnet.id]: http(`https://eth-mainnet.g.alchemy.com/v2/${alchemyKey}`),
      [base.id]: http(`https://base-mainnet.g.alchemy.com/v2/${alchemyKey}`),
      [optimism.id]: http(`https://opt-mainnet.g.alchemy.com/v2/${alchemyKey}`),
      [arbitrum.id]: http(`https://arb-mainnet.g.alchemy.com/v2/${alchemyKey}`),
      [polygon.id]: http(`https://polygon-mainnet.g.alchemy.com/v2/${alchemyKey}`)
    }
  })
);

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <DaimoPayProvider>{mounted && children}</DaimoPayProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
