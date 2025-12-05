import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    FlatList,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

const { width } = Dimensions.get('window');

// Mock data for mechanics and services
const MECHANICS_DATA = [
    {
        id: '1',
        name: 'Mike Johnson',
        specialization: 'Tire Specialist',
        rating: 4.8,
        reviews: 127,
        distance: '1.2 km',
        price: '$25',
        availability: 'Available Now',
        image: '👨‍🔧',
        skills: ['Flat Tire Repair', 'Tire Replacement', 'Wheel Alignment'],
        certifications: ['ASE Certified', '5 Years Experience'],
        responseTime: '5-10 min',
        featured: true
    },
    {
        id: '2',
        name: 'Sarah Chen',
        specialization: 'Engine Expert',
        rating: 4.9,
        reviews: 89,
        distance: '2.1 km',
        price: '$60',
        availability: 'Available Now',
        image: '👩‍🔧',
        skills: ['Engine Diagnostics', 'Oil Change', 'Brake Repair'],
        certifications: ['Master Technician', '8 Years Experience'],
        responseTime: '15-20 min',
        featured: true
    },
    {
        id: '3',
        name: 'Carlos Rodriguez',
        specialization: 'Towing & Recovery',
        rating: 4.7,
        reviews: 203,
        distance: '0.8 km',
        price: '$80',
        availability: 'Available Now',
        image: '🚛',
        skills: ['Vehicle Towing', 'Jump Start', 'Lockout Service'],
        certifications: ['CDL Licensed', '10 Years Experience'],
        responseTime: '8-12 min'
    },
    {
        id: '4',
        name: 'Express Auto Care',
        specialization: 'Full Service Garage',
        rating: 4.6,
        reviews: 456,
        distance: '3.5 km',
        price: '$45',
        availability: 'Available Now',
        image: '🏢',
        skills: ['Full Diagnostics', 'AC Repair', 'Electrical Systems'],
        certifications: ['AAA Certified', '24/7 Service'],
        responseTime: '20-25 min'
    },
    {
        id: '5',
        name: 'Quick Fuel Delivery',
        specialization: 'Fuel & Fluid Services',
        rating: 4.5,
        reviews: 78,
        distance: '1.8 km',
        price: '$15',
        availability: 'Available Now',
        image: '⛽',
        skills: ['Fuel Delivery', 'Fluid Top-up', 'Battery Service'],
        certifications: ['Mobile Service', '24/7 Available'],
        responseTime: '10-15 min'
    }
];

const SERVICE_TYPES = [
    { id: 'all', name: 'All Services', icon: 'build' },
    { id: 'tire', name: 'Tire Repair', icon: 'car' },
    { id: 'engine', name: 'Engine', icon: 'settings' },
    { id: 'towing', name: 'Towing', icon: 'trail-sign' },
    { id: 'fuel', name: 'Fuel Delivery', icon: 'flame' },
    { id: 'battery', name: 'Battery', icon: 'battery-charging' },
    { id: 'lock', name: 'Lockout', icon: 'lock-closed' },
];

const FILTER_OPTIONS = [
    { id: 'distance', name: 'Nearest', icon: 'navigate' },
    { id: 'rating', name: 'Top Rated', icon: 'star' },
    { id: 'price', name: 'Best Price', icon: 'cash' },
    { id: 'availability', name: 'Available Now', icon: 'time' },
];

export default function ServicesScreen() {
    const router = useRouter();
    const [activeView, setActiveView] = useState<'list' | 'map'>('list');
    const [selectedService, setSelectedService] = useState('all');
    const [selectedFilter, setSelectedFilter] = useState('distance');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedMechanic, setSelectedMechanic] = useState<any>(null);
    const [showFilters, setShowFilters] = useState(false);
    const [showMechanicModal, setShowMechanicModal] = useState(false);

    const scrollY = useRef(new Animated.Value(0)).current;

    const filteredMechanics = MECHANICS_DATA.filter(mechanic => {
        const matchesService = selectedService === 'all' ||
            mechanic.specialization.toLowerCase().includes(selectedService);
        const matchesSearch = mechanic.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            mechanic.specialization.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesService && matchesSearch;
    }).sort((a, b) => {
        switch (selectedFilter) {
            case 'distance':
                return parseFloat(a.distance) - parseFloat(b.distance);
            case 'rating':
                return b.rating - a.rating;
            case 'price':
                return parseFloat(a.price.slice(1)) - parseFloat(b.price.slice(1));
            case 'availability':
                return a.availability === 'Available Now' ? -1 : 1;
            default:
                return 0;
        }
    });

    const handleBookService = (mechanic: any) => {
        setShowMechanicModal(false);
        router.push({
            pathname: '/booking',
            params: {
                mechanicId: mechanic.id,
                mechanicName: mechanic.name,
                service: mechanic.specialization,
                price: mechanic.price
            }
        });
    };

    const ServiceTypeButton = ({ item }: { item: any }) => (
        <TouchableOpacity
            style={[
                styles.serviceTypeButton,
                selectedService === item.id && styles.serviceTypeButtonActive
            ]}
            onPress={() => setSelectedService(item.id)}
        >
            <Ionicons
                name={item.icon as any}
                size={20}
                color={selectedService === item.id ? '#075538' : '#64748b'}
            />
            <Text style={[
                styles.serviceTypeText,
                selectedService === item.id && styles.serviceTypeTextActive
            ]}>
                {item.name}
            </Text>
        </TouchableOpacity>
    );

    const FilterButton = ({ item }: { item: any }) => (
        <TouchableOpacity
            style={[
                styles.filterButton,
                selectedFilter === item.id && styles.filterButtonActive
            ]}
            onPress={() => setSelectedFilter(item.id)}
        >
            <Ionicons
                name={item.icon as any}
                size={16}
                color={selectedFilter === item.id ? '#fff' : '#64748b'}
            />
            <Text style={[
                styles.filterText,
                selectedFilter === item.id && styles.filterTextActive
            ]}>
                {item.name}
            </Text>
        </TouchableOpacity>
    );

    const MechanicCard = ({ mechanic, index }: { mechanic: any; index: number }) => {
        const translateY = scrollY.interpolate({
            inputRange: [0, 100 * index, 100 * (index + 2)],
            outputRange: [0, 0, 0],
            extrapolate: 'clamp',
        });

        const opacity = scrollY.interpolate({
            inputRange: [0, 100 * index, 100 * (index + 1)],
            outputRange: [1, 1, 1],
            extrapolate: 'clamp',
        });

        return (
            <Animated.View style={{ transform: [{ translateY }], opacity }}>
                <TouchableOpacity
                    style={styles.mechanicCard}
                    onPress={() => {
                        setSelectedMechanic(mechanic);
                        setShowMechanicModal(true);
                    }}
                >
                    <View style={styles.mechanicHeader}>
                        <Text style={styles.mechanicEmoji}>{mechanic.image}</Text>
                        <View style={styles.mechanicInfo}>
                            <Text style={styles.mechanicName}>{mechanic.name}</Text>
                            <Text style={styles.mechanicSpecialization}>{mechanic.specialization}</Text>
                            <View style={styles.ratingContainer}>
                                <Ionicons name="star" size={16} color="#f59e0b" />
                                <Text style={styles.ratingText}>{mechanic.rating}</Text>
                                <Text style={styles.reviewsText}>({mechanic.reviews} reviews)</Text>
                            </View>
                        </View>
                        <View style={styles.priceContainer}>
                            <Text style={styles.priceText}>from {mechanic.price}</Text>
                            <Text style={styles.distanceText}>{mechanic.distance}</Text>
                        </View>
                    </View>

                    <View style={styles.mechanicFooter}>
                        <View style={styles.availabilityBadge}>
                            <Ionicons name="time" size={12} color="#10b981" />
                            <Text style={styles.availabilityText}>{mechanic.responseTime}</Text>
                        </View>
                        <View style={styles.availabilityStatus}>
                            <View style={[styles.statusDot, { backgroundColor: '#10b981' }]} />
                            <Text style={styles.availabilityStatusText}>{mechanic.availability}</Text>
                        </View>
                    </View>

                    {mechanic.featured && (
                        <View style={styles.featuredBadge}>
                            <Ionicons name="flash" size={12} color="#fff" />
                            <Text style={styles.featuredText}>Featured</Text>
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
                    <Text style={styles.title}>Roadside Services</Text>
                    <View style={styles.viewToggle}>
                        <TouchableOpacity
                            style={[styles.viewButton, activeView === 'list' && styles.viewButtonActive]}
                            onPress={() => setActiveView('list')}
                        >
                            <Ionicons
                                name="list"
                                size={20}
                                color={activeView === 'list' ? '#075538' : '#64748b'}
                            />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.viewButton, activeView === 'map' && styles.viewButtonActive]}
                            onPress={() => setActiveView('map')}
                        >
                            <Ionicons
                                name="map"
                                size={20}
                                color={activeView === 'map' ? '#075538' : '#64748b'}
                            />
                        </TouchableOpacity>
                    </View>
                </View>
                <Text style={styles.subtitle}>Find trusted mechanics nearby</Text>

                {/* Search Bar */}
                <View style={styles.searchContainer}>
                    <Ionicons name="search" size={20} color="#64748b" style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search mechanics or services..."
                        placeholderTextColor="#9ca3af"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    <TouchableOpacity
                        style={styles.filterToggle}
                        onPress={() => setShowFilters(!showFilters)}
                    >
                        <Ionicons name="filter" size={20} color="#075538" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Service Types */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.serviceTypesScroll}
                contentContainerStyle={styles.serviceTypesContent}
            >
                {SERVICE_TYPES.map((service) => (
                    <ServiceTypeButton key={service.id} item={service} />
                ))}
            </ScrollView>

            {/* Filters */}
            {showFilters && (
                <View style={styles.filtersContainer}>
                    <Text style={styles.filtersTitle}>Sort by:</Text>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.filtersContent}
                    >
                        {FILTER_OPTIONS.map((filter) => (
                            <FilterButton key={filter.id} item={filter} />
                        ))}
                    </ScrollView>
                </View>
            )}

            {/* Content */}
            {activeView === 'list' ? (
                <FlatList
                    data={filteredMechanics}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item, index }) => <MechanicCard mechanic={item} index={index} />}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.listContent}
                    onScroll={Animated.event(
                        [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                        { useNativeDriver: false }
                    )}
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <Ionicons name="search" size={64} color="#cbd5e1" />
                            <Text style={styles.emptyTitle}>No mechanics found</Text>
                            <Text style={styles.emptyDescription}>
                                Try adjusting your search or filters
                            </Text>
                        </View>
                    }
                />
            ) : (
                <View style={styles.mapContainer}>
                    <View style={styles.mapPlaceholder}>
                        <Ionicons name="map" size={64} color="#cbd5e1" />
                        <Text style={styles.mapTitle}>Map View</Text>
                        <Text style={styles.mapDescription}>
                            {filteredMechanics.length} mechanics near you
                        </Text>
                        <TouchableOpacity style={styles.showListButton} onPress={() => setActiveView('list')}>
                            <Text style={styles.showListText}>Show List View</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}

            {/* Mechanic Detail Modal */}
            <Modal
                visible={showMechanicModal}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={() => setShowMechanicModal(false)}
            >
                {selectedMechanic && (
                    <View style={styles.modalContainer}>
                        <View style={styles.modalHeader}>
                            <TouchableOpacity
                                style={styles.modalCloseButton}
                                onPress={() => setShowMechanicModal(false)}
                            >
                                <Ionicons name="close" size={24} color="#1e293b" />
                            </TouchableOpacity>
                            <Text style={styles.modalTitle}>Mechanic Profile</Text>
                            <View style={styles.modalSpacer} />
                        </View>

                        <ScrollView style={styles.modalContent}>
                            <View style={styles.profileHeader}>
                                <Text style={styles.profileEmoji}>{selectedMechanic.image}</Text>
                                <View style={styles.profileInfo}>
                                    <Text style={styles.profileName}>{selectedMechanic.name}</Text>
                                    <Text style={styles.profileSpecialization}>{selectedMechanic.specialization}</Text>
                                    <View style={styles.profileRating}>
                                        <Ionicons name="star" size={20} color="#f59e0b" />
                                        <Text style={styles.profileRatingText}>{selectedMechanic.rating}</Text>
                                        <Text style={styles.profileReviews}>({selectedMechanic.reviews} reviews)</Text>
                                    </View>
                                </View>
                            </View>

                            <View style={styles.detailSection}>
                                <Text style={styles.sectionTitle}>Skills & Services</Text>
                                <View style={styles.skillsContainer}>
                                    {selectedMechanic.skills.map((skill: string, index: number) => (
                                        <View key={index} style={styles.skillTag}>
                                            <Text style={styles.skillText}>{skill}</Text>
                                        </View>
                                    ))}
                                </View>
                            </View>

                            <View style={styles.detailSection}>
                                <Text style={styles.sectionTitle}>Certifications</Text>
                                {selectedMechanic.certifications.map((cert: string, index: number) => (
                                    <View key={index} style={styles.certificationItem}>
                                        <Ionicons name="checkmark-circle" size={20} color="#10b981" />
                                        <Text style={styles.certificationText}>{cert}</Text>
                                    </View>
                                ))}
                            </View>

                            <View style={styles.detailSection}>
                                <Text style={styles.sectionTitle}>Pricing</Text>
                                <View style={styles.pricingCard}>
                                    <Text style={styles.startingPrice}>Starting from</Text>
                                    <Text style={styles.price}>{selectedMechanic.price}</Text>
                                    <Text style={styles.pricingNote}>Price may vary based on service complexity</Text>
                                </View>
                            </View>

                            <View style={styles.statsContainer}>
                                <View style={styles.stat}>
                                    <Ionicons name="time" size={20} color="#075538" />
                                    <Text style={styles.statValue}>{selectedMechanic.responseTime}</Text>
                                    <Text style={styles.statLabel}>Avg. Response</Text>
                                </View>
                                <View style={styles.stat}>
                                    <Ionicons name="location" size={20} color="#075538" />
                                    <Text style={styles.statValue}>{selectedMechanic.distance}</Text>
                                    <Text style={styles.statLabel}>Distance</Text>
                                </View>
                                <View style={styles.stat}>
                                    <Ionicons name="checkmark-circle" size={20} color="#075538" />
                                    <Text style={styles.statValue}>{selectedMechanic.availability}</Text>
                                    <Text style={styles.statLabel}>Status</Text>
                                </View>
                            </View>
                        </ScrollView>

                        <View style={styles.modalFooter}>
                            <TouchableOpacity
                                style={styles.bookButton}
                                onPress={() => handleBookService(selectedMechanic)}
                            >
                                <Ionicons name="calendar" size={20} color="#fff" />
                                <Text style={styles.bookButtonText}>Book Service</Text>
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
        marginBottom: 16,
    },
    viewToggle: {
        flexDirection: 'row',
        backgroundColor: '#f1f5f9',
        borderRadius: 12,
        padding: 4,
    },
    viewButton: {
        padding: 8,
        borderRadius: 8,
    },
    viewButtonActive: {
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8fafc',
        borderRadius: 12,
        paddingHorizontal: 12,
        borderWidth: 2,
        borderColor: '#e2e8f0',
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        paddingVertical: 12,
        fontSize: 16,
        color: '#1e293b',
    },
    filterToggle: {
        padding: 4,
    },
    serviceTypesScroll: {
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
    },
    serviceTypesContent: {
        paddingHorizontal: 20,
        paddingVertical: 16,
        gap: 12,
    },
    serviceTypeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8fafc',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#e2e8f0',
        gap: 8,
    },
    serviceTypeButtonActive: {
        backgroundColor: '#eff6ff',
        borderColor: '#075538',
    },
    serviceTypeText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#64748b',
    },
    serviceTypeTextActive: {
        color: '#075538',
    },
    filtersContainer: {
        backgroundColor: '#fff',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
    },
    filtersTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#64748b',
        marginLeft: 20,
        marginBottom: 12,
    },
    filtersContent: {
        paddingHorizontal: 20,
        gap: 8,
    },
    filterButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8fafc',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: '#e2e8f0',
        gap: 6,
    },
    filterButtonActive: {
        backgroundColor: '#075538',
        borderColor: '#075538',
    },
    filterText: {
        fontSize: 12,
        fontWeight: '500',
        color: '#64748b',
    },
    filterTextActive: {
        color: '#fff',
    },
    listContent: {
        padding: 20,
        paddingBottom: 100,
    },
    mechanicCard: {
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
    mechanicHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    mechanicEmoji: {
        fontSize: 40,
        marginRight: 12,
    },
    mechanicInfo: {
        flex: 1,
    },
    mechanicName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1e293b',
        marginBottom: 4,
    },
    mechanicSpecialization: {
        fontSize: 14,
        color: '#64748b',
        marginBottom: 6,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    ratingText: {
        marginLeft: 4,
        fontSize: 14,
        fontWeight: '600',
        color: '#1e293b',
    },
    reviewsText: {
        marginLeft: 4,
        fontSize: 12,
        color: '#64748b',
    },
    priceContainer: {
        alignItems: 'flex-end',
    },
    priceText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1e293b',
        marginBottom: 4,
    },
    distanceText: {
        fontSize: 12,
        color: '#64748b',
    },
    mechanicFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    availabilityBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f0fdf4',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        gap: 4,
    },
    availabilityText: {
        fontSize: 12,
        fontWeight: '500',
        color: '#166534',
    },
    availabilityStatus: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    availabilityStatusText: {
        fontSize: 12,
        color: '#64748b',
    },
    featuredBadge: {
        position: 'absolute',
        top: 12,
        right: 12,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f59e0b',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        gap: 4,
    },
    featuredText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#fff',
    },
    mapContainer: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    mapPlaceholder: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#e2e8f0',
    },
    mapTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#475569',
        marginTop: 16,
    },
    mapDescription: {
        fontSize: 14,
        color: '#64748b',
        marginTop: 8,
    },
    showListButton: {
        marginTop: 20,
        backgroundColor: '#075538',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 12,
    },
    showListText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
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
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 20,
        paddingTop: 60,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
    },
    modalCloseButton: {
        padding: 4,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1e293b',
    },
    modalSpacer: {
        width: 32,
    },
    modalContent: {
        flex: 1,
        padding: 20,
    },
    profileHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 16,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    profileEmoji: {
        fontSize: 48,
        marginRight: 16,
    },
    profileInfo: {
        flex: 1,
    },
    profileName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1e293b',
        marginBottom: 4,
    },
    profileSpecialization: {
        fontSize: 16,
        color: '#64748b',
        marginBottom: 8,
    },
    profileRating: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    profileRatingText: {
        marginLeft: 4,
        fontSize: 16,
        fontWeight: '600',
        color: '#1e293b',
    },
    profileReviews: {
        marginLeft: 4,
        fontSize: 14,
        color: '#64748b',
    },
    detailSection: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1e293b',
        marginBottom: 12,
    },
    skillsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    skillTag: {
        backgroundColor: '#eff6ff',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#dbeafe',
    },
    skillText: {
        fontSize: 12,
        fontWeight: '500',
        color: '#075538',
    },
    certificationItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    certificationText: {
        marginLeft: 8,
        fontSize: 14,
        color: '#374151',
    },
    pricingCard: {
        backgroundColor: '#f0fdf4',
        padding: 16,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#bbf7d0',
    },
    startingPrice: {
        fontSize: 14,
        color: '#166534',
        marginBottom: 4,
    },
    price: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#166534',
        marginBottom: 8,
    },
    pricingNote: {
        fontSize: 12,
        color: '#64748b',
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    stat: {
        alignItems: 'center',
    },
    statValue: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#1e293b',
        marginTop: 4,
    },
    statLabel: {
        fontSize: 12,
        color: '#64748b',
        marginTop: 2,
    },
    modalFooter: {
        padding: 20,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#e2e8f0',
    },
    bookButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#075538',
        padding: 16,
        borderRadius: 12,
        gap: 8,
    },
    bookButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});