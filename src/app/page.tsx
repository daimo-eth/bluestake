"use client";

import { useState, useEffect } from "react";
import { getAddress, Address } from "viem";
import { useBalance } from "../chain/balance";
import { DepositScreen } from "./DepositScreen";
import { LoginScreen } from "./LoginScreen";
import { useFarcaster } from "./FarcasterContext";
import { WalletConnector } from "./WalletConnector";
import { useDisconnect } from "wagmi";

export default function Home() {
  const [addrName, setAddrName] = useState("");
  const [addr, setAddr] = useState<Address | undefined>(undefined);
  const { balance, transactions, refetch } = useBalance({ address: addr });
  const { 
    address: farcasterAddress, 
    username, 
    displayName,
    isConnected: isFarcasterConnected,
  } = useFarcaster();
  const { disconnect } = useDisconnect();

  // Load saved address from localStorage on initial load only for non-Farcaster users
  useEffect(() => {
    // If we're not using Farcaster, try to load from localStorage
    if (!isFarcasterConnected && !addr && typeof window !== "undefined") {
      const savedAddr = localStorage.getItem("addr");
      const savedAddrName = localStorage.getItem("addrName");
      
      if (savedAddr) {
        try {
          setAddr(getAddress(savedAddr) as `0x${string}`);
          if (savedAddrName) {
            setAddrName(savedAddrName);
          } else {
            setAddrName(savedAddr);
          }
        } catch {
          // Invalid address in localStorage
          localStorage.removeItem("addr");
          localStorage.removeItem("addrName");
        }
      }
    }
  }, [isFarcasterConnected, addr]);

  // Auto-connect for Farcaster users
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

  // Save address to localStorage when it changes
  useEffect(() => {
    if (addr && !isFarcasterConnected) {
      localStorage.setItem("addr", addr);
      if (addrName) {
        localStorage.setItem("addrName", addrName);
      }
    }
  }, [addr, addrName, isFarcasterConnected]);

  async function handleLogout() {
    // First disconnect the wallet (do this first to avoid UI flickering)
    try {
      disconnect();
      // Wait a small amount of time to ensure disconnect completes
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (e) {
      console.error("Error disconnecting wallet:", e);
    }
    
    // Then clear state and localStorage
    setAddrName("");
    setAddr(undefined);
    
    // Clear localStorage for non-Farcaster users
    if (!isFarcasterConnected) {
      localStorage.removeItem("addr");
      localStorage.removeItem("addrName");
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-start p-4 font-[system-ui,sans-serif] mt-8">
      <WalletConnector 
        onAddressChange={handleAddressChange}
        onNameChange={handleNameChange}
      />
      <h1 className="text-3xl mb-1">🔷</h1>
      <h1 className="text-4xl font-bold mb-2">Bluestake</h1>
      <p className="text-sm font-medium mb-8 text-gray-600 uppercase tracking-wider">
        Convert any currency to Digital dollars earning safe yield
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
          transactions={transactions}
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
