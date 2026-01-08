import { View, ActivityIndicator } from "react-native";
import { Redirect } from "expo-router";
import { useAuth } from "@/providers/auth-provider";

export function AuthGate({ children }: { children: React.ReactNode }) {
    const { authenticated, loading } = useAuth();

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    if (!authenticated) {
        return <Redirect href="/(auth)" />;
    }

    return <>{children}</>;
}
