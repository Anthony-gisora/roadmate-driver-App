// app/_layout.tsx
import { ClerkProvider, SignedIn, SignedOut } from "@clerk/clerk-expo";
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import * as SecureStore from "expo-secure-store";
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { ToastProvider } from 'react-native-toast-notifications';

import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
    initialRouteName: '/',
};

const tokenCache = {
  async getToken(key: string) {
    try {
      return SecureStore.getItemAsync(key);
    } catch (err) {
      return null;
    }
  },
  async saveToken(key: string, value: string) {
    try {
      return SecureStore.setItemAsync(key, value);
    } catch (err) {
      return;
    }
  },
};

export default function RootLayout() {
    const colorScheme = useColorScheme();

    return (
        <ToastProvider>
            <ClerkProvider
            publishableKey="pk_test_c3RpcnJlZC1tdWRmaXNoLTM2LmNsZXJrLmFjY291bnRzLmRldiQ"
            tokenCache={tokenCache}>
            <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
                <Stack screenOptions={{ headerShown: false }}>
                    {/* Public routes */}
                    <Stack.Screen name="(auth)/index" />

                    {/* Protected routes */}
                    <SignedIn>
                        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                    </SignedIn>

                    {/* Redirect signed out users */}
                    <SignedOut>
                        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
                    </SignedOut>
                </Stack>
                <StatusBar style="auto" />
                </ThemeProvider>
        </ClerkProvider>
        </ToastProvider>
    );
}
