// FeedbackScreen.js
import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    Image,
    Alert,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import {apiClient} from "@/hooks/api-client";
import {Ionicons} from "@expo/vector-icons";
import SuccessModal from "@/components/success-modal";
import {useUser} from "@clerk/clerk-expo";
import {router} from "expo-router";

const FeedbackScreen = ({ navigation }) => {
    const [formData, setFormData] = useState({
        title: '',
        feedback: '',
        subject: '',
    });

    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [succesModalOpen, setSuccesModalOpen] = useState(false);
    const {user} = useUser();

    const subjects = [
        'Bug Report',
        'Feature Request',
        'UI/UX Feedback',
        'Performance Issue',
        'General Feedback',
        'Other',
    ];

    const validateForm = () => {
        const newErrors = {};

        if (!formData.title.trim()) {
            newErrors.title = 'Title is required';
        }

        if (!formData.feedback.trim()) {
            newErrors.feedback = 'Feedback is required';
        }

        if (!formData.subject) {
            newErrors.subject = 'Please select a subject';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) {
            Alert.alert('Error', 'Please fill in all required fields');
            return;
        }

        setLoading(true);

        try {
            const userId = user?.id;

            const feedbackData = {
                userId,
                title: formData.title,
                feedback: formData.feedback,
                subject: formData.subject,
                images: images.map(img => img.uri),
            };

            const response = await apiClient.post('/feedback', feedbackData);

            if (response.status === 201) {
                setSuccesModalOpen(true);
                setFormData({
                    title: '',
                    feedback: '',
                    subject: '',
                });
                setImages([]);
                setErrors({});
            }
        } catch (error) {
            console.error('Feedback submission error:', error);
            Alert.alert(
                'Submission Failed',
                'There was an error submitting your feedback. Please try again.'
            );
        } finally {
            setLoading(false);
        }
    };

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (status !== 'granted') {
            Alert.alert('Permission Required', 'We need access to your photos to upload images.');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 0.8,
            allowsMultipleSelection: true,
        });

        if (!result.canceled && result.assets) {
            const newImages = result.assets.slice(0, 3 - images.length); // Limit to 3 images
            setImages([...images, ...newImages]);
        }
    };

    const removeImage = (index) => {
        const newImages = images.filter((_, i) => i !== index);
        setImages(newImages);
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView showsVerticalScrollIndicator={false}>
                <SuccessModal
                    visible={succesModalOpen}
                    onClose={()=>{
                        setSuccesModalOpen(false)
                        router.back();
                    }}
                    title={undefined}
                    message={undefined} />
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => router.back()}
                    >
                        <Ionicons name="arrow-back" size={24} color="#6366F1" />
                    </TouchableOpacity>

                    <View style={styles.headerText}>
                        <Text style={styles.title}>Send Feedback</Text>
                        <Text style={styles.subtitle}>We value your opinion</Text>
                    </View>

                    {/* Spacer to keep center alignment */}
                    <View style={{ width: 40 }} />
                </View>

                <View style={styles.formContainer}>
                    {/* Subject Selection */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Subject *</Text>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            style={styles.subjectContainer}
                        >
                            {subjects.map((subject) => (
                                <TouchableOpacity
                                    key={subject}
                                    style={[
                                        styles.subjectButton,
                                        formData.subject === subject && styles.subjectButtonActive,
                                    ]}
                                    onPress={() => {
                                        setFormData({...formData, subject});
                                        setErrors({...errors, subject: null});
                                    }}
                                >
                                    <Text
                                        style={[
                                            styles.subjectButtonText,
                                            formData.subject === subject && styles.subjectButtonTextActive,
                                        ]}
                                    >
                                        {subject}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                        {errors.subject && (
                            <Text style={styles.errorText}>{errors.subject}</Text>
                        )}
                    </View>

                    {/* Title Input */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Title *</Text>
                        <TextInput
                            style={[styles.input, errors.title && styles.inputError]}
                            placeholder="Brief summary of your feedback"
                            placeholderTextColor="#9CA3AF"
                            value={formData.title}
                            onChangeText={(text) => {
                                setFormData({...formData, title: text});
                                setErrors({...errors, title: null});
                            }}
                        />
                        {errors.title && (
                            <Text style={styles.errorText}>{errors.title}</Text>
                        )}
                    </View>

                    {/* Feedback Input */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Your Feedback *</Text>
                        <TextInput
                            style={[styles.textArea, errors.feedback && styles.inputError]}
                            placeholder="Describe your feedback in detail..."
                            placeholderTextColor="#9CA3AF"
                            value={formData.feedback}
                            onChangeText={(text) => {
                                setFormData({...formData, feedback: text});
                                setErrors({...errors, feedback: null});
                            }}
                            multiline
                            numberOfLines={6}
                            textAlignVertical="top"
                        />
                        {errors.feedback && (
                            <Text style={styles.errorText}>{errors.feedback}</Text>
                        )}
                    </View>

                    {/* Image Upload */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Attachments (Optional)</Text>
                        <Text style={styles.hintText}>Upload up to 3 images</Text>

                        <View style={styles.imageContainer}>
                            {images.map((image, index) => (
                                <View key={index} style={styles.imageWrapper}>
                                    <Image source={{ uri: image.uri }} style={styles.previewImage} />
                                    <TouchableOpacity
                                        style={styles.removeImageButton}
                                        onPress={() => removeImage(index)}
                                    >
                                        <Ionicons name="close-circle" size={24} color="#EF4444" />
                                    </TouchableOpacity>
                                </View>
                            ))}

                            {images.length < 3 && (
                                <TouchableOpacity style={styles.addImageButton} onPress={pickImage}>
                                    <Ionicons name="camera-outline" size={32} color="#075538" />
                                    <Text style={styles.addImageText}>Add Image</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>

                    {/* Submit Button */}
                    <TouchableOpacity
                        style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                        onPress={handleSubmit}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#FFFFFF" />
                        ) : (
                            <>
                                <Ionicons name="send" size={20} color="#FFFFFF" />
                                <Text style={styles.submitButtonText}>Submit Feedback</Text>
                            </>
                        )}
                    </TouchableOpacity>

                    <Text style={styles.note}>
                        Your feedback will be reviewed by our team. We'll notify you once it's processed.
                    </Text>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    header: {
        paddingTop: 60,
        paddingHorizontal: 20,
        paddingBottom: 20,
        backgroundColor: '#075538',
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,

        flexDirection: 'row',
        alignItems: 'center',
    },

    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
    },

    headerText: {
        flex: 1,
        alignItems: 'center',
    },

    title: {
        fontSize: 28,
        fontWeight: '700',
        color: '#ffff',
    },

    subtitle: {
        fontSize: 16,
        color: '#ffff',
        marginTop: 4,
    },

    formContainer: {
        padding: 20,
    },
    inputGroup: {
        marginBottom: 24,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 8,
    },
    hintText: {
        fontSize: 14,
        color: '#9CA3AF',
        marginBottom: 12,
    },
    subjectContainer: {
        flexDirection: 'row',
        marginBottom: 4,
    },
    subjectButton: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        backgroundColor: '#F3F4F6',
        borderRadius: 12,
        marginRight: 8,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    subjectButtonActive: {
        backgroundColor: '#EEF2FF',
        borderColor: '#075538',
    },
    subjectButtonText: {
        color: '#6B7280',
        fontSize: 14,
        fontWeight: '500',
    },
    subjectButtonTextActive: {
        color: '#075538',
    },
    input: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
        borderWidth: 2,
        borderColor: '#E5E7EB',
        color: '#1F2937',
    },
    textArea: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
        borderWidth: 2,
        borderColor: '#E5E7EB',
        color: '#1F2937',
        minHeight: 120,
    },
    inputError: {
        borderColor: '#EF4444',
    },
    errorText: {
        color: '#EF4444',
        fontSize: 14,
        marginTop: 4,
    },
    imageContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    imageWrapper: {
        position: 'relative',
    },
    previewImage: {
        width: 100,
        height: 100,
        borderRadius: 12,
        backgroundColor: '#F3F4F6',
    },
    removeImageButton: {
        position: 'absolute',
        top: -8,
        right: -8,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
    },
    addImageButton: {
        width: 100,
        height: 100,
        backgroundColor: '#F3F4F6',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#E5E7EB',
        borderStyle: 'dashed',
    },
    addImageText: {
        marginTop: 8,
        fontSize: 12,
        color: '#075538',
        fontWeight: '500',
    },
    submitButton: {
        backgroundColor: '#075538',
        borderRadius: 12,
        paddingVertical: 16,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 8,
        marginBottom: 20,
        shadowColor: '#075538',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    submitButtonDisabled: {
        backgroundColor: '#9CA3AF',
    },
    submitButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
    note: {
        textAlign: 'center',
        fontSize: 14,
        color: '#6B7280',
        lineHeight: 20,
        paddingHorizontal: 20,
    },
});

export default FeedbackScreen;