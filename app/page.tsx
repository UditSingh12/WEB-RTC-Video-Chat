"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function HomePage() {
  const [roomId, setRoomId] = useState("");
  const router = useRouter();

  const joinRoom = () => {
    if (!roomId.trim()) return;
    router.push(`/room/${roomId}`);
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-4">
      <h1 className="text-3xl font-bold">
        WebRTC Video Chat
      </h1>

      <input
        value={roomId}
        onChange={(e) => setRoomId(e.target.value)}
        placeholder="Room ID"
        className="px-4 py-2 rounded text-black"
      />

      <button
        onClick={joinRoom}
        className="bg-blue-600 px-4 py-2 rounded"
      >
        Join Room
      </button>
    </main>
  );
}