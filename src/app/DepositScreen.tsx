import { useState } from "react";
import { DepositButton } from "./DepositButton";
import ReactConfetti from "react-confetti";
import { Deposit } from "@/chain/balance";
import { formatDistanceToNow } from "date-fns";
import { useFarcaster } from "./FarcasterContext";
import { sdk } from "@farcaster/frame-sdk";
import Image from "next/image";

type Props = {
  address: `0x${string}`;
  addressName: string;
  balance: number | undefined;
  deposits: Deposit[];
  refetch: () => Promise<void>;
  onLogout: () => void;
};

export function DepositScreen({
  address,
  addressName,
  balance,
  deposits,
  refetch,
  onLogout,
}: Props) {
  const [showConfetti, setShowConfetti] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { isConnected, displayName, username, profileImage } = useFarcaster();
  
  const userDisplayName = isConnected && displayName ? displayName : addressName;

  const handleLogout = () => {
    if (isConnected) {
      setIsLoggingOut(true);
      setTimeout(() => {
        onLogout();
        setIsLoggingOut(false);
      }, 300);
    } else {
      onLogout();
    }
  };

  return (
    <div className="w-full max-w-md">
      {showConfetti && (
        <ReactConfetti
          width={window.innerWidth}
          height={window.innerHeight}
          numberOfPieces={200}
          recycle={false}
          onConfettiComplete={() => setShowConfetti(false)}
        />
      )}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-1">
          <p className="text-2xl font-bold dark:text-white">
            {balance == null ? "..." : `$${balance.toFixed(2)}`}
          </p>
          <div className="flex flex-col items-end gap-2">
            {isConnected && profileImage && (
              <div className="relative w-10 h-10">
                <Image 
                  src={profileImage} 
                  alt={userDisplayName} 
                  fill
                  className="rounded-full object-cover"
                  sizes="40px"
                />
              </div>
            )}
            <div className="text-right">
              <p className="font-medium dark:text-white">{userDisplayName}</p>
              {isConnected && username && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  @{username}
                </p>
              )}
            </div>
          </div>
        </div>
        <div className="flex justify-between items-center mb-4">
          <div>
            <p className="text-sm flex items-center gap-1">
              <span className="text-green-600 dark:text-green-400">
                <ChartIcon />
              </span>
              <a 
                href="https://app.aave.com/reserve-overview/?underlyingAsset=0x833589fcd6edb6e08f4c7c32d4f71b54bda02913&marketName=proto_base_v3"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 hover:opacity-80"
                onClick={(e) => {
                  if (isConnected) {
                    e.preventDefault();
                    sdk.actions.openUrl("https://app.aave.com/reserve-overview/?underlyingAsset=0x833589fcd6edb6e08f4c7c32d4f71b54bda02913&marketName=proto_base_v3");
                  }
                }}
              >
                <span className="text-green-600 dark:text-green-400">6.28% APY</span>
                <span className="text-gray-500 dark:text-gray-400">powered by AAVE</span>
              </a>
            </p>
          </div>
          {!isConnected && (
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className={`text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300 text-sm px-2 py-1 cursor-pointer -mt-1 ${
                isLoggingOut ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {isLoggingOut ? "closing..." : "log out"}
            </button>
          )}
        </div>
        <DepositButton
          recipientAddr={address}
          refetch={refetch}
          showMore={balance != null && balance > 0}
          onPaymentSucceeded={() => setShowConfetti(true)}
        />
        <div className="mt-6">
          <p className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-2">
            {deposits.length === 0 ? "NO DEPOSITS YET" : "RECENT DEPOSITS"}
          </p>
          <div>
            {[...deposits]
              .sort((a, b) => b.timestamp - a.timestamp)
              .map((deposit, i) => (
                <a
                  key={i}
                  href={deposit.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex justify-between text-sm py-3 px-6 -mx-6 rounded hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-white transition-colors"
                >
                  <span>${deposit.amountUsd.toFixed(2)}</span>
                  <span className="text-gray-500 dark:text-gray-400">
                    {formatDistanceToNow(deposit.timestamp * 1000, {
                      addSuffix: true,
                    })}
                  </span>
                </a>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ChartIcon() {
  return (
    <svg
      className="w-4 h-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path
        d="M23 6l-9.5 9.5-5-5L1 18"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
