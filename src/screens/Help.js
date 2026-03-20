import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Alert, Linking, ScrollView, StyleSheet } from 'react-native';

import Cell from '../components/Cell';
import { colors, layout, spacing } from '../config/constants';

const Help = () => {
  const openSupport = async () => {
    try {
      await Linking.openURL('https://github.com/Ctere1/react-native-chat/issues');
    } catch (error) {
      Alert.alert('Unable to open support', error.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <Cell
            title="Contact support"
            subtitle="Open issue reporting and technical help"
            icon="help-buoy-outline"
            tintColor={colors.primary}
            onPress={openSupport}
            accessibilityHint="Opens the support page in your browser"
          />
          <Cell
            title="Firebase setup"
            subtitle="This project uses the Firebase config you provide"
            icon="cloud-outline"
            tintColor={colors.teal}
            showForwardIcon={false}
            accessibilityHint="Shows Firebase setup guidance"
            onPress={() => {
              Alert.alert(
                'Firebase setup',
                'This repository is a starter app. Authentication, Firestore, Storage, and project policies depend on the Firebase project configured by the person deploying it.'
              );
            }}
          />
          <Cell
            title="Troubleshooting"
            subtitle="Use the repository issues page for bugs and setup problems"
            icon="construct-outline"
            tintColor={colors.pink}
            showForwardIcon={false}
            accessibilityHint="Shows troubleshooting guidance"
            onPress={() => {
              Alert.alert(
                'Troubleshooting',
                'If something breaks, collect the error details and open an issue in the repository so the behavior can be reproduced and fixed.'
              );
            }}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F8FAFC',
    flex: 1,
  },
  content: {
    paddingBottom: spacing.lg,
    paddingHorizontal: layout.pageInset,
    paddingTop: layout.pageTopInset,
  },
  section: {
    borderRadius: layout.cardRadius,
    overflow: 'hidden',
  },
});

export default Help;
