import 'react-native-gesture-handler';
import '@ethersproject/shims';
import React from 'react-native';
import { WalletConnectModal } from '@walletconnect/modal-react-native';
import { MainContainer } from './navigation/mainContainer';
import { WALLET_CONNECT_PROJECT_ID } from './env';

//@ts-ignore
BigInt.prototype.toJSON = function () {
  return this.toString(16);
};

const projectId = WALLET_CONNECT_PROJECT_ID;

const providerMetadata = {
  name: 'YOUR_PROJECT_NAME',
  description: 'YOUR_PROJECT_DESCRIPTION',
  url: 'https://your-project-website.com/',
  icons: ['https://your-project-logo.com/'],
  redirect: {
    native: 'YOUR_APP_SCHEME://',
    universal: 'YOUR_APP_UNIVERSAL_LINK.com',
  },
};

export default function App() {
  return (
    <>
      <WalletConnectModal projectId={projectId} providerMetadata={providerMetadata} />
      <MainContainer />
    </>
  );
}
