import React, {
  StyleSheet,
  TouchableHighlight,
  View,
  Text,
  ToastAndroid,
  TouchableOpacity,
  FlatList,
  Modal,
} from 'react-native';
import { Image } from 'expo-image';
import Constants from 'expo-constants';
import Ionicons from '@expo/vector-icons/Ionicons';
import { CompositeScreenProps } from '@react-navigation/native';
import { StackScreenProps } from '@react-navigation/stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { RootBottomTabParamList } from '.';
import { RootStackParamList } from '../mainContainer';
import { useState, useEffect, useRef, useMemo } from 'react';
import { useWalletConnectModal } from '@walletconnect/modal-react-native';
import { BrowserProvider } from 'ethers';
import { Blockies } from '../../components/Blockies';
import * as Clipboard from 'expo-clipboard';
import { TravelRoute, TravelSolutionCard } from '../../components/travelSolutionCard';
import QRCode from 'react-native-qrcode-svg';
import { useWcProvider } from '../../utils/wcProviderHook';

type Props = CompositeScreenProps<
  BottomTabScreenProps<RootBottomTabParamList, 'User'>,
  StackScreenProps<RootStackParamList, 'Home'>
>;

const fakeRoutes: TravelRoute[] = [
  {
    from: {
      placeId: 'ChIJe_aAnuvLRxMRAXapJW5rvps',
      description: 'Polignano a Mare, Metropolitan City of Bari, Italy',
      mainText: 'Polignano a Mare',
      secondaryText: 'Metropolitan City of Bari, Italy',
      latitude: 40.99406931417607,
      longitude: 17.220477907339706,
    },
    to: {
      placeId: 'ChIJN8OrXLgghkcRG6-9TyYGcNk',
      description:
        'Politecnico di Torino, Corso Duca degli Abruzzi, Turin, Metropolitan City of Turin, Italy',
      mainText: 'Politecnico di Torino',
      secondaryText: 'Corso Duca degli Abruzzi, Turin, Metropolitan City of Turin, Italy',
      latitude: 45.062413578160196,
      longitude: 7.662373514691472,
    },
    departureTime: 1694680792,
    eta: 1698823992,
    typeOfTransport: 'train',
    class: 1,
    msp: {
      name: 'trenitalia',
      endpoint: '',
      unlockableContract: '',
      ticketContract: '',
    },
    mspId: 1,
    price: '1030000000000000000',
  },
  {
    from: {
      placeId: 'ChIJE5FuGyIjjUcRUEgSszTOCQQ',
      description: 'Poligny, France',
      mainText: 'Poligny',
      secondaryText: 'France',
      latitude: 46.835819,
      longitude: 5.707056,
    },
    to: {
      placeId: 'ChIJ9RrHu6fGhkcRcawaBawwpqI',
      description:
        "Policlinico di Milano Ospedale Maggiore | Fondazione IRCCS Ca' Granda, Via Francesco Sforza, Milan, Metropolitan City of Milan, Italy",
      mainText: "Policlinico di Milano Ospedale Maggiore | Fondazione IRCCS Ca' Granda",
      secondaryText: 'Via Francesco Sforza, Milan, Metropolitan City of Milan, Italy',
      latitude: 45.458827072076566,
      longitude: 9.194949412089617,
    },
    departureTime: 1694680792,
    eta: 1724723992,
    typeOfTransport: 'train',
    class: 2,
    msp: {
      name: 'TGV',
      endpoint: '',
      unlockableContract: '',
      ticketContract: '',
    },
    mspId: 1,
    price: '3123300000000000000',
  },
];

export function UserScreen({ route, navigation }: Props) {
  const { open, provider, isConnected, address } = useWalletConnectModal();

  const { wcProvider } = useWcProvider();

  const [name, setName] = useState('Unnamed');
  const [avatar, setAvatar] = useState<string | null>(null);

  const [usedMenu, setUsedMenu] = useState(false);
  const [qrCodeContent, setQrCodeContent] = useState<string | undefined>();

  useEffect(() => {
    const go = async () => {
      if (wcProvider && address) {
        wcProvider.on('network', (network) => {
          //
        });
        //const allOffers: Offer[] = await unlockableTransportContract.getAllOffers();
        const addressName = undefined; // await web3Provider.lookupAddress(address);
        setName(addressName || 'Unnamed');
        setAvatar(
          addressName ? await wcProvider.getAvatar(addressName) : null //await web3Provider.getAvatar('taytems.eth')
        );
      }
    };
    go();
  }, [address]);

  return (
    <View style={styles.container}>
      {isConnected ? (
        <View style={styles.profileContainer}>
          <View style={styles.disconnectButtonContainer}>
            <TouchableHighlight
              onPress={() => provider?.disconnect()}
              style={styles.disconnectButton}
            >
              <Text style={styles.disconnectButtonText}>Logout</Text>
            </TouchableHighlight>
          </View>

          <View style={styles.iconContainer}>
            {avatar != null ? (
              <Image style={styles.image} contentFit="cover" source={avatar} />
            ) : (
              <Blockies address={address!!} size={10} />
            )}
          </View>
          <Text style={styles.nameText}>{name}</Text>
          <TouchableOpacity
            onPress={() => {
              Clipboard.setStringAsync(address!!);
              ToastAndroid.show('Address copied!', ToastAndroid.SHORT);
            }}
            activeOpacity={0.1}
          >
            <View style={styles.addressContainer}>
              <Text numberOfLines={1} ellipsizeMode="middle" style={styles.addressText}>
                {address}
              </Text>
              <Ionicons name="copy-outline" size={13} />
            </View>
          </TouchableOpacity>
          <View style={styles.bottomContainer}>
            <View style={styles.bottomContainerButtonsContainer}>
              <TouchableOpacity
                onPress={() => setUsedMenu(false)}
                style={usedMenu ? {} : styles.bottomContainerButtonContainer}
              >
                <Text>Tickets</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setUsedMenu(true)}
                style={usedMenu ? styles.bottomContainerButtonContainer : {}}
              >
                <Text>Used</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              style={{}}
              data={usedMenu ? fakeRoutes : fakeRoutes}
              renderItem={({ item }) => (
                <TravelSolutionCard
                  travelRoute={item}
                  actionButton={usedMenu ? undefined : 'Validate'}
                  onActionButton={async () =>
                    setQrCodeContent(
                      await wcProvider?.send('personal_sign', ['ciao', address])
                    )
                  }
                />
              )}
            />
          </View>
          <Modal visible={!!qrCodeContent} transparent>
            <TouchableOpacity
              onPress={() => setQrCodeContent(undefined)}
              style={styles.modalContainer}
            >
              <TouchableOpacity
                activeOpacity={1}
                onPress={() => {}}
                style={styles.modalContentContainer}
              >
                <View style={styles.modalHeaderContainer}>
                  <TouchableOpacity onPress={() => setQrCodeContent(undefined)}>
                    <Ionicons name="close-outline" size={30} />
                  </TouchableOpacity>
                </View>

                <QRCode size={200} value={qrCodeContent} />
              </TouchableOpacity>
            </TouchableOpacity>
          </Modal>
        </View>
      ) : (
        <View style={styles.loginContainer}>
          <Text style={styles.heading}>Login</Text>
          <Text style={styles.secondaryText}>You are not logged in</Text>
          <TouchableHighlight onPress={() => open({})} style={styles.buttonContainer}>
            <Text style={styles.buttonText}>Login</Text>
          </TouchableHighlight>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: Constants.statusBarHeight,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heading: {
    fontSize: 32,
    marginBottom: 10,
  },
  secondaryText: {
    fontSize: 18,
    marginBottom: 60,
  },
  buttonContainer: {
    paddingHorizontal: 25,
    paddingVertical: 11,
    backgroundColor: '#4681f4',
    borderRadius: 5,
  },
  buttonText: {
    fontSize: 20,
    color: '#fff',
  },
  nameText: {
    marginTop: 10,
    fontSize: 15,
    fontWeight: 'bold',
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  addressText: {
    marginTop: 3,
    fontSize: 12,
    width: 150,
  },
  iconContainer: {
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: 'red',
  },
  profileContainer: {
    flex: 1,
    width: '100%',
    paddingHorizontal: 30,
    paddingTop: 40,
    alignItems: 'flex-start',
  },
  disconnectButton: {
    paddingHorizontal: 15,
    paddingVertical: 5,
    backgroundColor: 'red',
    borderRadius: 5,
  },
  disconnectButtonContainer: {
    alignItems: 'flex-end',
    width: '100%',
    marginBottom: 10,
  },
  disconnectButtonText: {
    fontSize: 13,
    color: '#fff',
  },
  bottomContainer: {
    paddingTop: 20,
    width: '100%',
  },
  ticketsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  image: { width: 100, height: 100 },
  bottomContainerButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  bottomContainerButtonContainer: {
    borderBottomColor: 'black',
    borderBottomWidth: 1,
  },
  modalContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  modalContentContainer: {
    paddingTop: 5,
    paddingBottom: 30,
    paddingHorizontal: 5,
    backgroundColor: 'white',
    alignItems: 'center',
    width: 270,
    alignSelf: 'center',
    borderColor: 'black',
    borderWidth: 4,
    borderRadius: 10,
  },
  modalHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    width: '100%',
  },
});
