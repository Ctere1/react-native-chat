import React from 'react';
import { View, Alert } from 'react-native';
import { signOut, deleteUser } from 'firebase/auth';
import { doc, deleteDoc } from 'firebase/firestore';

import Cell from '../components/Cell';
import { colors } from '../config/constants';
import { auth, database } from '../config/firebase';

const Account = () => {
  const onSignOut = () => {
    signOut(auth).catch((error) => console.log('Error logging out: ', error));
  };

  const deleteAccount = () => {
    deleteUser(auth?.currentUser).catch((error) => console.log('Error deleting: ', error));
    deleteDoc(doc(database, 'users', auth?.currentUser.email));
  };

  return (
    <View>
      <Cell
        title="Blocked Users"
        icon="close-circle-outline"
        tintColor={colors.primary}
        onPress={() => {
          alert('Blocked users touched');
        }}
        style={{ marginTop: 20 }}
      />
      <Cell
        title="Logout"
        icon="log-out-outline"
        tintColor={colors.grey}
        onPress={() => {
          Alert.alert(
            'Logout?',
            'You have to login again',
            [
              {
                text: 'Logout',
                onPress: () => {
                  onSignOut();
                },
              },
              {
                text: 'Cancel',
              },
            ],
            { cancelable: true }
          );
        }}
        showForwardIcon={false}
      />
      <Cell
        title="Delete my account"
        icon="trash-outline"
        tintColor={colors.red}
        onPress={() => {
          Alert.alert(
            'Delete account?',
            'Deleting your account will erase your message history',
            [
              {
                text: 'Delete my account',
                onPress: () => {
                  deleteAccount();
                },
              },
              {
                text: 'Cancel',
              },
            ],
            { cancelable: true }
          );
        }}
        showForwardIcon={false}
        style={{ marginTop: 20 }}
      />
    </View>
  );
};

export default Account;
