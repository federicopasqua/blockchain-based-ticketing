import { BrowserProvider, Contract } from 'ethers';
import { useEffect, useState } from 'react';
import { Msp } from '../navigation/home/planScreen';
import { unlockableTransportContractAbi, prepaidTicketsContractAbi } from './abi';
import { useWalletConnectModal } from '@walletconnect/modal-react-native';

export function useWcProvider() {
  const { provider, isConnected, address, open } = useWalletConnectModal();

  const [walletConnectProvider, setWalletConnectProvider] = useState<
    BrowserProvider | undefined
  >();

  useEffect(() => {
    const go = async () => {
      if (!isConnected || !provider) {
        setWalletConnectProvider(undefined);
        return;
      }

      const newProvider = new BrowserProvider(provider, {
        name: 'ticketing',
        chainId: 8118,
      });
      await newProvider?.send('wallet_switchEthereumChain', [{ chainId: '0x1fb6' }]);
      setWalletConnectProvider(newProvider);
    };
    go();
  }, [provider]);

  return {
    open,
    address,
    isConnected,
    wcProvider: walletConnectProvider,
    getContracts: async (msp: Msp) => ({
      unlockableTransportContract: new Contract(
        msp.unlockableContract,
        unlockableTransportContractAbi,
        await walletConnectProvider?.getSigner()
      ),
      prepaidTicketsContractContract: new Contract(
        msp.ticketContract,
        prepaidTicketsContractAbi,
        await walletConnectProvider?.getSigner()
      ),
    }),
  };
}
