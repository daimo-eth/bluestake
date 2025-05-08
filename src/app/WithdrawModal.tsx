"use client";

import { Dispatch, SetStateAction } from "react";
import { createPortal } from "react-dom";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onWithdraw: (amount: number) => void;
  balance: number;
  amount: string;
  setAmount: Dispatch<SetStateAction<string>>;
  isWithdrawing: boolean;
};

export default function WithdrawModal({
  isOpen,
  onClose,
  onWithdraw,
  balance,
  amount,
  setAmount,
  isWithdrawing,
}: Props) {
  if (!isOpen) return null;

  const handleAmountChange = (value: string) => {
    // Don't allow non-numeric values except decimal point
    if (!/^[0-9]*\.?[0-9]*$/.test(value) && value !== "") {
      return;
    }
    
    // Don't allow more than 2 decimal places
    if (value.includes(".") && value.split(".")[1]?.length > 2) {
      return;
    }

    // Don't allow more than the balance
    const numValue = parseFloat(value || "0");
    if (numValue > balance) {
      setAmount(balance.toString());
      return;
    }

    setAmount(value);
  };

  const handleSubmit = () => {
    const amountValue = parseFloat(amount);
    if (amountValue > 0 && amountValue <= balance) {
      onWithdraw(amountValue);
    }
  };

  const handleMaxClick = () => {
    setAmount(balance.toString());
  };

  if (typeof window === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold dark:text-white">Withdraw USDC</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="mb-6">
          <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
            Available Balance
          </label>
          <p className="text-2xl font-bold dark:text-white">${balance.toFixed(2)}</p>
        </div>

        <div className="mb-6">
          <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
            Withdraw Amount
          </label>
          <div className="relative">
            <span className="absolute left-3 top-2 text-gray-500 dark:text-gray-400">
              $
            </span>
            <input
              type="number"
              inputMode="decimal"
              className="w-full py-2 pl-7 pr-3 bg-transparent text-2xl font-bold border-b-2 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none dark:text-white"
              value={amount}
              onChange={(e) => handleAmountChange(e.target.value)}
              placeholder="0.00"
            />
          </div>
          <button
            onClick={handleMaxClick}
            className="mt-2 px-3 py-1 text-sm font-medium text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Use Max
          </button>
        </div>

        <button
          onClick={handleSubmit}
          disabled={!amount || parseFloat(amount) <= 0 || parseFloat(amount) > balance || isWithdrawing}
          className={`w-full py-3 rounded-lg text-white text-lg font-medium 
            ${
              !amount || parseFloat(amount) <= 0 || parseFloat(amount) > balance || isWithdrawing
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-amber-500 hover:bg-amber-600"
            }
          `}
        >
          {isWithdrawing ? "Processing..." : "Withdraw"}
        </button>
      </div>
    </div>,
    document.body
  );
} 