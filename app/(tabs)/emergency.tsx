// app/(tabs)/emergency.tsx
import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Alert,
    Animated,
    Dimensions,
    Image
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function EmergencyScreen() {
    const router = useRouter();
    const [selectedPriority, setSelectedPriority] = useState<'emergency' | 'normal' | 'other' | null>(null);
    const [selectedProblem, setSelectedProblem] = useState<string | null>(null);
    const [useAutoLocation, setUseAutoLocation] = useState(true);

    const slideAnim = useRef(new Animated.Value(0)).current;
    const pulseAnim = useRef(new Animated.Value(1)).current;

    const problems = [
        { id: 'flat-tire', name: 'Flat Tire', icon: 'car-outline', color: '#ef4444' },
        { id: 'fuel', name: 'Out of Fuel', icon: 'flame-outline', color: '#f59e0b' },
        { id: 'battery', name: 'Dead Battery', icon: 'battery-dead-outline', color: '#84cc16' },
        { id: 'lockout', name: 'Locked Out', icon: 'lock-closed-outline', color: '#8b5cf6' },
        { id: 'towing', name: 'Need Tow', icon: 'trail-sign-outline', color: '#06b6d4' },
        { id: 'engine', name: 'Engine Issue', icon: 'settings-outline', color: '#dc2626' },
        { id: 'accident', name: 'Accident', icon: 'warning-outline', color: '#dc2626' },
        { id: 'other', name: 'Other Issue', icon: 'help-outline', color: '#6b7280' },
    ];

    React.useEffect(() => {
        // Pulsing animation for emergency button
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, []);

    const handleRequestAssistance = () => {
        if (!selectedPriority) {
            Alert.alert('Select Priority', 'Please select the priority level for your request.');
            return;
        }
        if (!selectedProblem) {
            Alert.alert('Select Problem', 'Please select the type of problem you are experiencing.');
            return;
        }

        // Prepare request data
        const requestData = {
            priority: selectedPriority,
            problem: selectedProblem,
            useAutoLocation,
            timestamp: new Date().toISOString(),
        };

        // Navigate to request details page with data
        router.push({
            pathname: '/request',
            params: requestData
        });
    };

    const PriorityCard = ({ type, title, description, icon, color }: {
        type: 'emergency' | 'normal' | 'other';
        title: string;
        description: string;
        icon: string;
        color: string;
    }) => (
        <TouchableOpacity
            style={[
                styles.priorityCard,
                selectedPriority === type && { borderColor: color, backgroundColor: `${color}10` }
            ]}
            onPress={() => setSelectedPriority(type)}
        >
            <View style={[styles.priorityIcon, { backgroundColor: color }]}>
                <Ionicons name={icon as any} size={24} color="#fff" />
            </View>
            <View style={styles.priorityContent}>
                <Text style={styles.priorityTitle}>{title}</Text>
                <Text style={styles.priorityDescription}>{description}</Text>
            </View>
            <View style={[
                styles.radioButton,
                selectedPriority === type && { backgroundColor: color, borderColor: color }
            ]}>
                {selectedPriority === type && (
                    <Ionicons name="checkmark" size={16} color="#fff" />
                )}
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>Roadside Assistance</Text>
                <Text style={styles.subtitle}>Get help when you need it most</Text>
            </View>

            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Priority Selection */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Request Priority</Text>
                    <Text style={styles.sectionDescription}>How urgent is your situation?</Text>

                    <View style={styles.priorityContainer}>
                        <PriorityCard
                            type="emergency"
                            title="Emergency"
                            description="Immediate danger or safety concern"
                            icon="warning"
                            color="#dc2626"
                        />
                        <PriorityCard
                            type="normal"
                            title="Standard"
                            description="Need assistance within the hour"
                            icon="time"
                            color="#f59e0b"
                        />
                        <PriorityCard
                            type="other"
                            title="Scheduled"
                            description="Plan for later today or tomorrow"
                            icon="calendar"
                            color="#10b981"
                        />
                    </View>
                </View>

                {/* Problem Type Selection */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>What&apos;s the problem?</Text>
                    <Text style={styles.sectionDescription}>Select the type of assistance needed</Text>

                    <View style={styles.problemsGrid}>
                        {problems.map((problem) => (
                            <TouchableOpacity
                                key={problem.id}
                                style={[
                                    styles.problemCard,
                                    selectedProblem === problem.id && { borderColor: problem.color, backgroundColor: `${problem.color}10` }
                                ]}
                                onPress={() => setSelectedProblem(problem.id)}
                            >
                                <View style={[styles.problemIcon, { backgroundColor: problem.color }]}>
                                    <Ionicons name={problem.icon as any} size={20} color="#fff" />
                                </View>
                                <Text style={styles.problemText}>{problem.name}</Text>
                                {selectedProblem === problem.id && (
                                    <View style={[styles.problemCheck, { backgroundColor: problem.color }]}>
                                        <Ionicons name="checkmark" size={12} color="#fff" />
                                    </View>
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Location Settings */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Location Access</Text>
                    <Text style={styles.sectionDescription}>Share your location for faster assistance</Text>

                    <View style={styles.locationCard}>
                        <View style={styles.locationHeader}>
                            <Ionicons name="location" size={24} color="#2563eb" />
                            <View style={styles.locationText}>
                                <Text style={styles.locationTitle}>Automatic Location</Text>
                                <Text style={styles.locationDescription}>
                                    Use your current GPS location for accurate service dispatch
                                </Text>
                            </View>
                        </View>

                        <TouchableOpacity
                            style={styles.toggleButton}
                            onPress={() => setUseAutoLocation(!useAutoLocation)}
                        >
                            <View style={[
                                styles.toggleTrack,
                                useAutoLocation && { backgroundColor: '#2563eb' }
                            ]}>
                                <View style={[
                                    styles.toggleThumb,
                                    useAutoLocation && { transform: [{ translateX: 20 }] }
                                ]} />
                            </View>
                        </TouchableOpacity>
                    </View>

                    {!useAutoLocation && (
                        <TouchableOpacity style={styles.manualLocationButton}>
                            <Ionicons name="pin" size={20} color="#2563eb" />
                            <Text style={styles.manualLocationText}>Select location manually</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Spacer for button */}
                <View style={styles.spacer} />
            </ScrollView>

            {/* Fixed CTA Button */}
            <View style={styles.buttonContainer}>
                <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                    <TouchableOpacity
                        style={[
                            styles.ctaButton,
                            (!selectedPriority || !selectedProblem) && styles.ctaButtonDisabled
                        ]}
                        onPress={handleRequestAssistance}
                        disabled={!selectedPriority || !selectedProblem}
                    >
                        <Ionicons name="shield-checkmark" size={24} color="#fff" />
                        <Text style={styles.ctaButtonText}>Request Assistance</Text>
                        <View style={styles.emergencyBadge}>
                            <Ionicons name="flash" size={16} color="#fff" />
                        </View>
                    </TouchableOpacity>
                </Animated.View>

                <Text style={styles.ctaDescription}>
                    {selectedPriority === 'emergency'
                        ? 'Emergency services will be dispatched immediately'
                        : 'We will find the nearest available mechanic'
                    }
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    header: {
        padding: 20,
        paddingTop: 60,
        backgroundColor: '#fff',
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
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
        lineHeight: 22,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
    },
    section: {
        marginBottom: 32,
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
        marginBottom: 16,
    },
    priorityContainer: {
        gap: 12,
    },
    priorityCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 16,
        borderWidth: 2,
        borderColor: '#e2e8f0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    priorityIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    priorityContent: {
        flex: 1,
    },
    priorityTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1e293b',
        marginBottom: 4,
    },
    priorityDescription: {
        fontSize: 12,
        color: '#64748b',
        lineHeight: 16,
    },
    radioButton: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#cbd5e1',
        justifyContent: 'center',
        alignItems: 'center',
    },
    problemsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    problemCard: {
        width: (width - 64) / 2,
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 16,
        borderWidth: 2,
        borderColor: '#e2e8f0',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    problemIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    problemText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#1e293b',
        textAlign: 'center',
    },
    problemCheck: {
        position: 'absolute',
        top: 8,
        right: 8,
        width: 20,
        height: 20,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    locationCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 16,
        borderWidth: 2,
        borderColor: '#e2e8f0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    locationHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    locationText: {
        flex: 1,
        marginLeft: 12,
    },
    locationTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1e293b',
        marginBottom: 4,
    },
    locationDescription: {
        fontSize: 12,
        color: '#64748b',
        lineHeight: 16,
    },
    toggleButton: {
        padding: 4,
    },
    toggleTrack: {
        width: 44,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#cbd5e1',
        justifyContent: 'center',
        padding: 2,
    },
    toggleThumb: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 2,
    },
    manualLocationButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
        padding: 12,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#e2e8f0',
        marginTop: 12,
    },
    manualLocationText: {
        marginLeft: 8,
        fontSize: 14,
        fontWeight: '500',
        color: '#2563eb',
    },
    spacer: {
        height: 100,
    },
    buttonContainer: {
        position: 'absolute',
        bottom: 60,
        left: 20,
        right: 20,
        alignItems: 'center',
    },
    ctaButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#dc2626',
        paddingVertical: 18,
        paddingHorizontal: 24,
        borderRadius: 16,
        shadowColor: '#dc2626',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 8,
        width: width - 40,
    },
    ctaButtonDisabled: {
        backgroundColor: '#9ca3af',
        shadowColor: '#6b7280',
    },
    ctaButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        marginLeft: 8,
        marginRight: 8,
    },
    emergencyBadge: {
        position: 'absolute',
        top: -8,
        right: -8,
        backgroundColor: '#f59e0b',
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4,
    },
    ctaDescription: {
        marginTop: 12,
        fontSize: 12,
        color: '#64748b',
        textAlign: 'center',
        maxWidth: 300,
    },
});