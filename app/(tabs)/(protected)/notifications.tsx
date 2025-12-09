import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    Alert,
    Animated,
    Dimensions,
    Modal,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useToast } from 'react-native-toast-notifications';

const { width } = Dimensions.get('window');

// Mock notifications based on your schema
const MOCK_NOTIFICATIONS = [
    {
        _id: '1',
        title: 'Service Request Accepted',
        message: 'Your roadside assistance request has been accepted by Mike Johnson. ETA: 10 minutes.',
        actionTitle: 'View Details',
        actionUrl: '/service/123',
        read: false,
        category: 'account',
        createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 minutes ago
    },
    {
        _id: '2',
        message: 'Your payment of $45.00 has been processed successfully.',
        title: 'Payment Processed',
        actionTitle: 'View Receipt',
        actionUrl: '/receipt/456',
        read: true,
        category: 'account',
        createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(), // 1 hour ago
    },
    {
        _id: '3',
        title: 'Privacy Policy Updated',
        message: 'We have updated our privacy policy. Please review the changes.',
        actionTitle: 'Review Changes',
        actionUrl: '/privacy-policy',
        read: false,
        category: 'policy',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), // 3 hours ago
    },
    {
        _id: '4',
        title: 'Account Security Alert',
        message: 'New device detected. Was this you?',
        actionTitle: 'Review Activity',
        actionUrl: '/security',
        read: true,
        category: 'security',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    },
    {
        _id: '5',
        title: 'Settings Updated',
        message: 'Your notification preferences have been saved successfully.',
        actionTitle: null,
        actionUrl: null,
        read: true,
        category: 'settings',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
    },
    {
        _id: '6',
        title: 'Welcome to Driver Assist!',
        message: 'Thank you for joining Driver Assist. We are here to help you on the road.',
        actionTitle: 'Get Started',
        actionUrl: '/onboarding',
        read: true,
        category: 'other',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(), // 3 days ago
    },
];

export default function NotificationsScreen() {
    const router = useRouter();
    const toast = useToast();
    
    const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
    const [selectedNotification, setSelectedNotification] = useState<any>(null);
    const [isDialogVisible, setIsDialogVisible] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [filter, setFilter] = useState<'all' | 'unread'>('all');

    // Animation values
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;
    const dialogScaleAnim = useRef(new Animated.Value(0.8)).current;
    const dialogOpacityAnim = useRef(new Animated.Value(0)).current;

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
        if (filter === 'all') return true;
        return !notification.read;
    });

    const unreadCount = notifications.filter(n => !n.read).length;

    const formatTimeAgo = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
        
        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
        return date.toLocaleDateString();
    };

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'settings':
                return { icon: 'settings', color: '#075538' };
            case 'policy':
                return { icon: 'document-text', color: '#3b82f6' };
            case 'account':
                return { icon: 'person', color: '#8b5cf6' };
            case 'security':
                return { icon: 'shield-checkmark', color: '#ef4444' };
            default:
                return { icon: 'notifications', color: '#f59e0b' };
        }
    };

    const handleNotificationPress = (notification: any) => {
        setSelectedNotification(notification);
        setIsDialogVisible(true);
        
        // Mark as read
        if (!notification.read) {
            setNotifications(prev => 
                prev.map(n => n._id === notification._id ? { ...n, read: true } : n)
            );
        }

        // Start dialog animations
        dialogScaleAnim.setValue(0.8);
        dialogOpacityAnim.setValue(0);
        
        Animated.parallel([
            Animated.spring(dialogScaleAnim, {
                toValue: 1,
                tension: 50,
                friction: 7,
                useNativeDriver: true,
            }),
            Animated.timing(dialogOpacityAnim, {
                toValue: 1,
                duration: 200,
                useNativeDriver: true,
            }),
        ]).start();
    };

    const handleDialogAction = () => {
        if (selectedNotification?.actionUrl) {
            setIsDialogVisible(false);
            router.push(selectedNotification.actionUrl);
        }
    };

    const handleMarkAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        toast.show('All notifications marked as read', { type: 'success' });
    };

    const handleDeleteNotification = (id: string) => {
        Alert.alert(
            'Delete Notification',
            'Are you sure you want to delete this notification?',
            [
                { text: 'Cancel', style: 'cancel' },
                { 
                    text: 'Delete', 
                    style: 'destructive',
                    onPress: () => {
                        setNotifications(prev => prev.filter(n => n._id !== id));
                        if (selectedNotification?._id === id) {
                            setIsDialogVisible(false);
                        }
                        toast.show('Notification deleted', { type: 'success' });
                    }
                }
            ]
        );
    };

    const handleRefresh = () => {
        setRefreshing(true);
        // Simulate API call
        setTimeout(() => {
            setRefreshing(false);
            toast.show('Notifications refreshed', { type: 'success' });
        }, 1000);
    };

    const NotificationCard = ({ notification, index }: { notification: any, index: number }) => {
        const categoryIcon = getCategoryIcon(notification.category);
        const timeAgo = formatTimeAgo(notification.createdAt);
        
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
                    styles.notificationCard,
                    !notification.read && styles.unreadNotification,
                    { transform: [{ translateY }], opacity }
                ]}
            >
                <TouchableOpacity 
                    style={styles.notificationCardInner}
                    onPress={() => handleNotificationPress(notification)}
                >
                    <View style={styles.notificationHeader}>
                        <View style={[styles.categoryIcon, { backgroundColor: `${categoryIcon.color}15` }]}>
                            <Ionicons name={categoryIcon.icon as any} size={20} color={categoryIcon.color} />
                        </View>
                        
                        <View style={styles.notificationContent}>
                            <Text style={styles.notificationTitle} numberOfLines={1}>
                                {notification.title}
                            </Text>
                            <Text style={styles.notificationMessage} numberOfLines={2}>
                                {notification.message}
                            </Text>
                            <Text style={styles.notificationTime}>
                                {timeAgo} • {notification.category.charAt(0).toUpperCase() + notification.category.slice(1)}
                            </Text>
                        </View>

                        {!notification.read && (
                            <View style={styles.unreadIndicator} />
                        )}
                    </View>

                    {notification.actionTitle && (
                        <View style={styles.actionContainer}>
                            <View style={styles.actionDivider} />
                            <TouchableOpacity 
                                style={styles.actionButton}
                                onPress={() => handleNotificationPress(notification)}
                            >
                                <Text style={styles.actionButtonText}>
                                    {notification.actionTitle}
                                </Text>
                                <Ionicons name="arrow-forward" size={16} color="#075538" />
                            </TouchableOpacity>
                        </View>
                    )}
                </TouchableOpacity>
            </Animated.View>
        );
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerTop}>
                    <View>
                        <Text style={styles.title}>Notifications</Text>
                        <Text style={styles.subtitle}>
                            {unreadCount > 0 
                                ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}`
                                : 'You\'re all caught up'}
                        </Text>
                    </View>
                    
                    {unreadCount > 0 && (
                        <TouchableOpacity 
                            style={styles.markAllButton}
                            onPress={handleMarkAllAsRead}
                        >
                            <Text style={styles.markAllText}>Mark all as read</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Filter Tabs */}
                <View style={styles.filterContainer}>
                    <TouchableOpacity 
                        style={[styles.filterButton, filter === 'all' && styles.filterButtonActive]}
                        onPress={() => setFilter('all')}
                    >
                        <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
                            All
                        </Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                        style={[styles.filterButton, filter === 'unread' && styles.filterButtonActive]}
                        onPress={() => setFilter('unread')}
                    >
                        <View style={styles.filterBadge}>
                            <Text style={[styles.filterText, filter === 'unread' && styles.filterTextActive]}>
                                Unread
                            </Text>
                            {unreadCount > 0 && (
                                <View style={styles.filterCountBadge}>
                                    <Text style={styles.filterCountText}>{unreadCount}</Text>
                                </View>
                            )}
                        </View>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Notifications List */}
            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        colors={['#075538']}
                        tintColor="#075538"
                    />
                }
            >
                <View style={styles.notificationsList}>
                    {filteredNotifications.length > 0 ? (
                        filteredNotifications.map((notification, index) => (
                            <NotificationCard 
                                key={notification._id} 
                                notification={notification} 
                                index={index}
                            />
                        ))
                    ) : (
                        <Animated.View 
                            style={[
                                styles.emptyState,
                                { opacity: fadeAnim }
                            ]}
                        >
                            <View style={styles.emptyIcon}>
                                <Ionicons name="notifications-off" size={64} color="#cbd5e1" />
                            </View>
                            <Text style={styles.emptyTitle}>
                                {filter === 'unread' ? 'No unread notifications' : 'No notifications'}
                            </Text>
                            <Text style={styles.emptyDescription}>
                                {filter === 'unread' 
                                    ? 'You\'re all caught up with unread notifications' 
                                    : 'New updates will appear here'}
                            </Text>
                        </Animated.View>
                    )}
                </View>
            </ScrollView>

            {/* Notification Detail Dialog */}
            <Modal
                visible={isDialogVisible}
                transparent
                animationType="none"
                onRequestClose={() => setIsDialogVisible(false)}
            >
                <TouchableOpacity 
                    style={styles.dialogOverlay}
                    activeOpacity={1}
                    onPress={() => setIsDialogVisible(false)}
                >
                    <Animated.View 
                        style={[
                            styles.dialogContent,
                            {
                                opacity: dialogOpacityAnim,
                                transform: [{ scale: dialogScaleAnim }]
                            }
                        ]}
                    >
                        {selectedNotification && (
                            <>
                                <View style={styles.dialogHeader}>
                                    <View style={[
                                        styles.dialogIcon,
                                        { backgroundColor: `${getCategoryIcon(selectedNotification.category).color}15` }
                                    ]}>
                                        <Ionicons 
                                            name={getCategoryIcon(selectedNotification.category).icon as any} 
                                            size={28} 
                                            color={getCategoryIcon(selectedNotification.category).color} 
                                        />
                                    </View>
                                    <Text style={styles.dialogTitle}>{selectedNotification.title}</Text>
                                    <Text style={styles.dialogTime}>
                                        {formatTimeAgo(selectedNotification.createdAt)}
                                    </Text>
                                </View>

                                <ScrollView 
                                    style={styles.dialogBody}
                                    showsVerticalScrollIndicator={false}
                                >
                                    <Text style={styles.dialogMessage}>{selectedNotification.message}</Text>
                                    
                                    <View style={styles.dialogMeta}>
                                        <View style={styles.metaItem}>
                                            <Ionicons name="time" size={16} color="#64748b" />
                                            <Text style={styles.metaText}>
                                                {new Date(selectedNotification.createdAt).toLocaleString()}
                                            </Text>
                                        </View>
                                        <View style={styles.metaItem}>
                                            <Ionicons name="folder" size={16} color="#64748b" />
                                            <Text style={styles.metaText}>
                                                {selectedNotification.category.charAt(0).toUpperCase() + selectedNotification.category.slice(1)}
                                            </Text>
                                        </View>
                                        <View style={styles.metaItem}>
                                            <Ionicons name={selectedNotification.read ? 'checkmark-circle' : 'ellipse'} 
                                                size={16} 
                                                color={selectedNotification.read ? '#10b981' : '#64748b'} 
                                            />
                                            <Text style={styles.metaText}>
                                                {selectedNotification.read ? 'Read' : 'Unread'}
                                            </Text>
                                        </View>
                                    </View>
                                </ScrollView>

                                <View style={styles.dialogActions}>
                                    <TouchableOpacity 
                                        style={styles.deleteButton}
                                        onPress={() => handleDeleteNotification(selectedNotification._id)}
                                    >
                                        <Ionicons name="trash" size={20} color="#dc2626" />
                                        <Text style={styles.deleteButtonText}>Delete</Text>
                                    </TouchableOpacity>

                                    <View style={styles.primaryActions}>
                                        <TouchableOpacity 
                                            style={styles.closeButton}
                                            onPress={() => setIsDialogVisible(false)}
                                        >
                                            <Text style={styles.closeButtonText}>Close</Text>
                                        </TouchableOpacity>

                                        {selectedNotification.actionTitle && (
                                            <TouchableOpacity 
                                                style={styles.actionDialogButton}
                                                onPress={handleDialogAction}
                                            >
                                                <Text style={styles.actionDialogButtonText}>
                                                    {selectedNotification.actionTitle}
                                                </Text>
                                                <Ionicons name="arrow-forward" size={18} color="#fff" />
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                </View>
                            </>
                        )}
                    </Animated.View>
                </TouchableOpacity>
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
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 8,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 20,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#1e293b',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 14,
        color: '#64748b',
    },
    markAllButton: {
        padding: 8,
        backgroundColor: '#eff6ff',
        borderRadius: 8,
    },
    markAllText: {
        fontSize: 14,
        color: '#075538',
        fontWeight: '500',
    },
    filterContainer: {
        flexDirection: 'row',
        backgroundColor: '#f1f5f9',
        borderRadius: 12,
        padding: 4,
    },
    filterButton: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        alignItems: 'center',
    },
    filterButtonActive: {
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    filterText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#64748b',
    },
    filterTextActive: {
        color: '#075538',
    },
    filterBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    filterCountBadge: {
        backgroundColor: '#075538',
        borderRadius: 10,
        minWidth: 18,
        height: 18,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 4,
    },
    filterCountText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
    },
    scrollView: {
        flex: 1,
    },
    notificationsList: {
        padding: 20,
        paddingBottom: 100,
    },
    notificationCard: {
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
    notificationCardInner: {
        backgroundColor: '#fff',
        borderRadius: 16,
        overflow: 'hidden',
    },
    notificationHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        padding: 16,
    },
    categoryIcon: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
        borderWidth: 2,
        borderColor: '#e2e8f0',
    },
    notificationContent: {
        flex: 1,
        marginRight: 8,
    },
    notificationTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1e293b',
        marginBottom: 4,
    },
    notificationMessage: {
        fontSize: 14,
        color: '#64748b',
        lineHeight: 20,
        marginBottom: 8,
    },
    notificationTime: {
        fontSize: 12,
        color: '#94a3b8',
    },
    unreadIndicator: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#075538',
        marginTop: 4,
    },
    actionContainer: {
        borderTopWidth: 1,
        borderTopColor: '#e2e8f0',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    actionDivider: {
        height: 1,
        backgroundColor: '#e2e8f0',
        marginBottom: 12,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 12,
        backgroundColor: '#eff6ff',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#dbeafe',
    },
    actionButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#075538',
    },
    emptyState: {
        alignItems: 'center',
        padding: 40,
        marginTop: 60,
    },
    emptyIcon: {
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
        color: '#475569',
        marginBottom: 12,
        textAlign: 'center',
    },
    emptyDescription: {
        fontSize: 14,
        color: '#64748b',
        textAlign: 'center',
        lineHeight: 20,
    },
    // Dialog Styles
    dialogOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    dialogContent: {
        backgroundColor: '#fff',
        borderRadius: 24,
        width: '100%',
        maxWidth: 500,
        maxHeight: '80%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
        overflow: 'hidden',
    },
    dialogHeader: {
        alignItems: 'center',
        padding: 24,
        paddingBottom: 16,
        backgroundColor: '#f8fafc',
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
    },
    dialogIcon: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        borderWidth: 2,
        borderColor: '#e2e8f0',
    },
    dialogTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1e293b',
        textAlign: 'center',
        marginBottom: 8,
    },
    dialogTime: {
        fontSize: 14,
        color: '#64748b',
        textAlign: 'center',
    },
    dialogBody: {
        maxHeight: 300,
        padding: 24,
    },
    dialogMessage: {
        fontSize: 16,
        color: '#374151',
        lineHeight: 24,
        marginBottom: 24,
    },
    dialogMeta: {
        backgroundColor: '#f8fafc',
        borderRadius: 12,
        padding: 16,
        gap: 12,
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    metaText: {
        fontSize: 14,
        color: '#64748b',
    },
    dialogActions: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#e2e8f0',
    },
    deleteButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        backgroundColor: '#fef2f2',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#fecaca',
        gap: 8,
    },
    deleteButtonText: {
        color: '#dc2626',
        fontSize: 14,
        fontWeight: '500',
    },
    primaryActions: {
        flexDirection: 'row',
        gap: 12,
    },
    closeButton: {
        paddingVertical: 12,
        paddingHorizontal: 24,
        backgroundColor: '#f1f5f9',
        borderRadius: 12,
    },
    closeButtonText: {
        color: '#64748b',
        fontSize: 14,
        fontWeight: '500',
    },
    actionDialogButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 24,
        backgroundColor: '#075538',
        borderRadius: 12,
        gap: 8,
        shadowColor: '#075538',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    actionDialogButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
});