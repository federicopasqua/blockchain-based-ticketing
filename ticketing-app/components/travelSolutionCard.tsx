import React, { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { PlaceInfo, TypeOfTransport } from '../navigation/home/planScreen';
import dayjs from 'dayjs';
import { parseUnits, formatUnits } from 'ethers';

export type Msp = {
  name: string;
  endpoint: string;
  unlockableContract: string;
  ticketContract: string;
};

export type TravelRoute = {
  from: PlaceInfo;
  to: PlaceInfo;
  departureTime: number;
  eta: number;
  msp: Msp;
  class: number;
  typeOfTransport: TypeOfTransport;
  price: string;
  mspId: number;
};

type Props = {
  travelRoute: TravelRoute;
  onPress?: () => void;
  actionButton?: string;
  onActionButton?: () => void;
};

export function TravelSolutionCard({
  travelRoute,
  onPress,
  actionButton,
  onActionButton,
}: Props) {
  const totalMinutes = dayjs(travelRoute.eta).diff(travelRoute.departureTime, 'm', true);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = Math.ceil(totalMinutes - hours * 60);

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.9}>
      <View style={styles.container}>
        <View style={styles.firstRow}>
          <Text>{travelRoute.msp.name}</Text>
          <Text style={styles.amountText}>{`${+formatUnits(
            parseUnits(travelRoute.price, 'wei'),
            18
          )} Ξ`}</Text>
        </View>
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
        {actionButton && (
          <View style={styles.fourthRow}>
            <TouchableOpacity
              onPress={onActionButton}
              style={styles.actionButtonContainer}
            >
              <Text style={styles.actionButtonText}>{actionButton}</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 5,
    marginHorizontal: 5,
    paddingVertical: 10,
    elevation: 3,
    backgroundColor: 'white',
    borderRadius: 10,
  },
  firstRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomColor: '#cfcfcf',
    borderBottomWidth: 1,
    paddingBottom: 5,
    paddingHorizontal: 15,
  },
  secondRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 5,
    paddingHorizontal: 10,
  },
  thirdRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingBottom: 5,
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
  actionButtonContainer: {
    backgroundColor: '#4A6FFF',
    paddingHorizontal: 20,
    paddingVertical: 5,
    justifyContent: 'center',
    borderRadius: 5,
  },
  actionButtonText: {
    color: '#FFFFFF',
  },
  fourthRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingTop: 10,
    paddingHorizontal: 10,
    borderTopColor: '#cfcfcf',
    borderTopWidth: 1,
  },
});
