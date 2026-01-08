import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useToast } from 'react-native-toast-notifications';

const { width } = Dimensions.get('window');

export default function VerifyEmailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { id, username } = useLocalSearchParams();
  
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const [email, setEmail] = useState(params.email as string || 'user@example.com');
  const toast = useToast();

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const inputRefs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
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

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const startShakeAnimation = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, {
        toValue: 10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: -10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 0,
        duration: 50,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const startPulseAnimation = () => {
    Animated.sequence([
      Animated.timing(pulseAnim, {
        toValue: 1.1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleCodeChange = (text: string, index: number) => {
    if (text.length <= 1) {
      const newCode = [...code];
      newCode[index] = text;
      setCode(newCode);

      // Auto-focus next input
      if (text && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }

      // Auto-submit when all digits are entered
      if (text && index === 5) {
        const fullCode = newCode.join('');
        if (fullCode.length === 6) {
          handleVerifyCode(fullCode);
        }
      }
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyCode = async (verificationCode?: string) => {
    const fullCode = verificationCode || code.join('');
    
    if (fullCode.length !== 6) {
      Alert.alert('Invalid Code', 'Please enter the 6-digit verification code.');
      startShakeAnimation();
      return;
    }

    if (!isLoaded) {
        toast.show('System not ready. Please try again.', { type: 'danger' });
      return;
    }

    setIsLoading(true);

    try {
      await signUp.update({
        username: username.toString(),
        firstName: username.toString().split(' ')[0],
        lastName: username.toString().split(' ')[1],
      });
      // Attempt to complete sign up
      const completeSignUp = await signUp?.attemptEmailAddressVerification({
        code: fullCode,
      });

      if (completeSignUp.status === 'complete') {
        await setActive({ session: completeSignUp.createdSessionId });
        startPulseAnimation();
        
        // Success animation before navigation
        setTimeout(() => {
          router.replace('/(tabs)/emergency');
        }, 500);
        
      } else {
        // If sign up verification fails, try sign in verification
        await handleSignInVerification(fullCode);
      }
    } catch (err: any) {
        toast.show('Verification error: ' + err, { type: 'danger' });
      console.log('Verification error:', err);
      
      // Try sign in verification as fallback
      try {
        await handleSignInVerification(fullCode);
      } catch (signInErr: any) {
        handleVerificationError(signInErr);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignInVerification = async (fullCode: string) => {
    if (!signIn) {
      throw new Error('Sign in not available');
    }

    await signIn.create({ identifier: email })
    const signInAttempt = await signIn.attemptFirstFactor({
      strategy: 'email_code',
      code: fullCode,
    });

    if (signInAttempt.status === 'complete') {
      await setActive!({ session: signInAttempt.createdSessionId });
      startPulseAnimation();
      
      setTimeout(() => {
        router.replace('/(tabs)/emergency');
      }, 500);
    } else {
      throw new Error('Verification failed');
    }
  };

  const handleVerificationError = (err: any) => {
    console.log('Verification error details:', err);
    
    let errorMessage = 'Verification failed. Please try again.';
    
    if (err.errors && err.errors[0]) {
      const clerkError = err.errors[0];
      if (clerkError.code === 'form_code_incorrect') {
        errorMessage = 'Invalid verification code. Please check the code and try again.';
      } else if (clerkError.code === 'form_identifier_not_found') {
        errorMessage = 'Email not found. Please sign up again.';
        setTimeout(() => router.replace('/(auth)/signup'), 2000);
      } else if (clerkError.message) {
        errorMessage = clerkError.message;
      }
    }
    
    Alert.alert('Verification Failed', errorMessage);
    startShakeAnimation();
    setCode(['', '', '', '', '', '']);
    inputRefs.current[0]?.focus();
  };

  const handleResendCode = async () => {
    if (countdown > 0) return;

    setIsResending(true);

    try {
      if (signUp) {
        await signUp.prepareEmailAddressVerification();
      } else if (signIn) {
        await signIn.prepareFirstFactor({
          strategy: 'email_code',
          emailAddressId: email
        });
      }
      
      setCountdown(30);
      Alert.alert('Code Sent', 'A new verification code has been sent to your email.');
      startPulseAnimation();
    } catch (err) {
      console.log('Resend error:', err);
      Alert.alert('Error', 'Failed to resend code. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  const handleGoBack = () => {
    router.replace('/(auth)');
  };

  const CodeInput = ({ index }: { index: number }) => (
    <View style={styles.codeInputContainer}>
      <Text style={styles.codeInput}>
        {code[index]}
      </Text>
      <View style={[
        styles.codeInputUnderline,
        code[index] ? styles.codeInputUnderlineActive : {}
      ]} />
    </View>
  );

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Background Animation */}
      <View style={styles.backgroundAnimation}>
        <Animated.View 
          style={[
            styles.floatingCircle,
            {
              top: '20%',
              left: '10%',
              transform: [{ scale: pulseAnim }]
            }
          ]} 
        />
        <Animated.View 
          style={[
            styles.floatingCircle,
            {
              top: '60%',
              right: '15%',
              transform: [{ scale: pulseAnim.interpolate({
                inputRange: [1, 1.1],
                outputRange: [1, 1.2]
              }) }]
            }
          ]} 
        />
      </View>

      <Animated.View 
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [
              { translateY: slideAnim },
              { translateX: shakeAnim }
            ]
          }
        ]}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={handleGoBack}
          >
            <Ionicons name="arrow-back" size={24} color="#075538" />
          </TouchableOpacity>
          
          <View style={styles.logoContainer}>
            <Ionicons name="shield-checkmark" size={60} color="#075538" />
          </View>
          
          <Text style={styles.title}>Verify Your Email</Text>
          <Text style={styles.subtitle}>
            We sent a 6-digit code to
          </Text>
          <Text style={styles.emailText}>{email}</Text>
        </View>

        {/* Code Input Section */}
        <View style={styles.codeSection}>
          <Text style={styles.codeLabel}>Enter verification code</Text>
          
          <Animated.View style={styles.codeInputsContainer}>
            {code.map((_, index) => (
              <TouchableOpacity
                key={index}
                style={styles.codeInputWrapper}
                onPress={() => inputRefs.current[index]?.focus()}
              >
                <CodeInput index={index} />
              </TouchableOpacity>
            ))}
          </Animated.View>

          {/* Hidden TextInputs for keyboard */}
          <View style={styles.hiddenInputs}>
            {code.map((_, index) => (
              <TextInput
                key={index}
                ref={ref => inputRefs.current[index] = ref}
                style={styles.hiddenInput}
                value={code[index]}
                onChangeText={(text) => handleCodeChange(text, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                keyboardType="number-pad"
                maxLength={1}
                autoFocus={index === 0}
                selectTextOnFocus
              />
            ))}
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity 
            style={[
              styles.verifyButton,
              isLoading && styles.verifyButtonDisabled
            ]}
            onPress={() => handleVerifyCode()}
            disabled={isLoading || code.join('').length !== 6}
          >
            {isLoading ? (
              <Animated.View style={styles.loadingContainer}>
                <Ionicons 
                  name="refresh" 
                  size={24} 
                  color="#fff" 
                  style={styles.spinning} 
                />
                <Text style={styles.verifyButtonText}>Verifying...</Text>
              </Animated.View>
            ) : (
              <Animated.View style={styles.verifyContent}>
                <Text style={styles.verifyButtonText}>Verify Code</Text>
                <Ionicons name="arrow-forward" size={20} color="#fff" />
              </Animated.View>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            style={[
              styles.resendButton,
              (countdown > 0 || isResending) && styles.resendButtonDisabled
            ]}
            onPress={handleResendCode}
            disabled={countdown > 0 || isResending}
          >
            {isResending ? (
              <View style={styles.resendContent}>
                <Ionicons name="refresh" size={16} color="#64748b" />
                <Text style={styles.resendText}>Sending...</Text>
              </View>
            ) : (
              <View style={styles.resendContent}>
                <Ionicons 
                  name="send" 
                  size={16} 
                  color={countdown > 0 ? "#94a3b8" : "#075538"} 
                />
                <Text style={[
                  styles.resendText,
                  countdown > 0 && styles.resendTextDisabled
                ]}>
                  Resend Code {countdown > 0 && `(${countdown}s)`}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Help Section */}
        <View style={styles.helpSection}>
          <View style={styles.helpItem}>
            <Ionicons name="time" size={16} color="#64748b" />
            <Text style={styles.helpText}>Code expires in 10 minutes</Text>
          </View>
          <View style={styles.helpItem}>
            <Ionicons name="mail" size={16} color="#64748b" />
            <Text style={styles.helpText}>Check your spam folder</Text>
          </View>
        </View>
      </Animated.View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  backgroundAnimation: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  floatingCircle: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#eff6ff',
    opacity: 0.6,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  backButton: {
    position: 'absolute',
    top: 0,
    left: 0,
    padding: 8,
    backgroundColor: '#eff6ff',
    borderRadius: 12,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#075538',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 4,
  },
  emailText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#075538',
    textAlign: 'center',
  },
  codeSection: {
    alignItems: 'center',
    marginBottom: 48,
  },
  codeLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 24,
  },
  codeInputsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  codeInputWrapper: {
    alignItems: 'center',
  },
  codeInputContainer: {
    alignItems: 'center',
  },
  codeInput: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
    minWidth: 40,
    textAlign: 'center',
  },
  codeInputUnderline: {
    width: 40,
    height: 3,
    backgroundColor: '#e2e8f0',
    borderRadius: 2,
  },
  codeInputUnderlineActive: {
    backgroundColor: '#075538',
  },
  hiddenInputs: {
    position: 'absolute',
    opacity: 0,
    width: 0,
    height: 0,
  },
  hiddenInput: {
    width: 0,
    height: 0,
  },
  actionsContainer: {
    alignItems: 'center',
    gap: 16,
  },
  verifyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#075538',
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 16,
    width: '100%',
    maxWidth: 280,
    shadowColor: '#075538',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  verifyButtonDisabled: {
    opacity: 0.6,
  },
  verifyContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  spinning: {
    transform: [{ rotate: '0deg' }],
  },
  verifyButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  resendButton: {
    padding: 12,
  },
  resendButtonDisabled: {
    opacity: 0.5,
  },
  resendContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  resendText: {
    fontSize: 14,
    color: '#075538',
    fontWeight: '500',
  },
  resendTextDisabled: {
    color: '#94a3b8',
  },
  helpSection: {
    marginTop: 32,
    gap: 12,
  },
  helpItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  helpText: {
    fontSize: 12,
    color: '#64748b',
  },
});