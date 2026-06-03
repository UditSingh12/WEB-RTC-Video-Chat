import { createServer } from "http";
import next from "next";
import { Server as SocketIOServer } from "socket.io";

const dev = process.env.NODE_ENV !== "production";
const hostname = "0.0.0.0";
const port = Number(process.env.PORT || 3000);

const app = next({
  dev,
  hostname,
  port
});

const handle = app.getRequestHandler();

/*
  roomId -> Set<socketId>
*/
const rooms = new Map<string, Set<string>>();

/*
  socketId -> roomId
*/
const socketToRoom = new Map<string, string>();

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    handle(req, res);
  });

  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  io.on("connection", (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    /*
      JOIN ROOM
    */
    socket.on(
      "join-room",
      ({ roomId }: { roomId: string }) => {
        if (!roomId) return;

        socket.join(roomId);

        socketToRoom.set(socket.id, roomId);

        if (!rooms.has(roomId)) {
          rooms.set(roomId, new Set());
        }

        const roomUsers = rooms.get(roomId)!;

        const existingUsers = [...roomUsers];

        socket.emit("existing-users", existingUsers);

        roomUsers.add(socket.id);

        socket.to(roomId).emit("user-joined", {
          socketId: socket.id
        });
      }
    );

    /*
      OFFER
    */
    socket.on(
      "offer",
      ({
        target,
        offer
      }: {
        target: string;
        offer: RTCSessionDescriptionInit;
      }) => {
        io.to(target).emit("offer", {
          sender: socket.id,
          offer
        });
      }
    );

    /*
      ANSWER
    */
    socket.on(
      "answer",
      ({
        target,
        answer
      }: {
        target: string;
        answer: RTCSessionDescriptionInit;
      }) => {
        io.to(target).emit("answer", {
          sender: socket.id,
          answer
        });
      }
    );

    /*
      ICE CANDIDATE
    */
    socket.on(
      "ice-candidate",
      ({
        target,
        candidate
      }: {
        target: string;
        candidate: RTCIceCandidateInit;
      }) => {
        io.to(target).emit("ice-candidate", {
          sender: socket.id,
          candidate
        });
      }
    );

    /*
      CHAT MESSAGE
    */
    socket.on(
      "chat-message",
      ({
        roomId,
        message,
        sender
      }: {
        roomId: string;
        message: string;
        sender: string;
      }) => {
        io.to(roomId).emit("chat-message", {
          sender,
          message,
          timestamp: Date.now()
        });
      }
    );

    /*
      DISCONNECT
    */
    socket.on("disconnect", () => {
      const roomId = socketToRoom.get(socket.id);

      if (roomId) {
        const roomUsers = rooms.get(roomId);

        if (roomUsers) {
          roomUsers.delete(socket.id);

          socket.to(roomId).emit("user-left", {
            socketId: socket.id
          });

          if (roomUsers.size === 0) {
            rooms.delete(roomId);
          }
        }
      }

      socketToRoom.delete(socket.id);

      console.log(`Socket disconnected: ${socket.id}`);
    });
  });

  httpServer.listen(port, () => {
    console.log(
      `> Ready on http://${hostname}:${port}`
    );
  });
});