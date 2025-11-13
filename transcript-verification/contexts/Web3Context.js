'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { connectWallet, formatAddress } from '@/lib/web3';
import toast from 'react-hot-toast';

const Web3Context = createContext();

export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error('useWeb3 must be used within Web3Provider');
  }
  return context;
};

export const Web3Provider = ({ children }) => {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [chainId, setChainId] = useState(null);

  const connect = async () => {
    setIsConnecting(true);
    try {
      const { address, provider: web3Provider, signer: web3Signer } = await connectWallet();
      setAccount(address);
      setProvider(web3Provider);
      setSigner(web3Signer);
      
      const network = await web3Provider.getNetwork();
      setChainId(Number(network.chainId));
      
      toast.success(`Connected: ${formatAddress(address)}`);
      
      // Store in localStorage
      localStorage.setItem('walletConnected', 'true');
    } catch (error) {
      console.error('Connection error:', error);
      toast.error(error.message || 'Failed to connect wallet');
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnect = () => {
    setAccount(null);
    setProvider(null);
    setSigner(null);
    setChainId(null);
    localStorage.removeItem('walletConnected');
    toast.success('Wallet disconnected');
  };

  // Auto-connect on mount if previously connected
  useEffect(() => {
    const wasConnected = localStorage.getItem('walletConnected');
    if (wasConnected === 'true') {
      connect();
    }
  }, []);

  // Listen for account changes
  useEffect(() => {
    if (typeof window !== 'undefined' && window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length === 0) {
          disconnect();
        } else {
          setAccount(accounts[0]);
        }
      });

      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      });
    }

    return () => {
      if (typeof window !== 'undefined' && window.ethereum) {
        window.ethereum.removeAllListeners('accountsChanged');
        window.ethereum.removeAllListeners('chainChanged');
      }
    };
  }, []);

  const value = {
    account,
    provider,
    signer,
    chainId,
    isConnecting,
    isConnected: !!account,
    connect,
    disconnect,
  };

  return (
    <Web3Context.Provider value={value}>{children}</Web3Context.Provider>
  );
};