import { useColorScheme } from '@/hooks/use-color-scheme';
import { ClerkProvider } from "@clerk/clerk-expo";
import { tokenCache } from '@clerk/clerk-expo/token-cache'
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { ToastProvider } from 'react-native-toast-notifications';
import {useEffect} from "react";
import {getSocket} from "@/hooks/socket";
import {socketEvents} from "@/hooks/events-emitter";

export const unstable_settings = {
    initialRouteName: '/',
};

export default function RootLayout() {
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
