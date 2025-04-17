"use client";

import { useState, useEffect } from "react";
import { Address, getAddress, isAddress } from "viem";
import { mainnet } from "viem/chains";
import { usePublicClient } from "wagmi";
import { useFarcaster } from "./FarcasterContext";

type Props = {
  addrName: string;
  setAddrName: (name: string) => void;
  setAddr: (addr: Address | undefined) => void;
};

export function LoginScreen({ addrName, setAddrName, setAddr }: Props) {
  const [error, setError] = useState("");
  const [autoLoginInProgress, setAutoLoginInProgress] = useState(false);
  
  const publicClient = usePublicClient({ chainId: mainnet.id });
  const { isConnected, loading, address: farcasterAddress } = useFarcaster();
  
  useEffect(() => {
    if (isConnected && farcasterAddress && !addrName) {
      setAutoLoginInProgress(true);
      const timeoutId = setTimeout(() => {
        setAddr(farcasterAddress);
        setAutoLoginInProgress(false);
      }, 500);
      
      return () => clearTimeout(timeoutId);
    }
  }, [isConnected, farcasterAddress, setAddr, addrName]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!addrName.trim()) {
      setError("Please enter an address or ENS name");
      return;
    }

    if (isAddress(addrName)) {
      setAddr(getAddress(addrName) as `0x${string}`);
      setError("");
      return;
    }

    if (publicClient && addrName.endsWith(".eth")) {
      try {
        const name = addrName.toLowerCase();
        const address = await publicClient.getEnsAddress({ name });
        if (!address) {
          setError("ENS name could not be resolved");
          return;
        }
        setAddrName(name);
        setAddr(address);
        setError("");
      } catch {
        setError("Failed to resolve ENS name");
      }
      return;
    }

    setError("Invalid Ethereum address format");
  }

  if (autoLoginInProgress || (loading && !isConnected)) {
    return (
      <div className="w-full max-w-md flex flex-col gap-4 items-center justify-center">
        <div className="bg-blue-50 p-6 rounded-md border border-blue-200 text-blue-800 text-sm w-full">
          <div className="flex flex-col items-center gap-3">
            <svg className="animate-spin h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-center">Connecting with Farcaster automatically...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md flex flex-col gap-4">
      <form onSubmit={handleSubmit} className="w-full">
        <div className="flex gap-2">
          <input
            type="text"
            className="flex-1 px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            value={addrName}
            onChange={(e) => setAddrName(e.target.value)}
            placeholder="Enter ENS or address"
            autoFocus
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck="false"
            data-form-type="other"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Enter
          </button>
        </div>
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </form>
    </div>
  );
} 