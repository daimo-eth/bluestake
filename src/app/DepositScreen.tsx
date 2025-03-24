import { useState } from "react";
import { DepositButton } from "./DepositButton";
import ReactConfetti from "react-confetti";
import { Deposit } from "@/chain/balance";
import { formatDistanceToNow } from "date-fns";

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
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <p className="text-2xl font-bold">{balance == null ? "..." : `$${balance.toFixed(2)}`}</p>
            <p className="text-sm text-green-600 flex items-center gap-1">
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
              6.14% APY
            </p>
          </div>
          <div className="text-right">
            <p className="font-medium">{addressName}</p>
            <button
              onClick={onLogout}
              className="text-gray-400 hover:text-gray-600 text-sm px-2 py-1 rounded cursor-pointer"
            >
              logout
            </button>
          </div>
        </div>
        <DepositButton
          recipientAddr={address}
          refetch={refetch}
          showMore={balance != null && balance > 0}
          onPaymentSucceeded={() => setShowConfetti(true)}
        />
        <div className="mt-6">
          <p className="text-xs font-medium text-gray-600 uppercase tracking-wider mb-2">
            { deposits.length === 0 ? "NO DEPOSITS YET" : "RECENT DEPOSITS"}
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
                  className="flex justify-between text-sm py-3 px-6 -mx-6 rounded hover:bg-gray-50 transition-colors"
                >
                  <span>${deposit.amountUsd.toFixed(2)}</span>
                  <span className="text-gray-500">
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
