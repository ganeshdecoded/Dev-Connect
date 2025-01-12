import { createContext, useContext, useState, useCallback } from 'react';
import Web3 from 'web3';

const Web3Context = createContext();

export function Web3Provider({ children }) {
  const [web3, setWeb3] = useState(null);
  const [account, setAccount] = useState(null);

  const connectWallet = useCallback(async () => {
    if (window.ethereum) {
      try {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const web3Instance = new Web3(window.ethereum);
        const accounts = await web3Instance.eth.getAccounts();
        
        setWeb3(web3Instance);
        setAccount(accounts[0]);

        window.ethereum.on('accountsChanged', (accounts) => {
          setAccount(accounts[0] || null);
        });

        window.ethereum.on('chainChanged', () => {
          window.location.reload();
        });

        return accounts[0];
      } catch (error) {
        console.error('User denied account access', error);
        throw error;
      }
    } else {
      console.error('Please install MetaMask!');
      alert('Please install MetaMask to use this feature!');
      throw new Error('No ethereum wallet found');
    }
  }, []);

  const disconnectWallet = useCallback(() => {
    setWeb3(null);
    setAccount(null);
    // Remove event listeners
    if (window.ethereum) {
      window.ethereum.removeAllListeners('accountsChanged');
      window.ethereum.removeAllListeners('chainChanged');
    }
  }, []);

  return (
    <Web3Context.Provider value={{ web3, account, connectWallet, disconnectWallet }}>
      {children}
    </Web3Context.Provider>
  );
}

export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
}; 