import React, { useEffect, useState, useRef } from "react";
import {
    Modal,
    View,
    Text,
    FlatList,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Socket } from "socket.io-client";
import {getSocket} from "@/hooks/socket";

type Mechanic = {
    name: string;
    specialization: string;
    rating: number;
    image: string;
};

type Chat = {
    id: string;
    mechanic: Mechanic;
    lastMessage: string;
    timestamp: string;
    unread: boolean;
    active: boolean;
};

type Message = {
    id: string;
    text: string;
    type: "sent" | "received";
    timestamp?: string;
};

type ChatModalProps = {
    visible: boolean;
    onClose: () => void;
    selectedChat: Chat | null;
    userId: string;
};

let socket: Socket | null = null;

export default function ChatModal({
                                      visible,
                                      onClose,
                                      selectedChat,
                                      userId,
                                  }: ChatModalProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [messageText, setMessageText] = useState("");
    const scrollRef = useRef<FlatList>(null);

    useEffect(() => {
        if (!selectedChat) return;

        if (!socket) {
            socket = getSocket();
        }

        socket.emit("addUser", userId);

        socket.on("getMessage", (data: { senderId: string; text: string }) => {
            if (data.senderId === selectedChat.id) {
                setMessages((prev) => [
                    ...prev,
                    { id: Date.now().toString(), text: data.text, type: "received" },
                ]);
            }
        });

        return () => {
            socket?.off("getMessage");
        };
    }, [selectedChat, userId]);

    const handleSendMessage = () => {
        if (!messageText.trim() || !selectedChat) return;
        const newMsg: Message = {
            id: Date.now().toString(),
            text: messageText.trim(),
            type: "sent",
        };
        setMessages((prev) => [...prev, newMsg]);
        socket?.emit("sendMessage", {
            senderId: userId,
            otherUserId: selectedChat.id,
            text: messageText.trim(),
        });
        setMessageText("");
    };

    const renderMessage = ({ item }: { item: Message }) => (
        <View
            style={[
                styles.messageBubble,
                item.type === "sent" ? styles.sent : styles.received,
            ]}
        >
            <Text style={{ color: item.type === "sent" ? "#fff" : "#000" }}>
                {item.text}
            </Text>
        </View>
    );

    if (!selectedChat) return null;

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={onClose}
        >
            <KeyboardAvoidingView
                style={{ flex: 1, backgroundColor: "#f8fafc" }}
                behavior={Platform.OS === "ios" ? "padding" : undefined}
            >
                {/* Header */}
                <View style={styles.chatHeaderModal}>
                    <TouchableOpacity onPress={onClose}>
                        <Ionicons name="arrow-back" size={24} color="#1e293b" />
                    </TouchableOpacity>

                    <View style={styles.chatPartnerInfo}>
                        <Text style={styles.chatAvatar}>{selectedChat.mechanic.image}</Text>
                        <View style={styles.chatPartnerDetails}>
                            <Text style={styles.chatPartnerName}>{selectedChat.mechanic.name}</Text>
                            <Text style={styles.chatPartnerStatus}>
                                {selectedChat.active ? "Online" : "Offline"}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.chatActions}>
                        <TouchableOpacity style={styles.chatActionButton}>
                            <Ionicons name="call" size={20} color="#075538" />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.chatActionButton}>
                            <Ionicons name="location" size={20} color="#075538" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Messages */}
                <FlatList
                    ref={scrollRef}
                    data={messages}
                    keyExtractor={(item) => item.id}
                    renderItem={renderMessage}
                    contentContainerStyle={styles.messagesContent}
                    onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
                />

                {/* Message Input */}
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.messageInput}
                        placeholder="Type a message..."
                        placeholderTextColor="#9ca3af"
                        value={messageText}
                        onChangeText={setMessageText}
                        multiline
                    />
                    <TouchableOpacity
                        style={[styles.sendButton, !messageText.trim() && styles.sendButtonDisabled]}
                        onPress={handleSendMessage}
                        disabled={!messageText.trim()}
                    >
                        <Ionicons
                            name="send"
                            size={20}
                            color={messageText.trim() ? "#075538" : "#cbd5e1"}
                        />
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    chatHeaderModal: {
        flexDirection: "row",
        alignItems: "center",
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#e2e8f0",
        backgroundColor: "#fff",
    },
    chatPartnerInfo: { flexDirection: "row", alignItems: "center", flex: 1, marginLeft: 12 },
    chatAvatar: { fontSize: 32, marginRight: 12 },
    chatPartnerDetails: {},
    chatPartnerName: { fontSize: 16, fontWeight: "bold" },
    chatPartnerStatus: { fontSize: 12, color: "#64748b" },
    chatActions: { flexDirection: "row" },
    chatActionButton: { marginLeft: 12 },
    messagesContent: { padding: 16, flexGrow: 1 },
    messageBubble: { padding: 12, borderRadius: 12, marginBottom: 8, maxWidth: "70%" },
    sent: { backgroundColor: "#0d6efd", alignSelf: "flex-end" },
    received: { backgroundColor: "#e9ecef", alignSelf: "flex-start" },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        padding: 12,
        borderTopWidth: 1,
        borderColor: "#e2e8f0",
        backgroundColor: "#fff",
    },
    messageInput: {
        flex: 1,
        borderWidth: 1,
        borderColor: "#e2e8f0",
        borderRadius: 24,
        paddingVertical: 8,
        paddingHorizontal: 16,
        fontSize: 16,
        marginRight: 8,
        maxHeight: 100,
    },
    sendButton: {
        backgroundColor: "#d1fae5",
        padding: 12,
        borderRadius: 24,
        justifyContent: "center",
        alignItems: "center",
    },
    sendButtonDisabled: { backgroundColor: "#f1f5f9" },
});
