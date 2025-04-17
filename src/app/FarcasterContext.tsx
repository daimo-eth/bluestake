"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { sdk } from "@farcaster/frame-sdk";
import { Address, isAddress } from "viem";
import { v4 as uuidv4 } from "uuid";

interface FarcasterContextType {
  isConnected: boolean;
  fid?: number;
  username?: string;
  displayName?: string;
  profileImage?: string;
  address?: Address;
  loading: boolean;
  error: string | null;
}

const FarcasterContext = createContext<FarcasterContextType>({
  isConnected: false,
  loading: true,
  error: null
});

export const useFarcaster = () => useContext(FarcasterContext);

export function FarcasterProvider({ children }: { children: React.ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const [fid, setFid] = useState<number | undefined>();
  const [username, setUsername] = useState<string | undefined>();
  const [displayName, setDisplayName] = useState<string | undefined>();
  const [profileImage, setProfileImage] = useState<string | undefined>();
  const [address, setAddress] = useState<Address | undefined>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const context = await sdk.context;
        
        if (context?.user?.fid) {
          setFid(context.user.fid);
          setUsername(context.user.username);
          setDisplayName(context.user.displayName);
          setProfileImage(context.user.pfpUrl);
          setIsConnected(true);

          try {
            const nonce = uuidv4();
            const result = await sdk.actions.signIn({ 
              nonce,
              expirationTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
            });
            
            if (result) {
              const messageStr = result.message;
              const addressMatch = messageStr.match(/(?:0x[a-fA-F0-9]{40})/);
              if (addressMatch && addressMatch[0] && isAddress(addressMatch[0])) {
                setAddress(addressMatch[0] as Address);
              }
            }
          } catch (signInError) {
            console.warn("Silent sign-in failed:", signInError);
          }
        }

        await sdk.actions.ready({
          disableNativeGestures: true
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to initialize SDK");
        console.error("SDK initialization error:", err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return (
    <FarcasterContext.Provider
      value={{
        isConnected,
        fid,
        username,
        displayName,
        profileImage,
        address,
        loading,
        error
      }}
    >
      {children}
    </FarcasterContext.Provider>
  );
} 