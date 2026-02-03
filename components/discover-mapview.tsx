import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import React, { useRef, useState } from 'react';
import {
    ActivityIndicator,
    Animated,
    Dimensions,
    Modal,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { WebView } from 'react-native-webview';
import {getLocation} from "@/hooks/location";

const { width, height } = Dimensions.get('window');

interface LocationData {
  lat: number;
  lng: number;
}

interface Technician {
  location: LocationData;
  _id: string;
  clerkUid: string;
  name: string;
  personalNumber: string;
  phone: string;
  isOnline: 'online' | 'offline';
  distance: string;
  data: string[];
}

interface Props {
  technicians: Technician[];
  onTechnicianSelect?: (technician: Technician) => void;
  userLocation?: LocationData;
}

const TechnicianMap: React.FC<Props> = ({
  technicians,
  onTechnicianSelect,
  userLocation = { lat: -1.2921, lng: 36.8219 }
}) => {
  const webviewRef = useRef<WebView>(null);
  const [selectedTechnician, setSelectedTechnician] = useState<Technician | null>(null);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'all' | 'online'>('all');
  const [isModalVisible, setIsModalVisible] = useState(false);

  const sidebarAnimation = useRef(new Animated.Value(-300)).current;
  const modalAnimation = useRef(new Animated.Value(0)).current;

  const filteredTechnicians = selectedTab === 'online'
    ? technicians.filter(t => t.isOnline === 'online')
    : technicians;


  // Generate HTML for the map with markers
  const generateMapHTML = () => {
    const markers = technicians.map(tech => `
      L.marker([${tech?.location?.lat}, ${tech?.location?.lng}], {
        icon: L.divIcon({
          html: \`
            <div class="custom-marker" data-id="${tech._id}">
              <div class="marker-pin ${tech.isOnline}"></div>
              <div class="marker-dot ${tech.isOnline}"></div>
            </div>
          \`,
          className: 'custom-div-icon',
          iconSize: [30, 42],
          iconAnchor: [15, 42]
        })
      })
      .addTo(map)
      .on('click', function() {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'marker_click',
          id: "${tech._id}"
        }));
      });
    `).join('\n');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossorigin=""/>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          html, body, #map {
            width: 100%;
            height: 100%;
            overflow: hidden;
          }
          
          .custom-marker {
            position: relative;
            width: 30px;
            height: 42px;
            cursor: pointer;
            transform-origin: bottom center;
            transition: transform 0.2s;
          }
          
          .custom-marker:hover {
            transform: scale(1.2);
          }
          
          .marker-pin {
            width: 30px;
            height: 30px;
            border-radius: 50% 50% 50% 0;
            background: ${tech => tech.isOnline === 'online' ? '#4CAF50' : '#9E9E9E'};
            position: absolute;
            transform: rotate(-45deg);
            left: 50%;
            top: 0;
            margin-left: -15px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.3);
          }
          
          .marker-pin.online {
            background: linear-gradient(135deg, #4CAF50, #66BB6A);
          }
          
          .marker-pin.offline {
            background: linear-gradient(135deg, #9E9E9E, #BDBDBD);
          }
          
          .marker-dot {
            width: 12px;
            height: 12px;
            border-radius: 50%;
            background: white;
            position: absolute;
            left: 50%;
            top: 8px;
            margin-left: -6px;
            transform: rotate(45deg);
            box-shadow: 0 1px 3px rgba(0,0,0,0.2);
          }
          
          .user-location {
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background: linear-gradient(135deg, #2196F3, #0D47A1);
            border: 3px solid white;
            box-shadow: 0 2px 5px rgba(0,0,0,0.3);
            animation: pulse 2s infinite;
          }
          
          @keyframes pulse {
            0% { box-shadow: 0 0 0 0 rgba(33, 150, 243, 0.7); }
            70% { box-shadow: 0 0 0 10px rgba(33, 150, 243, 0); }
            100% { box-shadow: 0 0 0 0 rgba(33, 150, 243, 0); }
          }
          
          .leaflet-control-zoom {
            border: none !important;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15) !important;
            border-radius: 12px !important;
            overflow: hidden;
          }
          
          .leaflet-bar a {
            background: white !important;
            border-bottom: 1px solid #f0f0f0 !important;
            color: #333 !important;
            font-weight: bold;
            transition: all 0.2s;
          }
          
          .leaflet-bar a:hover {
            background: #f8f8f8 !important;
          }
        </style>
      </head>
      <body>
        <div id="map"></div>
        
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
          integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo="
          crossorigin=""></script>
        
        <script>
          // Initialize map
          const map = L.map('map').setView([${userLocation?.lat}, ${userLocation?.lng}], 12);
          
          // Add tile layer
          L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
            attribution: '© OpenStreetMap, © CartoDB',
            maxZoom: 19,
            subdomains: 'abcd'
          }).addTo(map);
          
          // Add user location marker
          L.marker([${userLocation?.lat}, ${userLocation?.lng}], {
            icon: L.divIcon({
              html: '<div class="user-location"></div>',
              className: 'user-location-icon',
              iconSize: [20, 20],
              iconAnchor: [10, 10]
            })
          }).addTo(map);
          
          // Add technician markers
          ${markers}
          
          // Fit bounds to include all markers
          const bounds = L.latLngBounds([
            [${Math.min(...technicians.map(t => t?.location?.lat))}, ${Math.min(...technicians.map(t => t?.location?.lng))}],
            [${Math.max(...technicians.map(t => t?.location?.lat))}, ${Math.max(...technicians.map(t => t?.location?.lng))}]
          ]);
          
          map.fitBounds(bounds.pad(0.1));
          
          // Notify React Native that map is loaded
          window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'map_loaded' }));
          
          // Setup communication
          window.ReactNativeWebView = window.ReactNativeWebView || {
            postMessage: function(data) {
              window.postMessage(data);
            }
          };
        </script>
      </body>
      </html>
    `;
  };

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);

      if (data.type === 'map_loaded') {
        setMapLoaded(true);
        return;
      }

      if (data.type === 'marker_click') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        const technician = technicians.find(t => t._id === data.id);
        if (technician) {
          setSelectedTechnician(technician);
          setIsModalVisible(true);
          if (onTechnicianSelect) {
            onTechnicianSelect(technician);
          }
        }
      }
    } catch (err) {
      console.error('Failed to parse message:', err);
    }
  };

  const handleTechnicianSelect = (technician: Technician) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedTechnician(technician);
    setIsModalVisible(true);
    if (onTechnicianSelect) {
      onTechnicianSelect(technician);
    }

    // Fly to the selected technician's location
    if (webviewRef.current) {
      webviewRef.current.injectJavaScript(`
        map.flyTo([${technician?.location?.lat}, ${technician?.location?.lng}], 15, {
          duration: 1
        });
      `);
    }
  };

  const toggleSidebar = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (sidebarVisible) {
      Animated.timing(sidebarAnimation, {
        toValue: -300,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setSidebarVisible(false));
    } else {
      setSidebarVisible(true);
      Animated.timing(sidebarAnimation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  };

  const closeModal = () => {
    Animated.timing(modalAnimation, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => setIsModalVisible(false));
  };

  const openModal = () => {
    setIsModalVisible(true);
    Animated.timing(modalAnimation, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const renderTechnicianCard = (technician: Technician) => (
    <TouchableOpacity
      key={technician._id}
      style={[
        styles.technicianCard,
        selectedTechnician?._id === technician._id && styles.selectedCard
      ]}
      onPress={() => handleTechnicianSelect(technician)}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <View style={styles.nameContainer}>
          <Text style={styles.technicianName}>{technician.name}</Text>
          <View style={[
            styles.statusBadge,
            technician.isOnline === 'online' ? styles.onlineBadge : styles.offlineBadge
          ]}>
            <Text style={styles.statusText}>
              {technician.isOnline === 'online' ? '● Online' : '○ Offline'}
            </Text>
          </View>
        </View>
        <Text style={styles.distanceText}>{technician.distance} away</Text>
      </View>

      <View style={styles.cardBody}>
        <View style={styles.contactInfo}>
          <Ionicons name="call-outline" size={16} color="#666" />
          <Text style={styles.phoneText}>{technician.phone}</Text>
        </View>
        <Text style={styles.personalNumber}>ID: {technician.personalNumber}</Text>
      </View>

      <View style={styles.skillsContainer}>
        {technician?.data?.expertise?.map((skill, index) => (
          <View key={index} style={styles.skillTag}>
            <Text style={styles.skillText}>{skill}</Text>
          </View>
        ))}
        {technician?.data?.length > 3 && (
          <View style={styles.moreSkillsTag}>
            <Text style={styles.moreSkillsText}>+{technician.data.length - 3}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderTechnicianModal = () => (
    <Modal
      visible={isModalVisible}
      transparent
      animationType="fade"
      onRequestClose={closeModal}
    >
      <BlurView intensity={80} style={styles.modalOverlay}>
        <TouchableOpacity
          style={styles.modalCloseArea}
          onPress={closeModal}
          activeOpacity={1}
        />
        <Animated.View
          style={[
            styles.modalContent,
            {
              transform: [{
                translateY: modalAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [height, 0]
                })
              }]
            }
          ]}
        >
          {selectedTechnician && (
            <>
              <View style={styles.modalHeader}>
                <View style={styles.modalProfile}>
                  <View style={[
                    styles.modalAvatar,
                    selectedTechnician.isOnline === 'online' ? styles.onlineAvatar : styles.offlineAvatar
                  ]}>
                    <Text style={styles.avatarText}>
                      {selectedTechnician.name.split(' ')?.map(n => n[0]).join('')}
                    </Text>
                  </View>
                  <View>
                    <Text style={styles.modalName}>{selectedTechnician.name}</Text>
                    <View style={[
                      styles.modalStatusBadge,
                      selectedTechnician.isOnline === 'online' ? styles.modalOnlineBadge : styles.modalOfflineBadge
                    ]}>
                      <Text style={styles.modalStatusText}>
                        {selectedTechnician.isOnline === 'online' ? 'Available Now' : 'Currently Offline'}
                      </Text>
                    </View>
                  </View>
                </View>
                <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
                  <Ionicons name="close" size={24} color="#333" />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalBody}>
                <View style={styles.infoSection}>
                  <Text style={styles.sectionTitle}>Contact Information</Text>
                  <View style={styles.infoRow}>
                    <Ionicons name="call-outline" size={20} color="#666" />
                    <Text style={styles.infoText}>{selectedTechnician.phone}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Ionicons name="id-card-outline" size={20} color="#666" />
                    <Text style={styles.infoText}>ID: {selectedTechnician.personalNumber}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Ionicons name="location-outline" size={20} color="#666" />
                    <Text style={styles.infoText}>{selectedTechnician.distance} from your location</Text>
                  </View>
                </View>

                <View style={styles.infoSection}>
                  <Text style={styles.sectionTitle}>Services Offered</Text>
                  <View style={styles.skillsGrid}>
                    {selectedTechnician?.data?.expertise?.map((skill, index) => (
                      <View key={index} style={styles.modalSkillTag}>
                        <Text style={styles.modalSkillText}>{skill}</Text>
                      </View>
                    ))}
                  </View>
                </View>

                <View style={styles.infoSection}>
                  <Text style={styles.sectionTitle}>Location</Text>
                  <View style={styles.mapPreview}>
                    {/* Small map preview could be added here */}
                    <Text style={styles.locationText}>
                      Latitude: {selectedTechnician?.location?.lat.toFixed(4)}
                      {'\n'}
                      Longitude: {selectedTechnician?.location?.lng.toFixed(4)}
                    </Text>
                  </View>
                </View>
              </ScrollView>

              <View style={styles.modalFooter}>
                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    selectedTechnician.isOnline === 'offline' && styles.disabledButton
                  ]}
                  disabled={selectedTechnician.isOnline === 'offline'}
                  onPress={() => {
                    // Handle contact action
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                    closeModal();
                  }}
                >
                  <Ionicons
                    name={selectedTechnician.isOnline === 'online' ? 'chatbubble' : 'chatbubble-outline'}
                    size={20}
                    color="white"
                  />
                  <Text style={styles.actionButtonText}>
                    {selectedTechnician.isOnline === 'online' ? 'Contact Now' : 'Unavailable'}
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </Animated.View>
      </BlurView>
    </Modal>
  );

  if (Platform.OS === 'web') {
    return (
      <View style={styles.container}>
        <iframe
          title="Technician Map"
          srcDoc={generateMapHTML()}
          style={{ flex: 1, width: '100%', height: '100%', border: 0 }}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Main Map View */}
      <View style={styles.mapContainer}>
        {!mapLoaded && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#2196F3" />
            <Text style={styles.loadingText}>Loading Map...</Text>
          </View>
        )}

        <WebView
          ref={webviewRef}
          originWhitelist={['*']}
          source={{ html: generateMapHTML() }}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          mixedContentMode="always"
          allowUniversalAccessFromFileURLs={true}
          allowFileAccess={true}
          allowFileAccessFromFileURLs={true}
          onMessage={handleMessage}
          style={styles.webview}
          onLoadEnd={() => setMapLoaded(true)}
        />
      </View>

      {/* Floating Action Button for Sidebar */}
      <TouchableOpacity
        style={styles.fab}
        onPress={toggleSidebar}
        activeOpacity={0.8}
      >
        <Ionicons name="list" size={24} color="white" />
      </TouchableOpacity>

      {/* Sidebar */}
      {sidebarVisible && (
        <>
          <TouchableOpacity
            style={styles.sidebarOverlay}
            onPress={toggleSidebar}
            activeOpacity={0.5}
          />
          <Animated.View
            style={[
              styles.sidebar,
              { transform: [{ translateX: sidebarAnimation }] }
            ]}
          >
            <View style={styles.sidebarHeader}>
              <Text style={styles.sidebarTitle}>Nearby Technicians</Text>
              <Text style={styles.sidebarSubtitle}>
                {filteredTechnicians.length} available
              </Text>
            </View>

            <View style={styles.tabContainer}>
              <TouchableOpacity
                style={[
                  styles.tab,
                  selectedTab === 'all' && styles.activeTab
                ]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setSelectedTab('all');
                }}
              >
                <Text style={[
                  styles.tabText,
                  selectedTab === 'all' && styles.activeTabText
                ]}>All</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.tab,
                  selectedTab === 'online' && styles.activeTab
                ]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setSelectedTab('online');
                }}
              >
                <View style={styles.tabWithBadge}>
                  <Text style={[
                    styles.tabText,
                    selectedTab === 'online' && styles.activeTabText
                  ]}>Online</Text>
                  <View style={styles.onlineCountBadge}>
                    <Text style={styles.onlineCountText}>
                      {technicians.filter(t => t.isOnline === 'online').length}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.technicianList}>
              {filteredTechnicians?.map(renderTechnicianCard)}
            </ScrollView>
          </Animated.View>
        </>
      )}

      {/* Selected Technician Modal */}
      {renderTechnicianModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  webview: {
    flex: 1,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  fab: {
    position: 'absolute',
    top: 60,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    zIndex: 100,
  },
  sidebarOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 200,
  },
  sidebar: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 300,
    height: '100%',
    backgroundColor: 'white',
    zIndex: 300,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  sidebarHeader: {
    padding: 24,
    paddingTop: 60,
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  sidebarTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  sidebarSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  tabContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#2196F3',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  activeTabText: {
    color: 'white',
  },
  tabWithBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  onlineCountBadge: {
    marginLeft: 6,
    backgroundColor: '#4CAF50',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  onlineCountText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  technicianList: {
    flex: 1,
    padding: 16,
  },
  technicianCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  selectedCard: {
    borderColor: '#2196F3',
    borderWidth: 2,
    backgroundColor: '#f0f7ff',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  nameContainer: {
    flex: 1,
  },
  technicianName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  onlineBadge: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
  },
  offlineBadge: {
    backgroundColor: 'rgba(158, 158, 158, 0.1)',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  distanceText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  cardBody: {
    marginBottom: 12,
  },
  contactInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  phoneText: {
    marginLeft: 6,
    fontSize: 14,
    color: '#666',
  },
  personalNumber: {
    fontSize: 12,
    color: '#999',
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  skillTag: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 6,
    marginBottom: 4,
  },
  skillText: {
    fontSize: 12,
    color: '#1976D2',
    fontWeight: '500',
  },
  moreSkillsTag: {
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  moreSkillsText: {
    fontSize: 12,
    color: '#666',
  },
  modalOverlay: {
    flex: 1,
  },
  modalCloseArea: {
    flex: 1,
  },
  modalContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  modalProfile: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  onlineAvatar: {
    backgroundColor: 'linear-gradient(135deg, #4CAF50, #66BB6A)',
  },
  offlineAvatar: {
    backgroundColor: 'linear-gradient(135deg, #9E9E9E, #BDBDBD)',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '600',
    color: 'white',
  },
  modalName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  modalStatusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  modalOnlineBadge: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
  },
  modalOfflineBadge: {
    backgroundColor: 'rgba(158, 158, 158, 0.1)',
  },
  modalStatusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    padding: 24,
  },
  infoSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    marginLeft: 12,
    fontSize: 15,
    color: '#555',
  },
  skillsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  modalSkillTag: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  modalSkillText: {
    fontSize: 14,
    color: '#1976D2',
    fontWeight: '500',
  },
  mapPreview: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 16,
    height: 100,
    justifyContent: 'center',
  },
  locationText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  modalFooter: {
    padding: 24,
    paddingTop: 0,
  },
  actionButton: {
    backgroundColor: '#2196F3',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    elevation: 4,
  },
  disabledButton: {
    backgroundColor: '#BDBDBD',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default TechnicianMap;