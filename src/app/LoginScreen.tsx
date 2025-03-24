"use client";

import { useState } from "react";
import { Address, getAddress, isAddress } from "viem";
import { mainnet } from "viem/chains";
import { usePublicClient } from "wagmi";

type Props = {
  addrName: string;
  setAddrName: (name: string) => void;
  setAddr: (addr: Address | undefined) => void;
};

export function LoginScreen({ addrName, setAddrName, setAddr }: Props) {
  const [error, setError] = useState("");
  const publicClient = usePublicClient({ chainId: mainnet.id });

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

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md">
      <div className="flex gap-2">
        <input
          type="text"
          className="flex-1 px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          value={addrName}
          onChange={(e) => setAddrName(e.target.value)}
          placeholder="Enter ENS or address"
          autoFocus
          autoComplete="off"
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
  );
} 