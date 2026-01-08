import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState, useRef } from "react";
import {
    Animated,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    Dimensions
} from "react-native";
import { useToast } from "react-native-toast-notifications";
import { z } from "zod";
import * as WebBrowser from 'expo-web-browser';
import OAuthButton from "@/components/OauthButton";
import {apiClient} from "@/hooks/api-client";

const signupSchema = z.object({
    fullName: z.string().min(2, "Full name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    phone: z.string().min(10, "Phone number must be at least 10 digits"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
    emergencyContactName: z.string().min(2, "Emergency contact name is required"),
    emergencyContactPhone: z.string().min(10, "Emergency contact phone must be at least 10 digits"),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});


WebBrowser.maybeCompleteAuthSession();

export default function Signup() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
        emergencyContactName: "",
        emergencyContactPhone: "",
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(false);
    const [secureTextEntry, setSecureTextEntry] = useState(true);
    const [secureConfirmTextEntry, setSecureConfirmTextEntry] = useState(true);

    const toast = useToast();

    // Animation values
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;
    const pulseAnim = useRef(new Animated.Value(1)).current;

    const inputRefs = useRef<(TextInput | null)[]>([]);

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

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: "" }));
        }
    };

    const handleSignup = async () => {
        const result = signupSchema.safeParse(formData);
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

        try {
            // Create the sign-up attempt with metadata
            const response = await apiClient.post('/users', {
                email: formData.email,
                password: formData.password,
                name: formData.fullName,
                phone: formData.phone,
                emergencyContactName: formData.emergencyContactName,
                emergencyContactPhone: formData.emergencyContactPhone,
            });

            toast.show("Account created successfully,", { type: "success" });
            router.push("/(auth)");

        } catch (err: any) {
            console.error("Sign-up error:", err);
            toast.show(err.response?.data?.message, {
                type: 'warning'
            });
        } finally {
            setIsLoading(false);
        }

        setIsLoading(false);
    };

    const SectionHeader = ({ title, icon }: { title: string; icon: string }) => (
        <View style={styles.sectionHeader}>
            <View style={styles.sectionIconContainer}>
                <Ionicons name={icon as any} size={16} color="#075538" />
            </View>
            <Text style={styles.sectionTitle}>{title}</Text>
        </View>
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
                {/* Header Section */}
                <Animated.View
                    style={[
                        styles.header,
                        {
                            opacity: fadeAnim,
                            transform: [{translateY: slideAnim}]
                        }
                    ]}
                >
                    <View style={styles.logoContainer}>
                        <Ionicons name="car-sport" size={50} color="#fff"/>
                    </View>
                    <Text style={styles.title}>Join Driver Assist</Text>
                    <Text style={styles.subtitle}>
                        Create your account and drive with confidence
                    </Text>
                </Animated.View>

                {/* Social Signup Buttons - Now at top */}
                <Animated.View
                    style={[
                        styles.socialContainer,
                        {
                            opacity: fadeAnim,
                            transform: [{translateY: slideAnim}]
                        }
                    ]}
                >
                </Animated.View>

                {/* Form Section */}
                <Animated.View
                    style={[
                        styles.formContainer,
                        {
                            opacity: fadeAnim,
                            transform: [{translateY: slideAnim}]
                        }
                    ]}
                >
                    {/* Personal Information Section */}
                    <SectionHeader title="Personal Information" icon="person-outline"/>

                    {/* Full Name */}
                    <View style={styles.inputContainer}>
                        <Ionicons name="person-outline" size={20} color="#64748b" style={styles.inputIcon}/>
                        <TextInput
                            style={[styles.input, errors.fullName && styles.errorInput]}
                            placeholder="Full Name"
                            autoComplete={"name"}
                            placeholderTextColor="#94a3b8"
                            value={formData.fullName}
                            onChangeText={(text) => handleInputChange("fullName", text)}
                            autoCapitalize="words"
                        />
                    </View>
                    {errors.fullName && (
                        <View style={styles.errorContainer}>
                            <Ionicons name="warning-outline" size={14} color="#dc2626"/>
                            <Text style={styles.errorText}>{errors.fullName}</Text>
                        </View>
                    )}

                    {/* Email */}
                    <View style={styles.inputContainer}>
                        <Ionicons name="mail-outline" size={20} color="#64748b" style={styles.inputIcon}/>
                        <TextInput
                            style={[styles.input, errors.email && styles.errorInput]}
                            placeholder="Email Address"
                            autoComplete={'email'}
                            placeholderTextColor="#94a3b8"
                            value={formData.email}
                            onChangeText={(text) => handleInputChange("email", text)}
                            autoCapitalize="none"
                            keyboardType="email-address"
                        />
                    </View>
                    {errors.email && (
                        <View style={styles.errorContainer}>
                            <Ionicons name="warning-outline" size={14} color="#dc2626"/>
                            <Text style={styles.errorText}>{errors.email}</Text>
                        </View>
                    )}

                    {/* Phone */}
                    <View style={styles.inputContainer}>
                        <Ionicons name="call-outline" size={20} color="#64748b" style={styles.inputIcon}/>
                        <TextInput
                            style={[styles.input, errors.phone && styles.errorInput]}
                            placeholder="Phone Number"
                            autoComplete={'tel'}
                            placeholderTextColor="#94a3b8"
                            value={formData.phone}
                            onChangeText={(text) => handleInputChange("phone", text)}
                            keyboardType="phone-pad"
                        />
                    </View>
                    {errors.phone && (
                        <View style={styles.errorContainer}>
                            <Ionicons name="warning-outline" size={14} color="#dc2626"/>
                            <Text style={styles.errorText}>{errors.phone}</Text>
                        </View>
                    )}

                    {/* Password Section */}
                    <SectionHeader title="Security" icon="lock-closed-outline"/>

                    {/* Password */}
                    <View style={styles.inputContainer}>
                        <Ionicons name="lock-closed-outline" size={20} color="#64748b" style={styles.inputIcon}/>
                        <TextInput
                            style={[styles.input, errors.password && styles.errorInput]}
                            placeholder="Password (min. 6 characters)"
                            autoComplete={'new-password'}
                            placeholderTextColor="#94a3b8"
                            value={formData.password}
                            onChangeText={(text) => handleInputChange("password", text)}
                            secureTextEntry={secureTextEntry}
                        />
                        <TouchableOpacity
                            style={styles.eyeIcon}
                            onPress={() => setSecureTextEntry(!secureTextEntry)}
                        >
                            <Ionicons
                                name={secureTextEntry ? "eye-outline" : "eye-off-outline"}
                                size={20}
                                color="#64748b"
                            />
                        </TouchableOpacity>
                    </View>
                    {errors.password && (
                        <View style={styles.errorContainer}>
                            <Ionicons name="warning-outline" size={14} color="#dc2626"/>
                            <Text style={styles.errorText}>{errors.password}</Text>
                        </View>
                    )}

                    {/* Confirm Password */}
                    <View style={styles.inputContainer}>
                        <Ionicons name="lock-closed-outline" size={20} color="#64748b" style={styles.inputIcon}/>
                        <TextInput
                            style={[styles.input, errors.confirmPassword && styles.errorInput]}
                            placeholder="Confirm Password"
                            autoComplete={'new-password'}
                            placeholderTextColor="#94a3b8"
                            value={formData.confirmPassword}
                            onChangeText={(text) => handleInputChange("confirmPassword", text)}
                            secureTextEntry={secureConfirmTextEntry}
                        />
                        <TouchableOpacity
                            style={styles.eyeIcon}
                            onPress={() => setSecureConfirmTextEntry(!secureConfirmTextEntry)}
                        >
                            <Ionicons
                                name={secureConfirmTextEntry ? "eye-outline" : "eye-off-outline"}
                                size={20}
                                color="#64748b"
                            />
                        </TouchableOpacity>
                    </View>
                    {errors.confirmPassword && (
                        <View style={styles.errorContainer}>
                            <Ionicons name="warning-outline" size={14} color="#dc2626"/>
                            <Text style={styles.errorText}>{errors.confirmPassword}</Text>
                        </View>
                    )}

                    {/* Emergency Contact Section */}
                    <SectionHeader title="Emergency Contact" icon="medkit-outline"/>
                    <Text style={styles.sectionDescription}>
                        This contact will be notified in case of emergencies
                    </Text>

                    {/* Emergency Contact Name */}
                    <View style={styles.inputContainer}>
                        <Ionicons name="person-outline" size={20} color="#64748b" style={styles.inputIcon}/>
                        <TextInput
                            style={[styles.input, errors.emergencyContactName && styles.errorInput]}
                            placeholder="Emergency Contact Name"
                            autoComplete={'name'}
                            placeholderTextColor="#94a3b8"
                            value={formData.emergencyContactName}
                            onChangeText={(text) => handleInputChange("emergencyContactName", text)}
                            autoCapitalize="words"
                        />
                    </View>
                    {errors.emergencyContactName && (
                        <View style={styles.errorContainer}>
                            <Ionicons name="warning-outline" size={14} color="#dc2626"/>
                            <Text style={styles.errorText}>{errors.emergencyContactName}</Text>
                        </View>
                    )}

                    {/* Emergency Contact Phone */}
                    <View style={styles.inputContainer}>
                        <Ionicons name="call-outline" size={20} color="#64748b" style={styles.inputIcon}/>
                        <TextInput
                            style={[styles.input, errors.emergencyContactPhone && styles.errorInput]}
                            placeholder="Emergency Contact Phone"
                            autoComplete={'tel'}
                            placeholderTextColor="#94a3b8"
                            value={formData.emergencyContactPhone}
                            onChangeText={(text) => handleInputChange("emergencyContactPhone", text)}
                            keyboardType="phone-pad"
                        />
                    </View>
                    {errors.emergencyContactPhone && (
                        <View style={styles.errorContainer}>
                            <Ionicons name="warning-outline" size={14} color="#dc2626"/>
                            <Text style={styles.errorText}>{errors.emergencyContactPhone}</Text>
                        </View>
                    )}

                    {/* Signup Button */}
                    <TouchableOpacity
                        style={[styles.signupButton, isLoading && styles.buttonDisabled]}
                        onPress={handleSignup}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <View style={styles.loadingContainer}>
                                <Ionicons name="refresh" size={20} color="#fff" style={styles.spinning}/>
                                <Text style={styles.buttonText}>Creating Account...</Text>
                            </View>
                        ) : (
                            <View style={styles.buttonContent}>
                                <Text style={styles.buttonText}>Create Account</Text>
                                <Ionicons name="arrow-forward" size={20} color="#fff"/>
                            </View>
                        )}
                    </TouchableOpacity>

                    <View style={styles.divider}>
                        <View style={styles.dividerLine}/>
                        <Text style={styles.dividerText}>or</Text>
                        <View style={styles.dividerLine}/>
                    </View>

                    {/* OAuthButton component to handle OAuth sign-in */}
                    <View style={{marginBottom: 24}}>
                        <OAuthButton>Sign in with Google</OAuthButton>
                    </View>

                    {/* Terms and Conditions */}
                    <Text style={styles.termsText}>
                        By creating an account, you agree to our{" "}
                        <Text onPress={() => router.push('https://roadmateassist.co.ke/terms-of-service')} style={styles.link}>Terms of Service</Text> and{" "}
                        <Text onPress={() => router.push('https://roadmateassist.co.ke/privacy-policy')} style={styles.link}>Privacy Policy</Text>
                    </Text>
                </Animated.View>

                {/* Login Link */}
                <View style={styles.footer}>
                    <Text style={styles.footerText}>Already have an account? </Text>
                    <TouchableOpacity onPress={() => router.replace('/(auth)')}>
                        <Text style={styles.loginText}>Sign in</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#075538",
    },
    scrollContainer: {
        flexGrow: 1,
        padding: 20,
        paddingTop: 40,
    },
    header: {
        alignItems: "center",
        marginBottom: 30,
    },
    logoContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: "rgba(255, 255, 255, 0.1)",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 16,
        borderWidth: 2,
        borderColor: "rgba(255, 255, 255, 0.2)",
    },
    title: {
        fontSize: 32,
        fontWeight: "bold",
        marginBottom: 8,
        textAlign: "center",
        color: "#fff",
    },
    subtitle: {
        fontSize: 16,
        textAlign: "center",
        color: "rgba(255, 255, 255, 0.8)",
        lineHeight: 22,
        maxWidth: 300,
    },
    socialContainer: {
        marginBottom: 24,
    },
    googleButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#fff",
        padding: 16,
        borderRadius: 12,
        marginBottom: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    googleButtonText: {
        marginLeft: 12,
        fontSize: 16,
        fontWeight: "500",
        color: "#374151",
    },
    divider: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 20,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: "#075538",
    },
    dividerText: {
        marginHorizontal: 12,
        color: "#075538",
        fontSize: 14,
        fontWeight: "500",
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
        marginBottom: 20,
    },
    sectionHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 16,
        marginTop: 8,
    },
    sectionIconContainer: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: "#eff6ff",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 8,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#1e293b",
    },
    sectionDescription: {
        fontSize: 14,
        color: "#64748b",
        marginBottom: 16,
        marginLeft: 36,
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
        borderColor: "#dc2626",
    },
    errorContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 12,
        marginLeft: 4,
    },
    errorText: {
        color: "#dc2626",
        fontSize: 12,
        marginLeft: 4,
    },
    signupButton: {
        backgroundColor: "#075538",
        padding: 18,
        borderRadius: 12,
        marginTop: 8,
        marginBottom: 16,
        shadowColor: "#075538",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    verifyButton: {
        backgroundColor: "#075538",
        padding: 18,
        borderRadius: 12,
        marginTop: 8,
        marginBottom: 16,
        width: '100%',
        maxWidth: 280,
        alignSelf: 'center',
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
    termsText: {
        textAlign: "center",
        fontSize: 12,
        color: "#64748b",
        lineHeight: 16,
        marginBottom: 20,
    },
    link: {
        color: "#075538",
        fontWeight: "500",
    },
    footer: {
        flexDirection: "row",
        justifyContent: "center",
        marginBottom: 20,
    },
    footerText: {
        color: "rgba(255, 255, 255, 0.8)",
        fontSize: 14,
    },
    loginText: {
        color: "#fff",
        fontSize: 14,
        fontWeight: "600",
    },
    // Verification specific styles
    verificationHeader: {
        alignItems: "center",
        marginBottom: 40,
    },
    verificationLogoContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: "rgba(255, 255, 255, 0.1)",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 24,
        borderWidth: 2,
        borderColor: "rgba(255, 255, 255, 0.2)",
    },
    verificationTitle: {
        fontSize: 28,
        fontWeight: "bold",
        color: "#fff",
        marginBottom: 8,
        textAlign: "center",
    },
    verificationSubtitle: {
        fontSize: 16,
        color: "rgba(255, 255, 255, 0.8)",
        textAlign: "center",
        marginBottom: 4,
    },
    verificationEmail: {
        fontSize: 18,
        fontWeight: "600",
        color: "#fff",
        textAlign: "center",
    },
    verificationFormContainer: {
        backgroundColor: "#fff",
        borderRadius: 20,
        padding: 24,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 16,
        elevation: 5,
    },
    codeLabel: {
        fontSize: 16,
        fontWeight: "600",
        color: "#1e293b",
        textAlign: "center",
        marginBottom: 24,
    },
    codeInputsContainer: {
        flexDirection: "row",
        justifyContent: "center",
        gap: 12,
        marginBottom: 24,
    },
    codeInputWrapper: {
        alignItems: "center",
    },
    codeInputContainer: {
        alignItems: "center",
    },
    codeInput: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#1e293b",
        marginBottom: 8,
        minWidth: 40,
        textAlign: "center",
    },
    codeInputUnderline: {
        width: 40,
        height: 3,
        backgroundColor: "#e2e8f0",
        borderRadius: 2,
    },
    codeInputUnderlineActive: {
        backgroundColor: "#075538",
    },
    hiddenInputs: {
        position: "absolute",
        opacity: 0,
        width: 0,
        height: 0,
    },
    hiddenInput: {
        width: 0,
        height: 0,
    },
    verificationHelp: {
        textAlign: "center",
        fontSize: 14,
        color: "#64748b",
        marginBottom: 24,
        lineHeight: 20,
    },
    resendButton: {
        alignItems: "center",
        marginBottom: 16,
    },
    resendText: {
        color: "#64748b",
        fontSize: 14,
    },
    resendLink: {
        color: "#075538",
        fontWeight: "600",
    },
    backButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        padding: 12,
    },
    backText: {
        color: "#64748b",
        fontSize: 14,
        marginLeft: 8,
    },
});