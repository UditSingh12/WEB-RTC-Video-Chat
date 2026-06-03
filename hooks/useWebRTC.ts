"use client";

import { MutableRefObject, useCallback, useRef, useState } from "react";
import { Socket } from "socket.io-client";

type RemoteStreamMap = Map<string, MediaStream>;

export function useWebRTC(
  socketRef: MutableRefObject<Socket | null>,
  localStream: MediaStream | null
) {
  const peerConnections =
    useRef<Map<string, RTCPeerConnection>>(
      new Map()
    );

  const [remoteStreams, setRemoteStreams] =
    useState<RemoteStreamMap>(new Map());

  const stunServer =
    process.env.NEXT_PUBLIC_STUN_SERVER ||
    "stun:stun.l.google.com:19302";

  const updateRemoteStream = (
    socketId: string,
    stream: MediaStream
  ) => {
    setRemoteStreams((prev) => {
      const next = new Map(prev);
      next.set(socketId, stream);
      return next;
    });
  };

  const removeRemoteStream = (
    socketId: string
  ) => {
    setRemoteStreams((prev) => {
      const next = new Map(prev);
      next.delete(socketId);
      return next;
    });
  };

  const createPeerConnection =
    useCallback(
      (targetId: string) => {
        if (!localStream) return null;

        const pc = new RTCPeerConnection({
          iceServers: [
            {
              urls: stunServer
            }
          ]
        });

        localStream
          .getTracks()
          .forEach((track) => {
            pc.addTrack(track, localStream);
          });

        pc.ontrack = (event) => {
          const stream =
            event.streams[0];

          updateRemoteStream(
            targetId,
            stream
          );
        };

        pc.onicecandidate = (event) => {
          if (
            event.candidate &&
            socketRef.current
          ) {
            socketRef.current.emit(
              "ice-candidate",
              {
                target: targetId,
                candidate:
                  event.candidate.toJSON()
              }
            );
          }
        };

        peerConnections.current.set(
          targetId,
          pc
        );

        return pc;
      },
      [localStream, socketRef, stunServer]
    );

  const createOffer =
    useCallback(
      async (targetId: string) => {
        const pc =
          createPeerConnection(
            targetId
          );

        if (
          !pc ||
          !socketRef.current
        )
          return;

        const offer =
          await pc.createOffer();

        await pc.setLocalDescription(
          offer
        );

        socketRef.current.emit(
          "offer",
          {
            target: targetId,
            offer
          }
        );
      },
      [createPeerConnection, socketRef]
    );

  const handleOffer =
    useCallback(
      async (
        sender: string,
        offer: RTCSessionDescriptionInit
      ) => {
        if (
          !localStream ||
          !socketRef.current
        )
          return;

        const pc =
          createPeerConnection(
            sender
          );

        if (!pc) return;

        await pc.setRemoteDescription(
          new RTCSessionDescription(
            offer
          )
        );

        const answer =
          await pc.createAnswer();

        await pc.setLocalDescription(
          answer
        );

        socketRef.current.emit(
          "answer",
          {
            target: sender,
            answer
          }
        );
      },
      [
        localStream,
        socketRef,
        createPeerConnection
      ]
    );

  const handleAnswer =
    useCallback(
      async (
        sender: string,
        answer: RTCSessionDescriptionInit
      ) => {
        const pc =
          peerConnections.current.get(
            sender
          );

        if (!pc) return;

        await pc.setRemoteDescription(
          new RTCSessionDescription(
            answer
          )
        );
      },
      []
    );

  const handleIceCandidate =
    useCallback(
      async (
        sender: string,
        candidate: RTCIceCandidateInit
      ) => {
        const pc =
          peerConnections.current.get(
            sender
          );

        if (!pc) return;

        await pc.addIceCandidate(
          new RTCIceCandidate(
            candidate
          )
        );
      },
      []
    );

  const removePeer =
    useCallback(
      (socketId: string) => {
        const pc =
          peerConnections.current.get(
            socketId
          );

        if (pc) {
          pc.close();
          peerConnections.current.delete(
            socketId
          );
        }

        removeRemoteStream(
          socketId
        );
      },
      []
    );

  const cleanup =
    useCallback(() => {
      peerConnections.current.forEach(
        (pc) => {
          pc.close();
        }
      );

      peerConnections.current.clear();

      setRemoteStreams(
        new Map()
      );
    }, []);

  return {
    remoteStreams,
    peerConnections,
    createOffer,
    handleOffer,
    handleAnswer,
    handleIceCandidate,
    removePeer,
    cleanup
  };
}