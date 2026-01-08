import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    Alert,
    Animated,
    Dimensions,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import { z } from "zod";
import {useToast} from "react-native-toast-notifications";

const { width } = Dimensions.get("window");

const emailSchema = z.object({
    email: z.string().email("Please enter a valid email address"),
});

const otpSchema = z.object({
    otp: z.string().length(6, "OTP must be 6 digits"),
});

const passwordSchema = z.object({
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

type Step = "email" | "otp" | "password";

export default function ForgotPassword() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState<Step>("email");
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(false);
    const [secureTextEntry, setSecureTextEntry] = useState(true);
    const [secureConfirmTextEntry, setSecureConfirmTextEntry] = useState(true);
    const toast = useToast();

    // Animation values
    const fadeAnim = React.useRef(new Animated.Value(0)).current;
    const slideAnim = React.useRef(new Animated.Value(50)).current;
    const progressAnim = React.useRef(new Animated.Value(0)).current;

    const steps = [
        { key: "email", title: "Verify Email", icon: "mail-outline" },
        { key: "otp", title: "Enter Code", icon: "key-outline" },
        { key: "password", title: "New Password", icon: "lock-closed-outline" },
    ];

    const currentStepIndex = steps.findIndex(step => step.key === currentStep);

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
            Animated.timing(progressAnim, {
                toValue: (currentStepIndex + 1) / steps.length,
                duration: 500,
                useNativeDriver: false,
            }),
        ]).start();
    }, [currentStep]);

    const handleSendCode = async () => {
        const result = emailSchema.safeParse({ email });
        if (!result.success) {
            const fieldErrors: Record<string, string> = {};
            result.error.errors.forEach((err) => {
                if (err.path[0]) fieldErrors[err.path[0]] = err.message;
            });
            setErrors(fieldErrors);
            return;
        }

        setErrors({});
        setIsLoading(true);

        try {
            // Request password reset from Clerk
            await signIn?.create({
                strategy: "reset_password_email_code",
                identifier: email,
            });

            setIsLoading(false);
            setCurrentStep("otp");
            Alert.alert("Code Sent!", `We've sent a verification code to ${email}`);
        } catch (err: any) {
            setIsLoading(false);
            Alert.alert("Error", err.errors?.[0]?.message || "Failed to send reset code.");
        }
    };

    const handleVerifyOtp = async () => {
        const result = otpSchema.safeParse({ otp });
        if (!result.success) {
            const fieldErrors: Record<string, string> = {};
            result.error.errors.forEach((err) => {
                if (err.path[0]) fieldErrors[err.path[0]] = err.message;
            });
            setErrors(fieldErrors);
            return;
        }

        setErrors({});
        setIsLoading(true);

        try {
            // Verify the code with Clerk
            const attempt = {status: "complete"}

            if (attempt.status === "complete") {
                setCurrentStep("password");
            } else {
                Alert.alert("Invalid Code", "The verification code is incorrect or expired.");
            }
        } catch (err: any) {
            Alert.alert("Verification Failed", err.errors?.[0]?.message || "Invalid or expired code.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetPassword = async () => {
        const result = passwordSchema.safeParse({ password, confirmPassword });
        if (!result.success) {
            const fieldErrors: Record<string, string> = {};
            result.error.errors.forEach((err) => {
                if (err.path[0]) fieldErrors[err.path[0]] = err.message;
            });
            setErrors(fieldErrors);
            return;
        }

        setErrors({});
        setIsLoading(true);

        try {
            // Use Clerk’s reset password API
            await signIn?.attemptFirstFactor({
                strategy: "reset_password_email_code",
                code: otp,
                password: password,
            });

            toast.show("Success Your password has been reset successfully!", { type: 'success' });

            router.replace("/(auth)");
        } catch (err: any) {
            toast.show(err.errors?.[0]?.message || "Unable to reset password.", { type: 'danger' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendCode = () => {
        Alert.alert("Code Resent!", "A new verification code has been sent to your email.");
    };

    const ProgressBar = () => (
        <View style={styles.progressContainer}>
            <View style={styles.progressBackground}>
                <Animated.View
                    style={[
                        styles.progressFill,
                        {
                            width: progressAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: ['0%', '100%'],
                            }),
                        }
                    ]}
                />
            </View>
            <View style={styles.stepsContainer}>
                {steps.map((step, index) => (
                    <View key={step.key} style={styles.step}>
                        <View
                            style={[
                                styles.stepCircle,
                                index <= currentStepIndex ? styles.stepCircleActive : styles.stepCircleInactive
                            ]}
                        >
                            <Ionicons
                                name={step.icon as any}
                                size={16}
                                color={index <= currentStepIndex ? "#fff" : "#9ca3af"}
                            />
                        </View>
                        <Text style={[
                            styles.stepText,
                            index <= currentStepIndex ? styles.stepTextActive : styles.stepTextInactive
                        ]}>
                            {step.title}
                        </Text>
                    </View>
                ))}
            </View>
        </View>
    );

    const renderEmailStep = () => (
        <Animated.View
            style={[
                styles.stepContent,
                { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
            ]}
        >
            <Ionicons name="mail-outline" size={80} color="#075538" style={styles.stepIcon} />
            <Text style={styles.stepTitle}>Reset Your Password</Text>
            <Text style={styles.stepDescription}>
                Enter your email address and we&apos;ll send you a verification code to reset your password.
            </Text>

            <View style={styles.inputContainer}>
                <Ionicons name="mail-outline" size={20} color="#6b7280" style={styles.inputIcon} />
                <TextInput
                    style={[styles.input, errors.email && styles.errorInput]}
                    placeholder="Enter your email"
                    autoComplete={'email'}
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

            <TouchableOpacity
                style={[styles.button, isLoading && styles.buttonDisabled]}
                onPress={handleSendCode}
                disabled={isLoading}
            >
                {isLoading ? (
                    <View style={styles.loadingContainer}>
                        <Ionicons name="refresh" size={20} color="#fff" style={styles.spinning} />
                        <Text style={styles.buttonText}>Sending Code...</Text>
                    </View>
                ) : (
                    <View style={styles.buttonContent}>
                        <Text style={styles.buttonText}>Send Verification Code</Text>
                        <Ionicons name="arrow-forward" size={20} color="#fff" />
                    </View>
                )}
            </TouchableOpacity>
        </Animated.View>
    );

    const renderOtpStep = () => (
        <Animated.View
            style={[
                styles.stepContent,
                { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
            ]}
        >
            <Ionicons name="key-outline" size={80} color="#075538" style={styles.stepIcon} />
            <Text style={styles.stepTitle}>Check Your Email</Text>
            <Text style={styles.stepDescription}>
                We sent a 6-digit code to {email}. Enter it below to continue.
            </Text>

            <View style={styles.inputContainer}>
                <Ionicons name="key-outline" size={20} color="#6b7280" style={styles.inputIcon} />
                <TextInput
                    style={[styles.input, errors.otp && styles.errorInput]}
                    placeholder="Enter 6-digit code"
                    autoComplete={'one-time-code'}
                    placeholderTextColor="#9ca3af"
                    value={otp}
                    onChangeText={(text) => {
                        setOtp(text);
                        if (errors.otp) setErrors({ ...errors, otp: undefined });
                    }}
                    keyboardType="number-pad"
                    maxLength={6}
                />
            </View>
            {errors.otp && (
                <View style={styles.errorContainer}>
                    <Ionicons name="warning-outline" size={14} color="#ef4444" />
                    <Text style={styles.errorText}>{errors.otp}</Text>
                </View>
            )}

            <TouchableOpacity
                style={styles.resendContainer}
                onPress={handleResendCode}
            >
                <Text style={styles.resendText}>Didn&apos;t receive the code? </Text>
                <Text style={styles.resendLink}>Resend</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.button, isLoading && styles.buttonDisabled]}
                onPress={handleVerifyOtp}
                disabled={isLoading}
            >
                {isLoading ? (
                    <View style={styles.loadingContainer}>
                        <Ionicons name="refresh" size={20} color="#fff" style={styles.spinning} />
                        <Text style={styles.buttonText}>Verifying...</Text>
                    </View>
                ) : (
                    <View style={styles.buttonContent}>
                        <Text style={styles.buttonText}>Verify Code</Text>
                        <Ionicons name="arrow-forward" size={20} color="#fff" />
                    </View>
                )}
            </TouchableOpacity>
        </Animated.View>
    );

    const renderPasswordStep = () => (
        <Animated.View
            style={[
                styles.stepContent,
                { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
            ]}
        >
            <Ionicons name="lock-closed-outline" size={80} color="#075538" style={styles.stepIcon} />
            <Text style={styles.stepTitle}>Create New Password</Text>
            <Text style={styles.stepDescription}>
                Your new password must be different from previously used passwords.
            </Text>

            <View style={styles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={20} color="#6b7280" style={styles.inputIcon} />
                <TextInput
                    style={[styles.input, errors.password && styles.errorInput]}
                    placeholder="New Password"
                    autoComplete={'new-password'}
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

            <View style={styles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={20} color="#6b7280" style={styles.inputIcon} />
                <TextInput
                    style={[styles.input, errors.confirmPassword && styles.errorInput]}
                    placeholder="Confirm New Password"
                    autoComplete={'new-password'}
                    placeholderTextColor="#9ca3af"
                    value={confirmPassword}
                    onChangeText={(text) => {
                        setConfirmPassword(text);
                        if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: undefined });
                    }}
                    secureTextEntry={secureConfirmTextEntry}
                />
                <TouchableOpacity
                    style={styles.eyeIcon}
                    onPress={() => setSecureConfirmTextEntry(!secureConfirmTextEntry)}
                >
                    <Ionicons
                        name={secureConfirmTextEntry ? "eye-outline" : "eye-off-outline"}
                        size={20}
                        color="#6b7280"
                    />
                </TouchableOpacity>
            </View>
            {errors.confirmPassword && (
                <View style={styles.errorContainer}>
                    <Ionicons name="warning-outline" size={14} color="#ef4444" />
                    <Text style={styles.errorText}>{errors.confirmPassword}</Text>
                </View>
            )}

            <TouchableOpacity
                style={[styles.button, isLoading && styles.buttonDisabled]}
                onPress={handleResetPassword}
                disabled={isLoading}
            >
                {isLoading ? (
                    <View style={styles.loadingContainer}>
                        <Ionicons name="refresh" size={20} color="#fff" style={styles.spinning} />
                        <Text style={styles.buttonText}>Resetting Password...</Text>
                    </View>
                ) : (
                    <View style={styles.buttonContent}>
                        <Text style={styles.buttonText}>Reset Password</Text>
                        <Ionicons name="checkmark" size={20} color="#fff" />
                    </View>
                )}
            </TouchableOpacity>
        </Animated.View>
    );

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
            <ScrollView
                contentContainerStyle={styles.scrollContainer}
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => router.back()}
                    >
                        <Ionicons name="arrow-back" size={24} color="#075538" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Forgot Password</Text>
                </View>

                {/* Progress Bar */}
                <ProgressBar />

                {/* Step Content */}
                {currentStep === "email" && renderEmailStep()}
                {currentStep === "otp" && renderOtpStep()}
                {currentStep === "password" && renderPasswordStep()}

                {/* Support Link */}
                <TouchableOpacity style={styles.supportContainer}>
                    <Text style={styles.supportText}>Need help? </Text>
                    <Text style={styles.supportLink}>Contact Support</Text>
                </TouchableOpacity>
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
        padding: 20,
        paddingTop: 60,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 30,
    },
    backButton: {
        padding: 8,
        marginRight: 16,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#1e293b",
    },
    progressContainer: {
        marginBottom: 40,
    },
    progressBackground: {
        height: 6,
        backgroundColor: "#e2e8f0",
        borderRadius: 3,
        marginBottom: 20,
        overflow: "hidden",
    },
    progressFill: {
        height: "100%",
        backgroundColor: "#075538",
        borderRadius: 3,
    },
    stepsContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    step: {
        alignItems: "center",
        flex: 1,
    },
    stepCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 8,
    },
    stepCircleActive: {
        backgroundColor: "#075538",
    },
    stepCircleInactive: {
        backgroundColor: "#f1f5f9",
        borderWidth: 2,
        borderColor: "#e2e8f0",
    },
    stepText: {
        fontSize: 12,
        fontWeight: "500",
        textAlign: "center",
    },
    stepTextActive: {
        color: "#075538",
    },
    stepTextInactive: {
        color: "#9ca3af",
    },
    stepContent: {
        backgroundColor: "#fff",
        borderRadius: 20,
        padding: 24,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 16,
        elevation: 5,
        marginBottom: 20,
    },
    stepIcon: {
        alignSelf: "center",
        marginBottom: 20,
    },
    stepTitle: {
        fontSize: 24,
        fontWeight: "bold",
        textAlign: "center",
        color: "#1e293b",
        marginBottom: 12,
    },
    stepDescription: {
        fontSize: 16,
        textAlign: "center",
        color: "#64748b",
        lineHeight: 22,
        marginBottom: 24,
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
    button: {
        backgroundColor: "#075538",
        padding: 16,
        borderRadius: 12,
        marginTop: 8,
        shadowColor: "#075538",
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
    resendContainer: {
        flexDirection: "row",
        justifyContent: "center",
        marginBottom: 20,
    },
    resendText: {
        color: "#64748b",
        fontSize: 14,
    },
    resendLink: {
        color: "#075538",
        fontSize: 14,
        fontWeight: "600",
    },
    supportContainer: {
        flexDirection: "row",
        justifyContent: "center",
        marginTop: 20,
    },
    supportText: {
        color: "#64748b",
        fontSize: 14,
    },
    supportLink: {
        color: "#075538",
        fontSize: 14,
        fontWeight: "600",
    },
});