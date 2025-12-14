import { io, Socket } from "socket.io-client";
import {socketEvents} from "@/hooks/events-emitter";
import {DEFAULT_SOCKET_URL} from "@/hooks/api-client";

let socket: Socket | null = null;

export const getSocket = () => {
    if (!socket) {
        socket = io(DEFAULT_SOCKET_URL, { transports: ["websocket"] });
        console.log("Socket connected");

        // Listen for incoming messages from server
        socket.on("getMessage", (msg) => {
            // Emit globally via our SimpleEmitter
            socketEvents.emit("newMessage", msg);
        });
    }
    return socket;
};

export const sendMessage = (payload: {
    senderId: string;
    conversationId: string;
    messageText: string;
    otherUserId: string;
}) => {
    const s = getSocket();
    s.emit("sendMessage", payload);
};
