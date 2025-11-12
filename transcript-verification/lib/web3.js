import { ethers } from 'ethers';

export const getProvider = () => {
  if (typeof window !== 'undefined' && window.ethereum) {
    return new ethers.BrowserProvider(window.ethereum);
  }
  // Fallback to RPC provider
  return new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_POLYGON_RPC_URL);
};

export const getSigner = async () => {
  if (typeof window !== 'undefined' && window.ethereum) {
    const provider = new ethers.BrowserProvider(window.ethereum);
    return await provider.getSigner();
  }
  throw new Error('No Ethereum provider found');
};

export const connectWallet = async () => {
  if (typeof window !== 'undefined' && window.ethereum) {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send('eth_requestAccounts', []);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      const network = await provider.getNetwork();
      
      // Check if on correct network
      if (network.chainId !== BigInt(process.env.NEXT_PUBLIC_CHAIN_ID)) {
        await switchNetwork();
      }
      
      return { address, provider, signer };
    } catch (error) {
      console.error('Error connecting wallet:', error);
      throw error;
    }
  } else {
    throw new Error('Please install MetaMask');
  }
};

export const switchNetwork = async () => {
  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: `0x${parseInt(process.env.NEXT_PUBLIC_CHAIN_ID).toString(16)}` }],
    });
  } catch (switchError) {
    // Network not added, try to add it
    if (switchError.code === 4902) {
      try {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: `0x${parseInt(process.env.NEXT_PUBLIC_CHAIN_ID).toString(16)}`,
              chainName: 'Polygon Mumbai Testnet',
              nativeCurrency: {
                name: 'MATIC',
                symbol: 'MATIC',
                decimals: 18,
              },
              rpcUrls: [process.env.NEXT_PUBLIC_POLYGON_RPC_URL],
              blockExplorerUrls: ['https://mumbai.polygonscan.com/'],
            },
          ],
        });
      } catch (addError) {
        throw addError;
      }
    } else {
      throw switchError;
    }
  }
};

export const formatAddress = (address) => {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export const isValidAddress = (address) => {
  return ethers.isAddress(address);
};
