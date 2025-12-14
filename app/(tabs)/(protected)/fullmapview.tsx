import { Ionicons } from '@expo/vector-icons';
import {router, useLocalSearchParams, useRouter} from 'expo-router';
import { Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import LiveMechanicMap from "@/components/locationtile";
import React from "react";

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
                lat={Number(lat) ?? 1.2921}
                lng={Number(lng) ?? 36.8219} />
        </SafeAreaView>
    );
}
