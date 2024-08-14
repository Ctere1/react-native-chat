import 'dotenv/config';

export default {
  "expo": {
    "name": "react-native-chat",
    "slug": "react-native-chat",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "assetBundlePatterns": [
      "**/*"
    ],
    "ios": {
      "supportsTablet": true
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      },
      "package": "com.ctere1.reactnativechat"
    },
    "web": {
      "favicon": "./assets/favicon.png"
    },
    "extra": {
      "apiKey": process.env.EXPO_PUBLIC_API_KEY,
      "authDomain": process.env.EXPO_PUBLIC_AUTH_DOMAIN,
      "projectId": process.env.EXPO_PUBLIC_PROJECT_ID,
      "storageBucket": process.env.EXPO_PUBLIC_STORAGE_BUCKET,
      "messagingSenderId": process.env.EXPO_PUBLIC_MESSAGING_SENDER_ID,
      "appId": process.env.EXPO_PUBLIC_APP_ID,
      "measurementId": process.env.EXPO_PUBLIC_MEASUREMENT_ID,
      "eas": {
        "projectId": process.env.EXPO_PUBLIC_EAS_PROJECT_ID
      }
    }
  }
}
