import messaging from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { confirmIntake } from '../api/patient';
import { Platform } from 'react-native';

export const initFCM = async () => {
  await messaging().requestPermission();
  const token = await messaging().getToken();
  await AsyncStorage.setItem('fcmToken', token);

  messaging().onMessage(async (remoteMessage) => {
    // Handle foreground notifications
    console.log('Foreground notification:', remoteMessage);
  });

  messaging().onNotificationOpenedApp((remoteMessage) => {
    // Handle notification click when app is in background
    if (remoteMessage.data.intakeId) {
      navigateToNotificationScreen(remoteMessage.data);
    }
  });

  messaging().getInitialNotification().then((remoteMessage) => {
    // Handle notification click when app is quit
    if (remoteMessage && remoteMessage.data.intakeId) {
      navigateToNotificationScreen(remoteMessage.data);
    }
  });
};

export const handleBackgroundNotification = async (remoteMessage) => {
  console.log('Background notification:', remoteMessage);
};

const navigateToNotificationScreen = (data) => {
  // Navigation logic to NotificationScreen will be handled in App.js
};