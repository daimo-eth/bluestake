"use client";

import { useState, useEffect } from "react";
import { WITHDRAW_CONTRACT_ABI, BASE_WITHDRAW_CONTRACT_ADDR, BASE_USDC_ADDR, BASE_CHAIN_ID } from "../chain/yield";
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useSwitchChain, useChainId, useConnect, injected } from "wagmi";
import { createPortal } from "react-dom";
import { parseUnits } from "viem";
import ReactConfetti from "react-confetti";

type Props = {
  balance: number | undefined;
  refetch: () => Promise<void>;
  address: `0x${string}`;
};

export function WithdrawButton({ balance, refetch, address }: Props) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [chainSwitchError, setChainSwitchError] = useState<string | null>(null);
  const [addressMismatchError, setAddressMismatchError] = useState<boolean>(false);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  
  const { address: connectedAddress, isConnected } = useAccount();
  const { connect, isPending: isConnectPending } = useConnect();
  const { switchChain } = useSwitchChain();
  const currentChainId = useChainId();
  
  // Set up contract write
  const { 
    writeContract, 
    data: hash,
    error: writeError,
    isPending: isWritePending
  } = useWriteContract();

  // Wait for transaction
  const { 
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    error: confirmError
  } = useWaitForTransactionReceipt({
    hash,
  });
  
  // Handle successful transaction
  useEffect(() => {
    if (isConfirmed && hash) {
      // Transaction successful
      setIsModalOpen(false);
      refetch();
      setIsWithdrawing(false);
      setAddressMismatchError(false);
      
      // Show success animation
      setShowSuccessAnimation(true);
      
      // Hide the animation after a few seconds
      setTimeout(() => {
        setShowSuccessAnimation(false);
      }, 8000);
    }
  }, [isConfirmed, hash, refetch]);

  const handleOpenModal = () => {
    setAmount("");
    
    // If wallet is connected, check address match
    if (isConnected) {
      if (connectedAddress && address && connectedAddress.toLowerCase() !== address.toLowerCase()) {
        setAddressMismatchError(true);
      } else {
        setAddressMismatchError(false);
      }
    }
    
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    if (!isWithdrawing && !isConnectPending) {
      setIsModalOpen(false);
      setAddressMismatchError(false);
    }
  };

  const handleConnectWallet = () => {
      connect({ connector: injected()});
  };

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
    if (numValue > balance!) {
      setAmount(balance!.toString());
      return;
    }

    setAmount(value);
  };

  const handleMaxClick = () => {
    setAmount(balance?.toString() || "0");
  };

  const handleSubmit = () => {
    // If not connected, connect wallet first
    if (!isConnected) {
      handleConnectWallet();
      return;
    }
    
    const amountValue = parseFloat(amount);
    if (amountValue > 0 && amountValue <= (balance || 0)) {
      handleWithdraw(amountValue);
    }
  };

  const handleWithdraw = async (amountToWithdraw: number) => {
    if (!connectedAddress || !balance || balance <= 0 || amountToWithdraw <= 0) {
      return;
    }

    // Verify address match
    if (address.toLowerCase() !== connectedAddress.toLowerCase()) {
      setAddressMismatchError(true);
      return;
    }

    try {
      setIsWithdrawing(true);
      setChainSwitchError(null);
      setAddressMismatchError(false);
      
      // Check if we need to switch chains
      if (currentChainId !== BASE_CHAIN_ID) {
        try {
          // Attempt to switch to the Base network
          await switchChain({ chainId: BASE_CHAIN_ID });
        } catch (switchError) {
          console.error("Failed to switch chain:", switchError);
          setChainSwitchError("Please switch your wallet to the Base network to withdraw.");
          setIsWithdrawing(false);
          return;
        }
      }
      
      // Convert amount to wei (USDC has 6 decimals)
      const amountInWei = parseUnits(amountToWithdraw.toString(), 6);
      
      // Call the contract using the correct function
      writeContract({
        address: BASE_WITHDRAW_CONTRACT_ADDR,
        abi: WITHDRAW_CONTRACT_ABI,
        functionName: 'withdraw',
        chainId: BASE_CHAIN_ID,
        args: [
          BASE_USDC_ADDR,                     // asset
          amountInWei,                        // amount
          connectedAddress,                   // to (receiver address)
        ],
      });
      
    } catch (error) {
      console.error("Withdraw error:", error);
      setIsWithdrawing(false);
    }
  };

  // Reset withdrawing state when transaction fails
  useEffect(() => {
    if (writeError || confirmError) {
      setIsWithdrawing(false);
    }
  }, [writeError, confirmError]);

  // Handle error messages
  const getErrorMessage = () => {
    // Address mismatch takes priority
    if (addressMismatchError) {
      return "Only the owner of this address can withdraw funds. Please connect your wallet with the correct address.";
    }
    
    if (chainSwitchError) return chainSwitchError;
    
    if (writeError || confirmError) {
      const error = writeError || confirmError;
      const errorMsg = error?.message || "";
      
      // Check for user rejected messages
      if (
        errorMsg.includes("User rejected") || 
        errorMsg.includes("user rejected") ||
        errorMsg.includes("rejected the request")
      ) {
        return "Transaction cancelled";
      }
      
      // Return a generic error for other cases
      return `Error: ${errorMsg}`;
    }
    
    return null;
  };
  
  const errorMessage = getErrorMessage();

  return (
    <>
      {showSuccessAnimation && typeof window !== "undefined" && (
        <ReactConfetti
          width={window.innerWidth}
          height={window.innerHeight}
          numberOfPieces={300}
          recycle={false}
          gravity={0.1}
          colors={['#f59e0b', '#fbbf24', '#fde68a', '#fed7aa']} // Amber theme colors
          onConfettiComplete={() => setShowSuccessAnimation(false)}
        />
      )}
    
      <button
        onClick={handleOpenModal}
        disabled={!balance || balance <= 0}
        className={`w-full px-8 py-4 mt-3 bg-amber-500 text-white text-lg font-medium rounded-lg hover:bg-amber-600 transition-colors cursor-pointer ${
          !balance || balance <= 0 ? "opacity-50 cursor-not-allowed" : ""
        }`}
      >
        Withdraw
      </button>

      {isModalOpen && typeof window !== "undefined" && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-xl font-bold dark:text-white">Withdraw USDC</h2>
              </div>
              <button
                onClick={handleCloseModal}
                disabled={isWithdrawing || isConnectPending}
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

            {!isConnected ? (
              // Show connect wallet UI when not connected
              <div className="mb-6 text-center">
                <p className="mb-4 dark:text-white">Connect your wallet to withdraw your funds.</p>
                <button
                  onClick={handleConnectWallet}
                  disabled={isConnectPending}
                  className="w-full py-3 rounded-lg text-white text-lg font-medium bg-blue-500 hover:bg-blue-600"
                >
                  {isConnectPending ? "Connecting..." : "Connect Wallet"}
                </button>
              </div>
            ) : (
              // Show withdraw UI when connected
              <>
                <div className="mb-6">
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Available Balance
                  </label>
                  <p className="text-2xl font-bold dark:text-white">${(balance || 0).toFixed(2)}</p>
                  <p className="text-xs text-gray-500 mt-1">Withdrawals must be processed on the Base network.</p>
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
                      disabled={isWithdrawing}
                    />
                  </div>
                  <button
                    onClick={handleMaxClick}
                    disabled={isWithdrawing}
                    className={`mt-2 px-3 py-1 text-sm font-medium text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 ${
                      isWithdrawing ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    Use Max
                  </button>
                </div>

                {errorMessage && (
                  <div className="mb-4 p-2 bg-red-50 border border-red-200 text-gray-700 rounded text-sm flex items-center">
                    <svg className="w-4 h-4 mr-2 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {errorMessage}
                  </div>
                )}

                <button
                  onClick={handleSubmit}
                  disabled={!amount || parseFloat(amount) <= 0 || parseFloat(amount) > (balance || 0) || isWithdrawing}
                  className={`w-full py-3 rounded-lg text-white text-lg font-medium 
                    ${
                      !amount || parseFloat(amount) <= 0 || parseFloat(amount) > (balance || 0) || isWithdrawing
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-amber-500 hover:bg-amber-600"
                    }
                  `}
                >
                  {isWritePending || isConfirming ? "Processing..." : "Withdraw"}
                </button>
              </>
            )}
          </div>
        </div>,
        document.body
      )}
    </>
  );
} 