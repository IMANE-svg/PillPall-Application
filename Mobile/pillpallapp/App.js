import React, { useEffect, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from './src/screens/auth/LoginScreen';
import RegisterScreen from './src/screens/auth/RegisterScreen';
import DoctorNavigator from './src/navigation/DoctorNavigator';
import PatientNavigator from './src/navigation/PatientNavigator';
import AdminNavigator from './src/navigation/AdminNavigator';
import NotificationScreen from './src/screens/NotificationScreen';
import { initFCM, setNavigationRef } from './src/utils/fcm';
import messaging from '@react-native-firebase/messaging';

const Stack = createNativeStackNavigator();

const App = () => {
  const navigationRef = useRef(null);

  useEffect(() => {
    initFCM();
    setNavigationRef(navigationRef.current);
    messaging().setBackgroundMessageHandler(async (remoteMessage) => {
      console.log('Background notification:', remoteMessage);
    });
  }, []);

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Doctor" component={DoctorNavigator} options={{ headerShown: false }} />
        <Stack.Screen name="Patient" component={PatientNavigator} options={{ headerShown: false }} />
        <Stack.Screen name="Admin" component={AdminNavigator} options={{ headerShown: false }} />
        <Stack.Screen name="Notification" component={NotificationScreen} options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;