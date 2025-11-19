import React, { useEffect, useRef } from 'react';
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
      if (data.lat && data.lng) {
        onSelect({ latitude: data.lat, longitude: data.lng });
      }
    } catch (err) {
      console.error("Failed to parse message from WebView", err);
    }
  };

  // HTML for the map
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="initial-scale=1.0, width=device-width" />
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
          cursor: pointer;
          z-index: 10;
        }
      </style>
      <script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyAGxso4wjswucd6jqwl"></script>
    </head>
    <body>
      <div id="map"></div>
      <div class="pin">📍</div>
      <div id="selectBtn">Select Location</div>
      <script>
        const map = new google.maps.Map(document.getElementById('map'), {
          center: { lat: -1.2921, lng: 36.8219 },
          zoom: 14,
        });

        document.getElementById('selectBtn').addEventListener('click', () => {
          const center = map.getCenter();
          if (window.ReactNativeWebView) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              lat: center.lat(),
              lng: center.lng()
            }));
          } else {
            const event = new CustomEvent('locationSelected', {
              detail: { lat: center.lat(), lng: center.lng() }
            });
            window.dispatchEvent(event);
          }
        });
      </script>
    </body>
    </html>
  `;

  // Listen for web events unconditionally
  useEffect(() => {
    if (Platform.OS === 'web') {
      const handleWebSelect = (e: any) => {
        const { lat, lng } = e.detail;
        onSelect({ latitude: lat, longitude: lng });
      };
      window.addEventListener('locationSelected', handleWebSelect);
      return () => window.removeEventListener('locationSelected', handleWebSelect);
    }
  }, [onSelect]);

  // Render for web
  if (Platform.OS === 'web') {
    return (
      <iframe
        title="Select Location"
        srcDoc={html}
        style={{ flex: 1, width: '100%', height: '100%', border: 0 }}
      />
    );
  }

  // Render for mobile (iOS/Android)
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
