import { io, Socket } from "socket.io-client";
import {socketEvents} from "@/hooks/events-emitter";

let socket: Socket | null = null;

export const getSocket = () => {
    if (!socket) {
        socket = io("http://localhost:5000", { transports: ["websocket"] });
        console.log("Socket connected");

        // Listen for incoming messages from server
        socket.on("message", (msg) => {
            // Emit globally via our SimpleEmitter
            socketEvents.emit("newMessage", msg);
        });
    }
    return socket;
};
