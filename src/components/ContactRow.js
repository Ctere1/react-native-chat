import React from 'react';
import PropTypes from 'prop-types';
import { Ionicons } from '@expo/vector-icons';
import { Text, View, StyleSheet, TouchableOpacity } from 'react-native';

import { colors } from '../config/constants';

const ContactRow = ({
  name,
  subtitle,
  onPress,
  style,
  onLongPress,
  selected,
  showForwardIcon = true,
  subtitle2,
  newMessageCount,
}) => (
  <TouchableOpacity style={[styles.row, style]} onPress={onPress} onLongPress={onLongPress}>
    <View style={styles.avatar}>
      <Text style={styles.avatarLabel}>
        {name
          .trim()
          .split(' ')
          .reduce((prev, current) => `${prev}${current[0]}`, '')}
      </Text>
    </View>

    <View style={styles.textsContainer}>
      <Text style={styles.name}>{name}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>

    <View style={styles.rightContainer}>
      <Text style={styles.subtitle2}>{subtitle2}</Text>

      {newMessageCount > 0 && (
        <View style={styles.newMessageBadge}>
          <Text style={styles.newMessageText}>{newMessageCount}</Text>
        </View>
      )}

      {selected && (
        <View style={styles.overlay}>
          <Ionicons name="checkmark-outline" size={16} color="white" />
        </View>
      )}

      {showForwardIcon && <Ionicons name="chevron-forward-outline" size={20} />}
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  avatar: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 28,
    height: 56,
    justifyContent: 'center',
    width: 56,
  },
  avatarLabel: {
    color: 'white',
    fontSize: 20,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
  },
  newMessageBadge: {
    alignItems: 'center',
    backgroundColor: colors.teal,
    borderRadius: 12,
    justifyContent: 'center',
    marginBottom: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  newMessageText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  overlay: {
    alignItems: 'center',
    backgroundColor: colors.teal,
    borderColor: 'black',
    borderRadius: 11,
    borderWidth: 1.5,
    height: 22,
    justifyContent: 'center',
    position: 'absolute',
    right: 0,
    top: 0,
    width: 22,
  },
  rightContainer: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  row: {
    alignItems: 'center',
    borderBottomWidth: 0.5,
    borderColor: '#e0e0e0',
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  subtitle: {
    color: '#565656',
    fontSize: 14,
    marginTop: 4,
    maxWidth: 200,
  },
  subtitle2: {
    color: '#8e8e8e',
    fontSize: 12,
    marginBottom: 4,
  },
  textsContainer: {
    flex: 1,
    marginStart: 16,
  },
});

ContactRow.propTypes = {
  name: PropTypes.string.isRequired,
  subtitle: PropTypes.string.isRequired,
  onPress: PropTypes.func.isRequired,
  style: PropTypes.object,
  onLongPress: PropTypes.func,
  selected: PropTypes.bool,
  showForwardIcon: PropTypes.bool,
  subtitle2: PropTypes.string,
  newMessageCount: PropTypes.number,
};

export default ContactRow;
