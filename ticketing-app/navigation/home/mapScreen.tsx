import React, {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import * as Location from 'expo-location';
import { Location as appLocation } from './planScreen';
import Constants from 'expo-constants';
import { CompositeScreenProps } from '@react-navigation/native';
import { StackScreenProps } from '@react-navigation/stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { RootBottomTabParamList } from '.';
import { RootStackParamList } from '../mainContainer';
import MapView, { Marker } from 'react-native-maps';
import Ionicons from '@expo/vector-icons/Ionicons';
import { BikeMarker } from '../../assets/bike-marker';
import { useEffect, useState } from 'react';
import { BACKEND_URL } from '../../env';
import { Offer } from '../ratesScreen';
import { useWcProvider } from '../../utils/wcProviderHook';
import { useRpcProvider } from '../../utils/rpcProviderHook';
import { Msp } from '../../components/travelSolutionCard';

type Props = CompositeScreenProps<
  BottomTabScreenProps<RootBottomTabParamList, 'Map'>,
  StackScreenProps<RootStackParamList, 'Home'>
>;

type PlacesDistance = {
  distance: { text: string; value: number };
  duration: { text: string; value: number };
};

export type Vehicle = {
  id: number;
  position: appLocation;
  totalKm: number;
  battery: number;
  vehicleAddress: string;
  currentOwner?: string;
  offerId?: number;
  startKm?: number;
  startTime?: number;
  maxToSpend?: number;
  msp: Msp;
};

type VehicleWithOffer = {
  id: number;
  position: appLocation;
  totalKm: number;
  battery: number;
  vehicleAddress: string;
  currentOwner?: string;
  offer?: Offer;
  startKm?: number;
  startTime?: number;
  maxToSpend?: number;
  enabled: boolean;
  msp: Msp;
};

export function MapScreen({ navigation }: Props) {
  const { open, isConnected, address, wcProvider } = useWcProvider();
  const { getContracts } = useRpcProvider();

  const [currentlySelected, setCurrentlySelected] = useState<Vehicle | undefined>(
    undefined
  );

  const [currentlyRenting, setCurrentlyRenting] = useState<VehicleWithOffer | undefined>(
    undefined
  );

  const [currentlySelectedDistance, setCurrentlySelectedDistance] = useState<
    string | undefined
  >(undefined);
  const [currentlySelectedDuration, setCurrentlySelectedDuration] = useState<
    string | undefined
  >(undefined);

  const [vehicles, setvehicles] = useState<Vehicle[]>([]);

  function calculateFare() {
    if (!currentlyRenting || !currentlyRenting.offer) {
      return 0;
    }
    const usedKm = currentlyRenting.totalKm - (currentlyRenting.startKm ?? 0);
    const usedTime = Date.now() / 1000 - (currentlyRenting.startTime ?? 0);

    const billedKm =
      currentlyRenting.offer?.KmAllowance && usedKm > currentlyRenting.offer.KmAllowance
        ? usedKm - currentlyRenting.offer.KmAllowance
        : 0;

    const billedTime =
      currentlyRenting.offer?.TimeAllowance &&
      usedTime > currentlyRenting.offer.TimeAllowance
        ? usedTime - currentlyRenting.offer.TimeAllowance
        : 0;

    return (
      billedKm * +currentlyRenting.offer.pricePerKm +
      billedTime * +currentlyRenting.offer.pricePerSec +
      currentlyRenting.offer.UnlockPrice
    );
  }

  async function calculateDistanceFromUser(
    latitude: number,
    longitude: number
  ): Promise<PlacesDistance> {
    const currentUserPosition = await Location.getCurrentPositionAsync();
    return (
      await fetch(`${BACKEND_URL}/maps/places/distance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentLocation: {
            lat: currentUserPosition.coords.latitude,
            lng: currentUserPosition.coords.longitude,
          },
          targetLocation: { lat: latitude, lng: longitude },
        }),
      })
    ).json();
  }

  async function getVehicles(
    currentPosition: appLocation,
    radius: number
  ): Promise<Vehicle[]> {
    try {
      const vehicles = await (
        await fetch(`${BACKEND_URL}/vehicles`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            currentPosition,
            radius,
          }),
        })
      ).json();
      return vehicles;
    } catch (e) {}
    return [];
  }

  async function getCurrentlyRenting(): Promise<VehicleWithOffer | undefined> {
    if (!address) {
      return undefined;
    }
    try {
      const request = await fetch(`${BACKEND_URL}/vehicles/owned/${address}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!request.ok) {
        return undefined;
      }
      const vehicle = await request.json();
      return vehicle;
    } catch (e) {}
    return undefined;
  }

  useEffect(() => {
    Location.requestForegroundPermissionsAsync();
  }, []);

  useEffect(() => {
    calculateFare();
  }, [currentlyRenting]);

  useEffect(() => {
    const go = async () => {
      setCurrentlySelectedDistance(undefined);
      setCurrentlySelectedDuration(undefined);
      if (!currentlySelected) {
        return;
      }
      const distance = await calculateDistanceFromUser(
        currentlySelected.position.lat,
        currentlySelected.position.lng
      );
      setCurrentlySelectedDistance(distance.distance.text);
      setCurrentlySelectedDuration(distance.duration.text);
    };
    go();
  }, [currentlySelected]);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={() => {
          navigation.navigate('DestinationPicker', {
            onSuccess: async (place) => {
              navigation.navigate('Plan', {
                arrival: place,
                departure: {
                  placeId: 'currentPosition',
                  description: 'your position',
                  mainText: 'your position',
                  secondaryText: 'your position',
                  latitude: (await Location.getCurrentPositionAsync()).coords.latitude,
                  longitude: (await Location.getCurrentPositionAsync()).coords.longitude,
                },
              });
            },
            onBack: () => {
              navigation.goBack();
            },
          });
        }}
        style={styles.searchBarContainer}
        activeOpacity={0.9}
      >
        <Text style={styles.searchPlaceholder}>{'Where are you going?'}</Text>
        <Ionicons name="navigate-circle-outline" size={19} />
      </TouchableOpacity>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: 45.06246931989467,
          longitude: 7.662465297272862,
          latitudeDelta: 0.08,
          longitudeDelta: 0.08,
        }}
        // TODO: handle permission
        showsUserLocation={true}
        showsMyLocationButton={true}
        showsCompass={false}
        minZoomLevel={9}
        toolbarEnabled={false}
        mapPadding={{ top: Constants.statusBarHeight + 45, right: 7, left: 0, bottom: 0 }}
        onPress={() => {
          if (!currentlyRenting) {
            setCurrentlySelected(undefined);
          }
        }}
        onRegionChangeComplete={async (region) => {
          setvehicles(
            (await getVehicles({ lat: region.latitude, lng: region.longitude }, 10)) ?? []
          );
          const currentRent = await getCurrentlyRenting();
          setCurrentlyRenting(currentRent);
          if (currentRent) {
            setCurrentlySelected({ ...currentRent, offerId: currentRent.offer?.id });
          }
        }}
      >
        {vehicles.map((marker, index) =>
          currentlyRenting === undefined ||
          currentlyRenting.vehicleAddress === marker.vehicleAddress ? (
            <Marker
              key={index}
              coordinate={{
                latitude: marker.position.lat,
                longitude: marker.position.lng,
              }}
              onPress={() => setCurrentlySelected(marker)}
            >
              <BikeMarker
                size={24}
                color={
                  marker.vehicleAddress === currentlySelected?.vehicleAddress
                    ? 'red'
                    : undefined
                }
              />
            </Marker>
          ) : null
        )}
      </MapView>
      {currentlySelected && (
        <View
          style={[
            styles.vehicleInfoContainer,
            currentlyRenting ? styles.vehicleInfoContainerWhileRenting : {},
          ]}
        >
          <Image
            style={styles.vehicleImage}
            source={require('../../assets/bike-side.jpg')}
          />
          <View style={styles.vehicleInformationContainer}>
            <View
              style={[
                styles.vehicleInformationTopContainer,
                currentlyRenting ? styles.vehicleInformationTopContainerWhileRenting : {},
              ]}
            >
              <View>
                <Text style={styles.lable}>{'Address'}</Text>
                <Text>{`0x${currentlySelected.vehicleAddress
                  .slice(2, 21)
                  .toUpperCase()}...`}</Text>
              </View>
              <View style={styles.detailsContainer}>
                <Ionicons name="briefcase-outline" size={12} />
                <Text style={styles.businessNameValue}>{currentlySelected.msp.name}</Text>
              </View>
              {!currentlyRenting && (
                <View style={styles.detailsContainer}>
                  <Ionicons name="time-outline" size={13} />
                  {currentlySelectedDuration !== undefined &&
                  currentlySelectedDistance !== undefined ? (
                    <Text
                      style={styles.vehicleDistanceValue}
                    >{`${currentlySelectedDuration}/${currentlySelectedDistance}`}</Text>
                  ) : (
                    <ActivityIndicator
                      style={styles.vehicleDistanceLoading}
                      color="grey"
                      size={14}
                    />
                  )}
                </View>
              )}
            </View>
            {currentlyRenting && (
              <View style={styles.vehicleInformationBottomContainer}>
                <View style={styles.vehicleBatteryContainer}>
                  <Text style={styles.lable}>Time</Text>
                  <Text style={styles.batteryValue}>{`${Math.round(
                    (Date.now() / 1000 - (currentlyRenting.startTime ?? 0)) / 60
                  )} min`}</Text>
                </View>
                <View style={styles.vehicleBatteryContainer}>
                  <Text style={styles.lable}>Km</Text>
                  <Text style={styles.batteryValue}>{`${
                    currentlyRenting.totalKm - (currentlyRenting.startKm ?? 0)
                  } Km`}</Text>
                </View>
                <View style={styles.vehicleBatteryContainer}>
                  <Text style={styles.lable}>Charge</Text>
                  <Text style={styles.batteryValue}>{`3 Gwei`}</Text>
                </View>
              </View>
            )}
            <View style={styles.vehicleInformationBottomContainer}>
              <View style={styles.vehicleBatteryContainer}>
                <Text style={styles.lable}>Battery</Text>
                <Text style={styles.batteryValue}>{`${currentlySelected.battery}%`}</Text>
              </View>
              <TouchableOpacity
                onPress={async () => {
                  if (!isConnected) {
                    open();
                    return;
                  }
                  if (currentlyRenting) {
                    const tx = await (
                      await getContracts(currentlyRenting.msp)
                    ).unlockableTransportContract
                      .getFunction('Lock')
                      .populateTransaction(currentlyRenting.id, {
                        from: address,
                      });
                    await wcProvider?.send('eth_sendTransaction', [tx]);
                    return;
                  }
                  navigation.navigate('ratesSelection', {
                    vehicle: currentlySelected,
                  });
                }}
                style={styles.rentVehicleButtonContainer}
              >
                <Text style={styles.rentVehicleButtonText}>
                  {isConnected ? (currentlyRenting ? 'Stop Rent' : 'Rent') : 'Login'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchBarContainer: {
    position: 'absolute',
    alignSelf: 'center',
    top: Constants.statusBarHeight + 10,
    height: 35,
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 7,
    elevation: 20,
    shadowColor: '#52006A',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
  },
  searchPlaceholder: {
    opacity: 0.6,
    fontSize: 14,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
    zIndex: -1,
  },
  vehicleInfoContainer: {
    position: 'absolute',
    alignSelf: 'center',
    bottom: 20,
    height: 120,
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 7,
    elevation: 20,
    shadowColor: '#52006A',
    flexDirection: 'row',
    alignItems: 'center',
  },
  vehicleInfoContainerWhileRenting: {
    height: 160,
  },
  vehicleImage: {
    height: 90,
    width: 90,
    resizeMode: 'contain',
    marginBottom: 10,
    marginHorizontal: 10,
  },
  vehicleInformationContainer: {
    flex: 1,
    marginHorizontal: 10,
  },
  vehicleInformationTopContainer: {
    flex: 2,
    borderBottomColor: '#DADADA',
    borderBottomWidth: 1,
    justifyContent: 'space-between',
    paddingVertical: 5,
  },
  vehicleInformationTopContainerWhileRenting: {
    flex: 1,
  },
  vehicleInformationBottomContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  vehicleBatteryContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lable: {
    color: '#808080',
    fontSize: 12,
  },
  batteryValue: {
    fontWeight: 'bold',
    fontSize: 12,
  },
  rentVehicleButtonContainer: {
    backgroundColor: '#4A6FFF',
    marginVertical: 5,
    paddingHorizontal: 25,
    justifyContent: 'center',
    borderRadius: 5,
    marginLeft: 20,
  },
  rentVehicleButtonText: {
    color: '#FFFFFF',
  },
  detailsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 4,
  },
  businessNameValue: {
    marginLeft: 4,
    fontSize: 12,
  },
  vehicleDistanceValue: {
    marginLeft: 3,
    fontSize: 11,
  },
  vehicleDistanceLoading: {
    marginLeft: 5,
  },
});
