"use client";

import { useCallback, useEffect, useState } from "react";

export function useUserMedia() {
  const [stream, setStream] =
    useState<MediaStream | null>(null);

  const [audioEnabled, setAudioEnabled] =
    useState(true);

  const [videoEnabled, setVideoEnabled] =
    useState(true);

  useEffect(() => {
    let mounted = true;

    async function startMedia() {
      try {
        const media =
          await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true
          });

        if (mounted) {
          setStream(media);
        }
      } catch (error) {
        console.error(error);
      }
    }

    startMedia();

    return () => {
      mounted = false;
    };
  }, []);

  const toggleMic = useCallback(() => {
    if (!stream) return;

    stream
      .getAudioTracks()
      .forEach((track) => {
        track.enabled = !track.enabled;
        setAudioEnabled(track.enabled);
      });
  }, [stream]);

  const toggleCamera = useCallback(() => {
    if (!stream) return;

    stream
      .getVideoTracks()
      .forEach((track) => {
        track.enabled = !track.enabled;
        setVideoEnabled(track.enabled);
      });
  }, [stream]);

  const stopMedia = useCallback(() => {
    if (!stream) return;

    stream.getTracks().forEach((track) => {
      track.stop();
    });
  }, [stream]);

  return {
    stream,
    audioEnabled,
    videoEnabled,
    toggleMic,
    toggleCamera,
    stopMedia
  };
}