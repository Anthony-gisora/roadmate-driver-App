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
        driver TEXT,
        mechanic TEXT,
        lastMessage TEXT,
        lastTimestamp INTEGER
      )
    `);

    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS messages (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          conversationId TEXT,
          messageText TEXT,
          senderId TEXT,
          timestamp INTEGER
        )
    `)
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

  async deleteChat(id: string): Promise<void> {
    const db = await getDB();
    await db.runAsync('DELETE FROM conversations WHERE conversationId = ?', id);
    await db.runAsync('DELETE FROM messages WHERE conversationId = ?', id);
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

  // get all messages for a conversation given the other user id
  async getMessageByOtherUserId(userId: string): Promise<any[]> {
    const db = await getDB();

    // 1. Get any message sent by the given senderId
    const message = await db.getFirstAsync(
        'SELECT conversationId FROM messages WHERE senderId = ? LIMIT 1',
        userId
    );

    // No messages found for this sender
    if (!message?.conversationId) {
      return [];
    }

    const conversationId = message.conversationId;

    // 2 & 3. Get all messages for that conversationId
    const rows = await db.getAllAsync(
        'SELECT * FROM messages WHERE conversationId = ? ORDER BY timestamp ASC',
        conversationId
    );

    // 4. Return messages
    return rows;
  }

  // Add a new message to a conversation
  async addMessage({
    conversationId,
    messageText,
    senderId,
      driver,mechanic,memberB,
    isViewing = false,
    isSending = true,
      time
  }: {
    conversationId: string;
    messageText: string;
    senderId: string;
    driver: string | undefined;mechanic: string | undefined;memberB: string | undefined;
    isViewing?: boolean;
    isSending?: boolean;
    time?: number| null;
  }) {
    const db = await getDB();
    const timestamp = time ?? Date.now();

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
        'INSERT INTO conversations (conversationId, memberA, memberB,driver,mechanic, lastMessage, lastTimestamp) VALUES (?, ?, ?, ?, ?,?,?)',
        conversationId,
        senderId,
        memberB ?? '',
        driver ?? '',
        mechanic ?? '',
        messageText,
        timestamp
      );
    }

    // Handle notification or sound
    if(isViewing){
      if (isSending) {
        this.playSendingSound();
      }else{
        //play incoming message sound
        this.playIncomingSound();
      }
    }
  }

  // Create a new chat
  async createChat({
    conversationId,
    memberA,
    memberB,
    driver,
    mechanic,
    lastMessage,
    lastTimestamp,
  }: {
    conversationId: string;
    memberA: string;
    memberB: string;
    driver: string;
    mechanic: string;
    lastMessage: string;
    lastTimestamp: Date
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
      driver,
      mechanic,
      lastMessage: lastMessage,
      lastTimestamp: Date.now(),
    };

    await db.runAsync(
      'INSERT INTO conversations (conversationId, memberA, memberB, driver, mechanic, lastMessage, lastTimestamp) VALUES (?, ?, ?, ?, ?)',
      newChat.conversationId,
      newChat.memberA,
      newChat.memberB,
      newChat.driver,
      newChat.mechanic,
      lastMessage,
      newChat.lastTimestamp
    );

    return newChat;
  }

  private async playSendingSound() {
    try {
      const { sound } = await Audio.Sound.createAsync(
          require('../assets/audio/inchat.mp3')
      );
      await sound.playAsync();
    } catch (err) {
      console.error('Failed to play sound', err);
    }
  }

  private async playIncomingSound() {
    try {
      const { sound } = await Audio.Sound.createAsync(
          require('../assets/audio/outchat.mp3')
      );
      await sound.playAsync();
    } catch (err) {
      console.error('Failed to play sound', err);
    }
  }
}
