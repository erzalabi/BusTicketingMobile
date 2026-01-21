import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useSelector, useDispatch } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActivityIndicator, View } from 'react-native';
import { setCredentials } from '../store/slices/authSlice';

// Auth Screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';

// Passenger Screens
import PassengerHome from '../screens/passenger/HomeScreen';
import SearchBusScreen from '../screens/passenger/SearchBusScreen';
import BusDetailScreen from '../screens/passenger/BusDetailScreen';
import SeatSelectionScreen from '../screens/passenger/SeatSelectionScreen';
import BookingScreen from '../screens/passenger/BookingScreen';
import PaymentScreen from '../screens/passenger/PaymentScreen';
import MyTicketsScreen from '../screens/passenger/MyTicketsScreen';
import TicketDetailScreen from '../screens/passenger/TicketDetailScreen';

// Conductor Screens
import ConductorHome from '../screens/conductor/HomeScreen';
import ScanTicketScreen from '../screens/conductor/ScanTicketScreen';
import PassengerListScreen from '../screens/conductor/PassengerListScreen';

const Stack = createStackNavigator();

export default function AppNavigator() {
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(true);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const [token, userData] = await Promise.all([
        AsyncStorage.getItem('userToken'),
        AsyncStorage.getItem('userData'),
      ]);
      
      if (token && userData) {
        const parsedUserData = JSON.parse(userData);
        dispatch(setCredentials({
          token,
          user: parsedUserData,
          isAuthenticated: true,
        }));
      }
    } catch (error) {
      console.error('Auth check error:', error);
      // Clear invalid data
      await AsyncStorage.multiRemove(['userToken', 'userData']);
    } finally {
      setLoading(false);
      setIsCheckingAuth(false);
    }
  };

  // Show loading indicator
  if (loading || isCheckingAuth) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator 
        screenOptions={{ 
          headerShown: false,
          animationEnabled: true,
          gestureEnabled: true,
        }}
      >
        {!isAuthenticated ? (
          <>
            {/* Auth Stack */}
            <Stack.Screen 
              name="Login" 
              component={LoginScreen} 
              options={{ gestureEnabled: false }}
            />
            <Stack.Screen 
              name="Register" 
              component={RegisterScreen} 
            />
          </>
        ) : user?.role === 'passenger' ? (
          <>
            {/* Passenger Stack */}
            <Stack.Screen 
              name="PassengerHome" 
              component={PassengerHome} 
              options={{ gestureEnabled: false }}
            />
            <Stack.Screen name="SearchBus" component={SearchBusScreen} />
            <Stack.Screen name="BusDetail" component={BusDetailScreen} />
            <Stack.Screen name="SeatSelection" component={SeatSelectionScreen} />
            <Stack.Screen name="Booking" component={BookingScreen} />
            <Stack.Screen name="Payment" component={PaymentScreen} />
            <Stack.Screen name="MyTickets" component={MyTicketsScreen} />
            <Stack.Screen name="TicketDetail" component={TicketDetailScreen} />
          </>
        ) : (
          <>
            {/* Conductor Stack */}
            <Stack.Screen 
              name="ConductorHome" 
              component={ConductorHome} 
              options={{ gestureEnabled: false }}
            />
            <Stack.Screen name="ScanTicket" component={ScanTicketScreen} />
            <Stack.Screen name="PassengerList" component={PassengerListScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}