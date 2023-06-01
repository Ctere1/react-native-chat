import React, { useState, createContext, useContext, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { View, ActivityIndicator } from 'react-native';
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from '@expo/vector-icons'
import Chats from './screens/Chats'
import Settings from "./screens/Settings";
import { colors } from "./config/constants";
import SignUp from "./screens/SignUp";
import Chat from "./screens/Chat";
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './config/firebase';
import Profile from "./screens/Profile";
import Login from "./screens/Login";
import Users from "./screens/Users";
import About from "./screens/About";
import Account from "./screens/Account";
import Help from "./screens/Help";
import Group from "./screens/Group";

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator()
const AuthenticatedUserContext = createContext({});

const AuthenticatedUserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  return (
    <AuthenticatedUserContext.Provider value={{ user, setUser }}>
      {children}
    </AuthenticatedUserContext.Provider>
  );
};

const TabNavigator = () => (
  <Tab.Navigator screenOptions={({ route }) => ({
    tabBarIcon: ({ focused, color, size }) => {
      let iconName;

      if (route.name === 'Chats') {
        iconName = focused
          ? 'chatbubbles'
          : 'chatbubbles-outline';
      } else if (route.name === 'Settings') {
        iconName = focused ? 'settings' : 'settings-outline';
      }
      // You can return any component that you like here!
      return <Ionicons name={iconName} size={size} color={color} />;
    },
    tabBarActiveTintColor: colors.primary,
    tabBarInactiveTintColor: 'gray',
    headerShown: true,
    presentation: 'modal'
  })}>
    <Tab.Screen name="Chats" component={Chats} />
    <Tab.Screen name="Settings" component={Settings} />
  </Tab.Navigator >
)

const MainStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="Home" component={TabNavigator} options={{ headerShown: false }} />
    <Stack.Screen name="Chat" component={Chat} options={({ route }) => ({ headerTitle: route.params.chatName })} />
    <Stack.Screen name="Users" component={Users} options={{ title: 'Select User' }} />
    <Stack.Screen name="Profile" component={Profile} />
    <Stack.Screen name="About" component={About} />
    <Stack.Screen name="Help" component={Help} />
    <Stack.Screen name="Account" component={Account} />
    <Stack.Screen name="Group" component={Group} options={{ title: 'New Group' }} />
  </Stack.Navigator>
)

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name='Login' component={Login} />
      <Stack.Screen name='SignUp' component={SignUp} />
    </Stack.Navigator>
  );
}

function RootNavigator() {
  const { user, setUser } = useContext(AuthenticatedUserContext);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    // onAuthStateChanged returns an unsubscriber
    const unsubscribeAuth = onAuthStateChanged(
      auth,
      async authenticatedUser => {
        authenticatedUser ? setUser(authenticatedUser) : setUser(null);
        setIsLoading(false);
      }
    );
    // unsubscribe auth listener on unmount
    return unsubscribeAuth;
  }, [user]);
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size='large' />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {user ? <MainStack /> : <AuthStack />}
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AuthenticatedUserProvider>
      <RootNavigator />
    </AuthenticatedUserProvider>
  );
}
