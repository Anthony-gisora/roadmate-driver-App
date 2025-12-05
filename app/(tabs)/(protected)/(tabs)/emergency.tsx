import SelectLocationMap from '@/components/select-location';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
    Image,
    Alert,
    Animated,
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

const { width, height } = Dimensions.get('window');

export default function EmergencyScreen() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(1);
    const [selectedPriority, setSelectedPriority] = useState<'emergency' | 'normal' | 'other' | null>(null);
    const [selectedProblem, setSelectedProblem] = useState<string | null>(null);
    const [otherDescription, setOtherDescription] = useState('');
    const [useAutoLocation, setUseAutoLocation] = useState(true);
    const handleSelect = (coords: { latitude: number; longitude: number }) => {
        console.log(coords);
        Alert.alert("Selected", `${coords.latitude}, ${coords.longitude}`);
    };

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

    const handleNextStep = () => {
        if (currentStep === 1 && !selectedPriority) {
            Alert.alert('Select Priority', 'Please select the priority level for your request.');
            return;
        }
        if (currentStep === 2 && !selectedProblem) {
            Alert.alert('Select Problem', 'Please select the type of problem you are experiencing.');
            return;
        }
        if (currentStep === 2 && selectedProblem === 'other' && !otherDescription.trim()) {
            Alert.alert('Describe Problem', 'Please describe your problem.');
            return;
        }
        setCurrentStep(currentStep + 1);
    };

    const handlePreviousStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleRequestAssistance = () => {
        // Prepare request data
        const requestData = {
            priority: selectedPriority,
            problem: selectedProblem,
            otherDescription: selectedProblem === 'other' ? otherDescription : '',
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

    const renderStepContent = () => {
        switch (currentStep) {
            case 1:
                return (
                    <View style={styles.stepContainer}>
                        <Text style={styles.stepTitle}>Get Assistance Now!</Text>
                        <Text style={styles.stepDescription}>Select the priority level for your request</Text>

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
                );

            case 2:
                return (
                    <View style={styles.stepContainer}>
                        <Text style={styles.stepTitle}>What&apos;s the problem?</Text>
                        <Text style={styles.stepDescription}>Select the type of assistance needed</Text>

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

                        {selectedProblem === 'other' && (
                            <View style={styles.otherInputContainer}>
                                <Text style={styles.otherInputLabel}>Please describe your problem</Text>
                                <TextInput
                                    style={styles.otherInput}
                                    placeholder="Describe what's happening with your vehicle..."
                                    multiline
                                    numberOfLines={4}
                                    value={otherDescription}
                                    onChangeText={setOtherDescription}
                                />
                            </View>
                        )}
                    </View>
                );

            case 3:
                return (
                    <View style={styles.stepContainer}>
                        <Text style={styles.stepTitle}>Where are you located?</Text>
                        <Text style={styles.stepDescription}>Share your location for faster assistance</Text>

                        <View style={styles.locationCard}>
                            <View style={styles.locationHeader}>
                                <Ionicons name="location" size={24} color="#075538" />
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
                                    useAutoLocation && { backgroundColor: '#075538' }
                                ]}>
                                    <View style={[
                                        styles.toggleThumb,
                                        useAutoLocation && { transform: [{ translateX: 20 }] }
                                    ]} />
                                </View>
                            </TouchableOpacity>
                        </View>

                        {!useAutoLocation && (
                            <View style={styles.manualLocationContainer}>
                                <SelectLocationMap onSelect={handleSelect}/>
                            </View>
                        )}
                    </View>
                );

            default:
                return null;
        }
    };

    const getStepProgress = () => {
        return (currentStep / 3) * 100;
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Image
                    source={require('@/assets/images/icon.png')}
                    style={styles.logo}
                />
                <View style={{ flex: 1 }}>
                    <View style={styles.progressBar}>
                        <View style={[styles.progressFill, { width: `${getStepProgress()}%` }]} />
                    </View>
                    <Text style={styles.title}>RoadMate Assist</Text>
                    <Text style={styles.subtitle}>Step {currentStep} of 3</Text>
                </View>
            </View>

            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {renderStepContent()}
                <View style={styles.spacer} />
            </ScrollView>

            {/* Navigation Buttons - Fixed positioning */}
            <View style={styles.buttonContainer}>
                {currentStep > 1 && (
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={handlePreviousStep}
                    >
                        <Ionicons name="chevron-back" size={20} color="#075538" />
                        <Text style={styles.backButtonText}>Back</Text>
                    </TouchableOpacity>
                )}

                {currentStep < 3 ? (
                    <TouchableOpacity
                        style={[
                            styles.nextButton,
                            ((currentStep === 1 && !selectedPriority) ||
                             (currentStep === 2 && (!selectedProblem || (selectedProblem === 'other' && !otherDescription.trim())))) &&
                            styles.nextButtonDisabled
                        ]}
                        onPress={handleNextStep}
                        disabled={
                            (currentStep === 1 && !selectedPriority) ||
                            (currentStep === 2 && (!selectedProblem || (selectedProblem === 'other' && !otherDescription.trim())))
                        }
                    >
                        <Text style={styles.nextButtonText}>Continue</Text>
                        <Ionicons name="chevron-forward" size={20} color="#fff" />
                    </TouchableOpacity>
                ) : (
                    <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                        <TouchableOpacity
                            style={styles.ctaButton}
                            onPress={handleRequestAssistance}
                        >
                            <Ionicons name="shield-checkmark" size={24} color="#fff" />
                            <Text style={styles.ctaButtonText}>Request Assistance</Text>
                            <View style={styles.emergencyBadge}>
                                <Ionicons name="flash" size={16} color="#fff" />
                            </View>
                        </TouchableOpacity>
                    </Animated.View>
                )}
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
    progressBar: {
        height: 4,
        backgroundColor: '#e2e8f0',
        borderRadius: 2,
        marginBottom: 16,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#075538',
        borderRadius: 2,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1e293b',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 16,
        color: '#64748b',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 100, // Add padding at bottom to account for button container
    },
    stepContainer: {
        flex: 1,
    },
    stepTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1e293b',
        marginBottom: 8,
        textAlign: 'center',
    },
    stepDescription: {
        fontSize: 16,
        color: '#64748b',
        textAlign: 'center',
        marginBottom: 32,
        lineHeight: 22,
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
        justifyContent: 'center',
    },
    problemCard: {
        width: (width - 64) / 3,
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
    otherInputContainer: {
        marginTop: 24,
        padding: 16,
        backgroundColor: '#fff',
        borderRadius: 16,
        borderWidth: 2,
        borderColor: '#e2e8f0',
    },
    otherInputLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1e293b',
        marginBottom: 12,
    },
    otherInput: {
        borderWidth: 1,
        borderColor: '#cbd5e1',
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        textAlignVertical: 'top',
        minHeight: 120,
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
    manualLocationContainer: {
        marginTop: 16,
    },
    mapPlaceholder: {
        height: 200,
        backgroundColor: '#f1f5f9',
        borderRadius: 16,
        borderWidth: 2,
        borderColor: '#e2e8f0',
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
    },
    mapPlaceholderText: {
        marginTop: 12,
        fontSize: 14,
        color: '#64748b',
        fontWeight: '500',
    },
    spacer: {
        height: 20, // Reduced spacer since we have paddingBottom
    },
    buttonContainer: {
        position: 'absolute',
        bottom: 80, // Increased from 20 to be higher
        left: 20,
        right: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#f8fafc', // Add background to ensure visibility
        paddingVertical: 10,
        paddingHorizontal: 5,
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderRadius: 12,
        backgroundColor: '#f1f5f9',
    },
    backButtonText: {
        color: '#075538',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 4,
    },
    nextButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#075538',
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: 16,
        shadowColor: '#075538',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
        flex: 1,
        justifyContent: 'center',
        marginLeft: 'auto',
        maxWidth: 200, // Limit maximum width
    },
    nextButtonDisabled: {
        backgroundColor: '#9ca3af',
        shadowColor: '#6b7280',
    },
    nextButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        marginRight: 8,
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
        flex: 1,
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
    logo: {
        width: 50, // adjust size as needed
        height: 50,
        marginRight: 12,
        resizeMode: 'contain',
    },
});