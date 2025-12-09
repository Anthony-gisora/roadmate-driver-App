import React, { useRef } from 'react';
import { Platform, View } from 'react-native';
import { WebView } from 'react-native-webview';

interface Props {
  onSelect: (coords: { latitude: number; longitude: number }) => void;
}

const SelectLocationMap: React.FC<Props> = ({ onSelect }) => {
  const webviewRef = useRef<WebView>(null);

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      console.log('Received data from WebView:', data);
      if (data.lat && data.lng) {
        onSelect({ latitude: data.lat, longitude: data.lng });
      }
    } catch (err) {
      console.error('Failed to parse message from WebView', err);
    }
  };

  // Inject JavaScript to setup the ReactNativeWebView object properly
  const injectedJavaScript = `
    window.ReactNativeWebView = window.ReactNativeWebView || {
      postMessage: function(data) {
        window.postMessage(data);
      }
    };
    true; // Important: return true to avoid warning
  `;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
        crossorigin=""/>
      <style>
        html, body, #map { 
          height: 100%; 
          margin: 0; 
          padding: 0; 
          overflow: hidden;
        }
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
          border: none;
          font-size: 16px;
        }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <div class="pin">📍</div>
      <button id="selectBtn">Select Location</button>
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
        integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo="
        crossorigin=""></script>
      <script>
        // Wait for the page to fully load
        document.addEventListener('DOMContentLoaded', function() {
          console.log('DOM loaded, initializing map...');
          
          try {
            // Initialize map with a default location
            const map = L.map('map').setView([-1.2921, 36.8219], 14);
            
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
              attribution: '© OpenStreetMap contributors',
              maxZoom: 19
            }).addTo(map);
            
            // Setup the ReactNativeWebView object
            window.ReactNativeWebView = window.ReactNativeWebView || {
              postMessage: function(data) {
                window.postMessage(data);
              }
            };
            
            document.getElementById('selectBtn').addEventListener('click', function() {
              const center = map.getCenter();
              console.log('Map center:', center);
              
              const message = JSON.stringify({
                lat: center.lat,
                lng: center.lng
              });
              
              console.log('Sending message:', message);
              
              // Try multiple ways to send the message
              if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
                window.ReactNativeWebView.postMessage(message);
              } else if (window.postMessage) {
                window.postMessage(message);
              } else {
                console.error('No postMessage method available');
              }
            });
            
            console.log('Map initialized successfully');
          } catch (error) {
            console.error('Error initializing map:', error);
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
    <View style={{ flex: 1, height: 400 }}>
      <WebView
        ref={webviewRef}
        originWhitelist={['*']}
        source={{
          html,
          baseUrl: 'https://unpkg.com/'
        }}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        mixedContentMode="always"
        allowUniversalAccessFromFileURLs={true}
        allowFileAccess={true}
        allowFileAccessFromFileURLs={true}
        onMessage={handleMessage}
        injectedJavaScript={injectedJavaScript}
        onLoadEnd={() => {
          console.log('WebView loaded');
        }}
        onError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.warn('WebView error: ', nativeEvent);
        }}
        style={{ flex: 1 }}
      />
    </View>
  );
};

export default SelectLocationMap;