import LiveMechanicMap from "@/components/locationtile";
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React from "react";
import { Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function FullMapView() {
    const { mechanicId, lat, lng } = useLocalSearchParams();

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#075538' }}>
            {/* Header */}
            <View
                style={{
                    height: 60,
                    backgroundColor: '#075538',
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingHorizontal: 15,
                    elevation: 4,
                }}
            >
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>

                <Text
                    style={{
                        color: '#fff',
                        fontSize: 18,
                        fontWeight: 'bold',
                        marginLeft: 15,
                    }}
                >
                    Live Location Update
                </Text>
            </View>

            {/* MapView */}
            <LiveMechanicMap
                mechanicId={mechanicId as string}
                lat={Number(lat)}
                lng={Number(lng)} />
        </SafeAreaView>
    );
}
