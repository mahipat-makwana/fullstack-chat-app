import {Server} from 'socket.io';
import http from 'http';
import express from 'express';


const app = express();
const server = http.createServer(app);


const io = new Server(server, {
    cors: {
        origin: ['http://localhost:5173']
    }
});

export function getReceiverSocketId(userId) {
    return userSocketMap[userId];
};

// To store online users
const userSocketMap = new Map();


io.on("connection", (socket) => {
    console.log("a user connected: ", socket.id);

    const userId = socket.handshake.query.userId;
    if (!userId) return;

    socket.userId = userId;
    
    if (!userSocketMap.has(userId)) {
        userSocketMap.set(userId, new Set());
    }

    userSocketMap.get(userId).add(socket.id);

    // io.emit() is used to send events to all connected clients
    io.emit("getOnlineUsers", [...userSocketMap.keys()]);

    socket.on("disconnect", () => {
        console.log("a user disconnected: ", socket.id);

        const userId = socket.userId;
        if (!userId) return;
    
        const userSockets = userSocketMap.get(userId);
        if (userSockets) {
        userSockets.delete(socket.id);

        if (userSockets.size === 0) {
            userSocketMap.delete(userId);
        }
    }
        io.emit("getOnlineUsers", [...userSocketMap.keys()]);
    });
});

export {io, server, app};

