// app/feedback.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Alert,
    Animated,
    Dimensions,
    ActivityIndicator,
    Image,
    Modal,
    FlatList
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useToast } from 'react-native-toast-notifications';
import { useUser } from '@clerk/clerk-expo';
import * as ImagePicker from 'expo-image-picker';

const { width } = Dimensions.get('window');

// Mock API client - replace with your actual implementation
const apiClient = {
    get: async (url: string) => {
        // Your API client implementation
        const response = await fetch(url);
        return response.json();
    },
    post: async (url: string, data: any) => {
        // Your API client implementation
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        return response.json();
    },
    put: async (url: string, data: any) => {
        // Your API client implementation
        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        return response.json();
    }
};

export default function FeedbackScreen() {
    const router = useRouter();
    const { user } = useUser();
    const toast = useToast();

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [addingFeedback, setAddingFeedback] = useState(false);
    const [activeTab, setActiveTab] = useState<'my-feedback' | 'new'>('my-feedback');
    const [feedbacks, setFeedbacks] = useState<any[]>([]);
    const [selectedFeedback, setSelectedFeedback] = useState<any>(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [replyText, setReplyText] = useState('');
    const [sendingReply, setSendingReply] = useState(false);
    const [newFeedback, setNewFeedback] = useState({
        title: '',
        subject: '',
        feedback: [''],
        images: [] as string[],
    });

    // Animation values
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;
    const modalScale = useRef(new Animated.Value(0.8)).current;
    const modalOpacity = useRef(new Animated.Value(0)).current;
    const feedbackScale = useRef(new Animated.Value(0.9)).current;

    useEffect(() => {
        if (activeTab === 'my-feedback') {
            fetchFeedbacks();
        }
    }, [activeTab]);

    useEffect(() => {
        if (!loading) {
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
        }
    }, [loading]);

    const fetchFeedbacks = async () => {
        if (!user) return;

        try {
            setLoading(true);
            // Mock data - replace with your actual API call
            const mockFeedbacks = [
                {
                    _id: '1',
                    userId: user.id,
                    title: 'App Performance Issue',
                    feedback: ['The app sometimes crashes when I try to request emergency assistance.'],
                    subject: 'Bug Report',
                    status: 'pending',
                    images: [],
                    reply: [],
                    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
                    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
                },
                {
                    _id: '2',
                    userId: user.id,
                    title: 'Great Service Experience',
                    feedback: ['The mechanic arrived quickly and was very professional.'],
                    subject: 'General Feedback',
                    status: 'approved',
                    images: [],
                    reply: ['Thank you for your feedback! We\'re glad you had a good experience.'],
                    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
                    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
                },
                {
                    _id: '3',
                    userId: user.id,
                    title: 'Feature Request',
                    feedback: ['Can we have a chat history feature?', 'Also, adding estimated time for each service would be helpful.'],
                    subject: 'Feature Request',
                    status: 'pending',
                    images: [],
                    reply: ['We\'ve noted your feature requests and will consider them for future updates.'],
                    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
                    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
                },
            ];

            // Replace with: const response = await apiClient.get(`/api/feedback/user/${user.id}`);
            setFeedbacks(mockFeedbacks);

        } catch (error) {
            console.error('Error fetching feedbacks:', error);
            toast.show('Failed to load feedbacks', { type: 'danger' });
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitNewFeedback = async () => {
        if (!user) {
            toast.show('Please sign in to submit feedback', { type: 'danger' });
            return;
        }

        if (!newFeedback.title.trim() || !newFeedback.subject.trim() || !newFeedback.feedback[0]?.trim()) {
            toast.show('Please fill in all required fields', { type: 'danger' });
            return;
        }

        setSubmitting(true);

        try {
            const feedbackPayload = {
                userId: user.id,
                title: newFeedback.title.trim(),
                feedback: newFeedback.feedback.filter(f => f.trim()).map(f => f.trim()),
                subject: newFeedback.subject.trim(),
                images: newFeedback.images,
            };

            // Replace with your actual API call
            // const response = await apiClient.post('/api/feedback', feedbackPayload);

            // Mock response
            const mockResponse = {
                ...feedbackPayload,
                _id: Date.now().toString(),
                status: 'pending',
                reply: [],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };

            toast.show('Feedback submitted successfully!', { type: 'success' });

            // Reset form
            setNewFeedback({
                title: '',
                subject: '',
                feedback: [''],
                images: [],
            });

            // Switch to my feedback tab
            setActiveTab('my-feedback');
            setFeedbacks(prev => [mockResponse, ...prev]);

        } catch (error) {
            console.error('Error submitting feedback:', error);
            toast.show('Failed to submit feedback. Please try again.', { type: 'danger' });
        } finally {
            setSubmitting(false);
        }
    };

    const handleAddFeedbackPoint = () => {
        setNewFeedback(prev => ({
            ...prev,
            feedback: [...prev.feedback, ''],
        }));
    };

    const handleFeedbackPointChange = (text: string, index: number) => {
        setNewFeedback(prev => {
            const newFeedbackPoints = [...prev.feedback];
            newFeedbackPoints[index] = text;
            return { ...prev, feedback: newFeedbackPoints };
        });
    };

    const handleRemoveFeedbackPoint = (index: number) => {
        if (newFeedback.feedback.length > 1) {
            setNewFeedback(prev => {
                const newFeedbackPoints = [...prev.feedback];
                newFeedbackPoints.splice(index, 1);
                return { ...prev, feedback: newFeedbackPoints };
            });
        }
    };

    const pickImage = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.8,
            });

            if (!result.canceled && result.assets[0].uri) {
                // Here you would typically upload the image to your server
                // For now, we'll just add the local URI
                setNewFeedback(prev => ({
                    ...prev,
                    images: [...prev.images, result.assets[0].uri],
                }));
            }
        } catch (error) {
            console.error('Error picking image:', error);
            toast.show('Failed to pick image', { type: 'danger' });
        }
    };

    const removeImage = (index: number) => {
        setNewFeedback(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index),
        }));
    };

    const openFeedbackDetail = (feedback: any) => {
        setSelectedFeedback(feedback);
        setReplyText('');
        setShowDetailModal(true);

        // Animate modal in
        modalScale.setValue(0.8);
        modalOpacity.setValue(0);
        Animated.parallel([
            Animated.spring(modalScale, {
                toValue: 1,
                tension: 50,
                friction: 7,
                useNativeDriver: true,
            }),
            Animated.timing(modalOpacity, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }),
        ]).start();
    };

    const closeFeedbackDetail = () => {
        Animated.parallel([
            Animated.timing(modalScale, {
                toValue: 0.8,
                duration: 200,
                useNativeDriver: true,
            }),
            Animated.timing(modalOpacity, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }),
        ]).start(() => {
            setShowDetailModal(false);
            setSelectedFeedback(null);
        });
    };

    const handleAddReply = async () => {
        if (!replyText.trim() || !selectedFeedback) return;

        setSendingReply(true);

        try {
            // Replace with your actual API call
            // const response = await apiClient.put(`/api/feedback/add-feedback/${selectedFeedback._id}`, {
            //     feedback: replyText.trim()
            // });

            // Mock response
            const updatedFeedback = {
                ...selectedFeedback,
                feedback: [...selectedFeedback.feedback, replyText.trim()],
                updatedAt: new Date().toISOString(),
            };

            setSelectedFeedback(updatedFeedback);
            setFeedbacks(prev =>
                prev.map(f => f._id === selectedFeedback._id ? updatedFeedback : f)
            );

            setReplyText('');
            toast.show('Additional feedback added!', { type: 'success' });

        } catch (error) {
            console.error('Error adding reply:', error);
            toast.show('Failed to add feedback', { type: 'danger' });
        } finally {
            setSendingReply(false);
        }
    };

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            'approved': '#10b981',
            'pending': '#f59e0b',
            'rejected': '#dc2626',
        };
        return colors[status] || '#64748b';
    };

    const getSubjectColor = (subject: string) => {
        const colors: Record<string, string> = {
            'Bug Report': '#dc2626',
            'Feature Request': '#3b82f6',
            'General Feedback': '#8b5cf6',
            'Service Feedback': '#075538',
            'Other': '#64748b',
        };
        return colors[subject] || '#64748b';
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

        if (diffInHours < 1) return 'Just now';
        if (diffInHours < 24) return `${Math.floor(diffInHours)}h ago`;
        if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const FeedbackCard = ({ feedback }: { feedback: any }) => (
        <TouchableOpacity
            style={styles.feedbackCard}
            onPress={() => openFeedbackDetail(feedback)}
        >
            <Animated.View style={{ transform: [{ scale: feedbackScale }] }}>
                <View style={styles.cardHeader}>
                    <View style={styles.titleContainer}>
                        <Text style={styles.feedbackTitle} numberOfLines={1}>
                            {feedback.title}
                        </Text>
                        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(feedback.status) }]}>
                            <Text style={styles.statusText}>{feedback.status.toUpperCase()}</Text>
                        </View>
                    </View>
                    <Text style={styles.feedbackDate}>{formatDate(feedback.createdAt)}</Text>
                </View>

                <View style={styles.subjectContainer}>
                    <View style={[styles.subjectBadge, { backgroundColor: `${getSubjectColor(feedback.subject)}20` }]}>
                        <Text style={[styles.subjectText, { color: getSubjectColor(feedback.subject) }]}>
                            {feedback.subject}
                        </Text>
                    </View>
                    <View style={styles.statsContainer}>
                        <View style={styles.stat}>
                            <Ionicons name="chatbubble" size={14} color="#64748b" />
                            <Text style={styles.statText}>{feedback.feedback.length}</Text>
                        </View>
                        <View style={styles.stat}>
                            <Ionicons name="chatbubble-ellipses" size={14} color="#64748b" />
                            <Text style={styles.statText}>{feedback.reply?.length || 0}</Text>
                        </View>
                    </View>
                </View>

                <Text style={styles.feedbackPreview} numberOfLines={2}>
                    {feedback.feedback[0]}
                </Text>

                {feedback.reply && feedback.reply.length > 0 && (
                    <View style={styles.hasReplyBadge}>
                        <Ionicons name="checkmark-circle" size={12} color="#10b981" />
                        <Text style={styles.hasReplyText}>Admin replied</Text>
                    </View>
                )}
            </Animated.View>
        </TouchableOpacity>
    );

    const NewFeedbackForm = () => (
        <Animated.View
            style={[
                styles.formContainer,
                { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
            ]}
        >
            <Text style={styles.formTitle}>Share Your Feedback</Text>
            <Text style={styles.formDescription}>
                Your feedback helps us improve Driver Assist
            </Text>

            {/* Title */}
            <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Title *</Text>
                <TextInput
                    style={styles.textInput}
                    placeholder="Brief summary of your feedback"
                    placeholderTextColor="#94a3b8"
                    value={newFeedback.title}
                    onChangeText={(text) => setNewFeedback(prev => ({ ...prev, title: text }))}
                    maxLength={100}
                />
                <Text style={styles.charCount}>{newFeedback.title.length}/100</Text>
            </View>

            {/* Subject */}
            <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Subject *</Text>
                <View style={styles.subjectButtons}>
                    {['Bug Report', 'Feature Request', 'General Feedback', 'Service Feedback', 'Other'].map((subject) => (
                        <TouchableOpacity
                            key={subject}
                            style={[
                                styles.subjectButton,
                                newFeedback.subject === subject && styles.subjectButtonActive,
                                { borderColor: getSubjectColor(subject) }
                            ]}
                            onPress={() => setNewFeedback(prev => ({ ...prev, subject }))}
                        >
                            <Text style={[
                                styles.subjectButtonText,
                                newFeedback.subject === subject && { color: getSubjectColor(subject) }
                            ]}>
                                {subject}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* Feedback Points */}
            <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Your Feedback *</Text>
                {newFeedback.feedback.map((point, index) => (
                    <View key={index} style={styles.feedbackPointContainer}>
                        <TextInput
                            style={[styles.textInput, styles.feedbackPointInput]}
                            placeholder={`Point ${index + 1}`}
                            placeholderTextColor="#94a3b8"
                            value={point}
                            onChangeText={(text) => handleFeedbackPointChange(text, index)}
                            multiline
                        />
                        {newFeedback.feedback.length > 1 && (
                            <TouchableOpacity
                                style={styles.removePointButton}
                                onPress={() => handleRemoveFeedbackPoint(index)}
                            >
                                <Ionicons name="close-circle" size={20} color="#dc2626" />
                            </TouchableOpacity>
                        )}
                    </View>
                ))}
                <TouchableOpacity
                    style={styles.addPointButton}
                    onPress={handleAddFeedbackPoint}
                >
                    <Ionicons name="add-circle" size={20} color="#075538" />
                    <Text style={styles.addPointText}>Add another point</Text>
                </TouchableOpacity>
            </View>

            {/* Images */}
            <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Attach Images (Optional)</Text>
                <View style={styles.imageContainer}>
                    {newFeedback.images.map((uri, index) => (
                        <View key={index} style={styles.imagePreview}>
                            <Image source={{ uri }} style={styles.image} />
                            <TouchableOpacity
                                style={styles.removeImageButton}
                                onPress={() => removeImage(index)}
                            >
                                <Ionicons name="close-circle" size={20} color="#fff" />
                            </TouchableOpacity>
                        </View>
                    ))}
                    {newFeedback.images.length < 3 && (
                        <TouchableOpacity
                            style={styles.addImageButton}
                            onPress={pickImage}
                        >
                            <Ionicons name="camera" size={24} color="#64748b" />
                            <Text style={styles.addImageText}>Add Image</Text>
                        </TouchableOpacity>
                    )}
                </View>
                <Text style={styles.imageNote}>You can add up to 3 images</Text>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
                style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
                onPress={handleSubmitNewFeedback}
                disabled={submitting}
            >
                {submitting ? (
                    <ActivityIndicator size="small" color="#fff" />
                ) : (
                    <>
                        <Ionicons name="send" size={20} color="#fff" />
                        <Text style={styles.submitButtonText}>Submit Feedback</Text>
                    </>
                )}
            </TouchableOpacity>
        </Animated.View>
    );

    if (loading && activeTab === 'my-feedback') {
        return (
            <View style={styles.loadingContainer}>
                <Ionicons name="chatbubble-ellipses" size={60} color="#075538" />
                <Text style={styles.loadingText}>Loading your feedback...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.back()}
                >
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Feedback</Text>
                <View style={styles.headerSpacer} />
            </View>

            {/* Tabs */}
            <View style={styles.tabContainer}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'my-feedback' && styles.tabActive]}
                    onPress={() => setActiveTab('my-feedback')}
                >
                    <Ionicons
                        name="list"
                        size={20}
                        color={activeTab === 'my-feedback' ? '#075538' : '#64748b'}
                    />
                    <Text style={[styles.tabText, activeTab === 'my-feedback' && styles.tabTextActive]}>
                        My Feedback ({feedbacks.length})
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.tab, activeTab === 'new' && styles.tabActive]}
                    onPress={() => setActiveTab('new')}
                >
                    <Ionicons
                        name="add-circle"
                        size={20}
                        color={activeTab === 'new' ? '#075538' : '#64748b'}
                    />
                    <Text style={[styles.tabText, activeTab === 'new' && styles.tabTextActive]}>
                        New Feedback
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Content */}
            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {activeTab === 'my-feedback' ? (
                    feedbacks.length > 0 ? (
                        <Animated.View
                            style={[
                                styles.feedbacksList,
                                { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
                            ]}
                        >
                            {feedbacks.map((feedback) => (
                                <FeedbackCard key={feedback._id} feedback={feedback} />
                            ))}
                        </Animated.View>
                    ) : (
                        <View style={styles.emptyState}>
                            <Ionicons name="chatbubble-outline" size={80} color="#cbd5e1" />
                            <Text style={styles.emptyTitle}>No feedback yet</Text>
                            <Text style={styles.emptyDescription}>
                                Share your thoughts to help us improve Driver Assist
                            </Text>
                            <TouchableOpacity
                                style={styles.emptyButton}
                                onPress={() => setActiveTab('new')}
                            >
                                <Text style={styles.emptyButtonText}>Create First Feedback</Text>
                            </TouchableOpacity>
                        </View>
                    )
                ) : (
                    <NewFeedbackForm />
                )}
            </ScrollView>

            {/* Feedback Detail Modal */}
            <Modal
                visible={showDetailModal}
                transparent
                animationType="none"
                onRequestClose={closeFeedbackDetail}
            >
                <View style={styles.modalOverlay}>
                    <Animated.View
                        style={[
                            styles.modalContent,
                            {
                                opacity: modalOpacity,
                                transform: [{ scale: modalScale }]
                            }
                        ]}
                    >
                        {selectedFeedback && (
                            <>
                                <View style={styles.modalHeader}>
                                    <View style={styles.modalTitleContainer}>
                                        <Text style={styles.modalTitle} numberOfLines={2}>
                                            {selectedFeedback.title}
                                        </Text>
                                        <View style={[
                                            styles.modalStatusBadge,
                                            { backgroundColor: getStatusColor(selectedFeedback.status) }
                                        ]}>
                                            <Text style={styles.modalStatusText}>
                                                {selectedFeedback.status.toUpperCase()}
                                            </Text>
                                        </View>
                                    </View>
                                    <TouchableOpacity
                                        style={styles.modalCloseButton}
                                        onPress={closeFeedbackDetail}
                                    >
                                        <Ionicons name="close" size={24} color="#64748b" />
                                    </TouchableOpacity>
                                </View>

                                <ScrollView
                                    style={styles.modalBody}
                                    showsVerticalScrollIndicator={false}
                                >
                                    {/* Subject */}
                                    <View style={styles.modalSubject}>
                                        <Ionicons name="pricetag" size={16} color="#64748b" />
                                        <Text style={styles.modalSubjectText}>{selectedFeedback.subject}</Text>
                                    </View>

                                    {/* Original Feedback */}
                                    <View style={styles.messageSection}>
                                        <Text style={styles.sectionTitle}>Your Feedback</Text>
                                        {selectedFeedback.feedback.map((point: string, index: number) => (
                                            <View key={index} style={styles.feedbackPoint}>
                                                <View style={styles.pointBullet} />
                                                <Text style={styles.feedbackPointText}>{point}</Text>
                                            </View>
                                        ))}
                                    </View>

                                    {/* Images */}
                                    {selectedFeedback.images && selectedFeedback.images.length > 0 && (
                                        <View style={styles.messageSection}>
                                            <Text style={styles.sectionTitle}>Attached Images</Text>
                                            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                                {selectedFeedback.images.map((uri: string, index: number) => (
                                                    <Image
                                                        key={index}
                                                        source={{ uri }}
                                                        style={styles.detailImage}
                                                    />
                                                ))}
                                            </ScrollView>
                                        </View>
                                    )}

                                    {/* Admin Replies */}
                                    {selectedFeedback.reply && selectedFeedback.reply.length > 0 && (
                                        <View style={styles.messageSection}>
                                            <Text style={styles.sectionTitle}>Admin Response</Text>
                                            {selectedFeedback.reply.map((reply: string, index: number) => (
                                                <View key={index} style={styles.adminMessage}>
                                                    <View style={styles.adminAvatar}>
                                                        <Ionicons name="shield-checkmark" size={16} color="#fff" />
                                                    </View>
                                                    <View style={styles.adminMessageContent}>
                                                        <Text style={styles.adminMessageText}>{reply}</Text>
                                                    </View>
                                                </View>
                                            ))}
                                        </View>
                                    )}
                                </ScrollView>

                                {/* Add More Feedback */}
                                <View style={styles.modalFooter}>
                                    <TextInput
                                        style={styles.replyInput}
                                        placeholder="Add more to this feedback..."
                                        placeholderTextColor="#94a3b8"
                                        value={replyText}
                                        onChangeText={setReplyText}
                                        multiline
                                    />
                                    <TouchableOpacity
                                        style={[styles.sendButton, (!replyText.trim() || sendingReply) && styles.sendButtonDisabled]}
                                        onPress={handleAddReply}
                                        disabled={!replyText.trim() || sendingReply}
                                    >
                                        {sendingReply ? (
                                            <ActivityIndicator size="small" color="#fff" />
                                        ) : (
                                            <Ionicons name="send" size={18} color="#fff" />
                                        )}
                                    </TouchableOpacity>
                                </View>
                            </>
                        )}
                    </Animated.View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#075538',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#075538',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: '#fff',
        opacity: 0.8,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 20,
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
    },
    headerSpacer: {
        width: 40,
    },
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        marginHorizontal: 20,
        borderRadius: 12,
        padding: 4,
        marginBottom: 20,
    },
    tab: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        gap: 8,
    },
    tabActive: {
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    tabText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#64748b',
    },
    tabTextActive: {
        color: '#075538',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 40,
    },
    feedbacksList: {
        paddingHorizontal: 20,
    },
    feedbackCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    titleContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    feedbackTitle: {
        flex: 1,
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1e293b',
    },
    statusBadge: {
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    statusText: {
        fontSize: 10,
        color: '#fff',
        fontWeight: 'bold',
    },
    feedbackDate: {
        fontSize: 12,
        color: '#94a3b8',
    },
    subjectContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    subjectBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    subjectText: {
        fontSize: 12,
        fontWeight: '500',
    },
    statsContainer: {
        flexDirection: 'row',
        gap: 12,
    },
    stat: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    statText: {
        fontSize: 12,
        color: '#64748b',
    },
    feedbackPreview: {
        fontSize: 14,
        color: '#64748b',
        lineHeight: 20,
        marginBottom: 8,
    },
    hasReplyBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        backgroundColor: '#10b98120',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        gap: 4,
    },
    hasReplyText: {
        fontSize: 10,
        color: '#10b981',
        fontWeight: '500',
    },
    emptyState: {
        alignItems: 'center',
        padding: 40,
        marginTop: 60,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#475569',
        marginTop: 24,
        marginBottom: 12,
    },
    emptyDescription: {
        fontSize: 14,
        color: '#64748b',
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 20,
    },
    emptyButton: {
        backgroundColor: '#075538',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 12,
    },
    emptyButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    formContainer: {
        padding: 20,
    },
    formTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 8,
        textAlign: 'center',
    },
    formDescription: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.8)',
        textAlign: 'center',
        marginBottom: 32,
    },
    inputGroup: {
        marginBottom: 24,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#fff',
        marginBottom: 8,
    },
    textInput: {
        backgroundColor: '#fff',
        borderWidth: 2,
        borderColor: '#e2e8f0',
        borderRadius: 12,
        padding: 14,
        fontSize: 16,
        color: '#1e293b',
    },
    charCount: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.6)',
        textAlign: 'right',
        marginTop: 4,
    },
    subjectButtons: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    subjectButton: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 2,
        backgroundColor: '#fff',
    },
    subjectButtonActive: {
        backgroundColor: '#fff',
    },
    subjectButtonText: {
        fontSize: 12,
        fontWeight: '500',
        color: '#64748b',
    },
    feedbackPointContainer: {
        position: 'relative',
        marginBottom: 8,
    },
    feedbackPointInput: {
        paddingRight: 40,
    },
    removePointButton: {
        position: 'absolute',
        right: 8,
        top: 14,
    },
    addPointButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        padding: 12,
        backgroundColor: '#fff',
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#dbeafe',
        borderStyle: 'dashed',
    },
    addPointText: {
        fontSize: 14,
        color: '#075538',
        fontWeight: '500',
    },
    imageContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    imagePreview: {
        position: 'relative',
    },
    image: {
        width: 80,
        height: 80,
        borderRadius: 8,
    },
    removeImageButton: {
        position: 'absolute',
        top: -8,
        right: -8,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        borderRadius: 12,
    },
    addImageButton: {
        width: 80,
        height: 80,
        borderRadius: 8,
        backgroundColor: '#f8fafc',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#e2e8f0',
        borderStyle: 'dashed',
    },
    addImageText: {
        fontSize: 10,
        color: '#64748b',
        marginTop: 4,
    },
    imageNote: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.6)',
        marginTop: 8,
    },
    submitButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
        padding: 18,
        borderRadius: 16,
        marginTop: 8,
        gap: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    submitButtonDisabled: {
        opacity: 0.7,
    },
    submitButtonText: {
        color: '#075538',
        fontSize: 16,
        fontWeight: '600',
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        maxHeight: '85%',
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        padding: 20,
        paddingBottom: 16,
        borderBottomWidth: 1
    },
    modalTitleContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1e293b',
        flexShrink: 1,
    },
    modalStatusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
    },
    modalStatusText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#fff',
    },
    modalCloseButton: {
        padding: 8,
    },
    modalBody: {
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    modalSubject: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 16,
    },
    modalSubjectText: {
        fontSize: 14,
        color: '#475569',
        fontWeight: '500',
    },
    messageSection: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#075538',
        marginBottom: 8,
    },
    feedbackPoint: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    pointBullet: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#075538',
        marginTop: 8,
        marginRight: 8,
    },
    feedbackPointText: {
        fontSize: 14,
        color: '#475569',
        flex: 1,
        lineHeight: 20,
    },
    detailImage: {
        width: 100,
        height: 100,
        borderRadius: 12,
        marginRight: 12,
    },
    adminMessage: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    adminAvatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#10b981',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    adminMessageContent: {
        flex: 1,
        backgroundColor: '#f1f5f9',
        borderRadius: 12,
        padding: 12,
    },
    adminMessageText: {
        fontSize: 14,
        color: '#1e293b',
        lineHeight: 20,
    },
    modalFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderTopWidth: 1,
        borderColor: '#e2e8f0',
        gap: 12,
    },
    replyInput: {
        flex: 1,
        backgroundColor: '#f1f5f9',
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 10,
        fontSize: 14,
        color: '#1e293b',
        maxHeight: 100,
    },
    sendButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#075538',
        justifyContent: 'center',
        alignItems: 'center',
    },
    sendButtonDisabled: {
        backgroundColor: '#94a3b8',
    },
})