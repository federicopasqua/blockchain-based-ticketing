import React, { StyleSheet, View, Text, TouchableOpacity, FlatList } from 'react-native';
import Constants from 'expo-constants';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from './mainContainer';
import Ionicons from '@expo/vector-icons/Ionicons';
import { parseUnits } from 'ethers';
import { useEffect, useState } from 'react';
import { formatAmount } from '../utils/printAmounts';
import { useWalletConnectModal } from '@walletconnect/modal-react-native';
import { useRpcProvider } from '../utils/rpcProviderHook';
import { useWcProvider } from '../utils/wcProviderHook';

type Props = StackScreenProps<RootStackParamList, 'ratesSelection'>;

export type Offer = {
  id: number;
  pricePerKm: string;
  pricePerSec: string;
  UnlockPrice: string;
  KmAllowance: number;
  TimeAllowance: number;
  enabled: boolean;
};

export function RatesSelection({ route, navigation }: Props) {
  const { vehicle } = route.params;

  const { address } = useWalletConnectModal();
  const { getContracts } = useRpcProvider();
  const { wcProvider, getContracts: getWsContracts } = useWcProvider();

  const [offers, setOffers] = useState<Offer[]>([]);
  const [selectedOffer, setSelectedOffer] = useState<Offer | undefined>();

  useEffect(() => {
    const go = async () => {
      const allOffers: Offer[] = await (
        await getContracts(vehicle.msp)
      ).unlockableTransportContract.getAllOffers();
      setOffers(allOffers.filter((o) => o.enabled));
    };
    go();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name={'arrow-back-outline'} size={25} />
        </TouchableOpacity>
        <Text style={styles.title}>{`Choose a rate`}</Text>
        <View style={styles.headerRightContainer}></View>
      </View>
      <FlatList
        data={offers}
        renderItem={({ item }) => (
          <TouchableOpacity activeOpacity={0.9} onPress={() => setSelectedOffer(item)}>
            <View
              style={[
                styles.offerCardContainer,
                selectedOffer?.id === item.id ? styles.selectedCard : {},
              ]}
            >
              <View style={styles.offerCardLeftColumnContainer}>
                <Text style={styles.offerCardName}>{`offer ${item.id}`}</Text>
                <Text>{`unlock: ${formatAmount(item.UnlockPrice)}`}</Text>
              </View>
              <View style={styles.offerCardRightColumnContainer}>
                <View style={styles.offerCardRightColumnLeftContainer}>
                  <Text>{`${formatAmount(item.pricePerSec)}/sec`}</Text>
                  <Text>{`${formatAmount(item.pricePerKm)}/km`}</Text>
                </View>
                <View style={styles.offerCardRightColumnRightContainer}>
                  <Text>{`(${item.TimeAllowance} incl.)`}</Text>
                  <Text>{`(${item.KmAllowance} incl.)`}</Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        )}
      />
      <TouchableOpacity
        disabled={!selectedOffer}
        onPress={async () => {
          if (!wcProvider) {
            return;
          }

          const tx = await (await getContracts(vehicle.msp)).unlockableTransportContract
            .getFunction('Unlock')
            .populateTransaction(vehicle.id, selectedOffer!.id, {
              value: parseUnits('9', 'ether'),
              from: address,
            });

          await wcProvider?.send('eth_sendTransaction', [
            { ...tx, value: '0x7ce66c50e2840000' },
          ]);
          navigation.navigate('Home', {
            screen: 'Map',
          });
        }}
        style={[
          styles.startRentButtonContainer,
          !selectedOffer ? styles.disabledButton : {},
        ]}
      >
        <Text style={styles.startRentButtonText}>Start rent</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: Constants.statusBarHeight,
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 20,
    justifyContent: 'space-between',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  headerRightContainer: {
    width: 30,
  },
  title: {
    fontSize: 23,
    marginLeft: 10,
    marginVertical: 10,
    alignContent: 'center',
  },
  offerCardLeftColumnContainer: {},
  offerCardRightColumnContainer: {
    flexDirection: 'row',
  },
  offerCardContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 10,
    elevation: 3,
    backgroundColor: 'white',
    borderRadius: 10,
    marginHorizontal: 5,
    marginVertical: 5,
  },
  offerCardName: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  selectedCard: {
    borderColor: '#4A6FFF',
    borderWidth: 3,
    paddingHorizontal: 7,
    paddingVertical: 7,
  },
  offerCardRightColumnLeftContainer: {
    alignItems: 'flex-end',
  },
  offerCardRightColumnRightContainer: {
    alignItems: 'flex-end',
    marginLeft: 5,
  },
  startRentButtonContainer: {
    backgroundColor: '#4A6FFF',
    paddingVertical: 10,
    width: '90%',
    borderRadius: 10,
    alignSelf: 'center',
  },
  startRentButtonText: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontSize: 15,
  },
  disabledButton: {
    backgroundColor: '#cccccc',
  },
});
