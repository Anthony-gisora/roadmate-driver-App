import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    Alert,
    Animated,
    FlatList,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

export default function NotificationsScreen() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'all' | 'updates' | 'messages'>('all');
    const [chatModalVisible, setChatModalVisible] = useState(false);
    const [selectedChat, setSelectedChat] = useState<any>(null);
    const [messageText, setMessageText] = useState('');
    const [notifications, setNotifications] = useState([
        {
            id: '1',
            type: 'mechanic_accepted',
            title: 'Mechanic Assigned',
            description: 'Mike Johnson has accepted your roadside assistance request',
            time: '2 min ago',
            read: false,
            priority: 'high',
            mechanic: {
                name: 'Mike Johnson',
                specialization: 'Tire Specialist',
                rating: 4.8,
                eta: '5-10 min'
            }
        },
        {
            id: '2',
            type: 'system_update',
            title: 'Service Update',
            description: 'Your tire repair service has been completed successfully',
            time: '1 hour ago',
            read: true,
            priority: 'medium'
        },
        {
            id: '3',
            type: 'message',
            title: 'New Message',
            description: 'Mike Johnson: I\'m 5 minutes away from your location',
            time: '5 min ago',
            read: false,
            priority: 'high',
            mechanic: {
                name: 'Mike Johnson',
                specialization: 'Tire Specialist'
            }
        },
        {
            id: '4',
            type: 'system_update',
            title: 'Payment Processed',
            description: 'Payment of $25.00 for tire repair has been processed',
            time: '2 hours ago',
            read: true,
            priority: 'low'
        },
        {
            id: '5',
            type: 'mechanic_en_route',
            title: 'Mechanic En Route',
            description: 'Sarah Chen is on the way to your location',
            time: '1 day ago',
            read: true,
            priority: 'medium',
            mechanic: {
                name: 'Sarah Chen',
                specialization: 'Engine Expert',
                eta: '15 min'
            }
        }
    ]);

    const [chats, setChats] = useState([
        {
            id: '1',
            mechanic: {
                name: 'Mike Johnson',
                specialization: 'Tire Specialist',
                rating: 4.8,
                image: '👨‍🔧'
            },
            lastMessage: 'I\'m 5 minutes away from your location',
            timestamp: '2 min ago',
            unread: true,
            active: true
        },
        {
            id: '2',
            mechanic: {
                name: 'Sarah Chen',
                specialization: 'Engine Expert',
                rating: 4.9,
                image: '👩‍🔧'
            },
            lastMessage: 'Your engine diagnostics are complete',
            timestamp: '1 hour ago',
            unread: false,
            active: false
        },
        {
            id: '3',
            mechanic: {
                name: 'Carlos Rodriguez',
                specialization: 'Towing & Recovery',
                rating: 4.7,
                image: '🚛'
            },
            lastMessage: 'I\'ve arrived at your location',
            timestamp: '1 day ago',
            unread: false,
            active: false
        }
    ]);

    const [messages, setMessages] = useState([
        {
            id: '1',
            text: 'Hi John, I\'ve accepted your roadside assistance request',
            sender: 'mechanic',
            timestamp: '10:30 AM'
        },
        {
            id: '2',
            text: 'Great! How long until you arrive?',
            sender: 'user',
            timestamp: '10:31 AM'
        },
        {
            id: '3',
            text: 'I\'m about 5 minutes away from your location. Can you confirm your exact position?',
            sender: 'mechanic',
            timestamp: '10:32 AM'
        },
        {
            id: '4',
            text: 'Yes, I\'m on Main Street near the gas station',
            sender: 'user',
            timestamp: '10:33 AM'
        },
        {
            id: '5',
            text: 'Perfect, I can see you on the map. I\'ll be there in 2-3 minutes',
            sender: 'mechanic',
            timestamp: '10:34 AM'
        }
    ]);

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 500,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    const filteredNotifications = notifications.filter(notification => {
        if (activeTab === 'all') return true;
        if (activeTab === 'updates') return notification.type !== 'message';
        if (activeTab === 'messages') return notification.type === 'message';
        return true;
    });

    const handleMarkAsRead = (id: string) => {
        setNotifications(prev =>
            prev.map(notif =>
                notif.id === id ? { ...notif, read: true } : notif
            )
        );
    };

    const handleMarkAllAsRead = () => {
        setNotifications(prev =>
            prev.map(notif => ({ ...notif, read: true }))
        );
    };

    const handleOpenChat = (chat: any) => {
        setSelectedChat(chat);
        setChatModalVisible(true);
    };

    const handleSendMessage = () => {
        if (messageText.trim()) {
            const newMessage = {
                id: (messages.length + 1).toString(),
                text: messageText,
                sender: 'user',
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            setMessages(prev => [...prev, newMessage]);
            setMessageText('');

            // Simulate mechanic response
            setTimeout(() => {
                const responseMessage = {
                    id: (messages.length + 2).toString(),
                    text: 'Thanks for the update. I can see your location on the map.',
                    sender: 'mechanic',
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                };
                setMessages(prev => [...prev, responseMessage]);
            }, 2000);
        }
    };

    const handleCallMechanic = () => {
        Alert.alert(
            'Call Mechanic',
            `Would you like to call ${selectedChat?.mechanic.name}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Call', onPress: () => {
                        Alert.alert('Calling...', `Connecting to ${selectedChat?.mechanic.name}`);
                    }}
            ]
        );
    };

    const handleShareLocation = () => {
        Alert.alert(
            'Share Location',
            'Your current location has been shared with the mechanic',
            [{ text: 'OK' }]
        );
    };

    const getNotificationIcon = (type: string, priority: string) => {
        const color = priority === 'high' ? '#dc2626' :
            priority === 'medium' ? '#f59e0b' : '#075538';

        switch (type) {
            case 'mechanic_accepted':
                return { name: 'checkmark-circle', color };
            case 'system_update':
                return { name: 'information-circle', color };
            case 'message':
                return { name: 'chatbubble', color };
            case 'mechanic_en_route':
                return { name: 'navigate', color };
            default:
                return { name: 'notifications', color };
        }
    };

    const NotificationCard = ({ notification }: { notification: any }) => {
        const icon = getNotificationIcon(notification.type, notification.priority);

        return (
            <TouchableOpacity
                style={[
                    styles.notificationCard,
                    !notification.read && styles.unreadNotification
                ]}
                onPress={() => handleMarkAsRead(notification.id)}
            >
                <View style={styles.notificationHeader}>
                    <View style={[styles.iconContainer, { backgroundColor: `${icon.color}15` }]}>
                        <Ionicons name={icon.name as any} size={20} color={icon.color} />
                    </View>
                    <View style={styles.notificationContent}>
                        <Text style={styles.notificationTitle}>{notification.title}</Text>
                        <Text style={styles.notificationDescription}>{notification.description}</Text>
                        <Text style={styles.notificationTime}>{notification.time}</Text>
                    </View>
                    {!notification.read && <View style={styles.unreadDot} />}
                </View>

                {notification.mechanic && (
                    <View style={styles.mechanicInfo}>
                        <Text style={styles.mechanicName}>{notification.mechanic.name}</Text>
                        <Text style={styles.mechanicDetails}>
                            {notification.mechanic.specialization} • ETA: {notification.mechanic.eta}
                        </Text>
                    </View>
                )}

                {notification.type === 'message' && (
                    <TouchableOpacity
                        style={styles.replyButton}
                        onPress={() => {
                            const chat = chats.find(c => c.mechanic.name === notification.mechanic?.name);
                            if (chat) handleOpenChat(chat);
                        }}
                    >
                        <Ionicons name="chatbubble" size={16} color="#075538" />
                        <Text style={styles.replyText}>Reply</Text>
                    </TouchableOpacity>
                )}
            </TouchableOpacity>
        );
    };

    const ChatCard = ({ chat }: { chat: any }) => (
        <TouchableOpacity
            style={styles.chatCard}
            onPress={() => handleOpenChat(chat)}
        >
            <View style={styles.chatHeader}>
                <Text style={styles.chatAvatar}>{chat.mechanic.image}</Text>
                <View style={styles.chatInfo}>
                    <View style={styles.chatNameRow}>
                        <Text style={styles.chatName}>{chat.mechanic.name}</Text>
                        {chat.active && (
                            <View style={styles.activeBadge}>
                                <Text style={styles.activeText}>Active</Text>
                            </View>
                        )}
                    </View>
                    <Text style={styles.chatSpecialization}>{chat.mechanic.specialization}</Text>
                    <Text style={styles.chatLastMessage} numberOfLines={1}>
                        {chat.lastMessage}
                    </Text>
                </View>
                <View style={styles.chatMeta}>
                    <Text style={styles.chatTime}>{chat.timestamp}</Text>
                    {chat.unread && <View style={styles.chatUnread} />}
                </View>
            </View>
        </TouchableOpacity>
    );

    const MessageBubble = ({ message }: { message: any }) => (
        <View style={[
            styles.messageBubble,
            message.sender === 'user' ? styles.userMessage : styles.mechanicMessage
        ]}>
            <Text style={[
                styles.messageText,
                message.sender === 'user' ? styles.userMessageText : styles.mechanicMessageText
            ]}>
                {message.text}
            </Text>
            <Text style={styles.messageTime}>{message.timestamp}</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerTop}>
                    <Text style={styles.title}>Notifications</Text>
                    <TouchableOpacity
                        style={styles.markAllButton}
                        onPress={handleMarkAllAsRead}
                    >
                        <Text style={styles.markAllText}>Mark all as read</Text>
                    </TouchableOpacity>
                </View>
                <Text style={styles.subtitle}>Stay updated with your services</Text>
            </View>

            {/* Navigation Tabs */}
            <View style={styles.tabContainer}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'all' && styles.tabActive]}
                    onPress={() => setActiveTab('all')}
                >
                    <Text style={[styles.tabText, activeTab === 'all' && styles.tabTextActive]}>
                        All
                    </Text>
                    {notifications.some(n => !n.read) && (
                        <View style={styles.tabBadge}>
                            <Text style={styles.tabBadgeText}>
                                {notifications.filter(n => !n.read).length}
                            </Text>
                        </View>
                    )}
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.tab, activeTab === 'updates' && styles.tabActive]}
                    onPress={() => setActiveTab('updates')}
                >
                    <Text style={[styles.tabText, activeTab === 'updates' && styles.tabTextActive]}>
                        Updates
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.tab, activeTab === 'messages' && styles.tabActive]}
                    onPress={() => setActiveTab('messages')}
                >
                    <Text style={[styles.tabText, activeTab === 'messages' && styles.tabTextActive]}>
                        Messages
                    </Text>
                    {chats.some(c => c.unread) && (
                        <View style={styles.tabBadge}>
                            <Text style={styles.tabBadgeText}>
                                {chats.filter(c => c.unread).length}
                            </Text>
                        </View>
                    )}
                </TouchableOpacity>
            </View>

            {/* Content */}
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <Animated.View
                    style={[
                        styles.contentInner,
                        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
                    ]}
                >
                    {activeTab !== 'messages' ? (
                        <>
                            {filteredNotifications.length > 0 ? (
                                filteredNotifications.map(notification => (
                                    <NotificationCard key={notification.id} notification={notification} />
                                ))
                            ) : (
                                <View style={styles.emptyState}>
                                    <Ionicons name="notifications-off" size={64} color="#cbd5e1" />
                                    <Text style={styles.emptyTitle}>No notifications</Text>
                                    <Text style={styles.emptyDescription}>
                                        You're all caught up! New updates will appear here.
                                    </Text>
                                </View>
                            )}
                        </>
                    ) : (
                        <>
                            {chats.map(chat => (
                                <ChatCard key={chat.id} chat={chat} />
                            ))}

                            {chats.length === 0 && (
                                <View style={styles.emptyState}>
                                    <Ionicons name="chatbubble" size={64} color="#cbd5e1" />
                                    <Text style={styles.emptyTitle}>No messages</Text>
                                    <Text style={styles.emptyDescription}>
                                        Your conversations with mechanics will appear here.
                                    </Text>
                                </View>
                            )}
                        </>
                    )}
                </Animated.View>
            </ScrollView>

            {/* Chat Modal */}
            <Modal
                visible={chatModalVisible}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={() => setChatModalVisible(false)}
            >
                {selectedChat && (
                    <View style={styles.modalContainer}>
                        {/* Chat Header */}
                        <View style={styles.chatHeaderModal}>
                            <TouchableOpacity
                                style={styles.backButton}
                                onPress={() => setChatModalVisible(false)}
                            >
                                <Ionicons name="arrow-back" size={24} color="#1e293b" />
                            </TouchableOpacity>

                            <View style={styles.chatPartnerInfo}>
                                <Text style={styles.chatAvatar}>{selectedChat.mechanic.image}</Text>
                                <View style={styles.chatPartnerDetails}>
                                    <Text style={styles.chatPartnerName}>{selectedChat.mechanic.name}</Text>
                                    <Text style={styles.chatPartnerStatus}>Online</Text>
                                </View>
                            </View>

                            <View style={styles.chatActions}>
                                <TouchableOpacity
                                    style={styles.chatActionButton}
                                    onPress={handleCallMechanic}
                                >
                                    <Ionicons name="call" size={20} color="#075538" />
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.chatActionButton}
                                    onPress={handleShareLocation}
                                >
                                    <Ionicons name="location" size={20} color="#075538" />
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Messages */}
                        <FlatList
                            data={messages}
                            keyExtractor={(item) => item.id}
                            renderItem={({ item }) => <MessageBubble message={item} />}
                            style={styles.messagesContainer}
                            contentContainerStyle={styles.messagesContent}
                            inverted={false}
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
                                    color={messageText.trim() ? "#075538" : "#cbd5e1"}
                                />
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#075538',
    },
    header: {
        backgroundColor: '#fff',
        padding: 20,
        paddingTop: 60,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1e293b',
    },
    subtitle: {
        fontSize: 16,
        color: '#64748b',
    },
    markAllButton: {
        padding: 8,
    },
    markAllText: {
        fontSize: 14,
        color: '#075538',
        fontWeight: '500',
    },
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
    },
    tab: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        gap: 8,
    },
    tabActive: {
        borderBottomWidth: 2,
        borderBottomColor: '#075538',
    },
    tabText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#64748b',
    },
    tabTextActive: {
        color: '#075538',
    },
    tabBadge: {
        backgroundColor: '#dc2626',
        borderRadius: 10,
        minWidth: 18,
        height: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    tabBadgeText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
    },
    content: {
        flex: 1,
    },
    contentInner: {
        padding: 20,
        paddingBottom: 100,
    },
    notificationCard: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    unreadNotification: {
        borderLeftWidth: 4,
        borderLeftColor: '#075538',
    },
    notificationHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    notificationContent: {
        flex: 1,
    },
    notificationTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1e293b',
        marginBottom: 4,
    },
    notificationDescription: {
        fontSize: 14,
        color: '#64748b',
        marginBottom: 4,
        lineHeight: 20,
    },
    notificationTime: {
        fontSize: 12,
        color: '#94a3b8',
    },
    unreadDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#075538',
        marginLeft: 8,
    },
    mechanicInfo: {
        marginTop: 12,
        padding: 12,
        backgroundColor: '#f8fafc',
        borderRadius: 12,
        borderLeftWidth: 3,
        borderLeftColor: '#075538',
    },
    mechanicName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1e293b',
        marginBottom: 2,
    },
    mechanicDetails: {
        fontSize: 12,
        color: '#64748b',
    },
    replyButton: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        marginTop: 12,
        paddingHorizontal: 12,
        paddingVertical: 6,
        backgroundColor: '#eff6ff',
        borderRadius: 8,
        gap: 4,
    },
    replyText: {
        fontSize: 12,
        fontWeight: '500',
        color: '#075538',
    },
    chatCard: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    chatHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    chatAvatar: {
        fontSize: 32,
        marginRight: 12,
    },
    chatInfo: {
        flex: 1,
    },
    chatNameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    chatName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1e293b',
    },
    activeBadge: {
        backgroundColor: '#10b981',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    activeText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#fff',
    },
    chatSpecialization: {
        fontSize: 12,
        color: '#64748b',
        marginBottom: 4,
    },
    chatLastMessage: {
        fontSize: 14,
        color: '#64748b',
    },
    chatMeta: {
        alignItems: 'flex-end',
    },
    chatTime: {
        fontSize: 12,
        color: '#94a3b8',
        marginBottom: 4,
    },
    chatUnread: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#075538',
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#475569',
        marginTop: 16,
    },
    emptyDescription: {
        fontSize: 14,
        color: '#64748b',
        marginTop: 8,
        textAlign: 'center',
    },
    modalContainer: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    chatHeaderModal: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 20,
        paddingTop: 60,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
    },
    backButton: {
        padding: 8,
    },
    chatPartnerInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        marginLeft: 12,
    },
    chatPartnerDetails: {
        marginLeft: 12,
    },
    chatPartnerName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1e293b',
    },
    chatPartnerStatus: {
        fontSize: 12,
        color: '#10b981',
    },
    chatActions: {
        flexDirection: 'row',
        gap: 12,
    },
    chatActionButton: {
        padding: 8,
    },
    messagesContainer: {
        flex: 1,
    },
    messagesContent: {
        padding: 20,
    },
    messageBubble: {
        maxWidth: '80%',
        padding: 12,
        borderRadius: 16,
        marginBottom: 12,
    },
    userMessage: {
        alignSelf: 'flex-end',
        backgroundColor: '#075538',
        borderBottomRightRadius: 4,
    },
    mechanicMessage: {
        alignSelf: 'flex-start',
        backgroundColor: '#fff',
        borderBottomLeftRadius: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 1,
    },
    messageText: {
        fontSize: 16,
        lineHeight: 20,
    },
    userMessageText: {
        color: '#fff',
    },
    mechanicMessageText: {
        color: '#1e293b',
    },
    messageTime: {
        fontSize: 10,
        color: '#94a3b8',
        marginTop: 4,
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
        backgroundColor: '#eff6ff',
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 12,
    },
    sendButtonDisabled: {
        backgroundColor: '#f1f5f9',
    },
});