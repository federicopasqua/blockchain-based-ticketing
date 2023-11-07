import React, {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableHighlight,
  TouchableOpacity,
  View,
} from 'react-native';
import Constants from 'expo-constants';
import Ionicons from '@expo/vector-icons/Ionicons';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from './mainContainer';
import * as Location from 'expo-location';
import { useEffect, useRef, useState } from 'react';
import { BACKEND_URL } from '../env';

type Props = StackScreenProps<RootStackParamList, 'DestinationPicker'>;

type Places = {
  referenceId: string;
  description: string;
  mainText: string;
  secondaryText: string;
};

export function DestinationPickerScreen({ route, navigation }: Props) {
  const { onBack, onSuccess, initialSearch } = route.params;

  const [input, setInput] = useState(initialSearch);
  const [matchingPlaces, setMatchingPlaces] = useState<Places[]>([]);

  const [lockPresses, setLockPresses] = useState<string | undefined>(undefined);

  async function fetchPlaces(input: string): Promise<Places[] | undefined> {
    const currentUserPosition = await Location.getCurrentPositionAsync();

    const request = await fetch(
      `${BACKEND_URL}/maps/places/search/${input}?lat=${currentUserPosition.coords.latitude}&lng=${currentUserPosition.coords.longitude}`,
      { headers: { 'Content-Type': 'application/json' } }
    );

    if (!request.ok) {
      return;
    }

    return request.json();
  }

  async function getCoordinatesFromPlaceId(
    placeId: string
  ): Promise<{ lat: number; lng: number }> {
    return (
      await fetch(`${BACKEND_URL}/maps/places/coord/${placeId}`, {
        headers: { 'Content-Type': 'application/json' },
      })
    ).json();
  }

  const timeout = useRef<NodeJS.Timeout | undefined>();

  useEffect(() => {
    if (timeout.current) {
      clearTimeout(timeout.current);
    }
    timeout.current = setTimeout(async () => {
      const places = await fetchPlaces(input ?? '');
      setMatchingPlaces(places ?? []);
    }, 500);
  }, [input]);

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TouchableOpacity onPress={onBack} style={styles.backButtonContainer}>
          <Ionicons name="arrow-back" size={18} />
        </TouchableOpacity>
        <TextInput
          style={styles.searchInput}
          onChangeText={(newText) => setInput(newText)}
          defaultValue={input}
        />
      </View>
      <View style={styles.flatlistContainer}>
        {
          <FlatList
            style={styles.flatlist}
            data={matchingPlaces}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            keyExtractor={(item) => item.referenceId}
            renderItem={({ item }) => (
              <TouchableHighlight
                style={styles.cardTouchable}
                onPress={async () => {
                  if (lockPresses) {
                    return;
                  }
                  setLockPresses(item.referenceId);
                  const { lat, lng } = await getCoordinatesFromPlaceId(item.referenceId);
                  onSuccess({
                    placeId: item.referenceId,
                    description: item.description,
                    mainText: item.mainText,
                    secondaryText: item.secondaryText,
                    latitude: lat,
                    longitude: lng,
                  });
                  setLockPresses(undefined);
                }}
              >
                <View style={styles.cardContainer}>
                  <View style={styles.cardTextContainer}>
                    <Text numberOfLines={1} style={styles.cardMainText}>
                      {item.mainText}
                    </Text>
                    <Text numberOfLines={1}>{item.secondaryText}</Text>
                  </View>
                  <View style={styles.cardIconContainer}>
                    {item.referenceId === lockPresses ? (
                      <ActivityIndicator />
                    ) : (
                      <Ionicons name="chevron-forward" size={18} />
                    )}
                  </View>
                </View>
              </TouchableHighlight>
            )}
          />
        }
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
  searchContainer: {
    flexDirection: 'row',
    width: '90%',
    alignItems: 'center',
    marginTop: 30,
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 10,
    borderColor: '#8a8a8a',
    marginRight: 20,
    paddingHorizontal: 10,
  },
  backButtonContainer: {
    marginRight: 20,
  },
  flatlistContainer: {
    flex: 1,
    marginTop: 20,
  },
  flatlist: {
    flex: 1,
  },
  cardContainer: {
    width: '90%',
    marginVertical: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardTouchable: {
    alignItems: 'center',
  },
  cardTextContainer: {
    flex: 1,
  },
  cardMainText: {
    fontWeight: 'bold',
  },
  separator: {
    width: '85%',
    height: 0,
    borderColor: 'black',
    borderTopWidth: 1,
    opacity: 0.5,
    alignSelf: 'center',
  },
  cardIconContainer: {
    justifyContent: 'center',
  },
});
