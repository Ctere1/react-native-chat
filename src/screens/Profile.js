import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Cell from '../components/Cell';
import { auth } from '../config/firebase';
import { buildInitials } from '../utils/chat';
import { colors, layout, spacing } from '../config/constants';

const Profile = () => {
  const initials = buildInitials(auth?.currentUser?.displayName || auth?.currentUser?.email || '');

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.avatarContainer}>
        <View style={styles.avatar}>
          <Text style={styles.avatarLabel}>{initials}</Text>
        </View>
      </View>

      <View style={styles.infoContainer}>
        <View style={styles.card}>
          <Cell
            title="Name"
            icon="person-outline"
            iconColor="black"
            subtitle={auth?.currentUser?.displayName || 'No name set'}
            showForwardIcon={false}
            style={styles.cellDivider}
          />

          <Cell
            title="Email"
            subtitle={auth?.currentUser?.email}
            icon="mail-outline"
            iconColor="black"
            showForwardIcon={false}
            style={styles.cellDivider}
          />

          <Cell
            title="About"
            subtitle="Available"
            icon="information-circle-outline"
            iconColor="black"
            showForwardIcon={false}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  avatar: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 48,
    height: 96,
    justifyContent: 'center',
    width: 96,
  },
  avatarContainer: {
    alignItems: 'center',
    marginTop: layout.pageTopInset,
  },
  avatarLabel: {
    color: 'white',
    fontSize: 30,
    fontWeight: 'bold',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: layout.cardRadius,
    overflow: 'hidden',
  },
  cellDivider: {
    borderBottomColor: '#e0e0e0',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  container: {
    backgroundColor: '#F8FAFC',
    flex: 1,
  },
  infoContainer: {
    marginTop: spacing.lg,
    paddingHorizontal: layout.pageInset,
    width: '100%',
  },
});

export default Profile;
