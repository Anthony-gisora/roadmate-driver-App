// app/signup.tsx
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    Alert,
    Animated,
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

        // Simulate API call
        setTimeout(() => {
            setIsLoading(false);
            Alert.alert(
                "Success! 🎉",
                "Your account has been created successfully!",
                [{ text: "Continue", onPress: () => router.replace("(tabs)") }]
            );
        }, 2000);
    };

    const handleSocialSignup = (provider: string) => {
        Alert.alert("Social Signup", `${provider} signup would be implemented here`);
    };

    const SectionHeader = ({ title, icon }: { title: string; icon: string }) => (
        <View style={styles.sectionHeader}>
            <Ionicons name={icon as any} size={20} color="#2563eb" />
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
                            transform: [{ translateY: slideAnim }]
                        }
                    ]}
                >
                    <View style={styles.logoContainer}>
                        <Ionicons name="car-sport" size={50} color="#075538" />
                    </View>
                    <Text style={styles.title}>Join Driver Assist App</Text>
                    <Text style={styles.subtitle}>
                        Create your account and drive with confidence
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
                    {/* Personal Information Section */}
                    <SectionHeader title="Personal Information" icon="person-outline" />

                    {/* Full Name */}
                    <View style={styles.inputContainer}>
                        <Ionicons name="person-outline" size={20} color="#6b7280" style={styles.inputIcon} />
                        <TextInput
                            style={[styles.input, errors.fullName && styles.errorInput]}
                            placeholder="Full Name"
                            placeholderTextColor="#9ca3af"
                            value={formData.fullName}
                            onChangeText={(text) => handleInputChange("fullName", text)}
                            autoCapitalize="words"
                        />
                    </View>
                    {errors.fullName && (
                        <View style={styles.errorContainer}>
                            <Ionicons name="warning-outline" size={14} color="#ef4444" />
                            <Text style={styles.errorText}>{errors.fullName}</Text>
                        </View>
                    )}

                    {/* Email */}
                    <View style={styles.inputContainer}>
                        <Ionicons name="mail-outline" size={20} color="#6b7280" style={styles.inputIcon} />
                        <TextInput
                            style={[styles.input, errors.email && styles.errorInput]}
                            placeholder="Email Address"
                            placeholderTextColor="#9ca3af"
                            value={formData.email}
                            onChangeText={(text) => handleInputChange("email", text)}
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

                    {/* Phone */}
                    <View style={styles.inputContainer}>
                        <Ionicons name="call-outline" size={20} color="#6b7280" style={styles.inputIcon} />
                        <TextInput
                            style={[styles.input, errors.phone && styles.errorInput]}
                            placeholder="Phone Number"
                            placeholderTextColor="#9ca3af"
                            value={formData.phone}
                            onChangeText={(text) => handleInputChange("phone", text)}
                            keyboardType="phone-pad"
                        />
                    </View>
                    {errors.phone && (
                        <View style={styles.errorContainer}>
                            <Ionicons name="warning-outline" size={14} color="#ef4444" />
                            <Text style={styles.errorText}>{errors.phone}</Text>
                        </View>
                    )}

                    {/* Password Section */}
                    <SectionHeader title="Security" icon="lock-closed-outline" />

                    {/* Password */}
                    <View style={styles.inputContainer}>
                        <Ionicons name="lock-closed-outline" size={20} color="#6b7280" style={styles.inputIcon} />
                        <TextInput
                            style={[styles.input, errors.password && styles.errorInput]}
                            placeholder="Password"
                            placeholderTextColor="#9ca3af"
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

                    {/* Confirm Password */}
                    <View style={styles.inputContainer}>
                        <Ionicons name="lock-closed-outline" size={20} color="#6b7280" style={styles.inputIcon} />
                        <TextInput
                            style={[styles.input, errors.confirmPassword && styles.errorInput]}
                            placeholder="Confirm Password"
                            placeholderTextColor="#9ca3af"
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

                    {/* Emergency Contact Section */}
                    <SectionHeader title="Emergency Contact" icon="medkit-outline" />
                    <Text style={styles.sectionDescription}>
                        This contact will be notified in case of emergencies
                    </Text>

                    {/* Emergency Contact Name */}
                    <View style={styles.inputContainer}>
                        <Ionicons name="person-outline" size={20} color="#6b7280" style={styles.inputIcon} />
                        <TextInput
                            style={[styles.input, errors.emergencyContactName && styles.errorInput]}
                            placeholder="Emergency Contact Name"
                            placeholderTextColor="#9ca3af"
                            value={formData.emergencyContactName}
                            onChangeText={(text) => handleInputChange("emergencyContactName", text)}
                            autoCapitalize="words"
                        />
                    </View>
                    {errors.emergencyContactName && (
                        <View style={styles.errorContainer}>
                            <Ionicons name="warning-outline" size={14} color="#ef4444" />
                            <Text style={styles.errorText}>{errors.emergencyContactName}</Text>
                        </View>
                    )}

                    {/* Emergency Contact Phone */}
                    <View style={styles.inputContainer}>
                        <Ionicons name="call-outline" size={20} color="#6b7280" style={styles.inputIcon} />
                        <TextInput
                            style={[styles.input, errors.emergencyContactPhone && styles.errorInput]}
                            placeholder="Emergency Contact Phone"
                            placeholderTextColor="#9ca3af"
                            value={formData.emergencyContactPhone}
                            onChangeText={(text) => handleInputChange("emergencyContactPhone", text)}
                            keyboardType="phone-pad"
                        />
                    </View>
                    {errors.emergencyContactPhone && (
                        <View style={styles.errorContainer}>
                            <Ionicons name="warning-outline" size={14} color="#ef4444" />
                            <Text style={styles.errorText}>{errors.emergencyContactPhone}</Text>
                        </View>
                    )}

                    {/* Signup Button */}
                    <TouchableOpacity
                        style={[styles.button, isLoading && styles.buttonDisabled]}
                        onPress={handleSignup}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <View style={styles.loadingContainer}>
                                <Ionicons name="refresh" size={20} color="#fff" style={styles.spinning} />
                                <Text style={styles.buttonText}>Creating Account...</Text>
                            </View>
                        ) : (
                            <View style={styles.buttonContent}>
                                <Text style={styles.buttonText}>Create Account</Text>
                                <Ionicons name="arrow-forward" size={20} color="#fff" />
                            </View>
                        )}
                    </TouchableOpacity>

                    {/* Terms and Conditions */}
                    <Text style={styles.termsText}>
                        By creating an account, you agree to our{" "}
                        <Text style={styles.link}>Terms of Service</Text> and{" "}
                        <Text style={styles.link}>Privacy Policy</Text>
                    </Text>

                    {/* Divider */}
                    <View style={styles.divider}>
                        <View style={styles.dividerLine} />
                        <Text style={styles.dividerText}>or sign up with</Text>
                        <View style={styles.dividerLine} />
                    </View>

                    {/* Social Signup Options */}
                    <View style={styles.socialContainer}>
                        <TouchableOpacity
                            style={[styles.socialButton, styles.googleButton]}
                            onPress={() => handleSocialSignup("Google")}
                        >
                            <Ionicons name="logo-google" size={20} color="#DB4437" />
                            <Text style={styles.socialButtonText}>Google</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.socialButton, styles.appleButton]}
                            onPress={() => handleSocialSignup("Apple")}
                        >
                            <Ionicons name="logo-apple" size={20} color="#000" />
                            <Text style={styles.socialButtonText}>Apple</Text>
                        </TouchableOpacity>
                    </View>
                </Animated.View>

                {/* Login Link */}
                <View style={styles.footer}>
                    <Text style={styles.footerText}>Already have an account? </Text>
                    <TouchableOpacity onPress={() => router.back()}>
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
        backgroundColor: "#f8fafc",
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
        backgroundColor: "#eff6ff",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 16,
        shadowColor: "#075538",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
    },
    title: {
        fontSize: 28,
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
        maxWidth: 300,
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
    sectionTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#1e293b",
        marginLeft: 8,
    },
    sectionDescription: {
        fontSize: 14,
        color: "#64748b",
        marginBottom: 16,
        marginLeft: 28,
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
        marginBottom: 16,
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
        marginBottom: 20,
    },
    footerText: {
        color: "#64748b",
        fontSize: 14,
    },
    loginText: {
        color: "#075538",
        fontSize: 14,
        fontWeight: "600",
    },
});