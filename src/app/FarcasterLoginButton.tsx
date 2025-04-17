"use client";

import { useFarcaster } from "./FarcasterContext";

export function FarcasterLoginButton() {
  const { 
    signIn, 
    loading, 
    isFarcasterEnvironment, 
    isConnected, 
    autoSignInAttempted 
  } = useFarcaster();

  // Don't render the button if not in a Farcaster environment
  if (!isFarcasterEnvironment) {
    return null;
  }

  // If already connected, show a success state instead of the button
  if (isConnected && autoSignInAttempted) {
    return (
      <div className="flex items-center justify-center gap-2 w-full px-4 py-2 mt-2 bg-green-100 text-green-800 rounded-md border border-green-200">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="16" 
          height="16" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
        <span>Connected with Farcaster</span>
      </div>
    );
  }

  return (
    <button
      onClick={() => signIn()}
      disabled={loading}
      className="flex items-center justify-center gap-2 w-full px-4 py-2 mt-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      ) : (
        <svg
          width="16"
          height="16"
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M16 31C24.2843 31 31 24.2843 31 16C31 7.71573 24.2843 1 16 1C7.71573 1 1 7.71573 1 16C1 24.2843 7.71573 31 16 31Z"
            fill="white"
          />
          <path
            d="M21.5 14.5H23V17.5H21.5V14.5Z"
            fill="#6B37FF"
          />
          <path
            d="M9 14.5H10.5V17.5H9V14.5Z"
            fill="#6B37FF"
          />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M16 7.5C11.5817 7.5 8 11.0817 8 15.5V16.5C8 20.9183 11.5817 24.5 16 24.5C20.4183 24.5 24 20.9183 24 16.5V15.5C24 11.0817 20.4183 7.5 16 7.5ZM10.5 15.5V18.5H12V15.5H10.5ZM20 18.5V15.5H21.5V18.5H20Z"
            fill="#6B37FF"
          />
        </svg>
      )}
      {loading ? "Connecting..." : "Connect with Farcaster"}
    </button>
  );
} 