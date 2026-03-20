import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, View, ScrollView, StyleSheet } from 'react-native';

import { layout, spacing } from '../config/constants';

const sections = [
  {
    title: 'Open-source starter',
    body:
      'React Native Chat is an Expo and Firebase starter project for direct and group messaging, media sharing, and real-time updates.',
  },
  {
    title: 'Your Firebase project',
    body:
      'Auth, Firestore, Storage, security rules, and operational policies come from the Firebase project configured by whoever deploys this app.',
  },
  {
    title: 'Repository support',
    body:
      'For source code, setup guidance, and bug reports, use the GitHub repository linked from Settings.',
  },
];

const About = () => (
  <SafeAreaView style={styles.container}>
    <ScrollView contentContainerStyle={styles.content}>
      {sections.map((section) => (
        <View key={section.title} style={styles.card}>
          <Text style={styles.cardTitle}>{section.title}</Text>
          <Text style={styles.cardBody}>{section.body}</Text>
        </View>
      ))}
    </ScrollView>
  </SafeAreaView>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: layout.cardRadius,
    padding: spacing.md,
    width: '100%',
  },
  cardBody: {
    color: '#4B5563',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
  },
  cardTitle: {
    color: '#111827',
    fontSize: 16,
    fontWeight: '600',
  },
  container: {
    backgroundColor: '#F8FAFC',
    flex: 1,
  },
  content: {
    gap: spacing.sm,
    paddingBottom: spacing.lg,
    paddingHorizontal: layout.pageInset,
    paddingTop: layout.pageTopInset,
  },
});

export default About;
