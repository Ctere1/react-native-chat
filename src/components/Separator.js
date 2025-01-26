import React from 'react';
import { View, StyleSheet } from 'react-native';

import { colors } from '../config/constants';

const Separator = () => <View style={styles.separator} />;

const styles = StyleSheet.create({
  separator: {
    backgroundColor: colors.border,
    height: StyleSheet.hairlineWidth,
  },
});

export default Separator;
