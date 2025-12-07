// app/chat/[id].tsx
import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    Animated
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '@clerk/clerk-expo';
import {ChatManager} from "@/hooks/chat-manager";
import {apiClient} from "@/hooks/api-client";
import {sendMessage} from "@/hooks/socket";

export default function ChatScreen() {
    const { id, mechanicName, mechanicImage, chatId } = useLocalSearchParams();
    const router = useRouter();
    const { user } = useUser();
    const [messages, setMessages] = useState<any[]>([]);
    const [messageText, setMessageText] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    let chatId2 = chatId;

    const flatListRef = useRef<FlatList>(null);
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        loadMessages();
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
        }).start();
    }, []);

    const loadMessages = async () => {
        // get all messages from backend and store locally if the chatId is not null
        if(chatId2){
            // chatId exists so maybe locally too
            try {
                const chatManager = ChatManager.getInstance();
                const conversationMessages = await chatManager.getMessages(id as string);
                setMessages(conversationMessages);
                if (conversationMessages.length < 1){
                    // chat exists but not locally, so fetch from backend
                    apiClient.get(`/message/${chatId2}`)
                        .then(res => {
                            console.log(res);
                            setMessages([...res.data]);
                            chatManager.createChat({conversationId: chatId2 as string,
                            memberA: user?.id as string,
                            memberB: id as string})

                            //save messages
                            messages.forEach((message) => {
                                chatManager.addMessage({
                                    conversationId:chatId2 as string,
                                    messageText: message?.messageText as string,
                                    senderId: message?.senderId as string,
                                    isViewing: true,
                                })
                            })
                        })
                        .catch((err) => {
                            console.log(err);
                        })
                }
            } catch (error) {
                console.error('Error loading messages:', error);
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleSendMessage = async () => {
        if (!messageText.trim()) return;
        const chatManager = ChatManager.getInstance();
        //check if chat exists
        if(chatId2 == null){
            //create the chat in the backend then save the chatId and save it locally
            try{
                const res = await apiClient.post("/conversation", {
                    receiverId: id, currentUserId: user?.id as string,
                    mechanicName: mechanicName, driverName: user?.firstName as string,
                })
                //update chatId2
                chatId2 = res?.data?.chatId as string;
                console.log("chatId2", chatId2);

                await chatManager.createChat({
                    conversationId: res?.data?.chatId,
                    memberA: user?.id as string,
                    memberB: id as string,
                });
            }catch (e) {
                console.error(e);
            }

        }

        // send the message using sockets
        sendMessage({
            senderId: user?.id as string,
            conversationId: chatId2 as string,
            messageText: messageText,
            otherUserId: id as string
        });

        const newMessage = {
            id: Date?.now()?.toString(),
            messageText: messageText.trim(),
            senderId: user!.id,
            timestamp: Date.now(),
            conversationId: id as string
        };

        // Optimistically update UI
        setMessages(prev => [...prev, newMessage]);
        setMessageText('');

        // Save to database
        try {
            const chatManager = ChatManager.getInstance();
            await chatManager.addMessage({
                conversationId: chatId2 as string,
                messageText: messageText.trim(),
                senderId: user!.id,
                isViewing: true
            });
        } catch (error) {
            console.error('Error sending message:', error);
            // Optionally show error and revert optimistic update
        }

        // Scroll to bottom
        setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
    };

    const MessageBubble = ({ message }: { message: any }) => {
        const isUser = message.senderId === user?.id;

        return (
            <View style={[
                styles.messageContainer,
                isUser ? styles.userMessageContainer : styles.mechanicMessageContainer
            ]}>
                <View style={[
                    styles.messageBubble,
                    isUser ? styles.userMessageBubble : styles.mechanicMessageBubble
                ]}>
                    <Text style={[
                        styles.messageText,
                        isUser ? styles.userMessageText : styles.mechanicMessageText
                    ]}>
                        {message.messageText}
                    </Text>
                    <Text style={styles.messageTime}>
                        {new Date(message.timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                        })}
                    </Text>
                </View>
            </View>
        );
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.back()}
                >
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>

                <View style={styles.mechanicInfo}>
                    <Text style={styles.avatar}>{mechanicImage}</Text>
                    <View style={styles.mechanicDetails}>
                        <Text style={styles.mechanicName}>{mechanicName}</Text>
                        <Text style={styles.status}>Online</Text>
                    </View>
                </View>

                <TouchableOpacity style={styles.callButton}>
                    <Ionicons name="call" size={20} color="#fff" />
                </TouchableOpacity>
            </View>

            {/* Messages */}
            <Animated.View
                style={[
                    styles.messagesContainer,
                    { opacity: fadeAnim }
                ]}
            >
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    keyExtractor={(item) => item?.id?.toString()}
                    renderItem={({ item }) => <MessageBubble message={item} />}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.messagesContent}
                    onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                />
            </Animated.View>

            {/* Message Input */}
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.messageInput}
                    placeholder="Type a message..."
                    placeholderTextColor="#94a3b8"
                    value={messageText}
                    onChangeText={setMessageText}
                    multiline
                    maxLength={500}
                />
                <TouchableOpacity
                    style={[
                        styles.sendButton,
                        !messageText.trim() && styles.sendButtonDisabled
                    ]}
                    onPress={handleSendMessage}
                    disabled={!messageText.trim()}
                >
                    <Ionicons
                        name="send"
                        size={20}
                        color={messageText.trim() ? "#fff" : "#cbd5e1"}
                    />
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#075538',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 16,
        backgroundColor: '#075538',
    },
    backButton: {
        padding: 8,
    },
    mechanicInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        marginLeft: 12,
    },
    avatar: {
        fontSize: 32,
        marginRight: 12,
    },
    mechanicDetails: {
        flex: 1,
    },
    mechanicName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 2,
    },
    status: {
        fontSize: 12,
        color: '#10b981',
        fontWeight: '500',
    },
    callButton: {
        padding: 8,
    },
    messagesContainer: {
        flex: 1,
        backgroundColor: '#f8fafc',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        overflow: 'hidden',
    },
    messagesContent: {
        padding: 20,
        paddingBottom: 20,
    },
    messageContainer: {
        marginBottom: 16,
    },
    userMessageContainer: {
        alignItems: 'flex-end',
    },
    mechanicMessageContainer: {
        alignItems: 'flex-start',
    },
    messageBubble: {
        maxWidth: '80%',
        padding: 12,
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    userMessageBubble: {
        backgroundColor: '#075538',
        borderBottomRightRadius: 4,
    },
    mechanicMessageBubble: {
        backgroundColor: '#fff',
        borderBottomLeftRadius: 4,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    messageText: {
        fontSize: 16,
        lineHeight: 20,
        marginBottom: 4,
    },
    userMessageText: {
        color: '#fff',
    },
    mechanicMessageText: {
        color: '#1e293b',
    },
    messageTime: {
        fontSize: 10,
        opacity: 0.7,
        alignSelf: 'flex-end',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        padding: 16,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#e2e8f0',
    },
    messageInput: {
        flex: 1,
        backgroundColor: '#f8fafc',
        borderWidth: 2,
        borderColor: '#e2e8f0',
        borderRadius: 24,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
        color: '#1e293b',
        maxHeight: 100,
    },
    sendButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#075538',
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    sendButtonDisabled: {
        backgroundColor: '#cbd5e1',
    },
});