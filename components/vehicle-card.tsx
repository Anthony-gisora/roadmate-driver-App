import { Ionicons } from '@expo/vector-icons';
import React, { useRef, useState } from 'react';
import {
    Alert,
    Animated,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import {apiClient} from "@/hooks/api-client";

const VehicleCard = ({ vehicle, userId, onUpdate, onDelete}: {
    vehicle: any;
    userId: string;
    onUpdate: (id: string, updates: any) => Promise<void>;
    onDelete: (id: string, userId: string) => Promise<void>;
}) => {
    const [modalVisible, setModalVisible] = useState(false);
    const [editingVehicle, setEditingVehicle] = useState(vehicle);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // Animation values
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(300)).current;

    const openModal = () => {
        setEditingVehicle(vehicle);
        setModalVisible(true);

        // Start animations
        fadeAnim.setValue(0);
        slideAnim.setValue(300);

        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }),
        ]).start();
    };

    const closeModal = () => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 300,
                duration: 200,
                useNativeDriver: true,
            }),
        ]).start(() => {
            setModalVisible(false);
        });
    };

    const handleSave = async () => {
        if (!editingVehicle.make?.trim() || !editingVehicle.model?.trim() || !editingVehicle.plate?.trim()) {
            Alert.alert('Missing Information', 'Please fill in all required fields.');
            return;
        }

        if (!editingVehicle.year || editingVehicle.year < 1900 || editingVehicle.year > new Date().getFullYear() + 1) {
            Alert.alert('Invalid Year', 'Please enter a valid vehicle year.');
            return;
        }

        setIsSaving(true);
        try {
            await onUpdate(vehicle._id, {
                make: editingVehicle.make.trim(),
                model: editingVehicle.model.trim(),
                plate: editingVehicle.plate.trim().toUpperCase(),
                year: editingVehicle.year.toString(),
                color: editingVehicle.color?.trim() || '',
                isDefault: editingVehicle.isDefault || false
            });

            closeModal();
        } catch (error) {
            console.error('Error updating vehicle:', error);
            Alert.alert('Error', 'Failed to update vehicle. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = () => {
        Alert.alert(
            'Delete Vehicle',
            `Are you sure you want to delete your ${vehicle.year} ${vehicle.make} ${vehicle.model}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        setIsDeleting(true);
                        try {
                            await onDelete(vehicle._id, userId);
                            closeModal();
                        } catch (error) {
                            console.error(error);
                        }finally {
                            setIsDeleting(false)
                        }
                    }
                }
            ]
        );
    };

    const handleSetDefault = () => {
        setEditingVehicle(prev => ({
            ...prev,
            isDefault: true
        }));
    };

    return (
        <>
            {/* Vehicle Card */}
            <View style={styles.vehicleCard}>
                <View style={styles.vehicleHeader}>
                    <View style={[
                        styles.vehicleIconContainer,
                        { backgroundColor: vehicle.isDefault ? '#07553820' : '#f8fafc' }
                    ]}>
                        <Ionicons name="car" size={20} color="#075538" />
                    </View>
                    <View style={styles.vehicleInfo}>
                        <Text style={styles.vehicleName}>
                            {vehicle.year} {vehicle.make} {vehicle.model}
                        </Text>
                        <Text style={styles.vehicleDetails}>
                            {vehicle.color} • {vehicle.plate}
                        </Text>
                    </View>
                    {vehicle.isDefault && (
                        <View style={styles.defaultBadge}>
                            <Ionicons name="checkmark-circle" size={12} color="#fff" />
                            <Text style={styles.defaultText}>Default</Text>
                        </View>
                    )}
                </View>
                <TouchableOpacity
                    style={styles.editVehicleButton}
                    onPress={openModal}
                >
                    <Ionicons name="ellipsis-horizontal" size={20} color="#64748b" />
                </TouchableOpacity>
            </View>

            {/* Edit Modal */}
            <Modal
                visible={modalVisible}
                transparent
                animationType="none"
                onRequestClose={closeModal}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                >
                    <Animated.View
                        style={[
                            styles.modalContent,
                            {
                                opacity: fadeAnim,
                                transform: [{ translateY: slideAnim }]
                            }
                        ]}
                    >
                        <TouchableOpacity
                            style={styles.modalCloseButton}
                            onPress={closeModal}
                        >
                            <Ionicons name="close" size={24} color="#64748b" />
                        </TouchableOpacity>

                        <ScrollView
                            style={styles.modalScrollView}
                            showsVerticalScrollIndicator={false}
                        >
                            <View style={styles.modalHeader}>
                                <View style={styles.modalIcon}>
                                    <Ionicons name="car-sport" size={40} color="#075538" />
                                </View>
                                <Text style={styles.modalTitle}>Edit Vehicle</Text>
                                <Text style={styles.modalSubtitle}>
                                    Update your vehicle details
                                </Text>
                            </View>

                            {/* Make */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Make *</Text>
                                <View style={styles.inputContainer}>
                                    <Ionicons name="car" size={20} color="#64748b" style={styles.inputIcon} />
                                    <TextInput
                                        style={styles.textInput}
                                        value={editingVehicle.make}
                                        onChangeText={(text) => setEditingVehicle(prev => ({...prev, make: text}))}
                                        placeholder="e.g., Toyota"
                                        placeholderTextColor="#94a3b8"
                                    />
                                </View>
                            </View>

                            {/* Model */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Model *</Text>
                                <View style={styles.inputContainer}>
                                    <Ionicons name="car-sport" size={20} color="#64748b" style={styles.inputIcon} />
                                    <TextInput
                                        style={styles.textInput}
                                        value={editingVehicle.model}
                                        onChangeText={(text) => setEditingVehicle(prev => ({...prev, model: text}))}
                                        placeholder="e.g., Camry"
                                        placeholderTextColor="#94a3b8"
                                    />
                                </View>
                            </View>

                            {/* Year */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Year *</Text>
                                <View style={styles.inputContainer}>
                                    <Ionicons name="calendar" size={20} color="#64748b" style={styles.inputIcon} />
                                    <TextInput
                                        style={styles.textInput}
                                        value={editingVehicle.year?.toString()}
                                        onChangeText={(text) => setEditingVehicle(prev => ({...prev, year: text}))}
                                        placeholder="e.g., 2020"
                                        placeholderTextColor="#94a3b8"
                                        keyboardType="number-pad"
                                        maxLength={4}
                                    />
                                </View>
                            </View>

                            {/* Color */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Color</Text>
                                <View style={styles.inputContainer}>
                                    <Ionicons name="color-palette" size={20} color="#64748b" style={styles.inputIcon} />
                                    <TextInput
                                        style={styles.textInput}
                                        value={editingVehicle.color}
                                        onChangeText={(text) => setEditingVehicle(prev => ({...prev, color: text}))}
                                        placeholder="e.g., Silver"
                                        placeholderTextColor="#94a3b8"
                                    />
                                </View>
                            </View>

                            {/* License Plate */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>License Plate *</Text>
                                <View style={styles.inputContainer}>
                                    <Ionicons name="document-text" size={20} color="#64748b" style={styles.inputIcon} />
                                    <TextInput
                                        style={styles.textInput}
                                        value={editingVehicle.plate}
                                        onChangeText={(text) => setEditingVehicle(prev => ({...prev, plate: text.toUpperCase()}))}
                                        placeholder="e.g., ABC-123"
                                        placeholderTextColor="#94a3b8"
                                        autoCapitalize="characters"
                                    />
                                </View>
                            </View>

                            {/* Set as Default */}
                            <TouchableOpacity
                                style={[
                                    styles.defaultOption,
                                    editingVehicle.isDefault && styles.defaultOptionActive
                                ]}
                                onPress={handleSetDefault}
                                disabled={editingVehicle.isDefault}
                            >
                                <View style={[
                                    styles.defaultCheckbox,
                                    editingVehicle.isDefault && styles.defaultCheckboxActive
                                ]}>
                                    {editingVehicle.isDefault && (
                                        <Ionicons name="checkmark" size={16} color="#fff" />
                                    )}
                                </View>
                                <View style={styles.defaultOptionText}>
                                    <Text style={styles.defaultOptionTitle}>Set as Default Vehicle</Text>
                                    <Text style={styles.defaultOptionDescription}>
                                        This vehicle will be used for all service requests
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        </ScrollView>

                        {/* Action Buttons */}
                        <View style={styles.modalActions}>
                            <TouchableOpacity
                                style={styles.deleteButton}
                                onPress={handleDelete}
                                disabled={isDeleting}
                            >
                                {isDeleting ? (
                                    <Ionicons name="refresh" size={18} color="#dc2626" style={styles.spinning} />
                                ) : (
                                    <Ionicons name="trash" size={18} color="#dc2626" />
                                )}
                                <Text style={styles.deleteButtonText}>
                                    {isDeleting ? 'Deleting...' : 'Delete Vehicle'}
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
                                onPress={handleSave}
                                disabled={isSaving}
                            >
                                {isSaving ? (
                                    <>
                                        <Ionicons name="refresh" size={18} color="#fff" style={styles.spinning} />
                                        <Text style={styles.saveButtonText}>Saving...</Text>
                                    </>
                                ) : (
                                    <>
                                        <Ionicons name="checkmark" size={18} color="#fff" />
                                        <Text style={styles.saveButtonText}>Save Changes</Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        </View>
                    </Animated.View>
                </TouchableOpacity>
            </Modal>
        </>
    );
};

const styles = StyleSheet.create({
    vehicleCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
        borderLeftWidth: 4,
        borderLeftColor: '#075538',
    },
    vehicleHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    vehicleIconContainer: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
        borderWidth: 2,
        borderColor: '#07553820',
    },
    vehicleInfo: {
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
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#075538',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        marginLeft: 8,
        gap: 4,
    },
    defaultText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#fff',
    },
    editVehicleButton: {
        padding: 8,
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        paddingBottom: Platform.OS === 'ios' ? 40 : 20,
        maxHeight: '85%',
    },
    modalCloseButton: {
        alignSelf: 'flex-end',
        padding: 16,
    },
    modalScrollView: {
        maxHeight: '75%',
    },
    modalHeader: {
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingBottom: 24,
    },
    modalIcon: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#eff6ff',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        borderWidth: 2,
        borderColor: '#07553820',
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1e293b',
        marginBottom: 8,
        textAlign: 'center',
    },
    modalSubtitle: {
        fontSize: 14,
        color: '#64748b',
        textAlign: 'center',
    },
    inputGroup: {
        marginBottom: 16,
        paddingHorizontal: 24,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1e293b',
        marginBottom: 8,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8fafc',
        borderWidth: 2,
        borderColor: '#e2e8f0',
        borderRadius: 12,
    },
    inputIcon: {
        padding: 12,
    },
    textInput: {
        flex: 1,
        padding: 12,
        fontSize: 16,
        color: '#1e293b',
    },
    defaultOption: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        marginHorizontal: 24,
        marginTop: 8,
        backgroundColor: '#f8fafc',
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#e2e8f0',
    },
    defaultOptionActive: {
        backgroundColor: '#07553810',
        borderColor: '#07553830',
    },
    defaultCheckbox: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#cbd5e1',
        marginRight: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    defaultCheckboxActive: {
        backgroundColor: '#075538',
        borderColor: '#075538',
    },
    defaultOptionText: {
        flex: 1,
    },
    defaultOptionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1e293b',
        marginBottom: 4,
    },
    defaultOptionDescription: {
        fontSize: 12,
        color: '#64748b',
    },
    modalActions: {
        flexDirection: 'row',
        paddingHorizontal: 24,
        paddingTop: 24,
        borderTopWidth: 1,
        borderTopColor: '#e2e8f0',
        gap: 12,
    },
    deleteButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        backgroundColor: '#fef2f2',
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#fecaca',
        gap: 8,
    },
    deleteButtonText: {
        color: '#dc2626',
        fontSize: 14,
        fontWeight: '600',
    },
    saveButton: {
        flex: 2,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        backgroundColor: '#075538',
        borderRadius: 12,
        gap: 8,
        shadowColor: '#075538',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    saveButtonDisabled: {
        opacity: 0.7,
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    spinning: {
        transform: [{ rotate: '0deg' }],
    },
});

export default VehicleCard;