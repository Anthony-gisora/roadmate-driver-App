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
    ActivityIndicator
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useToast } from 'react-native-toast-notifications';
import {apiClient} from "@/hooks/api-client";
import {useAuth} from "@/providers/auth-provider";

const { width } = Dimensions.get('window');

export default function ReviewScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const { user } = useAuth();
    const requestId = id;
    const toast = useToast();
    console.log(id);

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [requestData, setRequestData] = useState<any>(null);
    const [mechanicData, setMechanicData] = useState<any>(null);
    const [existingReview, setExistingReview] = useState<any>(null);
    const [rating, setRating] = useState(5);
    const titleRef = useRef('');
    const commentRef = useRef('');

    // Animation values
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;
    const starScaleAnim = useRef(new Animated.Value(1)).current;
    const reviewSlideAnim = useRef(new Animated.Value(100)).current;

    useEffect(() => {
        fetchData();
    }, [id]);

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

    const fetchData = async () => {
        try {
            setLoading(true);

            // Fetch request data
            apiClient.get(`/req/history/${id}`).then((requestResponse)=>{
                console.log(requestResponse.data);
                setRequestData(requestResponse?.data?.data[0]);

                if(requestResponse?.data?.data[0]?.mechanic){
                    setMechanicData(requestResponse?.data?.data[0]?.mechanic);
                }

            }).catch((err)=>{
                console.log(err.data);
                alert(err);
            });

            // Check for existing review
            apiClient.get(`/reviews/${id}`).then((data)=>{
                const reviewResponse  = data?.data
                if (reviewResponse && Array.isArray(reviewResponse) && reviewResponse.length > 0) {
                    setExistingReview(reviewResponse[0]);
                }
            })

        } catch (error) {
            console.error('Error fetching data:', error);
            toast.show('Failed to load service details', { type: 'danger' });
        } finally {
            setLoading(false);
        }
    };

    const handleStarPress = (selectedRating: number) => {
        setRating(selectedRating);

        // Pulse animation for star press
        Animated.sequence([
            Animated.timing(starScaleAnim, {
                toValue: 1.3,
                duration: 100,
                useNativeDriver: true,
            }),
            Animated.timing(starScaleAnim, {
                toValue: 1,
                duration: 100,
                useNativeDriver: true,
            }),
        ]).start();
    };

    const handleSubmitReview = async () => {
        if (!titleRef.current.trim()) {
            toast.show('Please add a review title', { type: 'danger' });
            return;
        }

        if (!commentRef.current.trim()) {
            toast.show('Please add a comment comment', { type: 'danger' });
            return;
        }

        if (rating === 0) {
            toast.show('Please select a rating', { type: 'danger' });
            return;
        }

        setSubmitting(true);

        try {
            const reviewPayload = {
                requestId,
                rating,
                userId: user?._id,
                title: titleRef.current.trim(),
                description: commentRef.current.trim() || '',
            };

            const response = await apiClient.post(`/reviews`, reviewPayload);

            toast.show('Review submitted successfully!', { type: 'success' });

            // Animate in the new review
            Animated.timing(reviewSlideAnim, {
                toValue: 0,
                duration: 500,
                useNativeDriver: true,
            }).start();

            setExistingReview(response?.data);
        } catch (error) {
            console.error('Error submitting review:', error);
            toast.show('Failed to submit review. Please try again.', { type: 'danger' });
        } finally {
            setSubmitting(false);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getRequestTypeDisplay = (type: string) => {
        const types: Record<string, string> = {
            'flat-tire': 'Flat Tire Repair',
            'fuel': 'Fuel Delivery',
            'battery': 'Jump Start',
            'lockout': 'Lockout Service',
            'towing': 'Vehicle Towing',
            'engine': 'Engine Repair',
            'other': 'Other Service',
        };
        return types[type] || type;
    };

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            'completed': '#10b981',
            'pending': '#f59e0b',
            'cancelled': '#dc2626',
            'in-progress': '#3b82f6',
        };
        return colors[status] || '#64748b';
    };

    const getReviewStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            'approved': '#10b981',
            'pending': '#f59e0b',
            'rejected': '#dc2626',
        };
        return colors[status] || '#64748b';
    };

    const StarRating = () => (
        <View style={styles.starContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                    key={star}
                    style={styles.starButton}
                    onPress={() => handleStarPress(star)}
                    disabled={!!existingReview}
                >
                    <Animated.View style={{ transform: [{ scale: rating >= star ? starScaleAnim : 1 }] }}>
                        <Ionicons
                            name={rating >= star ? 'star' : 'star-outline'}
                            size={32}
                            color={rating >= star ? '#f59e0b' : '#cbd5e1'}
                        />
                    </Animated.View>
                </TouchableOpacity>
            ))}
            <Text style={styles.ratingText}>{rating}.0</Text>
        </View>
    );

    const RequestDetailsCard = () => (
        <View style={styles.detailsCard}>
            <View style={styles.detailsHeader}>
                <View style={styles.serviceIcon}>
                    <Ionicons name="car-sport" size={24} color="#075538" />
                </View>
                <View style={styles.detailsTitle}>
                    <Text style={styles.serviceType}>
                        {getRequestTypeDisplay(requestData?.requestType || '')}
                    </Text>
                    <Text style={styles.serviceStatus}>
                        Status: <Text style={{ color: getStatusColor(requestData?.status || 'pending') }}>
                        {requestData?.status?.toUpperCase()}
                    </Text>
                    </Text>
                </View>
            </View>

            <View style={styles.detailsGrid}>
                <View style={styles.detailItem}>
                    <Ionicons name="calendar" size={16} color="#64748b" />
                    <Text style={styles.detailLabel}>Service Date</Text>
                    <Text style={styles.detailValue}>
                        {formatDate(requestData?.createdAt || new Date().toISOString())}
                    </Text>
                </View>

                <View style={styles.detailItem}>
                    <Ionicons name="cash" size={16} color="#64748b" />
                    <Text style={styles.detailLabel}>Amount Paid</Text>
                    <Text style={styles.detailValue}>
                        {requestData?.price}
                    </Text>
                </View>

                <View style={styles.detailItem}>
                    <Ionicons name="time" size={16} color="#64748b" />
                    <Text style={styles.detailLabel}>ETA</Text>
                    <Text style={styles.detailValue}>{requestData?.eta || 'N/A'}</Text>
                </View>

                <View style={styles.detailItem}>
                    <Ionicons name="car" size={16} color="#64748b" />
                    <Text style={styles.detailLabel}>Vehicle</Text>
                    <Text style={styles.detailValue}>
                        {requestData?.vehicleYear} {requestData?.vehicleMake} {requestData?.vehicleModel}
                    </Text>
                </View>
            </View>
        </View>
    );

    const MechanicCard = () => (
        <View style={styles.mechanicCard}>
            <View style={styles.mechanicHeader}>
                <View style={styles.mechanicAvatar}>
                    <Ionicons name="person" size={24} color="#fff" />
                </View>
                <View style={styles.mechanicInfo}>
                    <Text style={styles.mechanicName}>{mechanicData?.name || 'Unknown Mechanic'}</Text>
                    <Text style={styles.mechanicPhone}>{mechanicData.data['expertise']}</Text>
                </View>
            </View>
            <Text style={styles.thankYouText}>
                Thank you for your service!
            </Text>
        </View>
    );

    const ReviewForm = () => (
        <Animated.View
            style={[
                styles.reviewForm,
                { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
            ]}
        >
            <Text style={styles.sectionTitle}>Rate Your Experience</Text>
            <Text style={styles.sectionDescription}>
                How would you rate the service provided?
            </Text>

            <StarRating />

            <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Review Title *</Text>
                <TextInput
                    style={styles.textInput}
                    placeholder="e.g., Excellent service, quick response"
                    placeholderTextColor="#94a3b8"
                    onChangeText={(text) => {
                        titleRef.current = text;
                    }}
                    maxLength={100}
                />
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Additional Comments (Optional)</Text>
                <TextInput
                    style={[styles.textInput, styles.textArea]}
                    placeholder="Tell us more about your experience..."
                    placeholderTextColor="#94a3b8"
                    multiline
                    onChangeText={(text) => {
                        commentRef.current = text; // store in ref, not state
                    }}
                    numberOfLines={4}
                    maxLength={500}
                />
            </View>

            <TouchableOpacity
                style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
                onPress={handleSubmitReview}
                disabled={submitting}
            >
                {submitting ? (
                    <>
                        <ActivityIndicator size="small" color="#fff" />
                        <Text style={styles.submitButtonText}>Submitting...</Text>
                    </>
                ) : (
                    <>
                        <Ionicons name="send" size={20} color="#fff" />
                        <Text style={styles.submitButtonText}>Submit Review</Text>
                    </>
                )}
            </TouchableOpacity>
        </Animated.View>
    );

    const ExistingReviewCard = () => (
        <Animated.View
            style={[
                styles.existingReviewCard,
                {
                    opacity: fadeAnim,
                    transform: [{ translateY: reviewSlideAnim }]
                }
            ]}
        >
            <View style={styles.reviewHeader}>
                <View style={styles.reviewTitleRow}>
                    <Text style={styles.existingReviewTitle}>Your Review</Text>
                    <View style={[
                        styles.reviewStatusBadge,
                        { backgroundColor: getReviewStatusColor(existingReview?.status || 'pending') }
                    ]}>
                        <Text style={styles.reviewStatusText}>
                            {existingReview?.status?.toUpperCase() ?? "PENDING"}
                        </Text>
                    </View>
                </View>
                <Text style={styles.reviewDate}>
                    Submitted on {formatDate(existingReview?.dateCreated || new Date().toISOString())}
                </Text>
            </View>

            <View style={styles.reviewRating}>
                {[1, 2, 3, 4, 5].map((star) => (
                    <Ionicons
                        key={star}
                        name={existingReview?.rating >= star ? 'star' : 'star-outline'}
                        size={20}
                        color="#f59e0b"
                    />
                ))}
                <Text style={styles.reviewRatingText}>{existingReview?.rating}.0</Text>
            </View>

            <Text style={styles.reviewTitle}>{existingReview?.title}</Text>
            {existingReview?.description && (
                <Text style={styles.reviewDescription}>{existingReview?.description}</Text>
            )}
        </Animated.View>
    );

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <Ionicons name="star" size={60} color="#075538" />
                <Text style={styles.loadingText}>Loading service details...</Text>
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
                <Text style={styles.headerTitle}>Service Review</Text>
                <View style={styles.headerSpacer} />
            </View>

            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                <Animated.View
                    style={[
                        styles.content,
                        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
                    ]}
                >
                    {/* Service Details */}
                    <RequestDetailsCard />

                    {/* Mechanic Details */}
                    {mechanicData && <MechanicCard />}

                    {/* Existing Review or Review Form */}
                    {existingReview ? (
                        <ExistingReviewCard />
                    ) : (
                        <ReviewForm />
                    )}

                    {/* Help Text */}
                    <View style={styles.helpCard}>
                        <Ionicons name="information-circle" size={20} color="#075538" />
                        <Text style={styles.helpText}>
                            Your review helps us improve our services and assists other drivers in finding reliable mechanics.
                        </Text>
                    </View>
                </Animated.View>
            </ScrollView>
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
        backgroundColor: '#075538',
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
    },
    headerSpacer: {
        width: 40,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 40,
    },
    content: {
        flex: 1,
        padding: 20,
    },
    detailsCard: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 20,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
    },
    detailsHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    serviceIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#eff6ff',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
        borderWidth: 2,
        borderColor: '#07553820',
    },
    detailsTitle: {
        flex: 1,
    },
    serviceType: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1e293b',
        marginBottom: 4,
    },
    serviceStatus: {
        fontSize: 12,
        color: '#64748b',
        fontWeight: '500',
    },
    detailsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 16,
    },
    detailItem: {
        width: (width - 72) / 2,
        backgroundColor: '#f8fafc',
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    detailLabel: {
        fontSize: 10,
        color: '#64748b',
        marginTop: 4,
        marginBottom: 2,
        fontWeight: '500',
    },
    detailValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1e293b',
    },
    mechanicCard: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 20,
        marginBottom: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
    },
    mechanicHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    mechanicAvatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#075538',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    mechanicInfo: {
        flex: 1,
    },
    mechanicName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1e293b',
        marginBottom: 4,
    },
    mechanicPhone: {
        fontSize: 14,
        color: '#64748b',
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    statusText: {
        fontSize: 10,
        color: '#fff',
        fontWeight: 'bold',
    },
    thankYouText: {
        fontSize: 14,
        color: '#64748b',
        fontStyle: 'italic',
        textAlign: 'center',
        marginTop: 8,
    },
    reviewForm: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 24,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1e293b',
        marginBottom: 8,
    },
    sectionDescription: {
        fontSize: 14,
        color: '#64748b',
        marginBottom: 24,
    },
    starContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 32,
    },
    starButton: {
        padding: 8,
    },
    ratingText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1e293b',
        marginLeft: 16,
    },
    inputGroup: {
        marginBottom: 20,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1e293b',
        marginBottom: 8,
    },
    textInput: {
        backgroundColor: '#f8fafc',
        borderWidth: 2,
        borderColor: '#e2e8f0',
        borderRadius: 12,
        padding: 14,
        fontSize: 16,
        color: '#1e293b',
    },
    textArea: {
        minHeight: 100,
        textAlignVertical: 'top',
    },
    charCount: {
        fontSize: 12,
        color: '#94a3b8',
        textAlign: 'right',
        marginTop: 4,
    },
    submitButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#075538',
        padding: 18,
        borderRadius: 16,
        marginTop: 8,
        gap: 8,
        shadowColor: '#075538',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    submitButtonDisabled: {
        opacity: 0.7,
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    existingReviewCard: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 24,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
    },
    reviewHeader: {
        marginBottom: 16,
    },
    reviewTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    existingReviewTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1e293b',
    },
    reviewStatusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    reviewStatusText: {
        fontSize: 10,
        color: '#fff',
        fontWeight: 'bold',
    },
    reviewDate: {
        fontSize: 12,
        color: '#64748b',
    },
    reviewRating: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    reviewRatingText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1e293b',
        marginLeft: 8,
    },
    reviewTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1e293b',
        marginBottom: 12,
    },
    reviewDescription: {
        fontSize: 14,
        color: '#64748b',
        lineHeight: 20,
        marginBottom: 16,
    },
    editReviewButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
        backgroundColor: '#eff6ff',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#dbeafe',
        gap: 8,
    },
    editReviewText: {
        color: '#075538',
        fontSize: 14,
        fontWeight: '500',
    },
    helpCard: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    helpText: {
        flex: 1,
        fontSize: 12,
        color: '#64748b',
        marginLeft: 8,
        lineHeight: 16,
    },
});