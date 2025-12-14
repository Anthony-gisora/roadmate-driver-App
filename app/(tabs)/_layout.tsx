import { useAuth } from "@clerk/clerk-expo";
import { Stack, Redirect } from "expo-router";
import { useEffect, useState } from "react";
import {getSocket} from "@/hooks/socket";
import {socketEvents} from "@/hooks/events-emitter";

export default function AppLayout() {
    const { isSignedIn, isLoaded } = useAuth();
    const [ready, setReady] = useState(false);

    // Wait until Clerk is loaded
    useEffect(() => {
        if (isLoaded) setReady(true);
    }, [isLoaded]);

    if (!ready) return null; // or splash/loading

    // Redirect if not signed in
    if (!isSignedIn) {
        return <Redirect href="/(auth)" />;
    }

    return (
        <Stack screenOptions={{ headerShown: false }}>
            {/* Only render protected screens if signed in */}
            <Stack.Screen name="(protected)" />
        </Stack>
    );
}
