import messaging from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { getToken } from './auth';

const API_URL = 'http://192.168.1.11:8080/api/patient';

let navigationRef = null;

export const setNavigationRef = (ref) => {
  navigationRef = ref;
};

export const initFCM = async () => {
  try {
    console.log('Starting FCM initialization');
    const authStatus = await messaging().requestPermission();
    const enabled = authStatus === messaging.AuthorizationStatus.AUTHORIZED || 
                    authStatus === messaging.AuthorizationStatus.PROVISIONAL;
    
    if (enabled) {
      const fcmToken = await messaging().getToken();
      await AsyncStorage.setItem('fcmToken', fcmToken);
      console.log('FCM Token:', fcmToken);

      // Envoyer le token au backend
      try {
        const token = await getToken();
        console.log('JWT Token for FCM:', token);
        await axios.put(`${API_URL}/device-token`, { deviceToken: fcmToken }, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log('FCM Token envoyé au backend');
      } catch (authError) {
        console.error('Erreur lors de l\'envoi du FCM Token:', authError.message);
      }

      messaging().onMessage(async (remoteMessage) => {
        console.log('Foreground notification:', JSON.stringify(remoteMessage, null, 2));
        navigateToNotificationScreen(remoteMessage.data);
      });

      messaging().onNotificationOpenedApp((remoteMessage) => {
        console.log('Notification opened:', JSON.stringify(remoteMessage, null, 2));
        if (remoteMessage.data.intakeId) {
          navigateToNotificationScreen(remoteMessage.data);
        }
      });

      messaging().getInitialNotification().then((remoteMessage) => {
        if (remoteMessage && remoteMessage.data.intakeId) {
          console.log('Initial notification:', JSON.stringify(remoteMessage, null, 2));
          navigateToNotificationScreen(remoteMessage.data);
        }
      });
    } else {
      console.log('FCM permission not granted');
    }
  } catch (error) {
    console.error('Erreur initFCM:', error);
  }
};

export const handleBackgroundNotification = async (remoteMessage) => {
  console.log('Background notification:', JSON.stringify(remoteMessage, null, 2));
};

const navigateToNotificationScreen = (data) => {
  if (navigationRef && data.intakeId) {
    navigationRef.navigate('Notification', {
      intakeId: data.intakeId,
      medication: data.medicationName,
    });
  }
};