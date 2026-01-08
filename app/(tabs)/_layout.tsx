import { Stack, Redirect } from "expo-router";
import {useAuth} from "@/providers/auth-provider";

export default function AppLayout() {
    const { authenticated } = useAuth();

    if (!authenticated) {
        return <Redirect href="/(auth)" />;
    }

    return (
        <Stack screenOptions={{ headerShown: false }}>
            {/* Only render protected screens if signed in */}
            <Stack.Screen name="(protected)" />
        </Stack>
    );
}
