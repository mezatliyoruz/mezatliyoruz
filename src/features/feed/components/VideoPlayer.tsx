import React, { useEffect, useState } from 'react';
import { useVideoPlayer, VideoView } from 'expo-video';
import { View, StyleSheet, Pressable, Platform, Image } from 'react-native';
import { Volume2, VolumeX } from 'lucide-react-native';
import { useEvent } from 'expo';
import { VideoCacheManager } from '@/services/video-cache';

interface VideoPlayerProps {
  url: string;
  isActive: boolean;
  posterUrl?: string;
}

function ActualVideoPlayer({ url, isActive, posterUrl }: VideoPlayerProps) {
  const [isMuted, setIsMuted] = useState(false);

  const player = useVideoPlayer(url, (p) => {
    p.loop = true;
    p.muted = false; // sound is automatically open by default
  });

  // Track the playback status to show/hide the poster/thumbnail overlay
  const { status } = useEvent(player, 'statusChange', { status: player.status });

  useEffect(() => {
    if (isActive) {
      player.play();
    } else {
      player.pause();
    }
  }, [isActive, player]);

  const toggleMute = () => {
    const nextMuted = !player.muted;
    player.muted = nextMuted;
    setIsMuted(nextMuted);
  };

  return (
    <View style={styles.container}>
      <VideoView
        player={player}
        style={styles.video}
        nativeControls={false}
        contentFit="cover"
      />
      
      {/* Show poster image until the video is ready to play */}
      {posterUrl && status !== 'readyToPlay' && (
        <Image
          source={typeof posterUrl === 'number' ? posterUrl : { uri: posterUrl }}
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
        />
      )}
      
      {/* Custom Mute/Unmute Overlay Button */}
      <Pressable style={styles.muteButton} onPress={toggleMute}>
        {isMuted ? (
          <VolumeX size={18} color="#F8FAFC" />
        ) : (
          <Volume2 size={18} color="#F8FAFC" />
        )}
      </Pressable>
    </View>
  );
}

export default function VideoPlayer({ url, isActive, posterUrl }: VideoPlayerProps) {
  const [resolvedUrl, setResolvedUrl] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    async function resolveVideo() {
      const cached = await VideoCacheManager.getCachedUri(url);
      if (active) {
        setResolvedUrl(cached);
      }
    }
    resolveVideo();
    return () => {
      active = false;
    };
  }, [url]);

  if (!resolvedUrl) {
    return (
      <View style={styles.container}>
        {posterUrl && (
          <Image
            source={typeof posterUrl === 'number' ? posterUrl : { uri: posterUrl }}
            style={StyleSheet.absoluteFill}
            resizeMode="cover"
          />
        )}
      </View>
    );
  }

  return <ActualVideoPlayer url={resolvedUrl} isActive={isActive} posterUrl={posterUrl} />;
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    backgroundColor: '#000',
    position: 'relative',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  muteButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 100 : 80, // Safe distance below status/header
    left: 20, // opposite side of the overlay action items
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(7, 12, 25, 0.5)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
