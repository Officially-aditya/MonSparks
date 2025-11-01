import React, { createContext, useContext, useState, useEffect } from "react";
import { BrowserProvider, JsonRpcSigner } from "ethers";

interface Web3ContextType {
  account: string | null;
  provider: BrowserProvider | null;
  signer: JsonRpcSigner | null;
  chainId: number | null;
  isConnected: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  balance: string;
}

const Web3Context = createContext<Web3ContextType>({
  account: null,
  provider: null,
  signer: null,
  chainId: null,
  isConnected: false,
  connect: async () => {},
  disconnect: () => {},
  balance: "0",
});

export const useWeb3 = () => useContext(Web3Context);

export const Web3Provider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [account, setAccount] = useState<string | null>(null);
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [signer, setSigner] = useState<JsonRpcSigner | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [balance, setBalance] = useState<string>("0");

  const connect = async () => {
    try {
      if (typeof window.ethereum === "undefined") {
        alert("Please install MetaMask or another Web3 wallet");
        return;
      }

      const browserProvider = new BrowserProvider(window.ethereum);
      const accounts = await browserProvider.send("eth_requestAccounts", []);
      const network = await browserProvider.getNetwork();
      const userSigner = await browserProvider.getSigner();

      setProvider(browserProvider);
      setSigner(userSigner);
      setAccount(accounts[0]);
      setChainId(Number(network.chainId));

      // Get balance
      const bal = await browserProvider.getBalance(accounts[0]);
      setBalance((Number(bal) / 1e18).toFixed(4));
    } catch (error) {
      console.error("Error connecting wallet:", error);
    }
  };

  const disconnect = () => {
    setAccount(null);
    setProvider(null);
    setSigner(null);
    setChainId(null);
    setBalance("0");
  };

  // Listen for account changes
  useEffect(() => {
    if (typeof window.ethereum !== "undefined") {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnect();
        } else {
          setAccount(accounts[0]);
          // Update balance
          if (provider) {
            provider.getBalance(accounts[0]).then((bal) => {
              setBalance((Number(bal) / 1e18).toFixed(4));
            });
          }
        }
      };

      const handleChainChanged = () => {
        window.location.reload();
      };

      window.ethereum.on("accountsChanged", handleAccountsChanged);
      window.ethereum.on("chainChanged", handleChainChanged);

      return () => {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
        window.ethereum.removeListener("chainChanged", handleChainChanged);
      };
    }
  }, [provider]);

  // Auto-connect if previously connected
  useEffect(() => {
    const autoConnect = async () => {
      if (typeof window.ethereum !== "undefined") {
        try {
          const browserProvider = new BrowserProvider(window.ethereum);
          const accounts = await browserProvider.send("eth_accounts", []);
          if (accounts.length > 0) {
            await connect();
          }
        } catch (error) {
          console.error("Auto-connect failed:", error);
        }
      }
    };

    autoConnect();
  }, []);

  const value: Web3ContextType = {
    account,
    provider,
    signer,
    chainId,
    isConnected: !!account,
    connect,
    disconnect,
    balance,
  };

  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>;
};
