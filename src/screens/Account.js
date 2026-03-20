import React, { useState } from 'react';
import { signOut, deleteUser } from 'firebase/auth';
import { doc, deleteDoc } from 'firebase/firestore';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Alert, ScrollView, StyleSheet } from 'react-native';

import Cell from '../components/Cell';
import { auth, database } from '../config/firebase';
import { colors, layout, spacing } from '../config/constants';

const Account = () => {
  const [activeAction, setActiveAction] = useState(null);

  const onSignOut = async () => {
    try {
      setActiveAction('logout');
      await signOut(auth);
    } catch (error) {
      Alert.alert('Logout failed', error.message);
    } finally {
      setActiveAction(null);
    }
  };

  const deleteAccount = async () => {
    const currentUser = auth?.currentUser;
    const userEmail = currentUser?.email;

    if (!currentUser || !userEmail) {
      Alert.alert('Delete failed', 'You must be signed in to delete your account.');
      return;
    }

    try {
      setActiveAction('delete');
      await deleteUser(currentUser);
      await deleteDoc(doc(database, 'users', userEmail));
    } catch (error) {
      Alert.alert('Delete failed', error.message);
    } finally {
      setActiveAction(null);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <Cell
            title="Logout"
            subtitle={activeAction === 'logout' ? 'Signing you out...' : 'Sign out of this device'}
            icon="log-out-outline"
            tintColor={colors.grey}
            accessibilityHint="Shows a confirmation before signing out"
            onPress={() => {
              if (activeAction) {
                return;
              }

              Alert.alert(
                'Logout?',
                'You will need to sign in again to access your chats.',
                [
                  {
                    text: 'Logout',
                    onPress: onSignOut,
                  },
                  {
                    text: 'Cancel',
                    style: 'cancel',
                  },
                ],
                { cancelable: true }
              );
            }}
            showForwardIcon={false}
          />
        </View>

        <View style={styles.card}>
          <Cell
            title="Delete my account"
            subtitle={
              activeAction === 'delete'
                ? 'Deleting your account...'
                : 'Permanently remove your profile and local access'
            }
            icon="trash-outline"
            tintColor={colors.red}
            accessibilityHint="Shows a destructive confirmation before deleting your account"
            onPress={() => {
              if (activeAction) {
                return;
              }

              Alert.alert(
                'Delete account?',
                'This permanently removes your auth user and profile from this Firebase project.',
                [
                  {
                    text: 'Delete my account',
                    style: 'destructive',
                    onPress: deleteAccount,
                  },
                  {
                    text: 'Cancel',
                    style: 'cancel',
                  },
                ],
                { cancelable: true }
              );
            }}
            showForwardIcon={false}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: layout.cardRadius,
    marginBottom: spacing.sm,
    overflow: 'hidden',
  },
  container: {
    backgroundColor: '#F8FAFC',
    flex: 1,
  },
  content: {
    paddingBottom: spacing.lg,
    paddingHorizontal: layout.pageInset,
    paddingTop: layout.pageTopInset,
  },
});

export default Account;
