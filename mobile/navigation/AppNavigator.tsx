import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import PartnerConnectionScreen from '../screens/PartnerConnectionScreen';
import PartnerRequestsScreen from '../screens/PartnerRequestsScreen';
import PartnerProfileScreen from '../screens/PartnerProfileScreen';
import CategoryManagementScreen from '../screens/CategoryManagementScreen';
import BudgetListScreen from '../screens/BudgetListScreen';
import AddBudgetScreen from '../screens/AddBudgetScreen';
import TransactionListScreen from '../screens/TransactionListScreen';
import AddTransactionScreen from '../screens/AddTransactionScreen';
import PartnerBudgetViewScreen from '../screens/PartnerBudgetViewScreen';

export type AppStackParamList = {
  Home: undefined;
  Profile: undefined;
  PartnerConnection: undefined;
  PartnerRequests: undefined;
  PartnerProfile: undefined;
  CategoryManagement: undefined;
  BudgetList: undefined;
  AddBudget: { budget?: any } | undefined;
  TransactionList: undefined;
  AddTransaction: { transaction?: any } | undefined;
  PartnerBudgetView: undefined;
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
      <Stack.Screen
        name="CategoryManagement"
        component={CategoryManagementScreen}
        options={{ title: 'Categories' }}
      />
      <Stack.Screen
        name="BudgetList"
        component={BudgetListScreen}
        options={{ title: 'Budgets' }}
      />
      <Stack.Screen
        name="AddBudget"
        component={AddBudgetScreen}
        options={({ route }) => ({
          title: route.params?.budget ? 'Edit Budget' : 'Add Budget',
        })}
      />
      <Stack.Screen
        name="TransactionList"
        component={TransactionListScreen}
        options={{ title: 'Transactions' }}
      />
      <Stack.Screen
        name="AddTransaction"
        component={AddTransactionScreen}
        options={({ route }) => ({
          title: route.params?.transaction ? 'Edit Transaction' : 'Add Transaction',
        })}
      />
      <Stack.Screen
        name="PartnerBudgetView"
        component={PartnerBudgetViewScreen}
        options={{ title: "Partner's Budget" }}
      />
    </Stack.Navigator>
  );
}
