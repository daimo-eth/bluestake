"use client";

import { useState, useEffect } from "react";
import { isAddress, getAddress, Address } from "viem";
import { createPublicClient, http } from "viem";
import { mainnet } from "viem/chains";
import { useBalance } from "../chain/balance";
import { DepositScreen } from "./DepositScreen";

const publicClient = createPublicClient({
  chain: mainnet,
  transport: http(),
});

export default function Home() {
  const [addrName, setAddrName] = useState(window?.localStorage.addrName ?? "");
  const [addr, setAddr] = useState<Address | undefined>(
    window?.localStorage.addr
      ? (getAddress(window.localStorage.addr) as `0x${string}`)
      : undefined
  );
  const [error, setError] = useState("");
  const { balance, deposits, refetch } = useBalance({ address: addr });

  useEffect(() => {
    if (addr) window.localStorage.addr = addr;
    if (addrName) window.localStorage.addrName = addrName;
  }, [addr, addrName]);

  function handleLogout() {
    setAddrName("");
    setAddr(undefined);
    delete window.localStorage.addr;
    delete window.localStorage.addrName;
  }

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

    if (addrName.endsWith(".eth")) {
      try {
        const address = await publicClient.getEnsAddress({
          name: addrName.toLowerCase(),
        });
        if (!address) {
          setError("ENS name could not be resolved");
          return;
        }
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
    <div className="min-h-screen flex flex-col items-center justify-center p-4 font-[system-ui,sans-serif]">
      <h1 className="text-4xl font-bold mb-2">🔷 Bluestake</h1>
      <p className="text-sm font-medium mb-8 text-gray-600 uppercase tracking-wider">
        EARN SAFE, BLUE-CHIP YIELD IN ONE CLICK
      </p>

      {!addr ? (
        <form onSubmit={handleSubmit} className="w-full max-w-md">
          <div className="flex gap-2">
            <input
              type="text"
              className="flex-1 px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={addrName}
              onChange={(e) => setAddrName(e.target.value)}
              placeholder="Enter ENS or address"
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
      ) : (
        <DepositScreen
          address={addr}
          addressName={addrName}
          balance={balance}
          deposits={deposits}
          refetch={refetch}
          onLogout={handleLogout}
        />
      )}
    </div>
  );
}
