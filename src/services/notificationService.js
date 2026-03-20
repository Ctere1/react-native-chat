import Constants from 'expo-constants';
import { Platform } from 'react-native';

const isExpoGoAndroid =
  Platform.OS === 'android'
  && (
    Constants.executionEnvironment === 'storeClient'
      || Constants.appOwnership === 'expo'
  );

let notificationsEnabled = false;
let notificationsModulePromise;
let notificationHandlerConfigured = false;

const getNotificationsModule = async () => {
  if (isExpoGoAndroid) {
    return null;
  }

  if (!notificationsModulePromise) {
    notificationsModulePromise = import('expo-notifications').then((Notifications) => {
      if (!notificationHandlerConfigured) {
        Notifications.setNotificationHandler({
          handleNotification: async () => ({
            shouldPlaySound: true,
            shouldSetBadge: false,
            shouldShowBanner: true,
            shouldShowList: true,
          }),
        });
        notificationHandlerConfigured = true;
      }

      return Notifications;
    });
  }

  return notificationsModulePromise;
};

export const configureNotifications = async () => {
  try {
    if (isExpoGoAndroid) {
      notificationsEnabled = false;
      console.log(
        'Skipping expo-notifications setup in Expo Go for Android. Use a development build for push features.'
      );
      return false;
    }

    const Notifications = await getNotificationsModule();

    if (!Notifications) {
      notificationsEnabled = false;
      return false;
    }

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('messages', {
        name: 'Messages',
        importance: Notifications.AndroidImportance.DEFAULT,
      });
    }

    const settings = await Notifications.getPermissionsAsync();

    if (settings.granted) {
      notificationsEnabled = true;
      return true;
    }

    const requestedSettings = await Notifications.requestPermissionsAsync();
    notificationsEnabled = requestedSettings.granted;
    return notificationsEnabled;
  } catch (error) {
    console.log('Notification setup failed', error);
    notificationsEnabled = false;
    return false;
  }
};

export const scheduleChatNotification = async ({ body, chatId, title }) => {
  if (!notificationsEnabled) {
    return;
  }

  const Notifications = await getNotificationsModule();

  if (!Notifications) {
    return;
  }

  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data: { chatId },
    },
    trigger: null,
  });
};
