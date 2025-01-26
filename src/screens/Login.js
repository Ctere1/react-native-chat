import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import {
  Text,
  View,
  Image,
  Alert,
  TextInput,
  StatusBar,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';

import { auth } from '../config/firebase';
import { colors } from '../config/constants';
import backImage from '../assets/background.png';

export default function Login({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const onHandleLogin = () => {
    if (email !== '' && password !== '') {
      signInWithEmailAndPassword(auth, email, password)
        .then(() => console.log('Login success'))
        .catch((err) => Alert.alert('Login error', err.message));
    }
  };

  return (
    <View style={styles.container}>
      <Image source={backImage} style={styles.backImage} />
      <View style={styles.whiteSheet} />
      <SafeAreaView style={styles.form}>
        <Text style={styles.title}>Log In</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter email"
          autoCapitalize="none"
          keyboardType="email-address"
          textContentType="emailAddress"
          autoFocus
          value={email}
          onChangeText={(text) => setEmail(text)}
        />
        <TextInput
          style={styles.input}
          placeholder="Enter password"
          autoCapitalize="none"
          autoCorrect={false}
          secureTextEntry
          textContentType="password"
          value={password}
          onChangeText={(text) => setPassword(text)}
        />
        <TouchableOpacity style={styles.button} onPress={onHandleLogin}>
          <Text style={{ fontWeight: 'bold', color: '#fff', fontSize: 18 }}> Log In</Text>
        </TouchableOpacity>
        <View
          style={{ marginTop: 30, flexDirection: 'row', alignItems: 'center', alignSelf: 'center' }}
        >
          <Text style={{ color: 'gray', fontWeight: '600', fontSize: 14 }}>
            Don&apos;t have an account? &nbsp;
          </Text>
          <TouchableOpacity
            onPress={() => {
              navigation.navigate('SignUp');
            }}
          >
            <Text style={{ color: colors.pink, fontWeight: '600', fontSize: 14 }}> Sign Up</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
      <StatusBar barStyle="light-content" />
    </View>
  );
}
const styles = StyleSheet.create({
  backImage: {
    height: 340,
    position: 'absolute',
    resizeMode: 'cover',
    top: 0,
    width: '100%',
  },
  button: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 10,
    height: 58,
    justifyContent: 'center',
    marginTop: 40,
  },
  container: {
    backgroundColor: '#fff',
    flex: 1,
  },
  form: {
    flex: 1,
    justifyContent: 'center',
    marginHorizontal: 30,
  },
  input: {
    backgroundColor: '#F6F7FB',
    borderRadius: 10,
    fontSize: 16,
    height: 58,
    marginBottom: 20,
    padding: 12,
  },
  title: {
    alignSelf: 'center',
    color: 'black',
    fontSize: 36,
    fontWeight: 'bold',
    paddingBottom: 24,
  },
  whiteSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 60,
    bottom: 0,
    height: '75%',
    position: 'absolute',
    width: '100%',
  },
});

Login.propTypes = {
  navigation: PropTypes.object.isRequired,
};
