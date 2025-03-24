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

  if (!balance) return null;

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
            <p className="text-2xl font-bold">${balance.toFixed(2)}</p>
            <p className="text-sm text-gray-500">6.14% APY</p>
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
          showMore={balance > 0}
          onPaymentSucceeded={() => setShowConfetti(true)}
        />
        <div className="mt-6">
          <h3 className="font-medium mb-2">Recent Deposits</h3>
          <div className="space-y-2">
            {[...deposits]
              .sort((a, b) => b.timestamp - a.timestamp)
              .map((deposit, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span>${deposit.amountUsd.toFixed(2)}</span>
                  <span className="text-gray-500">
                    {formatDistanceToNow(deposit.timestamp * 1000, { addSuffix: true })}
                  </span>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
