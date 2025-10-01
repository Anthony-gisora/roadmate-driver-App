// app/login.tsx
import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Animated
} from "react-native";
import { useRouter } from "expo-router";
import { z } from "zod";
import { Ionicons } from "@expo/vector-icons";

const loginSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

export default function Login() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
    const [isLoading, setIsLoading] = useState(false);
    const [secureTextEntry, setSecureTextEntry] = useState(true);

    // Animation values
    const fadeAnim = React.useRef(new Animated.Value(0)).current;
    const slideAnim = React.useRef(new Animated.Value(50)).current;

    React.useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 600,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    const handleLogin = async () => {
        const result = loginSchema.safeParse({ email, password });
        if (!result.success) {
            const fieldErrors: Record<string, string> = {};
            result.error.errors.forEach((err) => {
                if (err.path[0]) {
                    fieldErrors[err.path[0]] = err.message;
                }
            });
            setErrors(fieldErrors);
            return;
        }

        // Clear errors
        setErrors({});
        setIsLoading(true);

        // Simulate API call
        setTimeout(() => {
            setIsLoading(false);
            router.replace("(tabs)/emergency");
        }, 1500);
    };

    const handleForgotPassword = () => {
        router.push('/forgot-password');
    };

    const handleSocialLogin = (provider: string) => {
        Alert.alert("Social Login", `${provider} login would be implemented here`);
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
            <ScrollView
                contentContainerStyle={styles.scrollContainer}
                showsVerticalScrollIndicator={false}
            >
                {/* Header Section */}
                <Animated.View
                    style={[
                        styles.header,
                        {
                            opacity: fadeAnim,
                            transform: [{ translateY: slideAnim }]
                        }
                    ]}
                >
                    <View style={styles.logoContainer}>
                        <Ionicons name="car-sport" size={60} color="#2563eb" />
                    </View>
                    <Text style={styles.title}>Welcome Back!</Text>
                    <Text style={styles.subtitle}>
                        Sign in to access your driver assistance services
                    </Text>
                </Animated.View>

                {/* Form Section */}
                <Animated.View
                    style={[
                        styles.formContainer,
                        {
                            opacity: fadeAnim,
                            transform: [{ translateY: slideAnim }]
                        }
                    ]}
                >
                    {/* Email Input */}
                    <View style={styles.inputContainer}>
                        <Ionicons name="mail-outline" size={20} color="#6b7280" style={styles.inputIcon} />
                        <TextInput
                            style={[styles.input, errors.email && styles.errorInput]}
                            placeholder="Enter your email"
                            placeholderTextColor="#9ca3af"
                            value={email}
                            onChangeText={(text) => {
                                setEmail(text);
                                if (errors.email) setErrors({ ...errors, email: undefined });
                            }}
                            autoCapitalize="none"
                            keyboardType="email-address"
                        />
                    </View>
                    {errors.email && (
                        <View style={styles.errorContainer}>
                            <Ionicons name="warning-outline" size={14} color="#ef4444" />
                            <Text style={styles.errorText}>{errors.email}</Text>
                        </View>
                    )}

                    {/* Password Input */}
                    <View style={styles.inputContainer}>
                        <Ionicons name="lock-closed-outline" size={20} color="#6b7280" style={styles.inputIcon} />
                        <TextInput
                            style={[styles.input, errors.password && styles.errorInput]}
                            placeholder="Enter your password"
                            placeholderTextColor="#9ca3af"
                            value={password}
                            onChangeText={(text) => {
                                setPassword(text);
                                if (errors.password) setErrors({ ...errors, password: undefined });
                            }}
                            secureTextEntry={secureTextEntry}
                        />
                        <TouchableOpacity
                            style={styles.eyeIcon}
                            onPress={() => setSecureTextEntry(!secureTextEntry)}
                        >
                            <Ionicons
                                name={secureTextEntry ? "eye-outline" : "eye-off-outline"}
                                size={20}
                                color="#6b7280"
                            />
                        </TouchableOpacity>
                    </View>
                    {errors.password && (
                        <View style={styles.errorContainer}>
                            <Ionicons name="warning-outline" size={14} color="#ef4444" />
                            <Text style={styles.errorText}>{errors.password}</Text>
                        </View>
                    )}

                    {/* Forgot Password */}
                    <TouchableOpacity
                        style={styles.forgotPasswordContainer}
                        onPress={handleForgotPassword}
                    >
                        <Text style={styles.forgotPasswordText}>Forgot your password?</Text>
                    </TouchableOpacity>

                    {/* Login Button */}
                    <TouchableOpacity
                        style={[styles.button, isLoading && styles.buttonDisabled]}
                        onPress={handleLogin}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <View style={styles.loadingContainer}>
                                <Ionicons name="refresh" size={20} color="#fff" style={styles.spinning} />
                                <Text style={styles.buttonText}>Signing in...</Text>
                            </View>
                        ) : (
                            <View style={styles.buttonContent}>
                                <Text style={styles.buttonText}>Sign In</Text>
                                <Ionicons name="arrow-forward" size={20} color="#fff" />
                            </View>
                        )}
                    </TouchableOpacity>

                    {/* Divider */}
                    <View style={styles.divider}>
                        <View style={styles.dividerLine} />
                        <Text style={styles.dividerText}>or continue with</Text>
                        <View style={styles.dividerLine} />
                    </View>

                    {/* Social Login Options */}
                    <View style={styles.socialContainer}>
                        <TouchableOpacity
                            style={[styles.socialButton, styles.googleButton]}
                            onPress={() => handleSocialLogin("Google")}
                        >
                            <Ionicons name="logo-google" size={20} color="#DB4437" />
                            <Text style={styles.socialButtonText}>Google</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.socialButton, styles.appleButton]}
                            onPress={() => handleSocialLogin("Apple")}
                        >
                            <Ionicons name="logo-apple" size={20} color="#000" />
                            <Text style={styles.socialButtonText}>Apple</Text>
                        </TouchableOpacity>
                    </View>
                </Animated.View>

                {/* Sign Up Link */}
                <View style={styles.footer}>
                    <Text style={styles.footerText}>Don&apos;t have an account? </Text>
                    <TouchableOpacity onPress={() => router.push('/signup')}>
                        <Text style={styles.signUpText}>Sign up now</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f8fafc",
    },
    scrollContainer: {
        flexGrow: 1,
        justifyContent: "center",
        padding: 24,
    },
    header: {
        alignItems: "center",
        marginBottom: 40,
    },
    logoContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: "#eff6ff",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 20,
        shadowColor: "#2563eb",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
    },
    title: {
        fontSize: 32,
        fontWeight: "bold",
        marginBottom: 8,
        textAlign: "center",
        color: "#1e293b",
    },
    subtitle: {
        fontSize: 16,
        textAlign: "center",
        color: "#64748b",
        lineHeight: 22,
    },
    formContainer: {
        backgroundColor: "#fff",
        borderRadius: 20,
        padding: 24,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 16,
        elevation: 5,
    },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#e2e8f0",
        borderRadius: 12,
        marginBottom: 8,
        backgroundColor: "#f8fafc",
    },
    inputIcon: {
        padding: 12,
    },
    input: {
        flex: 1,
        padding: 12,
        fontSize: 16,
        color: "#1e293b",
    },
    eyeIcon: {
        padding: 12,
    },
    errorInput: {
        borderColor: "#ef4444",
    },
    errorContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 12,
        marginLeft: 4,
    },
    errorText: {
        color: "#ef4444",
        fontSize: 12,
        marginLeft: 4,
    },
    forgotPasswordContainer: {
        alignSelf: "flex-end",
        marginBottom: 20,
    },
    forgotPasswordText: {
        color: "#2563eb",
        fontSize: 14,
        fontWeight: "500",
    },
    button: {
        backgroundColor: "#2563eb",
        padding: 16,
        borderRadius: 12,
        marginBottom: 20,
        shadowColor: "#2563eb",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    buttonContent: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
    },
    loadingContainer: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
    },
    spinning: {
        transform: [{ rotate: "0deg" }],
        marginRight: 8,
    },
    buttonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
        marginRight: 8,
    },
    divider: {
        flexDirection: "row",
        alignItems: "center",
        marginVertical: 20,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: "#e2e8f0",
    },
    dividerText: {
        marginHorizontal: 12,
        color: "#64748b",
        fontSize: 14,
    },
    socialContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        gap: 12,
    },
    socialButton: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#e2e8f0",
    },
    googleButton: {
        backgroundColor: "#fff",
    },
    appleButton: {
        backgroundColor: "#fff",
    },
    socialButtonText: {
        marginLeft: 8,
        fontSize: 14,
        fontWeight: "500",
        color: "#374151",
    },
    footer: {
        flexDirection: "row",
        justifyContent: "center",
        marginTop: 24,
    },
    footerText: {
        color: "#64748b",
        fontSize: 14,
    },
    signUpText: {
        color: "#2563eb",
        fontSize: 14,
        fontWeight: "600",
    },
});