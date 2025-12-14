import { Audio } from 'expo-av';
import * as Notifications from 'expo-notifications';
import * as SQLite from 'expo-sqlite';

// --- SQLite DB setup ---
let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

async function getDB() {
  if (!dbPromise) {
    dbPromise = SQLite.openDatabaseAsync('conversationsDB.db');
    const db = await dbPromise;

    // Create tables if they don't exist
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS conversations (
        conversationId TEXT PRIMARY KEY NOT NULL,
        memberA TEXT,
        memberB TEXT,
        lastMessage TEXT,
        lastTimestamp INTEGER
      );
      CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        conversationId TEXT,
        messageText TEXT,
        senderId TEXT,
        timestamp INTEGER
      );
    `);
  }
  return dbPromise;
}

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
  async getChats(): Promise<any[]> {
    const db = await getDB();
    const rows = await db.getAllAsync(
      'SELECT * FROM conversations ORDER BY lastTimestamp DESC'
    );
    return rows;
  }

  async deleteChat(id: string): Promise<any> {
    const db = await getDB();
    const del = await db.execAsync(`DELETE FROM conversations WHERE conversationId=${id}`);
    return del;
  }

  // Get all messages for a conversation
  async getMessages(conversationId: string): Promise<any[]> {
    const db = await getDB();
    const rows = await db.getAllAsync(
      'SELECT * FROM messages WHERE conversationId = ? ORDER BY timestamp ASC',
      conversationId
    );
    return rows;
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
    const db = await getDB();
    const timestamp = Date.now();

    // Store the message
    await db.runAsync(
      'INSERT INTO messages (conversationId, messageText, senderId, timestamp) VALUES (?, ?, ?, ?)',
      conversationId,
      messageText,
      senderId,
      timestamp
    );

    // Update conversation
    const conv = await db.getFirstAsync(
      'SELECT * FROM conversations WHERE conversationId = ?',
      conversationId
    );

    if (conv) {
      await db.runAsync(
        'UPDATE conversations SET lastMessage = ?, lastTimestamp = ? WHERE conversationId = ?',
        messageText,
        timestamp,
        conversationId
      );
    } else {
      // create conversation if doesn't exist
      await db.runAsync(
        'INSERT INTO conversations (conversationId, memberA, memberB, lastMessage, lastTimestamp) VALUES (?, ?, ?, ?, ?)',
        conversationId,
        senderId,
        '',
        messageText,
        timestamp
      );
    }

    // Handle notification or sound
    if (isViewing) {
      this.playSound();
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
    const db = await getDB();
    const existing = await db.getFirstAsync(
      'SELECT * FROM conversations WHERE conversationId = ?',
      conversationId
    );

    if (existing) return existing;

    const newChat = {
      conversationId,
      memberA,
      memberB,
      lastMessage: '',
      lastTimestamp: Date.now(),
    };

    await db.runAsync(
      'INSERT INTO conversations (conversationId, memberA, memberB, lastMessage, lastTimestamp) VALUES (?, ?, ?, ?, ?)',
      newChat.conversationId,
      newChat.memberA,
      newChat.memberB,
      '',
      newChat.lastTimestamp
    );

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
}
