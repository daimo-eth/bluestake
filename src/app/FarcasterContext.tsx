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
  signIn: () => Promise<void>;
  logout: () => void;
  isFarcasterEnvironment: boolean;
  autoSignInAttempted: boolean;
}

// Helper to detect if we're in a Farcaster environment
const detectFarcasterEnvironment = (): boolean => {
  if (typeof window === "undefined") return false;
  
  return (
    window.location.href.includes("warpcast.com") || 
    window.location.hostname.includes("farcaster") ||
    // Check if we're in an iframe that could be a Farcaster client
    (window.self !== window.top)
  );
};

const FarcasterContext = createContext<FarcasterContextType>({
  isConnected: false,
  loading: true,
  signIn: async () => {},
  logout: () => {},
  isFarcasterEnvironment: false,
  autoSignInAttempted: false
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
  const [autoSignInAttempted, setAutoSignInAttempted] = useState(false);

  // Initialize Farcaster SDK and detect environment
  useEffect(() => {
    const initFarcaster = async () => {
      try {
        // Check if we're in a Farcaster environment
        const isInFarcasterEnv = detectFarcasterEnvironment();
        setIsFarcasterEnvironment(isInFarcasterEnv);
        
        // If not in a Farcaster environment, don't initialize the SDK
        if (!isInFarcasterEnv) {
          setLoading(false);
          setAutoSignInAttempted(true);
          return;
        }

        // Signal that the app is ready to be displayed
        await sdk.actions.ready();
        
        // Check if we're running inside a Farcaster Mini App
        const context = await sdk.context;
        if (context?.user?.fid) {
          setFid(context.user.fid);
          setUsername(context.user.username);
          setDisplayName(context.user.displayName);
          setProfileImage(context.user.pfpUrl);
          
          // Attempt automatic sign-in for users coming from Farcaster
          try {
            await silentSignIn();
          } catch (err) {
            console.warn("Silent sign-in failed, user may need to sign in manually", err);
            // Even if silent sign-in fails, we still have the user context information
            // So we can show their profile info and prompt for explicit sign-in
          }
        }
      } catch (error) {
        console.error("Error initializing Farcaster:", error);
      } finally {
        setLoading(false);
        setAutoSignInAttempted(true);
      }
    };

    initFarcaster();
  }, []);

  // Silent sign-in attempt that doesn't show loading state
  const silentSignIn = async () => {
    if (!isFarcasterEnvironment) {
      return;
    }

    try {
      // Generate a nonce for the sign-in request
      const nonce = uuidv4();
      
      // Request authentication from the Farcaster client
      const result = await sdk.actions.signIn({ 
        nonce,
        expirationTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      });
      
      if (result) {
        setIsConnected(true);
        
        // Parse the message to extract user data
        try {
          const messageStr = result.message;
          
          // Check if the message contains an Ethereum address
          const addressMatch = messageStr.match(/(?:0x[a-fA-F0-9]{40})/);
          if (addressMatch && addressMatch[0] && isAddress(addressMatch[0])) {
            setAddress(addressMatch[0] as Address);
          }
          
          // Extract FID if present in the message
          const fidMatch = messageStr.match(/fid:(\d+)/);
          if (fidMatch && fidMatch[1]) {
            setFid(parseInt(fidMatch[1], 10));
          }
        } catch (e) {
          console.error("Error parsing Farcaster sign-in message:", e);
        }
      }
    } catch (error) {
      // Silent failure for automatic sign-in
      console.warn("Silent sign-in attempt failed:", error);
      throw error; // Rethrow so caller knows it failed
    }
  };

  // User-initiated sign-in with loading state
  const signIn = async () => {
    // Don't attempt sign-in if not in a Farcaster environment
    if (!isFarcasterEnvironment) {
      console.warn("Cannot sign in with Farcaster outside of Farcaster environment");
      return;
    }

    try {
      setLoading(true);
      
      // Generate a nonce for the sign-in request
      const nonce = uuidv4();
      
      // Request authentication from the Farcaster client
      const result = await sdk.actions.signIn({ 
        nonce,
        // Optional: Set expiration time (24 hours from now)
        expirationTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      });
      
      if (result) {
        setIsConnected(true);
        
        // Parse the message to extract user data
        // The message is a string in SIWE format containing user info
        try {
          const messageStr = result.message;
          
          // Check if the message contains an Ethereum address
          const addressMatch = messageStr.match(/(?:0x[a-fA-F0-9]{40})/);
          if (addressMatch && addressMatch[0] && isAddress(addressMatch[0])) {
            setAddress(addressMatch[0] as Address);
          }
          
          // Extract FID if present in the message
          const fidMatch = messageStr.match(/fid:(\d+)/);
          if (fidMatch && fidMatch[1]) {
            setFid(parseInt(fidMatch[1], 10));
          }
        } catch (e) {
          console.error("Error parsing Farcaster sign-in message:", e);
        }
      }
    } catch (error) {
      console.error("Error signing in with Farcaster:", error);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    // Reset all Farcaster-related state
    setIsConnected(false);
    setFid(undefined);
    setUsername(undefined);
    setDisplayName(undefined);
    setProfileImage(undefined);
    setAddress(undefined);
    
    // If in a Farcaster environment, attempt to close the app or reset the session
    if (isFarcasterEnvironment) {
      try {
        // In some Farcaster clients, closing the app is the proper way to "log out"
        sdk.actions.close().catch(error => {
          console.warn("Unable to close Farcaster Mini App:", error);
        });
      } catch (error) {
        console.error("Error during Farcaster logout:", error);
      }
    }
  };

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
        signIn,
        logout,
        isFarcasterEnvironment,
        autoSignInAttempted
      }}
    >
      {children}
    </FarcasterContext.Provider>
  );
} 