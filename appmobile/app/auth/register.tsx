import { useState } from 'react';
import {
    View, Text, TextInput, TouchableOpacity,
    StyleSheet, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView
} from 'react-native';
import { router } from 'expo-router';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';

const API_URL = 'http://localhost:5000/api';

export default function RegisterScreen() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'BUYER'
    });
    const [loading, setLoading] = useState(false);
    const [profileImage, setProfileImage] = useState<any>(null);

    const handleRegister = async () => {
    if (!formData.name || !formData.email || !formData.password) {
        Alert.alert('Error', 'Please fill in all fields');
        return;
    }

    setLoading(true);
    try {
        const data = new FormData();
        data.append('name', formData.name);
        data.append('email', formData.email);
        data.append('password', formData.password);
        data.append('role', formData.role);

        if (profileImage) {
            data.append('profile_image', {
                uri: profileImage.uri,
                type: 'image/jpeg',
                name: 'profile.jpg',
            } as any);
        }

        await axios.post(`${API_URL}/users/register`, data, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });

        Alert.alert('Success', 'Account created successfully!', [
            { text: 'OK', onPress: () => router.replace('/auth/login' as any) }
        ]);
    } catch (error: any) {
        Alert.alert('Error', error.response?.data?.error || 'Registration failed.');
    } finally {
        setLoading(false);
    }
};
    const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
    });
    if (!result.canceled) {
        setProfileImage(result.assets[0]);
    }
};

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView contentContainerStyle={styles.scrollContent}>

                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.logo}>📚 UNIBOOKS</Text>
                    <Text style={styles.title}>Create Account</Text>
                    <Text style={styles.subtitle}>Join our community of book lovers</Text>
                </View>

                {/* Form */}
                <View style={styles.form}>

                    <View style={styles.fieldGroup}>
                        <Text style={styles.label}>Full Name</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter your full name"
                            placeholderTextColor="#94a3b8"
                            value={formData.name}
                            onChangeText={(text) => setFormData({ ...formData, name: text })}
                        />
                    </View>

                    <View style={styles.fieldGroup}>
                        <Text style={styles.label}>Email Address</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter your email"
                            placeholderTextColor="#94a3b8"
                            value={formData.email}
                            onChangeText={(text) => setFormData({ ...formData, email: text })}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                    </View>

                    <View style={styles.fieldGroup}>
                        <Text style={styles.label}>Password</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Create a strong password"
                            placeholderTextColor="#94a3b8"
                            value={formData.password}
                            onChangeText={(text) => setFormData({ ...formData, password: text })}
                            secureTextEntry
                        />
                    </View>

                    {/* Role Selection */}
                    <View style={styles.fieldGroup}>
                        <Text style={styles.label}>I want to</Text>
                        <View style={styles.roleContainer}>
                            <TouchableOpacity
                                style={[
                                    styles.roleCard,
                                    formData.role === 'BUYER' && styles.roleCardActive
                                ]}
                                onPress={() => setFormData({ ...formData, role: 'BUYER' })}
                            >
                                <Text style={styles.roleIcon}>🛒</Text>
                                <Text style={[
                                    styles.roleTitle,
                                    formData.role === 'BUYER' && styles.roleTitleActive
                                ]}>Buy Books</Text>
                                <Text style={styles.roleSubtitle}>Browse & purchase</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[
                                    styles.roleCard,
                                    formData.role === 'SELLER' && styles.roleCardActive
                                ]}
                                onPress={() => setFormData({ ...formData, role: 'SELLER' })}
                            >
                                <Text style={styles.roleIcon}>📦</Text>
                                <Text style={[
                                    styles.roleTitle,
                                    formData.role === 'SELLER' && styles.roleTitleActive
                                ]}>Sell Books</Text>
                                <Text style={styles.roleSubtitle}>List & sell books</Text>
                            </TouchableOpacity>
                            
                        </View>
                    </View>
                    {/* Profile Image - SELLER Only */}
{formData.role === 'SELLER' && (
    <View style={styles.sellerBox}>
        <Text style={styles.sellerBoxLabel}>📷 Profile Picture (Optional)</Text>
        <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
            <Text style={styles.imagePickerIcon}>🖼️</Text>
            <Text style={styles.imagePickerText}>
                {profileImage ? '✅ Image Selected' : 'Tap to upload profile picture'}
            </Text>
            <Text style={styles.imagePickerHint}>PNG, JPG supported</Text>
        </TouchableOpacity>
    </View>
)}
                    

                    <TouchableOpacity
                        style={[styles.button, loading && styles.buttonDisabled]}
                        onPress={handleRegister}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text style={styles.buttonText}>Create Account</Text>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.loginLink}
                        onPress={() => router.replace('/auth/login' as any)}
                    >
                        <Text style={styles.loginText}>
                            Already have an account? <Text style={styles.loginTextBold}>Login here</Text>
                        </Text>
                    </TouchableOpacity>

                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0f3460',
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 20,
    },
    header: {
        alignItems: 'center',
        marginBottom: 30,
    },
    logo: {
        fontSize: 28,
        fontWeight: '800',
        color: 'white',
        marginBottom: 10,
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: 'white',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.7)',
    },
    form: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 25,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },
    fieldGroup: {
        marginBottom: 18,
    },
    label: {
        fontSize: 13,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 6,
    },
    input: {
        borderWidth: 1.5,
        borderColor: '#e2e8f0',
        borderRadius: 10,
        padding: 12,
        fontSize: 15,
        color: '#1a1a2e',
        backgroundColor: '#f8fafc',
    },
    roleContainer: {
        flexDirection: 'row',
        gap: 12,
    },
    roleCard: {
        flex: 1,
        alignItems: 'center',
        padding: 15,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#e2e8f0',
        backgroundColor: 'white',
    },
    roleCardActive: {
        borderColor: '#0f3460',
        backgroundColor: '#f0f4ff',
    },
    roleIcon: {
        fontSize: 24,
        marginBottom: 6,
    },
    roleTitle: {
        fontWeight: '600',
        color: '#1a1a2e',
        fontSize: 13,
    },
    roleTitleActive: {
        color: '#0f3460',
    },
    roleSubtitle: {
        fontSize: 11,
        color: '#94a3b8',
        marginTop: 2,
    },
    button: {
        backgroundColor: '#0f3460',
        borderRadius: 10,
        padding: 15,
        alignItems: 'center',
        marginTop: 5,
    },
    buttonDisabled: {
        backgroundColor: '#94a3b8',
    },
    buttonText: {
        color: 'white',
        fontWeight: '700',
        fontSize: 16,
    },
    loginLink: {
        marginTop: 20,
        alignItems: 'center',
    },
    loginText: {
        color: '#64748b',
        fontSize: 14,
    },
    loginTextBold: {
        color: '#0f3460',
        fontWeight: '700',
    },
    sellerBox: {
    backgroundColor: '#f0f4ff',
    borderWidth: 1.5,
    borderColor: '#0f3460',
    borderStyle: 'dashed',
    borderRadius: 10,
    padding: 15,
    marginBottom: 18,
},
sellerBoxLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0f3460',
    marginBottom: 10,
},
imagePicker: {
    alignItems: 'center',
    padding: 12,
},
imagePickerIcon: {
    fontSize: 28,
    marginBottom: 6,
},
imagePickerText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 3,
},
imagePickerHint: {
    fontSize: 11,
    color: '#94a3b8',
},
});