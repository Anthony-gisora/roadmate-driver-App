import { styles } from "@/data/styles";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import * as SecureStore from "expo-secure-store";
import { signInWithCredential, GoogleAuthProvider } from "firebase/auth";
import {auth, EXPO_PUBLIC_FIREBASE_WEB_CLIENT_ID} from "@/hooks/firebase";
import React, { useEffect } from "react";
import { Platform, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";

WebBrowser.maybeCompleteAuthSession();

export const useWarmUpBrowser = () => {
    useEffect(() => {
        if (Platform.OS === "web") return;
        void WebBrowser.warmUpAsync();
        return () => {
            void WebBrowser.coolDownAsync();
        };
    }, []);
};

export default function GoogleAuthButton({ children }: { children: React.ReactNode }) {
    useWarmUpBrowser();
    const router = useRouter();

    const [request, response, promptAsync] = Google.useAuthRequest({
        clientId: EXPO_PUBLIC_FIREBASE_WEB_CLIENT_ID,
    });

    useEffect(() => {
        if (response?.type !== "success") return;

        const { id_token } = response.authentication ?? {};
        if (!id_token) return;

        const credential = GoogleAuthProvider.credential(id_token);

        signInWithCredential(auth, credential)
            .then(async (result) => {
                const token = await result.user.getIdToken();

                // store token for your AuthProvider
                await SecureStore.setItemAsync("auth_token", token);

                router.replace("/home");
            })
            .catch(console.error);
    }, [response]);

    return (
        <TouchableOpacity
            disabled={!request}
            onPress={() => promptAsync()}
            style={styles.button}
        >
            <Text style={styles.buttonText}>{children}</Text>
        </TouchableOpacity>
    );
}
