import { useState, useCallback } from "react";
import { toast } from "sonner";

/**
 * Web3 Transaction Verification Hook
 * Provides real-time blockchain verification for crypto payments
 */

export interface Web3VerificationState {
  isVerifying: boolean;
  txHash: string;
  result: {
    verified: boolean;
    confirmed: boolean;
    confirmations: number;
    blockNumber?: number;
    gasUsed?: string;
    status?: string;
    message: string;
  } | null;
  error: string | null;
}

export function useWeb3Verification() {
  const [state, setState] = useState<Web3VerificationState>({
    isVerifying: false,
    txHash: "",
    result: null,
    error: null,
  });

  const verifyTransaction = useCallback(
    async (
      currency: "BTC" | "ETH" | "USDT" | "USDC",
      txHash: string,
      paymentAddress: string,
      amount?: string
    ) => {
      if (!txHash.trim()) {
        setState((prev) => ({ ...prev, error: "Transaction hash is required" }));
        toast.error("Please enter a transaction hash");
        return;
      }

      setState((prev) => ({
        ...prev,
        isVerifying: true,
        error: null,
        txHash,
      }));

      try {
        // In production, this would call the backend Web3 verification endpoint
        // For now, we'll use the client-side verification (not recommended for production)

        const response = await fetch("/api/trpc/payments.verifyWeb3Transaction", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            input: {
              currency,
              txHash,
              toAddress: paymentAddress,
              amount,
            },
          }),
        });

        const data = await response.json();

        if (data.error) {
          setState((prev) => ({
            ...prev,
            isVerifying: false,
            error: data.error.message,
            result: null,
          }));
          toast.error(data.error.message);
          return;
        }

        const result = data.result;
        setState((prev) => ({
          ...prev,
          isVerifying: false,
          result: {
            verified: result.verified,
            confirmed: result.confirmed,
            confirmations: result.confirmations,
            blockNumber: result.blockNumber,
            gasUsed: result.gasUsed,
            status: result.status,
            message: result.message,
          },
        }));

        if (result.confirmed) {
          toast.success(result.message);
        } else {
          toast.info(result.message);
        }

        return result;
      } catch (error) {
        const message = error instanceof Error ? error.message : "Verification failed";
        setState((prev) => ({
          ...prev,
          isVerifying: false,
          error: message,
          result: null,
        }));
        toast.error(message);
      }
    },
    []
  );

  const reset = useCallback(() => {
    setState({
      isVerifying: false,
      txHash: "",
      result: null,
      error: null,
    });
  }, []);

  return {
    ...state,
    verifyTransaction,
    reset,
  };
}

/**
 * Get blockchain explorer URL for a transaction
 */
export function getExplorerUrl(
  currency: "BTC" | "ETH" | "USDT" | "USDC",
  txHash: string,
  network: "mainnet" | "testnet" = "mainnet"
): string {
  if (currency === "ETH" || currency === "USDT" || currency === "USDC") {
    return `https://etherscan.io/tx/${txHash}`;
  } else if (currency === "BTC") {
    return network === "testnet"
      ? `https://testnet.blockchain.com/tx/${txHash}`
      : `https://blockchain.com/tx/${txHash}`;
  }
  return "";
}

/**
 * Format transaction hash for display
 */
export function formatTxHash(txHash: string, length: number = 8): string {
  if (txHash.length <= length * 2) return txHash;
  return `${txHash.slice(0, length)}...${txHash.slice(-length)}`;
}

/**
 * Validate transaction hash format
 */
export function validateTxHash(txHash: string, currency: "BTC" | "ETH" | "USDT" | "USDC"): boolean {
  if (!txHash || !txHash.trim()) return false;

  if (currency === "ETH" || currency === "USDT" || currency === "USDC") {
    // Ethereum transaction hash: 0x + 64 hex characters
    return /^0x[a-fA-F0-9]{64}$/.test(txHash);
  } else if (currency === "BTC") {
    // Bitcoin transaction hash: 64 hex characters
    return /^[a-fA-F0-9]{64}$/.test(txHash);
  }

  return false;
}

/**
 * Get required confirmations for currency
 */
export function getRequiredConfirmations(currency: "BTC" | "ETH" | "USDT" | "USDC"): number {
  switch (currency) {
    case "BTC":
      return 3;
    case "ETH":
    case "USDT":
    case "USDC":
      return 12;
    default:
      return 1;
  }
}
