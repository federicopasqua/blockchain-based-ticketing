import React from 'react-native';
import { NavigationContainer, NavigatorScreenParams } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { HomeScreen, RootBottomTabParamList as HomeParamList } from './home';
import { DestinationPickerScreen } from './destinationPickerScreen';
import { TicketBuyReview } from './ticketBuyReview';
import { RatesSelection } from './ratesScreen';
import { PlaceInfo } from './home/planScreen';
import { TravelRoute } from '../components/travelSolutionCard';
import { Vehicle } from './home/mapScreen';

const homeScreenName = 'Home';
const destinationPickerScreenName = 'DestinationPicker';
const ticketBuyReviewScreenName = 'ticketReview';
const ratesSelectionScreenName = 'ratesSelection';

export type RootStackParamList = {
  [homeScreenName]: NavigatorScreenParams<HomeParamList>;
  [destinationPickerScreenName]: {
    initialSearch?: string;
    onSuccess: (place: PlaceInfo) => void;
    onBack: () => void;
  };
  [ticketBuyReviewScreenName]: {
    travelRoute: TravelRoute;
  };
  [ratesSelectionScreenName]: {
    vehicle: Vehicle;
  };
};

const mainContainerStack = createStackNavigator<RootStackParamList>();

export function MainContainer() {
  return (
    <NavigationContainer>
      <mainContainerStack.Navigator>
        <mainContainerStack.Screen
          name={homeScreenName}
          component={HomeScreen}
          options={{ headerShown: false }}
        />
        <mainContainerStack.Screen
          name={destinationPickerScreenName}
          component={DestinationPickerScreen}
          options={{ headerShown: false }}
        />
        <mainContainerStack.Screen
          name={ticketBuyReviewScreenName}
          component={TicketBuyReview}
          options={{ headerShown: false }}
        />
        <mainContainerStack.Screen
          name={ratesSelectionScreenName}
          component={RatesSelection}
          options={{ headerShown: false }}
        />
      </mainContainerStack.Navigator>
    </NavigationContainer>
  );
}
