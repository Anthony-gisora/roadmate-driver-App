import CarSelector from '@/components/car-selector';
import { Car, offlineDB } from "@/data/db";
import { apiClient } from "@/hooks/api-client";
import { getLocation } from "@/hooks/location";
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Animated, Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useToast } from "react-native-toast-notifications";
import {useAuth} from "@/providers/auth-provider";

const { width } = Dimensions.get('window');

export default function RequestScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const [progress, setProgress] = useState(0);
    const [mechanic, setMechanic] = useState<any>(null);
    const [car, setCar] = useState<Car|undefined>();
    const [eta, setEta] = useState<string>('5-10 min');
    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState(false);
    const [price, setPrice] = useState<number>(0);
    const { user } = useAuth();
    const toast = useToast();
    const db = offlineDB;

    const progressAnim = new Animated.Value(0);
    const slideAnim = new Animated.Value(50);

    const { priority, problem, useAutoLocation,timestamp, location } = params;

    const problemIcons: { [key: string]: string } = {
        'flat-tire': 'car-outline',
        'fuel': 'flame-outline',
        'battery': 'battery-dead-outline',
        'lockout': 'lock-closed-outline',
        'towing': 'trail-sign-outline',
        'engine': 'settings-outline',
        'accident': 'warning-outline',
        'other': 'help-outline',
    };

    const priorityColors: { [key: string]: string } = {
        'emergency': '#dc2626',
        'normal': '#f59e0b',
        'other': '#10b981',
    };

    const handlePress = () => {
        console.log(mechanic);
        router.push({
            pathname: `/(tabs)/(protected)/messaging/${mechanic.id}`,
            params: {
                mechanicName: mechanic?.name,
                mechanicImage: ""
            }
        });
    };

    const handleSelectCar = (car) => {
        setCar(car);
    }

    function getETA(distanceKm: number): string {
        const averageSpeed = 40; // km/h
        const totalMinutes = (distanceKm / averageSpeed) * 60;

        if (totalMinutes < 60) {
            return `${Math.round(totalMinutes)} mins`;
        }

        const hours = Math.floor(totalMinutes / 60);
        const minutes = Math.round(totalMinutes % 60);
        return `${hours} hr${hours > 1 ? 's' : ''} ${minutes} mins`;
    }

    useEffect(() => {
        db.getDefaultCar()
            .then((res)=>{
                setCar(res);
            })
        fetchMechanic();
    }, []);

    const fetchMechanic = async () => {
        setSending(true);
        let loc: string | string[] = location ?? "";
        if (useAutoLocation === "true") {
            loc = (await getLocation()) ?? "";
        }
        setProgress(0);

        setProgress(15);
        const lat = loc.toString().split(',')[0];
        const lng = loc.toString().split(',')[1];


        await apiClient.get(`/online-mechanics?lat=${lat}&lng=${lng}`)
            .then((res) => {
                setProgress(30);
                const mechanic = res.data.nearest;
                const distance = Number(mechanic?.distance  ?? 0);

                if(mechanic){
                    //estimate ETA
                    setEta(getETA(distance));

                    setMechanic({
                        id: mechanic.clerkUid,
                        name: mechanic.name,
                        rating: 4.8,
                        reviews: 60,
                        distance: `${distance?.toFixed(2) }KM`,
                        specialization: problem === "flat-tire" ? "Tire Specialist" : "General Mechanic",
                        image: "👨‍🔧",
                        location: loc,
                        price: estimatedPrice()
                    });
                    setProgress(50);
                }else{
                    setMechanic({
                        id: 'user_30wtNSkJ1tqoMq0UawYeVAd1gOJ',
                        name: "Anthony Gesora",
                        rating: 4.8,
                        reviews: 19,
                        distance: `$2.45 KM`,
                        specialization: "flat-tire",
                        image: "🤖",
                        location: location,
                        price: estimatedPrice()
                    });
                    toast.show("No mechanic is available at the moment", { type: "danger" });
                }
            })
            .catch((err) => {
                console.log(err);
                setProgress(0);
                console.log("error",err.response);
                toast.show(err.message ?? "Error fetching available mechanics", { type: "danger" });
            }).finally(() => {
                setSending(false);
            })
    }

    const sendRequest = async () => {
        if(sent){
            return null;
        }
        setSending(true);
        const driverId = user?.id;
        const requestType = problem;
        const details = {
            priority: priority.toString(),
            timestamp: timestamp.toString(),
        };


        try {
            apiClient.post("/req/requests", {
                driverId,
                requestType,
                details: JSON.stringify(details),
                location: mechanic.loc,
                mechanicId: mechanic.id,
                price: mechanic.price,
                vehicleMake: car?.make,
                vehicleModel: car?.model,
                vehiclePlate: car?.plate,
                vehicleYear: car?.year,
                eta: eta
            })
                .then((res) => {
                    console.log(res);
                    toast.show('Request submitted', { type: "success" });
                    setProgress(100);
                    setSent(true);
                })
                .catch((err)=>{
                    toast.show(err.response.data?.message ?? 'An error occurred', { type: "danger" });
                    console.log(err);
                })
        } catch (err: any) {
            console.log("An error occurred", err);
            console.log("mechanic", mechanic);
            const error = err.response?.data?.message ?? err.message;
            setMechanic(null);
            toast.show(`Error occurred: ${error}`, { type: "danger" });
            setProgress(0);
        }
        setSending(false);
    };


    //update price estimates
    const estimatedPrice = () => {
        const basePrices: { [key: string]: number } = {
            'flat-tire': 500,
            'fuel': 500,
            'battery': 400,
            'lockout': 650,
            'towing': 1500,
            'engine': 4500,
            'accident': 3500,
            'other': 500,
        };

        const basePrice = basePrices[params.problem as string] || 50;
        const priorityMultiplier = params.priority === 'emergency' ? 1.5 : 1;
        const price = (basePrice * priorityMultiplier).toFixed(2);
        setPrice(Number(price));

        return `KES${price}`;
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="#1e293b" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Request Details</Text>
                <View style={styles.headerSpacer} />
            </View>

            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
                {/* Status Card */}
                <View style={styles.statusCard}>
                    <View style={styles.statusHeader}>
                        <View style={[styles.priorityBadge, { backgroundColor: priorityColors[params.priority as string] }]}>
                            <Text style={styles.priorityText}>
                                {params.priority === 'emergency' ? '🚨 EMERGENCY' :
                                    params.priority === 'normal' ? '🕐 STANDARD' : '📅 SCHEDULED'}
                            </Text>
                        </View>
                        <Text style={styles.statusTitle}>Assistance Requested</Text>
                        <Text style={styles.statusDescription}>
                            We&apos;re finding the best mechanic for your {params.problem} issue
                        </Text>
                    </View>

                    {/* Progress Bar */}
                    <View style={styles.progressContainer}>
                        <View style={styles.progressBackground}>
                            <Animated.View
                                style={[
                                    styles.progressFill,
                                    { width: `${progress}%` }
                                ]}
                            />
                        </View>
                        <Text style={styles.progressText}>{progress}% Complete</Text>
                    </View>
                </View>

                {/* Problem Details */}
                <View style={styles.detailCard}>
                    <Text style={styles.cardTitle}>Service Details</Text>

                    <View style={styles.detailRow}>
                        <View style={styles.detailIcon}>
                            <Ionicons
                                name={problemIcons[params.problem as string] || 'help-outline'}
                                size={20}
                                color="#2563eb"
                            />
                        </View>
                        <View style={styles.detailContent}>
                            <Text style={styles.detailLabel}>Problem Type</Text>
                            <Text style={styles.detailValue}>
                                {params.problem?.toString().replace('-', ' ').toUpperCase() || 'Unknown'}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.detailRow}>
                        <View style={styles.detailIcon}>
                            <Ionicons name="time" size={20} color="#2563eb" />
                        </View>
                        <View style={styles.detailContent}>
                            <Text style={styles.detailLabel}>Request Time</Text>
                            <Text style={styles.detailValue}>
                                {new Date().toLocaleTimeString()}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.detailRow}>
                        <View style={styles.detailIcon}>
                            <Ionicons name="cash" size={20} color="#2563eb" />
                        </View>
                        <View style={styles.detailContent}>
                            <Text style={styles.detailLabel}>Estimated Cost</Text>
                            <Text style={styles.detailValue}>{price}</Text>
                        </View>
                    </View>

                    <CarSelector
                        onSelectCar={(car) => {
                            handleSelectCar(car);
                        }}
                    />
                </View>

                {/* Mechanic Match */}
                {mechanic && (
                    <View style={styles.mechanicCard}>
                        <Text style={styles.cardTitle}>Mechanic Assigned</Text>

                        <View style={styles.mechanicInfo}>
                            <Text style={styles.mechanicEmoji}>{mechanic.image}</Text>
                            <View style={styles.mechanicDetails}>
                                <Text style={styles.mechanicName}>{mechanic.name}</Text>
                                <View style={styles.ratingContainer}>
                                    <Ionicons name="star" size={16} color="#f59e0b" />
                                    <Text style={styles.ratingText}>{mechanic.rating} ({mechanic.reviews} reviews)</Text>
                                </View>
                                <Text style={styles.mechanicSpecialty}>{mechanic.specialization}</Text>
                            </View>
                        </View>

                        <View style={styles.mechanicStats}>
                            <View style={styles.stat}>
                                <Ionicons name="location" size={16} color="#64748b" />
                                <Text style={styles.statText}>{mechanic?.distance} away</Text>
                            </View>
                            <View style={styles.stat}>
                                <Ionicons name="time" size={16} color="#64748b" />
                                <Text style={styles.statText}>ETA: {eta}</Text>
                            </View>
                        </View>

                        <TouchableOpacity onPress={handlePress} style={styles.contactButton}>
                            <Ionicons name="chatbubble" size={20} color="#2563eb" />
                            <Text style={styles.contactButtonText}>Message Mechanic</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Emergency Contacts */}
                <View style={styles.contactsCard}>
                    <Text style={styles.cardTitle}>Live Tracking</Text>
                    <Text style={styles.contactsDescription}>
                        View Live location updates on the homepage by clicking the active request
                    </Text>

                    <TouchableOpacity onPress={()=>{
                        router.push('/(tabs)/(protected)/(tabs)/home');
                    }} style={styles.emergencyButton}>
                        <Ionicons name="call" size={20} color="#00ff9d" />
                        <Text style={styles.emergencyButtonText}>Track location</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* Fixed Action Buttons */}
            <View style={styles.actionContainer}>
                <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => Alert.alert(
                        'Cancel Request',
                        'Are you sure you want to cancel this assistance request?',
                        [
                            { text: 'No', style: 'cancel' },
                            { text: 'Yes, Cancel', style: 'destructive', onPress: () => router.back() }
                        ]
                    )}
                >
                    <Text style={styles.cancelButtonText}>Cancel Request</Text>
                </TouchableOpacity>

                <TouchableOpacity disabled={sending || !mechanic} onPress={sendRequest} style={[
                    styles.updateButton,
                    mechanic === null && styles.disabledButton,
                ]}>
                    {sending ? (
                        <>
                            <Ionicons name="send" size={20} color="#2563eb" />
                            <Text style={styles.updateButtonText}>Submit Request</Text>
                        </>
                        ):(
                        <Text style={styles.updateButtonTextError}>No mechanic available</Text>
                    )}
                </TouchableOpacity>
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
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
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
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1e293b',
    },
    headerSpacer: {
        width: 40,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 100,
    },
    statusCard: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 20,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 4,
    },
    statusHeader: {
        alignItems: 'center',
        marginBottom: 20,
    },
    priorityBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        marginBottom: 12,
    },
    priorityText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    statusTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1e293b',
        marginBottom: 8,
    },
    statusDescription: {
        fontSize: 14,
        color: '#64748b',
        textAlign: 'center',
    },
    progressContainer: {
        marginTop: 8,
    },
    progressBackground: {
        height: 8,
        backgroundColor: '#e2e8f0',
        borderRadius: 4,
        overflow: 'hidden',
        marginBottom: 8,
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#10b981',
        borderRadius: 4,
    },
    progressText: {
        fontSize: 12,
        color: '#64748b',
        textAlign: 'center',
    },
    detailCard: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 20,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 4,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1e293b',
        marginBottom: 16,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    detailIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#eff6ff',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    detailContent: {
        flex: 1,
    },
    detailLabel: {
        fontSize: 12,
        color: '#64748b',
        marginBottom: 4,
    },
    detailValue: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1e293b',
    },
    mechanicCard: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 20,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 4,
    },
    mechanicInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    mechanicEmoji: {
        fontSize: 48,
        marginRight: 16,
    },
    mechanicDetails: {
        flex: 1,
    },
    mechanicName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1e293b',
        marginBottom: 4,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    ratingText: {
        marginLeft: 4,
        fontSize: 14,
        color: '#64748b',
    },
    mechanicSpecialty: {
        fontSize: 14,
        color: '#2563eb',
        fontWeight: '500',
    },
    mechanicStats: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 16,
        padding: 16,
        backgroundColor: '#f8fafc',
        borderRadius: 12,
    },
    stat: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statText: {
        marginLeft: 6,
        fontSize: 14,
        color: '#64748b',
        fontWeight: '500',
    },
    contactButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
        borderWidth: 2,
        borderColor: '#2563eb',
        borderRadius: 12,
    },
    contactButtonText: {
        marginLeft: 8,
        fontSize: 16,
        fontWeight: '600',
        color: '#2563eb',
    },
    mapCard: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 20,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 4,
    },
    mapPlaceholder: {
        height: 200,
        backgroundColor: '#f8fafc',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    mapText: {
        marginTop: 12,
        fontSize: 16,
        fontWeight: '600',
        color: '#1e293b',
    },
    mapSubtext: {
        marginTop: 4,
        fontSize: 14,
        color: '#64748b',
    },
    contactsCard: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 20,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 4,
    },
    contactsDescription: {
        fontSize: 14,
        color: '#64748b',
        marginBottom: 16,
    },
    emergencyButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        backgroundColor: '#ffffff',
        borderWidth: 2,
        borderColor: '#00ff9d',
        borderRadius: 12,
    },
    emergencyButtonText: {
        marginLeft: 8,
        fontSize: 16,
        fontWeight: '600',
        color: '#00ff9d',
    },
    actionContainer: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        right: 20,
        flexDirection: 'row',
        gap: 12,
    },
    cancelButton: {
        flex: 1,
        padding: 16,
        backgroundColor: '#fff',
        borderWidth: 2,
        borderColor: '#e2e8f0',
        borderRadius: 12,
        alignItems: 'center',
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#64748b',
    },
    updateButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        backgroundColor: '#eff6ff',
        borderWidth: 2,
        borderColor: '#2563eb',
        borderRadius: 12,
    },
    updateButtonText: {
        marginLeft: 8,
        fontSize: 16,
        fontWeight: '600',
        color: '#2563eb',
    },
    updateButtonTextError: {
        marginLeft: 8,
        fontSize: 16,
        fontWeight: '600',
        color: '#fb0202',
    },
    disabledButton: {
        backgroundColor: '#9ca3af',
        opacity: 0.6,
        borderColor: '#f10542',
    },
});