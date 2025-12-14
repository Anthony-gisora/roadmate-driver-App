import React, { useEffect, useRef, useState } from "react";
import { View, StyleSheet, TouchableOpacity, Text } from "react-native";
import { WebView } from "react-native-webview";
import { useNavigation } from "@react-navigation/native";
import io from "socket.io-client";
import {DEFAULT_SOCKET_URL} from "@/hooks/api-client";

type Props = {
    mechanicId: string;
    lat: number;
    lng: number;
};

export default function LiveMechanicMap({ mechanicId, lat, lng }: Props) {
    const navigation = useNavigation<any>();
    const webRef = useRef<WebView>(null);
    const socketRef = useRef<any>(null);

    const [coords, setCoords] = useState({ lat, lng });

    useEffect(() => {
        socketRef.current = io(DEFAULT_SOCKET_URL, { transports: ["websocket"] });

        socketRef.current.emit("trackMechanic", mechanicId);

        socketRef.current.on("mechanicLiveLocation", (data: any) => {
            if (data.mechanicId === mechanicId) {
                setCoords({ lat: data.lat, lng: data.lng });

                webRef.current?.postMessage(
                    JSON.stringify({ lat: data.lat, lng: data.lng })
                );
            }
        });

        return () => {
            socketRef.current.disconnect();
        };
    }, [mechanicId]);

    return (
        <View style={styles.container}>
            <WebView
                ref={webRef}
                originWhitelist={["*"]}
                javaScriptEnabled
                style={styles.map}
                source={{
                    html: leafletHTML(coords.lat, coords.lng),
                }}
            />

            <TouchableOpacity
                style={styles.button}
                onPress={() =>
                    navigation.navigate("fullmapview", {
                        mechanicId,
                        lat: coords.lat,
                        lng: coords.lng,
                    })
                }
            >
                <Text style={styles.buttonText}>Go Fullscreen</Text>
            </TouchableOpacity>
        </View>
    );
}

const leafletHTML = (lat: number, lng: number) => `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link
    rel="stylesheet"
    href="https://unpkg.com/leaflet/dist/leaflet.css"
  />
  <style>
    html, body, #map { height: 100%; margin: 0; }
  </style>
</head>
<body>
  <div id="map"></div>

  <script src="https://unpkg.com/leaflet/dist/leaflet.js"></script>
  <script>
    const map = L.map("map").setView([${lat}, ${lng}], 15);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19
    }).addTo(map);

    const marker = L.marker([${lat}, ${lng}]).addTo(map);

    window.addEventListener("message", (event) => {
      const data = JSON.parse(event.data);
      marker.setLatLng([data.lat, data.lng]);
      map.panTo([data.lat, data.lng]);
    });
  </script>
</body>
</html>
`;


const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    map: {
        flex: 1,
        height: 200
    },
    button: {
        position: "absolute",
        bottom: 16,
        right: 16,
        backgroundColor: "#0d6efd",
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderRadius: 8,
    },
    buttonText: {
        color: "#fff",
        fontWeight: "600",
    },
});
