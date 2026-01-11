import { apiClient } from "@/hooks/api-client";
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Dimensions, Linking, Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useToast } from "react-native-toast-notifications";
import LiveMechanicMap from "@/components/locationtile";
import {useAuth} from "@/providers/auth-provider";

const { width } = Dimensions.get('window');

const emergencyContactRoadside = [
  {
    id: 2,
    name: 'Roadmate Assist',
    phone: '+254753407670',
    relationship: 'Emergency'
  }
];

interface emergencyContact {
  id: number;
  name: string;
  phone: string;
  relationship: string;
}

export default function HomeScreen() {
  const router = useRouter();
  const toast = useToast();
  const [refreshing, setRefreshing] = useState(false);
  const [emergencyContacts, setEmergencyContacts] = useState<emergencyContact[]>(emergencyContactRoadside);
  const [activeService, setActiveService] = useState<any>(null);
  const {user} = useAuth();
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  const userStats = {
    trips: user?.trips,
    memberSince: user?.createdAt,
    savedAmount: user?.amountPaid
  };

  const quickServices = [
    {
      id: '1',
      name: 'Fuel Delivery',
      icon: 'flame',
      color: '#f59e0b',
      description: 'Out of gas? We\'ll bring it to you'
    },
    {
      id: '2',
      name: 'Jump Start',
      icon: 'battery-charging',
      color: '#84cc16',
      description: 'Dead battery? We\'ve got you covered'
    },
    {
      id: '3',
      name: 'Tire Change',
      icon: 'car',
      color: '#ef4444',
      description: 'Flat tire? Quick replacement'
    },
    {
      id: '4',
      name: 'Lockout Service',
      icon: 'lock-closed',
      color: '#8b5cf6',
      description: 'Locked out? We can help'
    }
  ];

  const handlePress = () => {
    router.push({
      pathname: `/messaging/${activeService.mechanicId as string}`,
      params: {
        mechanicName: activeService.mechanic,
        mechanicImage: ""
      }
    });
  };

  useEffect(() => {
    const emergencyC = [{
      id: 10,
      name: user?.emergencyContactName,
      phone: user?.emergencyContactPhone,
      relationship: user?.emergencyContactRelationship,
    }];

    apiClient.get(`/req/requests/${user?._id}`)
        .then((res)=>{
          console.log(res);
          const request = res.data?.data;
          const mechanic = res.data?.mechanic;

          setActiveService({
            id: '1',
            type: request?.requestType,
            mechanic: mechanic?.name,
            status: request?.status,
            eta: request?.eta,
            price: request?.price,
            progress: 75,
            mechanicImage: '👨‍🔧',
            mechanicId: mechanic?.clerkUid,
            distance: mechanic?.distance
          })

          setEmergencyContacts((prev) => {
            const existingIds = new Set(prev.map(c => c.id));
            const newContacts = emergencyC.filter(c => !existingIds.has(c.id));
            return [...prev, ...newContacts];
          });
        })
        .catch((res)=>{
          console.log(res);
          const emergencyC = [{
            id: 10,
            name: user?.emergencyContactName,
            phone: user?.emergencyContactPhone,
            relationship: user?.emergencyContactRelationship
          }];
          setEmergencyContacts((prev) => {
            const existingIds = new Set(prev.map(c => c.id));
            const newContacts = emergencyC.filter(c => !existingIds.has(c.id));
            return [...prev, ...newContacts];
          });
        })
  }, [user]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  const handleQuickService = (service: any) => {
    router.push({
      pathname: '/emergency',
      params: { preSelectedService: service.name }
    });
  };

  const handleNotification = () => {
    router.push({
      pathname: '/notifications',
    });
  }

  const handleEmergency = () => {
    router.push('/emergency');
  };

  const handleCallContact = async (contact: any) => {
    const url =
        Platform.OS === 'android'
            ? `tel:${contact.phone}`
            : `telprompt:${contact.phone}`;

    const supported = await Linking.canOpenURL(url);
    Alert.alert(
        `Call ${contact.name}`,
        `Would you like to call ${contact.phone}?`,
        [
          {text: 'Cancel', style: 'cancel'},
          {
            text: 'Call', onPress: async () => {
              if (supported) {
                await Linking.openURL(url);
              }
            }
          }
        ]
    );
  };

  const parseDate = (date: any) => {
    const memberSinceDate = new Date(date);
    const now = new Date();

    const diffMs = now.getTime() - memberSinceDate.getTime();
    const years = diffMs / (1000 * 60 * 60 * 24 * 365.25);

    return years.toFixed(1);
  }

  const StatCard = ({ value, label, icon, color }: { value: string; label: string; icon: string; color: string }) => (
    <Animated.View 
      style={[
        styles.statCard,
        { 
          opacity: fadeAnim,
          transform: [
            { translateY: slideAnim },
            { scale: scaleAnim }
          ]
        }
      ]}
    >
      <View style={[styles.statIcon, { backgroundColor: `${color}15` }]}>
        <Ionicons name={icon as any} size={24} color={color} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </Animated.View>
  );

  const QuickServiceCard = ({ service }: { service: any }) => (
    <TouchableOpacity 
      style={styles.quickServiceCard}
      onPress={() => handleQuickService(service)}
    >
      <View style={[styles.serviceIcon, { backgroundColor: `${service.color}15` }]}>
        <Ionicons name={service.icon as any} size={28} color={service.color} />
      </View>
      <Text style={styles.serviceName}>{service.name}</Text>
      <Text style={styles.serviceDescription}>{service.description}</Text>
    </TouchableOpacity>
  );

  const EmergencyContactCard = ({ contact }: { contact: any }) => (
    <TouchableOpacity 
      style={styles.contactCard}
      onPress={() => handleCallContact(contact)}
    >
      <View style={styles.contactHeader}>
        <View style={styles.contactIcon}>
          <Ionicons 
            name={contact?.relationship === 'Emergency' ? "warning" : "person"}
            size={20} 
            color="#dc2626" 
          />
        </View>
        <View style={styles.contactInfo}>
          <Text style={styles.contactName}>{contact?.name}</Text>
          <Text style={styles.contactRelationship}>{contact?.relationship}</Text>
        </View>
      </View>
      <Text style={styles.contactPhone}>{contact.phone}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Welcome Header */}
        <Animated.View 
          style={[
            styles.header,
            { 
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <View style={styles.welcomeSection}>
            <View>
              <Text style={styles.title}>Welcome {user?.name}</Text>
              <Text style={styles.subtitle}>Ready to hit the road?</Text>
            </View>
            <TouchableOpacity onPress={handleNotification} style={styles.notificationButton}>
              <Ionicons name="notifications" size={24} color="#1e293b" />
              <View style={styles.notificationBadge} />
            </TouchableOpacity>
          </View>

          {/* Stats Overview */}
          <View style={styles.statsContainer}>
            <StatCard value={`${parseDate(userStats.memberSince)} Yrs`} label="Member" icon="star" color="#f59e0b" />
            <StatCard value={`${user?.trips ?? 0}`} label="Requests" icon="car" color="#2563eb" />
            <StatCard value={`KES ${userStats.savedAmount ?? 0}`} label="Saved" icon="wallet" color="#10b981" />
          </View>
        </Animated.View>

        {/* Emergency Quick Action */}
        <Animated.View 
          style={[
            styles.section,
            { 
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Quick Assistance</Text>
            <Text style={styles.sectionDescription}>Get help when you need it most</Text>
          </View>
          
          <TouchableOpacity 
            style={styles.emergencyCard}
            onPress={handleEmergency}
          >
            <View style={styles.emergencyContent}>
              <View style={styles.emergencyIcon}>
                <Ionicons name="warning" size={32} color="#fff" />
              </View>
              <View style={styles.emergencyText}>
                <Text style={styles.emergencyTitle}>Emergency Assistance</Text>
                <Text style={styles.emergencyDescription}>
                  Immediate help for urgent situations
                </Text>
              </View>
              <Ionicons name="arrow-forward" size={24} color="#fff" />
            </View>
            <View style={styles.emergencyGlow} />
          </TouchableOpacity>
        </Animated.View>

        {/* Active Service */}
        {activeService != null && (
          <Animated.View 
            style={[
              styles.section,
              { 
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Active Service</Text>
              <Text style={styles.sectionDescription}>Your current assistance request</Text>
            </View>
            
            <View style={styles.activeServiceCard}>
              <View style={styles.serviceHeader}>
                <Text style={styles.serviceType}>{activeService.type}</Text>
                <Text style={styles.servicePrice}>{activeService.price}</Text>
              </View>
              
              <View style={styles.mechanicInfoRow}>
                <Text style={styles.mechanicImage}>{activeService.mechanicImage}</Text>
                <View style={styles.mechanicDetails}>
                  <Text style={styles.mechanicName}>{activeService.mechanic}</Text>
                  <Text style={styles.serviceStatus}>{activeService.status}</Text>
                </View>
                <View style={styles.etaBadge}>
                  <Text style={styles.etaText}>ETA: {activeService.eta}</Text>
                </View>
              </View>

              <View style={styles.progressContainer}>
                <LiveMechanicMap
                    mechanicId={activeService?.mechanicId}
                    lat={activeService?.location?.split(',')[0] ?? '1.2921'}
                    lng={activeService?.location?.split(',')[1]?? '36.8219'} />
              </View>

              <View style={styles.serviceActions}>
                <TouchableOpacity onPress={handlePress} style={styles.actionButton}>
                  <Ionicons name="chatbubble" size={20} color="#00ff9d" />
                  <Text style={styles.actionText}>Message Mechanic</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>
        )}

        {/* Quick Services */}
        <Animated.View 
          style={[
            styles.section,
            { 
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Quick Services</Text>
            <Text style={styles.sectionDescription}>Common roadside assistance services</Text>
          </View>
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.quickServicesContainer}
          >
            {quickServices.map(service => (
              <QuickServiceCard key={service.id} service={service} />
            ))}
          </ScrollView>
        </Animated.View>

        {/* Emergency Contacts */}
            <Animated.View
                style={[
                  styles.section,
                  {
                    opacity: fadeAnim,
                    transform: [{ translateY: slideAnim }]
                  }
                ]}
            >
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Emergency Contact</Text>
                <Text style={styles.sectionDescription}>Quick access when needed</Text>
              </View>
              {emergencyContacts != null && (

              <View style={styles.contactsContainer}>
                {emergencyContacts?.map((contact: emergencyContact)  => (
                    <EmergencyContactCard key={contact.id} contact={contact} />
                ))}
              </View>

              )}
            </Animated.View>


        {/* Safety Tips */}
        <Animated.View 
          style={[
            styles.section,
            { 
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <View style={styles.safetyCard}>
            <Ionicons name="shield-checkmark" size={32} color="#075538" />
            <View style={styles.safetyContent}>
              <Text style={styles.safetyTitle}>Safety First</Text>
              <Text style={styles.safetyDescription}>
                Always turn on hazard lights and move to a safe location while waiting for assistance
              </Text>
            </View>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollView: {
    flex: 1,
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
  welcomeSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
  },
  notificationButton: {
    padding: 8,
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#dc2626',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
  },
  section: {
    padding: 20,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#64748b',
  },
  seeAllText: {
    fontSize: 14,
    color: '#075538',
    fontWeight: '500',
  },
  emergencyCard: {
    backgroundColor: '#dc2626',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#dc2626',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
    position: 'relative',
    overflow: 'hidden',
  },
  emergencyContent: {
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 2,
  },
  emergencyIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  emergencyText: {
    flex: 1,
  },
  emergencyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  emergencyDescription: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  emergencyGlow: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  activeServiceCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  serviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  serviceType: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  servicePrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#10b981',
  },
  mechanicInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  mechanicImage: {
    fontSize: 32,
    marginRight: 12,
  },
  mechanicDetails: {
    flex: 1,
  },
  mechanicName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 2,
  },
  serviceStatus: {
    fontSize: 14,
    color: '#64748b',
  },
  etaBadge: {
    backgroundColor: '#eff6ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  etaText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#075538',
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressBackground: {
    height: 6,
    backgroundColor: '#e2e8f0',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10b981',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
  },
  serviceActions: {
    backgroundColor: '#fff',
    borderRadius: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#00ff9d',
    borderRadius: 12,
  },
  actionText: {
    fontSize: 12,
    color: '#075538',
    marginTop: 4,
    fontWeight: '500',
  },
  quickServicesContainer: {
    gap: 8,
    paddingStart: 8,
  },
  quickServiceCard: {
    width: 140,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    marginRight: 12,
    marginBottom: 12,
    marginTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  serviceIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  serviceDescription: {
    fontSize: 12,
    color: '#64748b',
    lineHeight: 16,
  },
  mechanicsContainer: {
    gap: 12,
  },
  mechanicCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  mechanicInfo: {
    flex: 1,
    marginLeft: 12,
  },
  mechanicName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 2,
  },
  mechanicSpecialization: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 6,
  },
  mechanicStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  ratingText: {
    marginLeft: 4,
    fontSize: 12,
    fontWeight: '500',
    color: '#1e293b',
  },
  distanceText: {
    fontSize: 12,
    color: '#64748b',
  },
  availabilityBadge: {
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  availabilityText: {
    fontSize: 10,
    fontWeight: '500',
    color: '#166534',
  },
  contactsContainer: {
    gap: 12,
  },
  contactCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  contactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  contactIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fef2f2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 2,
  },
  contactRelationship: {
    fontSize: 14,
    color: '#64748b',
  },
  contactPhone: {
    fontSize: 14,
    color: '#075538',
    fontWeight: '500',
  },
  safetyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  safetyContent: {
    flex: 1,
    marginLeft: 16,
  },
  safetyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  safetyDescription: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
  },
});