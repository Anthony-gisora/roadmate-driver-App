import { useAuth } from '@clerk/clerk-expo'
import { Stack } from 'expo-router'

export default function AppLayout() {
    const { isSignedIn } = useAuth()

    return (
        <Stack screenOptions={{ headerShown: false }}>
            {/* Public routes */}
            <Stack.Protected guard={!isSignedIn}>
                <Stack.Screen name="index" />
                <Stack.Screen name="signup" />
                <Stack.Screen name="forgot-password" />
                <Stack.Screen name="verify-email" />
            </Stack.Protected>

            {/* Protected routes */}
            <Stack.Protected guard={isSignedIn!}>
                <Stack.Screen name="(protected)" />
            </Stack.Protected>
        </Stack>
    )
}