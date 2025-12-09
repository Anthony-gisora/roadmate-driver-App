import { socketEvents } from "@/hooks/events-emitter";
import { getSocket } from "@/hooks/socket";
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ClerkProvider } from "@clerk/clerk-expo";
import { tokenCache } from '@clerk/clerk-expo/token-cache';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import * as Sentry from '@sentry/react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from "react";
import 'react-native-reanimated';
import { ToastProvider } from 'react-native-toast-notifications';

Sentry.init({
  dsn: 'https://a127ee337dafa3f316ddd8ad74d0bf2e@o4508255508561920.ingest.de.sentry.io/4510504659255376',

  // Adds more context data to events (IP address, cookies, user, etc.)
  // For more information, visit: https://docs.sentry.io/platforms/react-native/data-management/data-collected/
  sendDefaultPii: true,

  // Enable Logs
  enableLogs: true,

  // Configure Session Replay
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1,
  integrations: [Sentry.mobileReplayIntegration(), Sentry.feedbackIntegration()],

  // uncomment the line below to enable Spotlight (https://spotlightjs.com)
  // spotlight: __DEV__,
});

export const unstable_settings = {
    initialRouteName: '/',
};

function RootLayout() {
    const colorScheme = useColorScheme();

    useEffect(() => {
        getSocket();

        const listener = (msg: any) => {
            console.log("New message from anywhere in app:", msg);
        };

        socketEvents.on("newMessage", listener);

        return () => {
            socketEvents.off("newMessage", listener);
        };
    }, []);

    return (
        <ClerkProvider
            publishableKey="pk_test_c3RpcnJlZC1tdWRmaXNoLTM2LmNsZXJrLmFjY291bnRzLmRldiQ"
            tokenCache={tokenCache}>
                <ToastProvider>
                <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
                    <Stack screenOptions={{ headerShown: false }}>
                        {/* Public routes */}
                        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
                    </Stack>
                    <StatusBar style="auto" />
                    </ThemeProvider>
                </ToastProvider>
        </ClerkProvider>
    );
}

export default Sentry.wrap(RootLayout);