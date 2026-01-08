import { socketEvents } from "@/hooks/events-emitter";
import { getSocket } from "@/hooks/socket";
import { useColorScheme } from '@/hooks/use-color-scheme';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import * as Sentry from '@sentry/react-native';
import {router, Stack, usePathname, useRouter} from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import {useEffect, useState} from "react";
import 'react-native-reanimated';
import { ToastProvider } from 'react-native-toast-notifications';
import * as Notifications from "expo-notifications";
import {ActivityIndicator, Platform} from "react-native";
import {ChatManager} from "@/hooks/chat-manager";
import {AuthProvider} from "@/providers/auth-provider";
import {AuthGate} from "@/components/auth-guard";
import * as SecureStore from "expo-secure-store";

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

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        notificationBehavior: 'default',
        shouldShowBanner: true,
        shouldShowList: true
    }),
});

function RootLayout() {
    const colorScheme = useColorScheme();
    const pathname = usePathname();
    const router = useRouter();
    const isMessagingPage = pathname?.startsWith("/messaging");

    const listener = async (msg: any) => {
        console.log("New message from anywhere:", msg);

        await Notifications.scheduleNotificationAsync({
            content: {
                title: msg.mechanic ?? "New Message",
                body: msg.text ?? "You have a new message",
                sound: isMessagingPage ? false : "default",
                channelId: isMessagingPage ? 'silent-messages' : 'default',
                data: {
                    conversationId: msg.conversationId,
                    senderId: msg.senderId,
                },
            },
            trigger: null,
        });

        const chatManager = ChatManager.getInstance();
        await chatManager.addMessage({
            driver: msg?.driver, mechanic: msg?.mechanic, memberB: msg?.senderId,
            conversationId: msg.conversationId as string,
            messageText: msg.text.trim(),
            senderId: msg.senderId,
            isViewing: isMessagingPage,
            isSending: false,
            time: msg.timestamp
        });
    };

    useEffect(() => {
        getSocket();

        socketEvents.on("newMessage", listener);

        return () => {
            socketEvents.off("newMessage", listener);
        };
    }, []);

    useEffect(() => {
        if (Platform.OS === "android") {
            Notifications.setNotificationChannelAsync("messages", {
                name: "Messages",
                importance: Notifications.AndroidImportance.HIGH,
                sound: "default",
            });

            Notifications.setNotificationChannelAsync('silent-messages', {
                name: 'Silent Messages',
                importance: Notifications.AndroidImportance.MIN,
                sound: null,
                bypassDnd: false,
            });
        }
    }, []);

    useEffect(() => {
        (async () => {
            const { status } = await Notifications.getPermissionsAsync();
            if (status !== "granted") {
                await Notifications.requestPermissionsAsync();
            }
        })();

    }, []);

    useEffect(() => {
        const sub = Notifications.addNotificationResponseReceivedListener(
            response => {
                const data = response.notification.request.content.data;

                if (data?.conversationId) {
                    router.push(`/messaging/${data.conversationId}`);
                }
            }
        );

        return () => sub.remove();
    }, []);
    

    return (
        <AuthProvider
        >
                <ToastProvider>
                <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
                    <Stack screenOptions={{ headerShown: false }}>
                        {/* Public routes */}
                        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
                        <AuthGate>
                            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                        </AuthGate>
                    </Stack>
                    <StatusBar style="auto" />
                    </ThemeProvider>
                </ToastProvider>
        </AuthProvider>
    );
}

export default Sentry.wrap(RootLayout);