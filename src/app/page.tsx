"use client";

import { useState, useEffect } from "react";
import { getAddress, Address } from "viem";
import { useBalance } from "../chain/balance";
import { DepositScreen } from "./DepositScreen";
import { LoginScreen } from "./LoginScreen";
import { useFarcaster } from "./FarcasterContext";
import { WalletConnector } from "./WalletConnector";

const ls =
  typeof window === "undefined"
    ? ({} as Record<string, string>)
    : window.localStorage;

export default function Home() {
  const [addrName, setAddrName] = useState(ls.addrName ?? "");
  const [addr, setAddr] = useState<Address | undefined>(
    ls.addr ? (getAddress(ls.addr) as `0x${string}`) : undefined
  );
  const { balance, deposits, refetch } = useBalance({ address: addr });
  const { 
    address: farcasterAddress, 
    username, 
    displayName,
    isConnected: isFarcasterConnected,
  } = useFarcaster();

  useEffect(() => {
    if (farcasterAddress && !addr && isFarcasterConnected) {
      setAddr(farcasterAddress);
      
      if (displayName) {
        setAddrName(displayName);
      } else if (username) {
        setAddrName(`@${username}`);
      } else {
        setAddrName(farcasterAddress);
      }
    }
  }, [farcasterAddress, addr, displayName, username, isFarcasterConnected]);

  useEffect(() => {
    if (addr) ls.addr = addr;
    if (addrName) ls.addrName = addrName;
  }, [addr, addrName]);

  function handleLogout() {
    setAddrName("");
    setAddr(undefined);
    delete ls.addr;
    delete ls.addrName;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-start p-4 font-[system-ui,sans-serif] mt-8">
      <WalletConnector 
        onAddressChange={handleAddressChange}
        onNameChange={handleNameChange}
      />
      
      <h1 className="text-4xl font-bold mb-2">🔷 Bluestake</h1>
      <p className="text-sm font-medium mb-8 text-gray-600 uppercase tracking-wider">
        EARN SAFE, BLUE-CHIP YIELD IN ONE CLICK
      </p>

      {!addr ? (
        <LoginScreen
          addrName={addrName}
          setAddrName={setAddrName}
          setAddr={setAddr}
        />
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
  
  function handleAddressChange(address: Address | undefined) {
    if (address && !addr) {
      setAddr(address);
    }
  }

  function handleNameChange(name: string) {
    if (name && !addrName) {
      setAddrName(name);
    }
  }
}
