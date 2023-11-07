import React from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { RouteProp } from '@react-navigation/native';
import { MapScreen } from './mapScreen';
import { PlaceInfo, PlanScreen } from './planScreen';
import { UserScreen } from './userScreen';
import Ionicons from '@expo/vector-icons/Ionicons';
import { IonicNames } from '../../utils/ionicTypes';

const mapScreenName = 'Map';
const planScreenName = 'Plan';
const userScreenName = 'User';

export type RootBottomTabParamList = {
  [mapScreenName]: undefined;
  [planScreenName]: {
    departure?: PlaceInfo;
    arrival?: PlaceInfo;
  };
  [userScreenName]: undefined;
};

const homeScreenStack = createBottomTabNavigator<RootBottomTabParamList>();

export function HomeScreen() {
  return (
    <homeScreenStack.Navigator screenOptions={screenOptions}>
      <homeScreenStack.Screen
        name={mapScreenName}
        component={MapScreen}
        options={{ headerShown: false }}
      />
      <homeScreenStack.Screen
        name={planScreenName}
        component={PlanScreen}
        options={{ headerShown: false }}
      />
      <homeScreenStack.Screen
        name={userScreenName}
        component={UserScreen}
        options={{ headerShown: false }}
      />
    </homeScreenStack.Navigator>
  );
}

const screenOptions = ({
  route,
}: {
  route: RouteProp<RootBottomTabParamList, keyof RootBottomTabParamList>;
}) => ({
  tabBarIcon: ({
    focused,
    color,
    size,
  }: {
    focused: boolean;
    color: string;
    size: number;
  }) => {
    let iconName: IonicNames = 'map-outline';
    const rn = route.name;

    if (rn === mapScreenName) {
      iconName = focused ? 'map' : 'map-outline';
    }
    if (rn === planScreenName) {
      iconName = focused ? 'calendar' : 'calendar-outline';
    }

    if (rn === userScreenName) {
      iconName = focused ? 'person' : 'person-outline';
    }

    return <Ionicons name={iconName} size={size - 4} color={color} />;
  },
  tabBarActiveTintColor: '#4A6FFF',
  tabBarInactiveTintColor: 'grey',
  tabBarLabelStyle: { paddingBottom: 8, fontSize: 10 },
  tabBarStyle: { padding: 5, height: 50 },
});
