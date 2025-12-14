import { useAuth } from "@clerk/clerk-expo";
import { Stack } from "expo-router";
import { useEffect } from "react";
import {getSocket} from "@/hooks/socket";

export default function AppLayout() {
    const {userId} = useAuth();

    useEffect(() => {
        const s = getSocket();
        s.on("connect", () => {
            s.emit("addUser", userId);
        });
    }, []);

    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(protected)" />
        </Stack>
    );
}
