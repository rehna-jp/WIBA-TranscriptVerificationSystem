import { ethers } from 'ethers';

// 🔹 Safe helper to get the actual Ethereum provider (handles multiple)
const getInjectedProvider = () => {
  if (typeof window === 'undefined') return null;
  const eth = window.ethereum;
  if (!eth) return null;

  // If multiple providers exist, prefer MetaMask
  if (Array.isArray(eth.providers)) {
    const metamask = eth.providers.find((p) => p.isMetaMask);
    return metamask || eth.providers[0];
  }

  return eth;
};

// 🔹 Get provider
export const getProvider = () => {
  const injected = getInjectedProvider();
  if (injected) {
    return new ethers.BrowserProvider(injected);
  }

  // Fallback to RPC (for read-only actions)
  return new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL);
};

// 🔹 Get signer
export const getSigner = async () => {
  const injected = getInjectedProvider();
  if (injected) {
    const provider = new ethers.BrowserProvider(injected);
    return await provider.getSigner();
  }
  throw new Error('No Ethereum provider found');
};

// 🔹 Connect wallet (main entry)
export const connectWallet = async () => {
  const injected = getInjectedProvider();
  if (!injected) throw new Error('Please install MetaMask or another wallet');

  try {
    const provider = new ethers.BrowserProvider(injected);

    // Request wallet access
    await provider.send('eth_requestAccounts', []);

    const signer = await provider.getSigner();
    const address = await signer.getAddress();
    const network = await provider.getNetwork();

    const expectedChainId = BigInt(process.env.NEXT_PUBLIC_CHAIN_ID);
    if (network.chainId !== expectedChainId) {
      await switchNetwork();
    }

    return { address, provider, signer };
  } catch (error) {
    console.error('Error connecting wallet:', error);
    throw error;
  }
};

// 🔹 Switch network
export const switchNetwork = async () => {
  const injected = getInjectedProvider();
  if (!injected) throw new Error('No injected provider found');

  try {
    await injected.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: `0x${parseInt(process.env.NEXT_PUBLIC_CHAIN_ID).toString(16)}` }],
    });
  } catch (switchError) {
    if (switchError.code === 4902) {
      try {
        await injected.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: `0x${parseInt(process.env.NEXT_PUBLIC_CHAIN_ID).toString(16)}`,
              chainName: 'Ethereum Sepolia Testnet',
              nativeCurrency: {
                name: 'Ethereum',
                symbol: 'ETH',
                decimals: 18,
              },
              rpcUrls: [process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL],
              blockExplorerUrls: ['https://sepolia.etherscan.io'],
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

// 🔹 Address formatter
export const formatAddress = (address) => {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

// 🔹 Address validation
export const isValidAddress = (address) => ethers.isAddress(address);
