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
  isFarcasterEnvironment: boolean;
}

// Define interface for window with farcaster property
interface WindowWithFarcaster extends Window {
  farcaster?: unknown;
}

// Helper to detect if we're in a Farcaster environment
const detectFarcasterEnvironment = (): boolean => {
  if (typeof window === "undefined") return false;
  
  return (
    window.location.href.includes("warpcast.com") || 
    window.location.hostname.includes("farcaster") ||
    // Check if we're in an iframe that could be a Farcaster client
    (window.self !== window.top) ||
    // Check for farcaster object in window
    !!(window as WindowWithFarcaster).farcaster
  );
};

const FarcasterContext = createContext<FarcasterContextType>({
  isConnected: false,
  loading: true,
  isFarcasterEnvironment: false
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
  const [isFarcasterEnvironment, setIsFarcasterEnvironment] = useState(false);

  // Initialize Farcaster SDK and detect environment
  useEffect(() => {
    const initFarcaster = async () => {
      try {
        // Check if we're in a Farcaster environment
        const isInFarcasterEnv = detectFarcasterEnvironment();
        console.log("Farcaster environment detected:", isInFarcasterEnv);
        setIsFarcasterEnvironment(isInFarcasterEnv);
        
        // If not in a Farcaster environment, don't initialize the SDK
        if (!isInFarcasterEnv) {
          setLoading(false);
          return;
        }

        try {
          // Signal that the app is ready to be displayed
          await sdk.actions.ready();
          console.log("Farcaster SDK initialized successfully");
        } catch (sdkError) {
          console.error("Error initializing Farcaster SDK:", sdkError);
          setIsFarcasterEnvironment(false);
          setLoading(false);
          return;
        }
        
        // Get user context
        try {
          const context = await sdk.context;
          console.log("Farcaster context:", context);
          
          if (context?.user?.fid) {
            setFid(context.user.fid);
            setUsername(context.user.username);
            setDisplayName(context.user.displayName);
            setProfileImage(context.user.pfpUrl);
            
            // Set connected state since we have user info
            setIsConnected(true);
            
            // Attempt to get wallet address through silent sign-in
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
                  console.log("Extracted address from SIWE message:", addressMatch[0]);
                  setAddress(addressMatch[0] as Address);
                }
              }
            } catch (signInError) {
              console.warn("Silent sign-in failed:", signInError);
            }
          }
        } catch (contextError) {
          console.error("Error getting Farcaster context:", contextError);
        }
      } catch (error) {
        console.error("Error in Farcaster initialization:", error);
      } finally {
        setLoading(false);
      }
    };

    initFarcaster();
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
        isFarcasterEnvironment
      }}
    >
      {children}
    </FarcasterContext.Provider>
  );
} 