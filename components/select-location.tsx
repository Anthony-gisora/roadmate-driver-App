import React, { useEffect, useRef } from 'react';
import { View, Platform } from 'react-native';
import { WebView } from 'react-native-webview';

interface Props {
  onSelect: (coords: { latitude: number; longitude: number }) => void;
}

const SelectLocationMap: React.FC<Props> = ({ onSelect }) => {
  const webviewRef = useRef<WebView>(null);

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.lat && data.lng) {
        onSelect({ latitude: data.lat, longitude: data.lng });
      }
    } catch (err) {
      console.error('Failed to parse message from WebView', err);
    }
  };

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <link rel="stylesheet" href="https://unpkg.com/leaflet/dist/leaflet.css" />
      <script src="https://unpkg.com/leaflet/dist/leaflet.js"></script>
      <style>
        html, body, #map { height: 100%; margin: 0; padding: 0; }
        .pin {
          position: absolute;
          top: 50%;
          left: 50%;
          margin-left: -16px;
          margin-top: -32px;
          font-size: 32px;
          pointer-events: none;
          z-index: 1000;
        }
        #selectBtn {
          position: absolute;
          bottom: 20px;
          left: 50%;
          transform: translateX(-50%);
          padding: 12px 20px;
          background: black;
          color: white;
          font-weight: bold;
          border-radius: 8px;
          z-index: 1001;
          cursor: pointer;
        }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <div class="pin">📍</div>
      <div id="selectBtn">Select Location</div>
      <script>
        const map = L.map('map').setView([-1.2921, 36.8219], 14);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors'
        }).addTo(map);

        document.getElementById('selectBtn').addEventListener('click', () => {
          const center = map.getCenter();
        
          try {
            if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                lat: center.lat,
                lng: center.lng
              }));
              console.log('Message sent to React Native');
            } else {
              console.warn('ReactNativeWebView not ready');
            }
          } catch (err) {
            console.error('Failed to post message:', err);
          }
        });

      </script>
    </body>
    </html>
  `;

  if (Platform.OS === 'web') {
    return <iframe title="Select Location" srcDoc={html} style={{ flex: 1, width: '100%', height: '100%', border: 0 }} />;
  }

  return (
      <View style={{ flex: 1 }}>
        <WebView
            ref={webviewRef}
            originWhitelist={['*']}
            source={{ html }}
            onMessage={handleMessage}
        />
      </View>
  );
};

export default SelectLocationMap;
