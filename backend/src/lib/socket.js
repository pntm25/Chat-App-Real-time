import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const httpServer = http.createServer(app);
const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:5174",
    process.env.FRONTEND_URL,
].filter(Boolean);

const io = new Server(httpServer, {
    cors: {
        origin: allowedOrigins,
        credentials: true,
    },
});

export function getReceiverSocketId(userId) {
    return userSocketMap[userId];
}

const userSocketMap = {}; // Mapping of userId to socketId

io.on("connection", (socket) => {
    console.log("New client connected:", socket.id);

    const userId = socket.handshake.query.userId;
    if(userId) {
        userSocketMap[userId] = socket.id;
        console.log(`User ${userId} connected with socket ID ${socket.id}`);
        
        io.emit("onlineUsers", Object.keys(userSocketMap));
    }
    socket.on("disconnect", () => {
        console.log("Client disconnected:", socket.id);
        delete userSocketMap[userId];
        io.emit("onlineUsers", Object.keys(userSocketMap));
    });
});

export { io, app, httpServer };