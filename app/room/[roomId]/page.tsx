"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import VideoGrid from "@/components/VideoGrid";
import Controls from "@/components/Controls";
import ChatPanel, {
  ChatMessage
} from "@/components/ChatPanel";

import { useSocket } from "@/hooks/useSocket";
import { useUserMedia } from "@/hooks/useUserMedia";
import { useWebRTC } from "@/hooks/useWebRTC";

export default function RoomPage() {
  const params = useParams();
  const router = useRouter();

  const roomId = useMemo(
    () => String(params.roomId),
    [params]
  );

  const socket = useSocket();

  const {
    stream,
    audioEnabled,
    videoEnabled,
    toggleMic,
    toggleCamera,
    stopMedia
  } = useUserMedia();

  const localVideoRef =
    useRef<HTMLVideoElement>(null);

  const socketRef = useRef<any>(null);

  useEffect(() => {
    socketRef.current = socket;
  }, [socket]);

  const {
    remoteStreams,
    createOffer,
    handleOffer,
    handleAnswer,
    handleIceCandidate,
    removePeer,
    cleanup
  } = useWebRTC(
    socketRef,
    stream
  );

  const [messages, setMessages] =
    useState<ChatMessage[]>([]);

  const [status, setStatus] =
    useState<
      "waiting" |
      "connecting" |
      "connected"
    >("waiting");

  /*
    LOCAL VIDEO
  */
  useEffect(() => {
    if (
      localVideoRef.current &&
      stream
    ) {
      localVideoRef.current.srcObject =
        stream;
    }
  }, [stream]);

  /*
    JOIN ROOM
  */
  useEffect(() => {
    if (
      !socket ||
      !stream
    )
      return;

    socket.emit("join-room", {
      roomId
    });

    /*
      EXISTING USERS
    */
    socket.on(
      "existing-users",
      async (
        users: string[]
      ) => {
        if (users.length > 0) {
          setStatus(
            "connecting"
          );
        }

        for (const userId of users) {
          await createOffer(
            userId
          );
        }
      }
    );

    /*
      USER JOINED
    */
    socket.on(
      "user-joined",
      async ({
        socketId
      }: {
        socketId: string;
      }) => {
        setStatus(
          "connecting"
        );

        await createOffer(
          socketId
        );
      }
    );

    /*
      OFFER
    */
    socket.on(
      "offer",
      async ({
        sender,
        offer
      }) => {
        setStatus(
          "connecting"
        );

        await handleOffer(
          sender,
          offer
        );
      }
    );

    /*
      ANSWER
    */
    socket.on(
      "answer",
      async ({
        sender,
        answer
      }) => {
        await handleAnswer(
          sender,
          answer
        );
      }
    );

    /*
      ICE
    */
    socket.on(
      "ice-candidate",
      async ({
        sender,
        candidate
      }) => {
        await handleIceCandidate(
          sender,
          candidate
        );
      }
    );

    /*
      LEFT
    */
    socket.on(
      "user-left",
      ({
        socketId
      }: {
        socketId: string;
      }) => {
        removePeer(
          socketId
        );
      }
    );

    /*
      CHAT
    */
    socket.on(
      "chat-message",
      (
        message: ChatMessage
      ) => {
        setMessages(
          (prev) => [
            ...prev,
            message
          ]
        );
      }
    );

    return () => {
      socket.off(
        "existing-users"
      );
      socket.off(
        "user-joined"
      );
      socket.off("offer");
      socket.off("answer");
      socket.off(
        "ice-candidate"
      );
      socket.off(
        "user-left"
      );
      socket.off(
        "chat-message"
      );
    };
  }, [
    socket,
    roomId,
    stream,
    createOffer,
    handleOffer,
    handleAnswer,
    handleIceCandidate,
    removePeer
  ]);

  /*
    STATUS
  */
  useEffect(() => {
    if (
      remoteStreams.size === 0
    ) {
      setStatus(
        "waiting"
      );
    } else {
      setStatus(
        "connected"
      );
    }
  }, [remoteStreams]);

  /*
    CHAT SEND
  */
  const sendMessage = (
    message: string
  ) => {
    if (!socket) return;

    socket.emit(
      "chat-message",
      {
        roomId,
        sender:
          socket.id,
        message
      }
    );
  };

  /*
    HANGUP
  */
  const handleHangup =
    () => {
      cleanup();

      stopMedia();

      socket?.disconnect();

      router.push("/");
    };

  /*
    TAB CLOSE CLEANUP
  */
  useEffect(() => {
    return () => {
      cleanup();
      stopMedia();
      socket?.disconnect();
    };
  }, [
    cleanup,
    stopMedia,
    socket
  ]);

  return (
    <main className="h-screen flex">
      {/* VIDEO AREA */}

      <section className="flex-1 flex flex-col p-4 gap-4">
        {/* STATUS */}

        {status ===
          "waiting" && (
          <div
            data-test-id="status-waiting"
            className="bg-yellow-600 px-3 py-2 rounded"
          >
            Waiting for participants...
          </div>
        )}

        {status ===
          "connecting" && (
          <div
            data-test-id="status-connecting"
            className="bg-blue-600 px-3 py-2 rounded"
          >
            Connecting...
          </div>
        )}

        {status ===
          "connected" && (
          <div
            data-test-id="status-connected"
            className="bg-green-600 px-3 py-2 rounded"
          >
            Connected
          </div>
        )}

        {/* REMOTE GRID */}

        <div className="flex-1">
          <VideoGrid
            remoteStreams={
              remoteStreams
            }
          />
        </div>

        {/* LOCAL VIDEO */}

        <div className="fixed bottom-24 right-6 w-64">
          <video
            data-test-id="local-video"
            autoPlay
            muted
            playsInline
            ref={
              localVideoRef
            }
            className="rounded-lg border border-white bg-black"
          />
        </div>

        {/* CONTROLS */}

        <Controls
          audioEnabled={
            audioEnabled
          }
          videoEnabled={
            videoEnabled
          }
          onToggleMic={
            toggleMic
          }
          onToggleCamera={
            toggleCamera
          }
          onHangup={
            handleHangup
          }
        />
      </section>

      {/* CHAT */}

      <aside className="w-80">
        <ChatPanel
          messages={
            messages
          }
          onSend={
            sendMessage
          }
        />
      </aside>
    </main>
  );
}