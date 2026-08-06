import React, { useEffect, useRef } from 'react';
import { View, StyleSheet } from 'react-native';

interface VideoPlayerProps {
  url: string;
  isActive: boolean;
  posterUrl?: string;
}

export default function VideoPlayer({ url, isActive, posterUrl }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isActive) {
      video.currentTime = 0;
      video.play().catch(err => console.log('Autoplay blocked or failed:', err));
    } else {
      video.pause();
    }
  }, [isActive]);

  return (
    <View style={styles.container}>
      <video
        ref={videoRef}
        src={url}
        poster={posterUrl}
        style={styles.video}
        loop
        muted
        playsInline
        autoPlay={isActive}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    backgroundColor: '#000',
  },
  video: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
});
