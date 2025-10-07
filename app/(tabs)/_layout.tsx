// app/(tabs)/_layout.tsx
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';

export default function TabLayout() {
    return (
        <View style={styles.container}>
            <Tabs
                screenOptions={{
                    headerShown: false,
                    tabBarStyle: styles.tabBar,
                    tabBarBackground: () => <View style={styles.tabBarBackground} />,
                    tabBarShowLabel: true,
                    tabBarActiveTintColor: '#075538',
                    tabBarInactiveTintColor: '#6b7280',
                    tabBarLabelStyle: styles.tabBarLabel,
                }}>

                {/* Home Tab */}
                <Tabs.Screen
                    name="home"
                    options={{
                        title: 'Home',
                        tabBarIcon: ({ focused, color, size }) => (
                            <View style={focused ? styles.iconContainerActive : styles.iconContainer}>
                                <Ionicons
                                    name={focused ? 'home' : 'home-outline'}
                                    size={focused ? 24 : 22}
                                    color={color}
                                />
                            </View>
                        ),
                    }}
                />

                {/* Services Tab */}
                <Tabs.Screen
                    name="discover"
                    options={{
                        title: 'Discover',
                        tabBarIcon: ({ focused, color, size }) => (
                            <View style={focused ? styles.iconContainerActive : styles.iconContainer}>
                                <Ionicons
                                    name={focused ? 'map' : 'map-outline'}
                                    size={focused ? 24 : 22}
                                    color={color}
                                />
                            </View>
                        ),
                    }}
                />

                {/* Emergency Tab - Central prominent button */}
                <Tabs.Screen
                    name="emergency"
                    options={{
                        title: 'Emergency',
                        tabBarIcon: ({ focused, color, size }) => (
                            <View style={focused ? styles.emergencyIconContainerActive : styles.emergencyIconContainer}>
                                <Ionicons
                                    name={focused ? 'warning' : 'warning-outline'}
                                    size={focused ? 28 : 26}
                                    color={focused ? '#fff' : '#ef4444'}
                                />
                            </View>
                        ),
                        tabBarLabel: () => null,
                    }}
                />

                {/* Map Tab */}
                <Tabs.Screen
                    name="messaging"
                    options={{
                        title: 'Messaging',
                        tabBarIcon: ({ focused, color, size }) => (
                            <View style={focused ? styles.iconContainerActive : styles.iconContainer}>
                                <Ionicons
                                    name={focused ? 'chatbox' : 'chatbox-outline'}
                                    size={focused ? 24 : 22}
                                    color={color}
                                />
                            </View>
                        ),
                    }}
                />

                {/* Profile Tab */}
                <Tabs.Screen
                    name="profile"
                    options={{
                        title: 'Profile',
                        tabBarIcon: ({ focused, color, size }) => (
                            <View style={focused ? styles.iconContainerActive : styles.iconContainer}>
                                <Ionicons
                                    name={focused ? 'person' : 'person-outline'}
                                    size={focused ? 24 : 22}
                                    color={color}
                                />
                            </View>
                        ),
                    }}
                />
            </Tabs>

            {/* Curved top border */}
            <View style={styles.curvedBorder} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    tabBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 85,
        backgroundColor: 'transparent',
        borderTopWidth: 0,
        elevation: 0,
        shadowOpacity: 0,
    },
    tabBarBackground: {
        flex: 1,
        backgroundColor: '#ffffff',
        borderTopLeftRadius: 25,
        borderTopRightRadius: 25,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: -4,
        },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 8,
    },
    curvedBorder: {
        position: 'absolute',
        bottom: 85,
        left: 0,
        right: 0,
        height: 20,
        backgroundColor: 'transparent',
        borderTopLeftRadius: 25,
        borderTopRightRadius: 25,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: -2,
        },
        shadowOpacity: 0.05,
        shadowRadius: 8,
    },
    tabBarLabel: {
        fontSize: 12,
        fontWeight: '600',
        marginBottom: 8,
        fontFamily: 'System',
    },
    iconContainer: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 8,
        backgroundColor: 'transparent',
    },
    iconContainerActive: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 5,
        backgroundColor: '#eff6ff',
        shadowColor: '#2563eb',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    emergencyIconContainer: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: -10,
        backgroundColor: '#fff',
        borderWidth: 3,
        borderColor: '#fef2f2',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 8,
    },
    emergencyIconContainerActive: {
        width: 65,
        height: 65,
        borderRadius: 32.5,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: -12,
        backgroundColor: '#ef4444',
        borderWidth: 4,
        borderColor: '#fecaca',
        shadowColor: '#ef4444',
        shadowOffset: {
            width: 0,
            height: 6,
        },
        shadowOpacity: 0.4,
        shadowRadius: 16,
        elevation: 12,
    },
});