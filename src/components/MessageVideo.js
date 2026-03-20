import React from 'react';
import PropTypes from 'prop-types';
import { StyleSheet } from 'react-native';
import { VideoView, useVideoPlayer } from 'expo-video';

const MessageVideo = ({ currentMessage }) => {
  const player = useVideoPlayer(currentMessage.video, (videoPlayer) => {
    videoPlayer.loop = false;
  });

  return (
    <VideoView
      style={styles.video}
      player={player}
      allowsFullscreen
      nativeControls
      contentFit="contain"
    />
  );
};

const styles = StyleSheet.create({
  video: {
    borderRadius: 12,
    height: 212,
    width: 212,
  },
});

MessageVideo.propTypes = {
  currentMessage: PropTypes.shape({
    video: PropTypes.string.isRequired,
  }).isRequired,
};

export default MessageVideo;
