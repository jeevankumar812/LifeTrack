
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import DashboardScreen from '../screens/dashboard/DashboardScreen';
import TasksScreen from '../screens/tasks/TasksScreen';
import HabitsScreen from '../screens/habits/HabitsScreen';
import NotesScreen from '../screens/notes/NotesScreen';
import ExpensesScreen from '../screens/expenses/ExpensesScreen';

import { useAuth } from '../context/AuthContext';
import Loading from '../components/Loading';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return <Loading />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'none',
          gestureEnabled: false,
        }}
      >
        {user ? (
          <>
            <Stack.Screen
              name="Dashboard"
              component={DashboardScreen}
            />

            <Stack.Screen
              name="Tasks"
              component={TasksScreen}
            />

            <Stack.Screen
              name="Habits"
              component={HabitsScreen}
            />

            <Stack.Screen
              name="Notes"
              component={NotesScreen}
            />

            <Stack.Screen
             name="Expenses"
                component={ExpensesScreen}
/>
          </>
        ) : (
          <>
            <Stack.Screen
              name="Login"
              component={LoginScreen}
            />

            <Stack.Screen
              name="Register"
              component={RegisterScreen}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
