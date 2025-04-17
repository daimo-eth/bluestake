"use client";

import { useEffect } from "react";
import { useAccount, useConnect } from "wagmi";
import { Address } from "viem";

type WalletConnectorProps = {
  onAddressChange: (address: Address | undefined) => void;
  onNameChange: (name: string) => void;
};

export function WalletConnector({ onAddressChange, onNameChange }: WalletConnectorProps) {
  const { isConnected, address } = useAccount();
  const { connect, connectors } = useConnect();

  // Helper to detect if we're in a Farcaster context
  const isFarcasterContext = typeof window !== "undefined" && (
    window.location.href.includes("warpcast.com") || 
    window.location.hostname.includes("farcaster")
  );

  // Automatically connect with the Farcaster connector if available and we're in a Farcaster context
  useEffect(() => {
    // Only attempt auto-connection if we're in a Farcaster client
    if (!isFarcasterContext) return;

    // Find the Farcaster connector (typically the last one added)
    const farcasterConnector = connectors.find(c => c.name.includes("Farcaster"));
    
    if (farcasterConnector && !isConnected) {
      connect({ connector: farcasterConnector });
    }
  }, [connectors, connect, isConnected, isFarcasterContext]);

  // Update parent component when address changes
  useEffect(() => {
    if (address) {
      onAddressChange(address);
      // Use the address as the name if ENS not available
      onNameChange(address);
    } else {
      onAddressChange(undefined);
    }
  }, [address, onAddressChange, onNameChange]);

  // This component doesn't render anything visible
  return null;
} 