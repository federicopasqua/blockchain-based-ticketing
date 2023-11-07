import React, { StyleSheet, View, Text, TextInput } from 'react-native';
import Constants from 'expo-constants';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from './mainContainer';
import { parseUnits, formatUnits, solidityPacked, keccak256 } from 'ethers';
import Ionicons from '@expo/vector-icons/Ionicons';
import dayjs from 'dayjs';
import { useState } from 'react';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { useWalletConnectModal } from '@walletconnect/modal-react-native';
import { useWcProvider } from '../utils/wcProviderHook';
import { useRpcProvider } from '../utils/rpcProviderHook';
import { BACKEND_URL } from '../env';
import { TypeOfTransport } from './home/planScreen';

type Props = StackScreenProps<RootStackParamList, 'ticketReview'>;

export function TicketBuyReview({ route, navigation }: Props) {
  const { travelRoute } = route.params;
  const { open, isConnected, address, wcProvider } = useWcProvider();
  const { getContracts } = useRpcProvider();
  const totalMinutes = dayjs(travelRoute.eta).diff(travelRoute.departureTime, 'm', true);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = Math.ceil(totalMinutes - hours * 60);

  const [numberOfTickets, setNumberOfTickets] = useState(1);

  const calculateId = (expiration: number) => {
    const encoding =
      solidityPacked(
        ['uint256', 'uint256', 'string', 'uint256', 'uint256', 'string', 'uint256'],
        [
          travelRoute.typeOfTransport,
          travelRoute.price,
          travelRoute.from.mainText,
          Math.trunc(travelRoute.from.latitude * 1000000),
          Math.trunc(travelRoute.from.longitude * 1000000),
          travelRoute.to.mainText,
          Math.trunc(travelRoute.to.latitude * 1000000),
        ]
      ) +
      solidityPacked(
        ['uint256', 'uint256', 'uint256', 'uint8', 'uint256', 'address', 'bytes'],
        [
          Math.trunc(travelRoute.to.longitude * 1000000),
          travelRoute.departureTime,
          travelRoute.eta,
          travelRoute.class,
          expiration,
          address,
          '0x',
        ]
      ).slice(2);

    return keccak256(encoding);
  };

  const getSignature = async () => {
    const request = await fetch(
      `${BACKEND_URL}/routes/${address}/${travelRoute.msp.name}/${travelRoute.mspId}`,
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );

    if (!request.ok) {
      throw new Error();
    }

    return request.json() as Promise<{
      expiration: number;
      hashId: string;
      signature: { signature: string };
    }>;
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name={'arrow-back-outline'} size={25} />
        </TouchableOpacity>
        <Text style={styles.title}>{`Your ${
          TypeOfTransport[travelRoute.typeOfTransport]
        } journey`}</Text>
        <View style={styles.headerRightContainer}></View>
      </View>
      <View>
        <View style={styles.secondRow}>
          <Text style={styles.timeText}>
            {dayjs(travelRoute.departureTime).format('HH:mm')}
          </Text>
          <View style={styles.diffContainer}>
            <Text style={styles.diffText}>
              {hours > 0 ? `${hours} h ${minutes} min` : `${minutes} min`}
            </Text>
            <Ionicons name={'arrow-forward'} size={16} />
          </View>
          <Text style={styles.timeText}>{dayjs(travelRoute.eta).format('HH:mm')}</Text>
        </View>
        <View style={styles.thirdRow}>
          <Text style={styles.placeText} numberOfLines={1} ellipsizeMode="tail">
            {travelRoute.from.mainText}
          </Text>
          <Text style={styles.placeText} numberOfLines={1} ellipsizeMode="tail">
            {travelRoute.to.mainText}
          </Text>
        </View>
        <View>
          <View style={styles.detailContainer}>
            <Text style={styles.detailsTitle}>Company</Text>
            <Text>{travelRoute.msp.name}</Text>
          </View>
          <View style={styles.detailContainer}>
            <Text style={styles.detailsTitle}>Class</Text>
            <Text>{travelRoute.class}</Text>
          </View>
        </View>
      </View>

      <View style={styles.ticketQtyContainer}>
        <TouchableOpacity
          disabled={numberOfTickets < 2}
          onPress={() => setNumberOfTickets((old) => old - 1)}
        >
          <Ionicons
            style={numberOfTickets < 2 ? styles.disabledIcon : {}}
            name={'remove-circle-outline'}
            size={30}
          />
        </TouchableOpacity>
        <TextInput
          keyboardType="number-pad"
          inputMode="numeric"
          onChange={(e) =>
            setNumberOfTickets(e.nativeEvent.text ? +e.nativeEvent.text : 1)
          }
          value={numberOfTickets.toString()}
          style={styles.ticketQtyInput}
        />
        <TouchableOpacity onPress={() => setNumberOfTickets((old) => old + 1)}>
          <Ionicons name={'add-circle-outline'} size={30} />
        </TouchableOpacity>
      </View>
      <View style={styles.totalContainer}>
        <Text style={styles.totalLabel}>Total</Text>
        <Text style={styles.totalValue}>{`${
          +formatUnits(parseUnits(travelRoute.price, 'wei'), 18) * numberOfTickets
        } Ξ`}</Text>
      </View>
      <TouchableOpacity
        style={styles.buyButtonContainer}
        onPress={async () => {
          if (!isConnected) {
            open();
            return;
          }
          const { signature, expiration } = await getSignature();
          const tx = await (
            await getContracts(travelRoute.msp)
          ).prepaidTicketsContractContract
            .getFunction('mintTicket')
            .populateTransaction(
              {
                signature: signature.signature,
                id: calculateId(expiration),
                typeOfTransport: travelRoute.typeOfTransport,
                price: travelRoute.price,
                from: {
                  name: travelRoute.from.mainText,
                  x: Math.trunc(travelRoute.from.latitude * 1000000),
                  y: Math.trunc(travelRoute.from.longitude * 1000000),
                },
                to: {
                  name: travelRoute.to.mainText,
                  x: Math.trunc(travelRoute.to.latitude * 1000000),
                  y: Math.trunc(travelRoute.to.longitude * 1000000),
                },
                departureTime: travelRoute.departureTime,
                eta: travelRoute.eta,
                class: travelRoute.class,
                custom: '0x',
                exipiration: expiration,
                validFor: address,
                state: 0,
              },
              {
                from: address,
                value: travelRoute.price,
              }
            );
          console.log(await wcProvider?.send('eth_sendTransaction', [tx]));
        }}
      >
        <Text style={styles.buyButtonText}>{isConnected ? 'Buy' : 'Login'}</Text>
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
  secondRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  thirdRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
    marginBottom: 30,
  },
  diffText: {
    fontSize: 13,
  },
  placeText: {
    maxWidth: '45%',
    fontSize: 13,
  },
  timeText: {
    fontSize: 20,
    color: '#2b7bfc',
    fontWeight: '600',
  },
  amountText: {
    fontSize: 16,
    color: '#Ff333a',
    fontWeight: '600',
  },
  diffContainer: {
    position: 'relative',
    top: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 5,
    marginHorizontal: 10,
  },
  detailsTitle: {
    fontWeight: 'bold',
  },
  ticketQtyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 30,
    flexGrow: 2,
  },
  ticketQtyInput: {
    borderWidth: 1,
    borderColor: 'black',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 30,
    textAlign: 'center',
    fontSize: 20,
  },
  disabledIcon: {
    opacity: 0.3,
  },
  totalContainer: {
    flexDirection: 'column',
    marginHorizontal: 10,
    flexGrow: 1,
  },
  totalLabel: {
    fontSize: 20,
  },
  totalValue: {
    fontSize: 30,
    textAlign: 'right',
  },
  buyButtonContainer: {
    backgroundColor: '#4A6FFF',
    paddingVertical: 10,
    width: '90%',
    borderRadius: 10,
    alignSelf: 'center',
    flexGrow: 1,
  },
  buyButtonText: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontSize: 15,
  },
});
