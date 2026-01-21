import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { store } from './src/store/indextjs';
import AppNavigator from './src/navigation/AppNavigator';
import { StatusBar } from 'react-native';
import { Camera } from 'react-native-vision-camera';

export default function App() {

  useEffect(() => {
    (async () => {
      const cameraPermission = await Camera.requestCameraPermission();
      console.log('Camera permission:', cameraPermission);
    })();
  }, []);

  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <NavigationContainer>
          <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
          <AppNavigator />
        </NavigationContainer>
      </SafeAreaProvider>
    </Provider>
  );
}
