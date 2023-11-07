import { Contract, JsonRpcProvider } from 'ethers';
import { useRef } from 'react';
import { BLOCKCHAIN_RPC_URL } from '../env';
import { Msp } from '../navigation/home/planScreen';
import { unlockableTransportContractAbi, prepaidTicketsContractAbi } from './abi';

export function useRpcProvider() {
  const provider = useRef(
    new JsonRpcProvider(BLOCKCHAIN_RPC_URL, {
      name: 'ticketing',
      chainId: 8118,
    })
  );

  return {
    rpcProvider: provider.current,
    getContracts: (msp: Msp) => ({
      unlockableTransportContract: new Contract(
        msp.unlockableContract,
        unlockableTransportContractAbi,
        provider.current
      ),
      prepaidTicketsContractContract: new Contract(
        msp.ticketContract,
        prepaidTicketsContractAbi,
        provider.current
      ),
    }),
  };
}
