"use client";

import { useParams } from "next/navigation";

export default function RoomPage() {
  const params = useParams();
  const roomId = params.roomId as string;

  return <div>Room: {roomId}</div>;
}