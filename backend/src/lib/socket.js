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

    // WebRTC Signaling handlers
    socket.on("call-user", ({ to, offer, callType }) => {
        const receiverSocketId = getReceiverSocketId(to);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("incoming-call", {
                from: userId,
                offer,
                callType
            });
        }
    });

    socket.on("answer-call", ({ to, answer }) => {
        const callerSocketId = getReceiverSocketId(to);
        if (callerSocketId) {
            io.to(callerSocketId).emit("call-accepted", {
                answer
            });
        }
    });

    socket.on("ice-candidate", ({ to, candidate }) => {
        const targetSocketId = getReceiverSocketId(to);
        if (targetSocketId) {
            io.to(targetSocketId).emit("ice-candidate", {
                candidate,
                from: userId
            });
        }
    });

    socket.on("end-call", ({ to }) => {
        const targetSocketId = getReceiverSocketId(to);
        if (targetSocketId) {
            io.to(targetSocketId).emit("end-call");
        }
    });

    socket.on("reject-call", ({ to }) => {
        const targetSocketId = getReceiverSocketId(to);
        if (targetSocketId) {
            io.to(targetSocketId).emit("reject-call");
        }
    });

    socket.on("typing", ({ to, isTyping }) => {
        const receiverSocketId = getReceiverSocketId(to);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("typing", {
                from: userId,
                isTyping
            });
        }
    });
});

export { io, app, httpServer };