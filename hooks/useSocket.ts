"use client";

import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";

export function useSocket() {
  const socketRef =
    useRef<Socket | null>(null);

  useEffect(() => {
    if (socketRef.current)
      return;

    const socket = io({
      transports: ["websocket"]
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  return socketRef.current;
}