# WebRTC Multi-Peer Video Chat

A production-ready multi-peer video conferencing application built with:

- Next.js (App Router)
- TypeScript
- Socket.IO
- WebRTC
- Tailwind CSS
- Custom Node.js Server
- Docker & Docker Compose

This project is ready to be pushed to GitHub and run locally after installing dependencies.

## Prerequisites

- Node.js 18 or newer
- npm
- A browser with camera and microphone access

---

# Features

- Multi-peer WebRTC mesh topology
- Dynamic rooms
- Camera and microphone support
- Real-time chat
- Room isolation
- ICE candidate exchange
- Offer/Answer signaling
- Participant join/leave detection
- Responsive UI
- Docker deployment
- Healthcheck endpoint

---

# Architecture

Client Layer
-------------
Next.js App Router

Components:
- VideoGrid
- Controls
- ChatPanel

Hooks:
- useSocket
- useUserMedia
- useWebRTC

Server Layer
-------------
Custom Node.js server

- Next.js request handler
- Socket.IO signaling server
- Room management

Transport Layer
---------------
Socket.IO

Events:

Client → Server

- join-room
- offer
- answer
- ice-candidate
- chat-message

Server → Client

- existing-users
- user-joined
- offer
- answer
- ice-candidate
- user-left
- chat-message

Media Layer
-----------
WebRTC

RTCPeerConnection

STUN:

stun:stun.l.google.com:19302

Topology:

Mesh

Maximum:

4 participants

Each participant creates direct peer
connections with every other participant.

---

# Folder Structure

/app
/api/health/route.ts
/room/[roomId]/page.tsx

/components
ChatPanel.tsx
Controls.tsx
VideoGrid.tsx

/hooks
useSocket.ts
useUserMedia.ts
useWebRTC.ts

server.ts

Dockerfile
docker-compose.yml

README.md

---

# Environment Variables

Create:

.env

PORT=3000
NEXT_PUBLIC_STUN_SERVER=stun:stun.l.google.com:19302

---

# Installation

Install dependencies:

npm install

Create a local environment file:

copy .env.example .env

Run development server:

npm run dev

Open:

http://localhost:3000

## GitHub push notes

This repository is already configured to ignore local dependencies, build output, and environment files. You can safely commit the project and push it to GitHub.

---

# Running Production Build

Build:

npm run build

Start:

npm start

---

# Docker

Build:

docker compose build

Run:

docker compose up

Application:

http://localhost:3000

---

# Healthcheck

Endpoint:

GET /api/health

Response:

{
  "status": "ok"
}

---

# WebRTC Flow

1. User enters room
2. Browser requests camera and microphone
3. Client emits:

join-room

4. Server returns:

existing-users

5. Existing participants receive:

user-joined

6. Offer created

createOffer()

7. Offer sent through Socket.IO

8. Remote peer creates answer

createAnswer()

9. ICE candidates exchanged

10. Connection established

11. Remote streams rendered

---

# Chat Flow

Client sends:

chat-message

Server broadcasts:

chat-message

All participants append message
to chat log.

---

# Disconnect Flow

When user leaves:

- RTCPeerConnection closed
- Local tracks stopped
- Socket disconnected
- Remote streams removed

Server emits:

user-left

Remaining participants clean up
peer connections.

---

# Required Test IDs

Local Video

data-test-id="local-video"

Remote Container

data-test-id="remote-video-container"

Status

data-test-id="status-waiting"

data-test-id="status-connecting"

data-test-id="status-connected"

Controls

data-test-id="mute-mic-button"

data-test-id="toggle-camera-button"

data-test-id="hangup-button"

Chat

data-test-id="chat-input"

data-test-id="chat-submit"

data-test-id="chat-log"

data-test-id="chat-message"

---

# Verification Checklist

Application

✓ Next.js App Router

✓ TypeScript

✓ Tailwind CSS

✓ Custom Server

✓ Socket.IO

✓ Dynamic Rooms

Media

✓ Camera Access

✓ Microphone Access

✓ Local Video

✓ Remote Video

✓ WebRTC Signaling

✓ ICE Trickle

✓ Mesh Topology

Chat

✓ Real-Time Chat

✓ Room Isolation

Controls

✓ Mic Toggle

✓ Camera Toggle

✓ Hangup

Cleanup

✓ Peer Connection Cleanup

✓ Track Cleanup

✓ Socket Cleanup

✓ Disconnect Handling

Docker

✓ Dockerfile

✓ Docker Compose

✓ Healthcheck Endpoint

Build

✓ npm run build

✓ npm start

✓ docker compose up