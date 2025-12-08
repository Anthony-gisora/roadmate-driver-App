import { Audio } from 'expo-av';
import * as Notifications from 'expo-notifications';
import * as SQLite from 'expo-sqlite';

// --- SQLite DB setup ---
const db = SQLite.openDatabase('conversationsDB.db');

db.transaction(tx => {
  // Conversations table
  tx.executeSql(
    `CREATE TABLE IF NOT EXISTS conversations (
      conversationId TEXT PRIMARY KEY NOT NULL,
      memberA TEXT,
      memberB TEXT,
      lastMessage TEXT,
      lastTimestamp INTEGER
    );`
  );

  // Messages table
  tx.executeSql(
    `CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      conversationId TEXT,
      messageText TEXT,
      senderId TEXT,
      timestamp INTEGER
    );`
  );
});

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
  getChats(): Promise<any[]> {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          `SELECT * FROM conversations ORDER BY lastTimestamp DESC`,
          [],
          (_, { rows }) => resolve(rows._array),
          (_, error) => {
            console.error('Failed to fetch chats:', error);
            reject(error);
            return false;
          }
        );
      });
    });
  }

  // Get all messages for a conversation
  getMessages(conversationId: string): Promise<any[]> {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          `SELECT * FROM messages WHERE conversationId = ? ORDER BY timestamp ASC`,
          [conversationId],
          (_, { rows }) => resolve(rows._array),
          (_, error) => {
            console.error('Failed to fetch messages:', error);
            reject(error);
            return false;
          }
        );
      });
    });
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
    await new Promise<void>((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          `INSERT INTO messages (conversationId, messageText, senderId, timestamp) VALUES (?, ?, ?, ?)`,
          [conversationId, messageText, senderId, timestamp],
          () => resolve(),
          (_, error) => {
            console.error('Failed to add message:', error);
            reject(error);
            return false;
          }
        );
      });
    });

    // Update conversation
    const conv = await new Promise<any | undefined>((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          `SELECT * FROM conversations WHERE conversationId = ?`,
          [conversationId],
          (_, { rows }) => resolve(rows._array[0]),
          (_, error) => {
            console.error('Failed to get conversation:', error);
            reject(error);
            return false;
          }
        );
      });
    });

    if (conv) {
      await new Promise<void>((resolve, reject) => {
        db.transaction(tx => {
          tx.executeSql(
            `UPDATE conversations SET lastMessage = ?, lastTimestamp = ? WHERE conversationId = ?`,
            [messageText, timestamp, conversationId],
            () => resolve(),
            (_, error) => {
              console.error('Failed to update conversation:', error);
              reject(error);
              return false;
            }
          );
        });
      });
    } else {
      // create conversation if doesn't exist
      await new Promise<void>((resolve, reject) => {
        db.transaction(tx => {
          tx.executeSql(
            `INSERT INTO conversations (conversationId, memberA, memberB, lastMessage, lastTimestamp) VALUES (?, ?, ?, ?, ?)`,
            [conversationId, senderId, '', messageText, timestamp],
            () => resolve(),
            (_, error) => {
              console.error('Failed to create conversation:', error);
              reject(error);
              return false;
            }
          );
        });
      });
    }

    // Handle notification or sound
    if (isViewing) {
      this.playSound();
    } else {
      this.showNotification(messageText);
    }
  }

  // Create a new chat
  async createChat({
    conversationId,
    memberA,
    memberB,
  }: {
    conversationId: string;
    memberA: string;
    memberB: string;
  }) {
    const existing = await new Promise<any | undefined>((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          `SELECT * FROM conversations WHERE conversationId = ?`,
          [conversationId],
          (_, { rows }) => resolve(rows._array[0]),
          (_, error) => {
            console.error('Failed to fetch conversation:', error);
            reject(error);
            return false;
          }
        );
      });
    });

    if (existing) return existing;

    const newChat = {
      conversationId,
      memberA,
      memberB,
      lastMessage: '',
      lastTimestamp: Date.now(),
    };

    await new Promise<void>((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          `INSERT INTO conversations (conversationId, memberA, memberB, lastMessage, lastTimestamp) VALUES (?, ?, ?, ?, ?)`,
          [newChat.conversationId, newChat.memberA, newChat.memberB, '', newChat.lastTimestamp],
          () => resolve(),
          (_, error) => {
            console.error('Failed to create conversation:', error);
            reject(error);
            return false;
          }
        );
      });
    });

    return newChat;
  }

  private async playSound() {
    try {
      const { sound } = await Audio.Sound.createAsync(
        require('../assets/audio/inchat.mp3')
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
