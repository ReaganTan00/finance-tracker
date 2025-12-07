import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import PartnerConnectionScreen from '../screens/PartnerConnectionScreen';
import PartnerRequestsScreen from '../screens/PartnerRequestsScreen';
import PartnerProfileScreen from '../screens/PartnerProfileScreen';

export type AppStackParamList = {
  Home: undefined;
  Profile: undefined;
  PartnerConnection: undefined;
  PartnerRequests: undefined;
  PartnerProfile: undefined;
};

const Stack = createStackNavigator<AppStackParamList>();

export default function AppNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: '#FF8FAB',
        },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: {
          fontWeight: '600',
        },
      }}
      initialRouteName="Home"
    >
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: 'Finance Tracker' }}
      />
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: 'Profile' }}
      />
      <Stack.Screen
        name="PartnerConnection"
        component={PartnerConnectionScreen}
        options={{ title: 'Connect Partner' }}
      />
      <Stack.Screen
        name="PartnerRequests"
        component={PartnerRequestsScreen}
        options={{ title: 'Partner Requests' }}
      />
      <Stack.Screen
        name="PartnerProfile"
        component={PartnerProfileScreen}
        options={{ title: 'Partner Profile' }}
      />
    </Stack.Navigator>
  );
}
