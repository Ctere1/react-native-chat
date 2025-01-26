import React from 'react';
import PropTypes from 'prop-types';
import { Ionicons } from '@expo/vector-icons';
import { Text, View, StyleSheet, TouchableOpacity } from 'react-native';

const Cell = ({
  title,
  icon,
  iconColor = 'white',
  tintColor,
  style,
  onPress,
  secondIcon,
  subtitle,
  showForwardIcon = true,
}) => (
  <TouchableOpacity style={[styles.cell, style]} onPress={onPress}>
    <View style={[styles.iconContainer, { backgroundColor: tintColor }]}>
      <Ionicons name={icon} size={24} marginStart={4} color={iconColor} />
    </View>

    <View style={styles.textsContainer}>
      <Text style={styles.title}>{title}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
    {showForwardIcon && <Ionicons name={secondIcon ?? 'chevron-forward-outline'} size={20} />}
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  cell: {
    alignItems: 'center',
    backgroundColor: 'white',
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  iconContainer: {
    alignContent: 'center',
    borderRadius: 6,
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  subtitle: {
    color: '#565656',
  },
  textsContainer: {
    flex: 1,
    marginStart: 8,
  },
  title: {
    fontSize: 16,
  },
});

Cell.propTypes = {
  title: PropTypes.string.isRequired,
  icon: PropTypes.string.isRequired,
  iconColor: PropTypes.string,
  tintColor: PropTypes.string,
  style: PropTypes.object,
  onPress: PropTypes.func,
  secondIcon: PropTypes.string,
  subtitle: PropTypes.string,
  showForwardIcon: PropTypes.bool,
};

export default Cell;
