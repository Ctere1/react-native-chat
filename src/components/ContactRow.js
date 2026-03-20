import React from 'react';
import PropTypes from 'prop-types';
import { Ionicons } from '@expo/vector-icons';
import { Text, View, StyleSheet, TouchableOpacity } from 'react-native';

import { buildInitials } from '../utils/chat';
import { colors, spacing } from '../config/constants';

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
  <TouchableOpacity
    accessibilityHint={newMessageCount > 0 ? `${newMessageCount} unread messages` : undefined}
    accessibilityLabel={`${name}. ${subtitle}${subtitle2 ? `. ${subtitle2}` : ''}`}
    accessibilityRole="button"
    style={[styles.row, style]}
    onPress={onPress}
    onLongPress={onLongPress}
  >
    <View style={styles.avatar}>
      <Text style={styles.avatarLabel}>{buildInitials(name)}</Text>
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
    borderRadius: 26,
    height: 52,
    justifyContent: 'center',
    width: 52,
  },
  avatarLabel: {
    color: 'white',
    fontSize: 18,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 20,
  },
  newMessageBadge: {
    alignItems: 'center',
    backgroundColor: colors.teal,
    borderRadius: 12,
    justifyContent: 'center',
    marginBottom: spacing.xxs,
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
    marginLeft: spacing.sm,
    minWidth: 52,
  },
  row: {
    alignItems: 'center',
    borderBottomWidth: 0.5,
    borderColor: '#e0e0e0',
    flexDirection: 'row',
    minHeight: 68,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  subtitle: {
    color: '#565656',
    fontSize: 14,
    lineHeight: 18,
    marginTop: spacing.xxs,
    maxWidth: 200,
  },
  subtitle2: {
    color: '#8e8e8e',
    fontSize: 12,
    marginBottom: spacing.xxs,
  },
  textsContainer: {
    flex: 1,
    marginStart: spacing.sm,
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
