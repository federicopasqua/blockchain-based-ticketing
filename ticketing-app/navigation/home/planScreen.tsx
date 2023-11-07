import React, {
  StyleSheet,
  TouchableHighlight,
  View,
  Text,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import Constants from 'expo-constants';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useIsFocused } from '@react-navigation/native';
import { CompositeScreenProps } from '@react-navigation/native';
import { StackScreenProps } from '@react-navigation/stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { RootBottomTabParamList } from '.';
import { RootStackParamList } from '../mainContainer';
import { useState, useEffect } from 'react';
import {
  Msp,
  TravelRoute,
  TravelSolutionCard,
} from '../../components/travelSolutionCard';
import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import dayjs from 'dayjs';
import { BACKEND_URL } from '../../env';

type Props = CompositeScreenProps<
  BottomTabScreenProps<RootBottomTabParamList, 'Plan'>,
  StackScreenProps<RootStackParamList, 'Home'>
>;

export type PlaceInfo = {
  placeId: string;
  description: string;
  mainText: string;
  secondaryText: string;
  latitude: number;
  longitude: number;
};

export type Location = {
  lat: number;
  lng: number;
};

type PointOfInterest = {
  name: string;
  x: number;
  y: number;
};

export enum TypeOfTransport {
  TRAIN,
  BOAT,
  PLANE,
}

export type ServerRoute = {
  id: number;
  typeOfTransport: string;
  price: string;
  from: PointOfInterest;
  to: PointOfInterest;
  departureTime: number;
  eta: number;
  classNumber: number;
  custom: string;
  msp: Msp;
};

const fetchRoutes = async (
  departure: Location,
  arrival: Location,
  departureTime: number
): Promise<ServerRoute[]> => {
  return (
    await (
      await fetch(`${BACKEND_URL}/routes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ departure, arrival, departureTime }),
      })
    ).json()
  ).map((r: ServerRoute) => ({
    ...r,
    eta: r.eta * 1000,
    departureTime: r.departureTime * 1000,
  }));
};

export function PlanScreen({ route, navigation }: Props) {
  const [departure, setDeparture] = useState<PlaceInfo | undefined>(
    route.params?.departure
  );
  const [arrival, setArrival] = useState<PlaceInfo | undefined>(route.params?.arrival);
  const [departureTime, setDepartureTime] = useState(dayjs().unix() * 1000);

  const [routes, setRoutes] = useState<TravelRoute[]>([]);

  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) {
      setDeparture(route.params?.departure);
      setArrival(route.params?.arrival);
    }
  }, [isFocused]);

  useEffect(() => {
    const go = async () => {
      if (!departure || !arrival || !departureTime) {
        return;
      }
      const newRoutes = await fetchRoutes(
        { lat: departure.latitude, lng: departure.longitude },
        { lat: arrival.latitude, lng: arrival.longitude },
        Math.floor(departureTime / 1000)
      );
      setRoutes(
        newRoutes.map((r) => ({
          from: {
            placeId: r.from.name,
            description: r.from.name,
            mainText: r.from.name,
            secondaryText: r.from.name,
            latitude: r.from.x,
            longitude: r.from.y,
          },
          to: {
            placeId: r.to.name,
            description: r.to.name,
            mainText: r.to.name,
            secondaryText: r.to.name,
            latitude: r.to.x,
            longitude: r.to.y,
          },
          departureTime: r.departureTime,
          eta: r.eta,
          msp: r.msp,
          mspId: r.id,
          class: r.classNumber,
          typeOfTransport:
            TypeOfTransport[r.typeOfTransport as keyof typeof TypeOfTransport],
          price: r.price,
        }))
      );
    };
    go();
  }, [departure, arrival, departureTime]);

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <View style={styles.searchLeftIconsContainer}>
          <Ionicons name="radio-button-on" size={18} />
          <Ionicons name="ellipsis-vertical-outline" size={16} />
          <Ionicons name="trail-sign" size={18} />
        </View>
        <View style={styles.searchInputsContainer}>
          <TouchableHighlight
            onPress={() => {
              navigation.navigate('DestinationPicker', {
                initialSearch: departure?.mainText,
                onSuccess: (place) => {
                  navigation.navigate('Plan', {
                    departure: place,
                    arrival,
                  });
                },
                onBack: () => {
                  navigation.navigate('Plan', {
                    departure,
                    arrival,
                  });
                },
              });
            }}
            style={styles.startTextInputStyle}
          >
            <Text numberOfLines={1} style={departure ? {} : styles.placeholderText}>
              {departure?.mainText ?? 'Departure'}
            </Text>
          </TouchableHighlight>
          <TouchableHighlight
            onPress={() => {
              navigation.navigate('DestinationPicker', {
                initialSearch: arrival?.mainText,
                onSuccess: (place) => {
                  navigation.navigate('Plan', {
                    departure,
                    arrival: place,
                  });
                },
                onBack: () => {
                  navigation.navigate('Plan', {
                    departure,
                    arrival,
                  });
                },
              });
            }}
            style={styles.arrivalTextInputStyle}
          >
            <Text numberOfLines={1} style={arrival ? {} : styles.placeholderText}>
              {arrival?.mainText ?? 'Arrival'}
            </Text>
          </TouchableHighlight>
          <TouchableHighlight style={styles.changeDirectionContainer}>
            <Ionicons name="swap-vertical" size={22} />
          </TouchableHighlight>
        </View>
      </View>
      <View style={styles.timeDateButtonContainer}>
        <Ionicons name="calendar-outline" size={18} />
        <View style={styles.timeDateButtonInput}>
          <View style={styles.timeDateInputContainer}>
            <TouchableOpacity
              onPress={() =>
                DateTimePickerAndroid.open({
                  mode: 'date',
                  value: dayjs(departureTime).toDate(),
                  onChange: (_, date) => {
                    if (!date) {
                      return;
                    }
                    setDepartureTime(
                      (oldTime) =>
                        dayjs(oldTime)
                          .year(date.getFullYear())
                          .month(date.getMonth())
                          .date(date.getDate())
                          .unix() * 1000
                    );
                  },
                })
              }
              style={styles.dateInput}
            >
              <Text>{dayjs(departureTime).format('DD/MM/YYYY')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() =>
                DateTimePickerAndroid.open({
                  mode: 'time',
                  value: dayjs(departureTime).toDate(),
                  onChange: (_, date) => {
                    if (!date) {
                      return;
                    }
                    setDepartureTime(
                      (oldTime) =>
                        dayjs(oldTime)
                          .hour(date.getHours())
                          .minute(date.getMinutes())
                          .unix() * 1000
                    );
                  },
                })
              }
              style={styles.timeInput}
            >
              <Text>{dayjs(departureTime).format('HH:mm')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      <View style={styles.listContainer}>
        <FlatList
          data={routes}
          renderItem={({ item }) => (
            <TravelSolutionCard
              travelRoute={item}
              onPress={() =>
                navigation.navigate('ticketReview', {
                  travelRoute: item,
                })
              }
            />
          )}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: Constants.statusBarHeight,
    flex: 1,
    alignItems: 'center',
  },
  startTextInputStyle: {
    borderColor: '#8a8a8a',
    borderWidth: 1.5,
    height: 40,
    width: '100%',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    paddingHorizontal: 10,
    justifyContent: 'center',
  },
  arrivalTextInputStyle: {
    borderColor: '#8a8a8a',
    borderBottomWidth: 1.5,
    borderLeftWidth: 1.5,
    borderRightWidth: 1.5,
    height: 40,
    width: '100%',
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    paddingHorizontal: 10,
    justifyContent: 'center',
  },
  placeholderText: {
    opacity: 0.55,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 30,
    width: '80%',
    marginRight: 15,
  },
  searchInputsContainer: {
    flex: 1,
    marginLeft: 5,
    backgroundColor: 'white',
  },
  searchLeftIconsContainer: {
    alignItems: 'center',
  },
  changeDirectionContainer: {
    position: 'absolute',
    right: -15,
    top: 17,
    backgroundColor: 'white',
    borderRadius: 150,
    borderWidth: 1.5,
    borderColor: '#8a8a8a',
    height: 34,
    width: 34,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    marginTop: 20,
    flex: 1,
    width: '90%',
  },
  timeDateInputContainer: {
    flexDirection: 'row',
    flex: 1,
  },
  dateInput: {
    borderColor: '#8a8a8a',
    borderWidth: 1.5,
    height: 40,
    flexGrow: 3,
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
    paddingHorizontal: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timeInput: {
    borderColor: '#8a8a8a',
    borderWidth: 1.5,
    borderLeftWidth: 0,
    height: 40,
    flexGrow: 1,
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
    paddingHorizontal: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timeDateButtonContainer: {
    flexDirection: 'row',
    width: '80%',
    height: 40,
    alignItems: 'center',
    marginTop: 10,
    marginRight: 15,
  },
  timeDateButtonInput: {
    flex: 1,
    marginLeft: 5,
    backgroundColor: 'white',
  },
});
export { Msp };
