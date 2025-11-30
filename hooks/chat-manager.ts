import Dexie from 'dexie';
import { Audio } from 'expo-av';
import * as Notifications from 'expo-notifications';

// --- Dexie DB setup ---
export const db = new Dexie('conversationsDB');

db.version(1).stores({
    conversations: 'conversationId, memberA, memberB, lastMessage, lastTimestamp',
    messages: '++id, conversationId, messageText, senderId, timestamp',
});

db.open().catch(err => console.error('Failed to open DB', err));

// --- Offline Chat Manager ---
export class ChatManager {
    private static instance: ChatManager;

    private constructor() {}

    static getInstance() {
        if (!ChatManager.instance) {
            ChatManager.instance = new ChatManager();
        }
        return ChatManager.instance;
    }

    // Get all chats with last message
    async getChats() {
        return db.conversations.toArray();
    }

    // Get all messages for a conversation
    async getMessages(conversationId: string) {
        return db.messages.where('conversationId').equals(conversationId).sortBy('timestamp');
    }

    // Add a new message to a conversation
    async addMessage({
                         conversationId,
                         messageText,
                         senderId,
                         isViewing = false,
                     }: {
        conversationId: string;
        messageText: string;
        senderId: string;
        isViewing?: boolean;
    }) {
        const timestamp = Date.now();

        // Store the message
        await db.messages.add({ conversationId, messageText, senderId, timestamp });

        // Update conversation with last message and timestamp
        const conv = await db.conversations.get(conversationId);
        if (conv) {
            await db.conversations.update(conversationId, {
                lastMessage: messageText,
                lastTimestamp: timestamp,
            });
        } else {
            // create conversation if doesn't exist
            await db.conversations.put({
                conversationId,
                memberA: senderId,
                memberB: '', // optionally fill
                lastMessage: messageText,
                lastTimestamp: timestamp,
            });
        }

        // Handle notification or sound
        if (isViewing) {
            this.playSound();
        } else {
            this.showNotification(messageText);
        }
    }

    private async playSound() {
        try {
            const { sound } = await Audio.Sound.createAsync(
                require('./assets/notification.mp3') // add a notification sound file
            );
            await sound.playAsync();
        } catch (err) {
            console.error('Failed to play sound', err);
        }
    }

    private async showNotification(messageText: string) {
        try {
            await Notifications.scheduleNotificationAsync({
                content: {
                    title: 'New Message',
                    body: messageText,
                },
                trigger: null,
            });
        } catch (err) {
            console.error('Failed to show notification', err);
        }
    }
}
