import React from 'react';
import PropTypes from 'prop-types';
import { Text, StyleSheet, TouchableOpacity } from 'react-native';

const Button = ({ title, variant }) => (
  <TouchableOpacity
    style={[
      styles.buttonContainer,
      { backgroundColor: variant === 'primary' ? 'black' : 'transparent' },
      { paddingHorizontal: variant === 'primary' ? 18 : 0 },
    ]}
  >
    <Text style={[styles.buttonLabel, { color: variant === 'primary' ? 'white' : 'black' }]}>
      {title}
    </Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  buttonContainer: {
    borderRadius: 6,
    paddingVertical: 12,
  },
  buttonLabel: {
    fontSize: 18,
  },
});

Button.propTypes = {
  title: PropTypes.string.isRequired,
  variant: PropTypes.string,
};

export default Button;
