import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';

export default function WebViewScreen() {
  const { path } = useLocalSearchParams();
  const router = useRouter();
  const url = `https://roadmateassist.co.ke/${path}`;

  const getTitle = () => {
    if (path === 'terms') return 'Terms & Conditions';
    if (path === 'privacy') return 'Privacy Policy';
    if (path === 'help') return 'Help Center';
    return 'Web Page';
  };

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
          {getTitle()}
        </Text>
      </View>

      {/* WebView */}
      <WebView source={{ uri: url }} style={{ flex: 1 }} />
    </SafeAreaView>
  );
}
