import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
    Alert,
    Animated,
    Modal,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

export default function ProfileScreen() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'profile' | 'history' | 'settings'>('profile');
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [emergencyModalVisible, setEmergencyModalVisible] = useState(false);
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [locationEnabled, setLocationEnabled] = useState(true);

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;

    const [userData, setUserData] = useState({
        name: 'John Doe',
        email: 'john.doe@example.com',
        phone: '+1 (555) 123-4567',
        memberSince: '2024',
        rating: 4.9,
        trips: 24,
        emergencyContact: {
            name: 'Sarah Wilson',
            phone: '+1 (555) 987-6543',
            relationship: 'Spouse'
        }
    });

    const [editData, setEditData] = useState(userData);

    React.useEffect(() => {
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

    const serviceHistory = [
        {
            id: '1',
            type: 'Flat Tire Repair',
            mechanic: 'Mike Johnson',
            date: '2024-01-15',
            price: '$25',
            status: 'Completed',
            rating: 5,
            vehicle: 'Toyota Camry 2020'
        },
        {
            id: '2',
            type: 'Fuel Delivery',
            mechanic: 'Quick Fuel Service',
            date: '2024-01-10',
            price: '$15',
            status: 'Completed',
            rating: 4,
            vehicle: 'Toyota Camry 2020'
        },
        {
            id: '3',
            type: 'Jump Start',
            mechanic: 'Carlos Rodriguez',
            date: '2024-01-05',
            price: '$40',
            status: 'Completed',
            rating: 5,
            vehicle: 'Toyota Camry 2020'
        },
        {
            id: '4',
            type: 'Engine Diagnostics',
            mechanic: 'Sarah Chen',
            date: '2023-12-20',
            price: '$60',
            status: 'Completed',
            rating: 5,
            vehicle: 'Toyota Camry 2020'
        }
    ];

    const vehicles = [
        {
            id: '1',
            make: 'Toyota',
            model: 'Camry',
            year: '2020',
            license: 'ABC-1234',
            color: 'Silver',
            default: true
        },
        {
            id: '2',
            make: 'Honda',
            model: 'CR-V',
            year: '2018',
            license: 'XYZ-5678',
            color: 'Black',
            default: false
        }
    ];

    const handleSaveProfile = () => {
        setUserData(editData);
        setEditModalVisible(false);
        Alert.alert('Success', 'Profile updated successfully!');
    };

    const handleSaveEmergencyContact = () => {
        setUserData(prev => ({
            ...prev,
            emergencyContact: editData.emergencyContact
        }));
        setEmergencyModalVisible(false);
        Alert.alert('Success', 'Emergency contact updated successfully!');
    };

    const handleLogout = () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to logout?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Logout',
                    style: 'destructive',
                    onPress: () => router.replace('/login')
                }
            ]
        );
    };

    const StatCard = ({ value, label, icon }: { value: string; label: string; icon: string }) => (
        <View style={styles.statCard}>
            <Ionicons name={icon as any} size={24} color="#075538" />
            <Text style={styles.statValue}>{value}</Text>
            <Text style={styles.statLabel}>{label}</Text>
        </View>
    );

    const ServiceHistoryCard = ({ service }: { service: any }) => (
        <View style={styles.historyCard}>
            <View style={styles.historyHeader}>
                <View style={styles.serviceType}>
                    <Ionicons name="car-sport" size={16} color="#075538" />
                    <Text style={styles.serviceTypeText}>{service.type}</Text>
                </View>
                <Text style={styles.servicePrice}>{service.price}</Text>
            </View>

            <Text style={styles.mechanicName}>{service.mechanic}</Text>
            <Text style={styles.vehicleInfo}>{service.vehicle}</Text>

            <View style={styles.historyFooter}>
                <Text style={styles.serviceDate}>{new Date(service.date).toLocaleDateString()}</Text>
                <View style={styles.ratingContainer}>
                    {[...Array(5)].map((_, i) => (
                        <Ionicons
                            key={i}
                            name="star"
                            size={14}
                            color={i < service.rating ? "#f59e0b" : "#cbd5e1"}
                        />
                    ))}
                </View>
            </View>

            <View style={[styles.statusBadge, { backgroundColor: '#10b981' }]}>
                <Text style={styles.statusText}>{service.status}</Text>
            </View>
        </View>
    );

    const VehicleCard = ({ vehicle }: { vehicle: any }) => (
        <View style={styles.vehicleCard}>
            <View style={styles.vehicleHeader}>
                <Ionicons name="car" size={24} color="#075538" />
                <View style={styles.vehicleInfo}>
                    <Text style={styles.vehicleName}>{vehicle.year} {vehicle.make} {vehicle.model}</Text>
                    <Text style={styles.vehicleDetails}>{vehicle.color} • {vehicle.license}</Text>
                </View>
                {vehicle.default && (
                    <View style={styles.defaultBadge}>
                        <Text style={styles.defaultText}>Default</Text>
                    </View>
                )}
            </View>
            <TouchableOpacity style={styles.editVehicleButton}>
                <Ionicons name="pencil" size={16} color="#64748b" />
            </TouchableOpacity>
        </View>
    );

    const renderProfileTab = () => (
        <Animated.View
            style={[
                styles.tabContent,
                { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
            ]}
        >
            {/* Personal Information */}
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Personal Information</Text>
                    <TouchableOpacity
                        style={styles.editButton}
                        onPress={() => {
                            setEditData(userData);
                            setEditModalVisible(true);
                        }}
                    >
                        <Ionicons name="pencil" size={16} color="#075538" />
                    </TouchableOpacity>
                </View>

                <View style={styles.infoCard}>
                    <View style={styles.infoRow}>
                        <Ionicons name="person" size={20} color="#64748b" />
                        <Text style={styles.infoLabel}>Full Name</Text>
                        <Text style={styles.infoValue}>{userData.name}</Text>
                    </View>

                    <View style={styles.infoRow}>
                        <Ionicons name="mail" size={20} color="#64748b" />
                        <Text style={styles.infoLabel}>Email</Text>
                        <Text style={styles.infoValue}>{userData.email}</Text>
                    </View>

                    <View style={styles.infoRow}>
                        <Ionicons name="call" size={20} color="#64748b" />
                        <Text style={styles.infoLabel}>Phone</Text>
                        <Text style={styles.infoValue}>{userData.phone}</Text>
                    </View>
                </View>
            </View>

            {/* Emergency Contact */}
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Emergency Contact</Text>
                    <TouchableOpacity
                        style={styles.editButton}
                        onPress={() => {
                            setEditData(userData);
                            setEmergencyModalVisible(true);
                        }}
                    >
                        <Ionicons name="pencil" size={16} color="#075538" />
                    </TouchableOpacity>
                </View>

                <View style={styles.emergencyCard}>
                    <View style={styles.emergencyHeader}>
                        <Ionicons name="medkit" size={24} color="#dc2626" />
                        <View style={styles.emergencyInfo}>
                            <Text style={styles.emergencyName}>{userData.emergencyContact.name}</Text>
                            <Text style={styles.emergencyRelationship}>{userData.emergencyContact.relationship}</Text>
                        </View>
                    </View>
                    <Text style={styles.emergencyPhone}>{userData.emergencyContact.phone}</Text>
                </View>
            </View>

            {/* My Vehicles */}
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>My Vehicles</Text>
                    <TouchableOpacity style={styles.addButton}>
                        <Ionicons name="add" size={20} color="#075538" />
                    </TouchableOpacity>
                </View>

                <View style={styles.vehiclesContainer}>
                    {vehicles.map(vehicle => (
                        <VehicleCard key={vehicle.id} vehicle={vehicle} />
                    ))}
                </View>
            </View>
        </Animated.View>
    );

    const renderHistoryTab = () => (
        <Animated.View
            style={[
                styles.tabContent,
                { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
            ]}
        >
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Service History</Text>
                <Text style={styles.sectionDescription}>Your recent roadside assistance requests</Text>

                <View style={styles.historyContainer}>
                    {serviceHistory.map(service => (
                        <ServiceHistoryCard key={service.id} service={service} />
                    ))}
                </View>
            </View>
        </Animated.View>
    );

    const renderSettingsTab = () => (
        <Animated.View
            style={[
                styles.tabContent,
                { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
            ]}
        >
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Preferences</Text>

                <View style={styles.settingsCard}>
                    <View style={styles.settingRow}>
                        <View style={styles.settingInfo}>
                            <Ionicons name="notifications" size={24} color="#075538" />
                            <View style={styles.settingText}>
                                <Text style={styles.settingTitle}>Push Notifications</Text>
                                <Text style={styles.settingDescription}>Receive service updates and alerts</Text>
                            </View>
                        </View>
                        <Switch
                            value={notificationsEnabled}
                            onValueChange={setNotificationsEnabled}
                            trackColor={{ false: '#cbd5e1', true: '#075538' }}
                            thumbColor="#fff"
                        />
                    </View>

                    <View style={styles.settingRow}>
                        <View style={styles.settingInfo}>
                            <Ionicons name="location" size={24} color="#075538" />
                            <View style={styles.settingText}>
                                <Text style={styles.settingTitle}>Location Services</Text>
                                <Text style={styles.settingDescription}>Share location for faster assistance</Text>
                            </View>
                        </View>
                        <Switch
                            value={locationEnabled}
                            onValueChange={setLocationEnabled}
                            trackColor={{ false: '#cbd5e1', true: '#075538' }}
                            thumbColor="#fff"
                        />
                    </View>
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Support</Text>

                <View style={styles.settingsCard}>
                    <TouchableOpacity style={styles.menuItem}>
                        <Ionicons name="help-circle" size={24} color="#075538" />
                        <Text style={styles.menuText}>Help & Support</Text>
                        <Ionicons name="chevron-forward" size={20} color="#64748b" />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuItem}>
                        <Ionicons name="document-text" size={24} color="#075538" />
                        <Text style={styles.menuText}>Terms of Service</Text>
                        <Ionicons name="chevron-forward" size={20} color="#64748b" />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuItem}>
                        <Ionicons name="lock-closed" size={24} color="#075538" />
                        <Text style={styles.menuText}>Privacy Policy</Text>
                        <Ionicons name="chevron-forward" size={20} color="#64748b" />
                    </TouchableOpacity>
                </View>
            </View>

            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <Ionicons name="log-out" size={20} color="#dc2626" />
                <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
        </Animated.View>
    );

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.profileHeader}>
                    <View style={styles.avatarContainer}>
                        <Text style={styles.avatarText}>
                            {userData.name.split(' ').map(n => n[0]).join('')}
                        </Text>
                    </View>
                    <View style={styles.profileInfo}>
                        <Text style={styles.userName}>{userData.name}</Text>
                        <Text style={styles.userEmail}>{userData.email}</Text>
                    </View>
                </View>
            </View>

            {/* Navigation Tabs */}
            <View style={styles.tabContainer}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'profile' && styles.tabActive]}
                    onPress={() => setActiveTab('profile')}
                >
                    <Ionicons
                        name="person"
                        size={20}
                        color={activeTab === 'profile' ? '#075538' : '#64748b'}
                    />
                    <Text style={[styles.tabText, activeTab === 'profile' && styles.tabTextActive]}>
                        Profile
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.tab, activeTab === 'history' && styles.tabActive]}
                    onPress={() => setActiveTab('history')}
                >
                    <Ionicons
                        name="time"
                        size={20}
                        color={activeTab === 'history' ? '#075538' : '#64748b'}
                    />
                    <Text style={[styles.tabText, activeTab === 'history' && styles.tabTextActive]}>
                        History
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.tab, activeTab === 'settings' && styles.tabActive]}
                    onPress={() => setActiveTab('settings')}
                >
                    <Ionicons
                        name="settings"
                        size={20}
                        color={activeTab === 'settings' ? '#075538' : '#64748b'}
                    />
                    <Text style={[styles.tabText, activeTab === 'settings' && styles.tabTextActive]}>
                        Settings
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Tab Content */}
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {activeTab === 'profile' && renderProfileTab()}
                {activeTab === 'history' && renderHistoryTab()}
                {activeTab === 'settings' && renderSettingsTab()}
            </ScrollView>

            {/* Edit Profile Modal */}
            <Modal
                visible={editModalVisible}
                animationType="slide"
                presentationStyle="pageSheet"
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Edit Profile</Text>
                        <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                            <Ionicons name="close" size={24} color="#1e293b" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.modalContent}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Full Name</Text>
                            <TextInput
                                style={styles.textInput}
                                value={editData.name}
                                onChangeText={(text) => setEditData({...editData, name: text})}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Email</Text>
                            <TextInput
                                style={styles.textInput}
                                value={editData.email}
                                onChangeText={(text) => setEditData({...editData, email: text})}
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Phone</Text>
                            <TextInput
                                style={styles.textInput}
                                value={editData.phone}
                                onChangeText={(text) => setEditData({...editData, phone: text})}
                                keyboardType="phone-pad"
                            />
                        </View>
                    </ScrollView>

                    <View style={styles.modalFooter}>
                        <TouchableOpacity
                            style={styles.saveButton}
                            onPress={handleSaveProfile}
                        >
                            <Text style={styles.saveButtonText}>Save Changes</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Emergency Contact Modal */}
            <Modal
                visible={emergencyModalVisible}
                animationType="slide"
                presentationStyle="pageSheet"
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Emergency Contact</Text>
                        <TouchableOpacity onPress={() => setEmergencyModalVisible(false)}>
                            <Ionicons name="close" size={24} color="#1e293b" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.modalContent}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Contact Name</Text>
                            <TextInput
                                style={styles.textInput}
                                value={editData.emergencyContact.name}
                                onChangeText={(text) => setEditData({
                                    ...editData,
                                    emergencyContact: {...editData.emergencyContact, name: text}
                                })}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Phone Number</Text>
                            <TextInput
                                style={styles.textInput}
                                value={editData.emergencyContact.phone}
                                onChangeText={(text) => setEditData({
                                    ...editData,
                                    emergencyContact: {...editData.emergencyContact, phone: text}
                                })}
                                keyboardType="phone-pad"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Relationship</Text>
                            <TextInput
                                style={styles.textInput}
                                value={editData.emergencyContact.relationship}
                                onChangeText={(text) => setEditData({
                                    ...editData,
                                    emergencyContact: {...editData.emergencyContact, relationship: text}
                                })}
                            />
                        </View>
                    </ScrollView>

                    <View style={styles.modalFooter}>
                        <TouchableOpacity
                            style={styles.saveButton}
                            onPress={handleSaveEmergencyContact}
                        >
                            <Text style={styles.saveButtonText}>Save Contact</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
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
    profileHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatarContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#075538',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    avatarText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
    },
    profileInfo: {
        flex: 1,
    },
    userName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1e293b',
        marginBottom: 4,
    },
    userEmail: {
        fontSize: 16,
        color: '#64748b',
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
    content: {
        flex: 1,
    },
    tabContent: {
        padding: 20,
        paddingBottom: 100,
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 24,
    },
    statCard: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 16,
        alignItems: 'center',
        marginHorizontal: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    statValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1e293b',
        marginTop: 8,
    },
    statLabel: {
        fontSize: 12,
        color: '#64748b',
        marginTop: 4,
    },
    section: {
        marginBottom: 24,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1e293b',
    },
    sectionDescription: {
        fontSize: 14,
        color: '#64748b',
        marginBottom: 16,
    },
    editButton: {
        padding: 8,
        backgroundColor: '#eff6ff',
        borderRadius: 8,
    },
    addButton: {
        padding: 8,
        backgroundColor: '#eff6ff',
        borderRadius: 8,
    },
    infoCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    infoLabel: {
        flex: 1,
        fontSize: 14,
        color: '#64748b',
        marginLeft: 12,
    },
    infoValue: {
        fontSize: 16,
        fontWeight: '500',
        color: '#1e293b',
    },
    emergencyCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    emergencyHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    emergencyInfo: {
        marginLeft: 12,
        flex: 1,
    },
    emergencyName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1e293b',
    },
    emergencyRelationship: {
        fontSize: 14,
        color: '#64748b',
    },
    emergencyPhone: {
        fontSize: 16,
        color: '#075538',
        fontWeight: '500',
    },
    vehiclesContainer: {
        gap: 12,
    },
    vehicleCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    vehicleHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    vehicleInfo: {
        marginLeft: 12,
        flex: 1,
    },
    vehicleName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1e293b',
        marginBottom: 4,
    },
    vehicleDetails: {
        fontSize: 14,
        color: '#64748b',
    },
    defaultBadge: {
        backgroundColor: '#10b981',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    defaultText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#fff',
    },
    editVehicleButton: {
        padding: 8,
    },
    historyContainer: {
        gap: 12,
    },
    historyCard: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    historyHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    serviceType: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    serviceTypeText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1e293b',
    },
    servicePrice: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#10b981',
    },
    mechanicName: {
        fontSize: 14,
        color: '#64748b',
        marginBottom: 4,
    },
    vehicleInfo: {
        fontSize: 12,
        color: '#94a3b8',
        marginBottom: 12,
    },
    historyFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    serviceDate: {
        fontSize: 12,
        color: '#64748b',
    },
    ratingContainer: {
        flexDirection: 'row',
        gap: 2,
    },
    statusBadge: {
        position: 'absolute',
        top: 12,
        right: 12,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    statusText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#fff',
    },
    settingsCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    settingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    settingInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    settingText: {
        marginLeft: 12,
        flex: 1,
    },
    settingTitle: {
        fontSize: 16,
        fontWeight: '500',
        color: '#1e293b',
        marginBottom: 2,
    },
    settingDescription: {
        fontSize: 12,
        color: '#64748b',
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    menuText: {
        flex: 1,
        marginLeft: 12,
        fontSize: 16,
        color: '#1e293b',
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 16,
        marginTop: 20,
        gap: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    logoutText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#dc2626',
    },
    modalContainer: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        paddingTop: 60,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1e293b',
    },
    modalContent: {
        flex: 1,
        padding: 20,
    },
    inputGroup: {
        marginBottom: 20,
    },
    inputLabel: {
        fontSize: 16,
        fontWeight: '500',
        color: '#1e293b',
        marginBottom: 8,
    },
    textInput: {
        backgroundColor: '#fff',
        borderWidth: 2,
        borderColor: '#e2e8f0',
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        color: '#1e293b',
    },
    modalFooter: {
        padding: 20,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#e2e8f0',
    },
    saveButton: {
        backgroundColor: '#075538',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});