// app/(tabs)/notifications.tsx
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    Animated,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    RefreshControl
} from 'react-native';
import { useUser } from "@clerk/clerk-expo";
import {ChatManager} from "@/hooks/chat-manager";

export default function NotificationsScreen() {
    const router = useRouter();
    const { user } = useUser();
    const [chats, setChats] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Animation values
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;

    useEffect(() => {
        loadChats();
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

    const loadChats = async () => {
        try {
            setIsLoading(true);
            const chatManager = ChatManager.getInstance();
            const conversations = await chatManager.getChats();

            // Transform conversations to chat format with mechanic data
            const formattedChats = await Promise.all(
                conversations.map(async (conv) => {
                    // Get the last message details
                    const messages = await chatManager.getMessages(conv.conversationId);
                    const lastMessage = messages[messages.length - 1];

                    // Determine the mechanic based on conversation members
                    const mechanicId = conv.memberA === user?.id ? conv.memberB : conv.memberA;
                    const mechanic = await getMechanicDetails(mechanicId);

                    return {
                        id: conv.conversationId,
                        mechanic: {
                            id: mechanicId,
                            name: mechanic.name,
                            specialization: mechanic.specialization,
                            rating: mechanic.rating,
                            image: mechanic.image,
                            isOnline: Math.random() > 0.3 // Mock online status
                        },
                        lastMessage: lastMessage?.messageText || conv.lastMessage,
                        timestamp: formatTimestamp(lastMessage?.timestamp || conv.lastTimestamp),
                        unread: Math.random() > 0.5, // Mock unread status
                        messageCount: messages.length
                    };
                })
            );

            // Sort by last message timestamp
            formattedChats.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
            setChats(formattedChats);
        } catch (error) {
            console.error('Error loading chats:', error);
        } finally {
            setIsLoading(false);
            setRefreshing(false);
        }
    };

    const getMechanicDetails = async (mechanicId: string) => {
        // Mock mechanic data - in real app, you'd fetch from your backend
        const mechanics = {
            'mike_johnson': {
                name: 'Mike Johnson',
                specialization: 'Tire Specialist',
                rating: 4.8,
                image: '👨‍🔧'
            },
            'sarah_chen': {
                name: 'Sarah Chen',
                specialization: 'Engine Expert',
                rating: 4.9,
                image: '👩‍🔧'
            },
            'carlos_rodriguez': {
                name: 'Carlos Rodriguez',
                specialization: 'Towing & Recovery',
                rating: 4.7,
                image: '🚛'
            },
            'express_auto': {
                name: 'Express Auto Care',
                specialization: 'Full Service Garage',
                rating: 4.6,
                image: '🏢'
            }
        };

        return mechanics[mechanicId as keyof typeof mechanics] || {
            name: 'Unknown Mechanic',
            specialization: 'General Repair',
            rating: 4.5,
            image: '🔧'
        };
    };

    const formatTimestamp = (timestamp: number) => {
        const now = new Date();
        const messageTime = new Date(timestamp);
        const diffInHours = (now.getTime() - messageTime.getTime()) / (1000 * 60 * 60);

        if (diffInHours < 1) {
            const minutes = Math.floor(diffInHours * 60);
            return minutes < 1 ? 'now' : `${minutes}m ago`;
        } else if (diffInHours < 24) {
            return `${Math.floor(diffInHours)}h ago`;
        } else {
            return messageTime.toLocaleDateString();
        }
    };

    const handleRefresh = () => {
        setRefreshing(true);
        loadChats();
    };

    const handleChatPress = (chat: any) => {
        router.push({
            pathname: '/messaging/[id]',
            params: {
                id: chat.mechanic.id,
                mechanicName: chat.mechanic.name,
                mechanicImage: chat.mechanic.image
            }
        });
    };

    const ChatCard = ({ chat, index }: { chat: any; index: number }) => {
        const translateY = fadeAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [50 * (index + 1), 0],
        });

        const opacity = fadeAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 1],
        });

        return (
            <Animated.View
                style={[
                    styles.chatCard,
                    {
                        transform: [{ translateY }],
                        opacity
                    }
                ]}
            >
                <TouchableOpacity
                    style={styles.chatCardInner}
                    onPress={() => handleChatPress(chat)}
                >
                    {/* Avatar with Online Status */}
                    <View style={styles.avatarContainer}>
                        <Text style={styles.avatarText}>{chat.mechanic.image}</Text>
                        {chat.mechanic.isOnline && <View style={styles.onlineIndicator} />}
                    </View>

                    {/* Chat Content */}
                    <View style={styles.chatContent}>
                        <View style={styles.chatHeader}>
                            <Text style={styles.mechanicName} numberOfLines={1}>
                                {chat.mechanic.name}
                            </Text>
                            <Text style={styles.timestamp}>
                                {chat.timestamp}
                            </Text>
                        </View>

                        <Text style={styles.specialization}>
                            {chat.mechanic.specialization}
                        </Text>

                        <View style={styles.lastMessageContainer}>
                            <Text
                                style={[
                                    styles.lastMessage,
                                    chat.unread && styles.unreadMessage
                                ]}
                                numberOfLines={2}
                            >
                                {chat.lastMessage}
                            </Text>

                            {chat.unread && (
                                <View style={styles.unreadBadge}>
                                    <Text style={styles.unreadBadgeText}>
                                        {chat.messageCount > 99 ? '99+' : chat.messageCount}
                                    </Text>
                                </View>
                            )}
                        </View>
                    </View>

                    {/* Rating */}
                    <View style={styles.ratingContainer}>
                        <Ionicons name="star" size={16} color="#f59e0b" />
                        <Text style={styles.ratingText}>{chat.mechanic.rating}</Text>
                    </View>
                </TouchableOpacity>
            </Animated.View>
        );
    };

    const EmptyState = () => (
        <Animated.View
            style={[
                styles.emptyState,
                { opacity: fadeAnim }
            ]}
        >
            <View style={styles.emptyIllustration}>
                <Ionicons name="chatbubble-ellipses" size={80} color="#cbd5e1" />
            </View>
            <Text style={styles.emptyTitle}>No messages yet</Text>
            <Text style={styles.emptyDescription}>
                Your conversations with mechanics will appear here once you start a service request.
            </Text>
        </Animated.View>
    );

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerContent}>
                    <Text style={styles.title}>Messages</Text>
                    <Text style={styles.subtitle}>
                        Chat with your mechanics
                    </Text>
                </View>
                <View style={styles.headerDecoration} />
            </View>

            {/* Chat List */}
            <Animated.View
                style={[
                    styles.content,
                    { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
                ]}
            >
                {chats.length > 0 ? (
                    <FlatList
                        data={chats}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item, index }) => (
                            <ChatCard chat={item} index={index} />
                        )}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.chatList}
                        refreshControl={
                            <RefreshControl
                                refreshing={refreshing}
                                onRefresh={handleRefresh}
                                colors={['#075538']}
                                tintColor="#075538"
                            />
                        }
                    />
                ) : (
                    <EmptyState />
                )}
            </Animated.View>

            {/* Floating Decorative Elements */}
            <View style={styles.floatingElements}>
                <View style={[styles.floatingCircle, styles.circle1]} />
                <View style={[styles.floatingCircle, styles.circle2]} />
                <View style={[styles.floatingCircle, styles.circle3]} />
            </View>
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
        paddingHorizontal: 24,
        paddingTop: 60,
        paddingBottom: 24,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 8,
        position: 'relative',
        overflow: 'hidden',
    },
    headerContent: {
        zIndex: 2,
    },
    headerDecoration: {
        position: 'absolute',
        top: 0,
        right: 0,
        width: 200,
        height: 200,
        backgroundColor: '#075538',
        opacity: 0.05,
        borderRadius: 100,
        transform: [{ translateX: 100 }, { translateY: -100 }],
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#1e293b',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#64748b',
        opacity: 0.8,
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
    },
    chatList: {
        paddingVertical: 16,
        paddingBottom: 100,
    },
    chatCard: {
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    chatCardInner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 20,
        borderLeftWidth: 4,
        borderLeftColor: '#075538',
    },
    avatarContainer: {
        position: 'relative',
        marginRight: 16,
    },
    avatarText: {
        fontSize: 32,
        width: 56,
        height: 56,
        textAlign: 'center',
        lineHeight: 56,
        backgroundColor: '#f8fafc',
        borderRadius: 28,
        overflow: 'hidden',
    },
    onlineIndicator: {
        position: 'absolute',
        bottom: 2,
        right: 2,
        width: 12,
        height: 12,
        backgroundColor: '#10b981',
        borderWidth: 2,
        borderColor: '#fff',
        borderRadius: 6,
    },
    chatContent: {
        flex: 1,
        marginRight: 12,
    },
    chatHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 4,
    },
    mechanicName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1e293b',
        flex: 1,
        marginRight: 8,
    },
    timestamp: {
        fontSize: 12,
        color: '#94a3b8',
        fontWeight: '500',
    },
    specialization: {
        fontSize: 14,
        color: '#075538',
        fontWeight: '500',
        marginBottom: 6,
    },
    lastMessageContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    lastMessage: {
        fontSize: 14,
        color: '#64748b',
        flex: 1,
        marginRight: 8,
        lineHeight: 18,
    },
    unreadMessage: {
        color: '#1e293b',
        fontWeight: '600',
    },
    unreadBadge: {
        backgroundColor: '#dc2626',
        borderRadius: 12,
        minWidth: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 6,
    },
    unreadBadgeText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff7ed',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#fed7aa',
    },
    ratingText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#ea580c',
        marginLeft: 2,
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
        paddingTop: 60,
    },
    emptyIllustration: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#f8fafc',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#ffffff',
        marginBottom: 12,
        textAlign: 'center',
    },
    emptyDescription: {
        fontSize: 14,
        color: '#ffffff',
        textAlign: 'center',
        lineHeight: 20,
    },
    floatingElements: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: 'none',
    },
    floatingCircle: {
        position: 'absolute',
        borderRadius: 50,
        backgroundColor: '#fff',
        opacity: 0.1,
    },
    circle1: {
        width: 80,
        height: 80,
        top: '40%',
        left: -20,
    },
    circle2: {
        width: 60,
        height: 60,
        top: '20%',
        right: -10,
    },
    circle3: {
        width: 100,
        height: 100,
        bottom: '10%',
        left: '50%',
        transform: [{ translateX: -50 }],
    },
});