import { Stack } from "expo-router";
import { useEffect } from "react";
import {getSocket} from "@/hooks/socket";
import {useAuth} from "@/providers/auth-provider";

export default function AppLayout() {
    const {user} = useAuth();

    useEffect(() => {
        const s = getSocket();
        s.on("connect", () => {
            if(user){
                s.emit("addUser", user?._id);
            }else{
                console.log("User not logged in!");
            }
        });
    }, [user]);

    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(protected)" />
        </Stack>
    );
}
