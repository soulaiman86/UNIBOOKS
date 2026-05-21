import { useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ActivityIndicator,
    Image,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export default function SubscriptionPayment() {
    const router = useRouter();
    const params = useLocalSearchParams();

    const plan     = params.plan as string;
    const price    = params.price as string;
    const duration = params.duration as string;

    const [paymentProof, setPaymentProof] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 0.8,
        });
        if (!result.canceled) {
            setPaymentProof(result.assets[0]);
        }
    };

    const handleSubmit = async () => {
        if (!paymentProof) {
            Alert.alert('Error', 'Please upload your payment proof.');
            return;
        }

        setLoading(true);
        try {
            const userStr = await AsyncStorage.getItem('user');
            const userData = userStr ? JSON.parse(userStr) : null;
            const sellerId = userData?.id;

            const formData = new FormData();
            formData.append('seller_id', sellerId);
            formData.append('plan_type', plan);
            formData.append('price', price);
            formData.append('payment_proof', {
                uri: paymentProof.uri,
                type: 'image/jpeg',
                name: 'payment-proof.jpg',
            } as any);

            await axios.post(`${API_URL}/seller/subscription/request`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            setSubmitted(true);
        } catch (err: any) {
            Alert.alert('Error', 'Error submitting request. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // ── Success Screen ──
    if (submitted) {
        return (
            <View style={styles.successPage}>
                <View style={styles.successCard}>
                    <Text style={styles.successIcon}>✅</Text>
                    <Text style={styles.successTitle}>Request Submitted!</Text>
                    <Text style={styles.successDesc}>
                        Your payment proof has been sent to the admin. Your subscription will be activated after verification.
                    </Text>
                    <TouchableOpacity
                        style={styles.backToDashboardBtn}
                        onPress={() => router.replace('/seller/dashboard' as any)}
                    >
                        <Text style={styles.backToDashboardBtnText}>Back to Dashboard</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return (
        <ScrollView style={styles.page} contentContainerStyle={styles.pageContent}>

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                    <Text style={styles.backBtnText}>← Back</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>💳 Subscription Payment</Text>
            </View>

            {/* Order Summary Card */}
            <View style={styles.card}>
                <Text style={styles.cardTitle}>📋 Order Summary</Text>

                <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Plan</Text>
                    <Text style={styles.summaryValue}>{plan}</Text>
                </View>
                <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Duration</Text>
                    <Text style={styles.summaryValue}>{duration}</Text>
                </View>

                <View style={styles.divider} />

                <View style={styles.summaryRow}>
                    <Text style={styles.totalLabel}>Total</Text>
                    <Text style={styles.totalValue}>{price} MAD</Text>
                </View>

                {/* Payment Instructions */}
                <View style={styles.instructionsBox}>
                    <Text style={styles.instructionsTitle}>💳 Payment Instructions</Text>
                    <Text style={styles.instructionsDesc}>
                        Please transfer <Text style={styles.bold}>{price} MAD</Text> to one of the following accounts:
                    </Text>

                    {/* Bank Transfer */}
                    <View style={styles.paymentMethod}>
                        <Text style={styles.methodTitle}>🏦 Bank Transfer</Text>
                        <Text style={styles.methodDetail}>Bank: <Text style={styles.bold}>CIH Bank</Text></Text>
                        <Text style={styles.methodDetail}>Account: <Text style={styles.bold}>007 810 0000123456789</Text></Text>
                        <Text style={styles.methodDetail}>Name: <Text style={styles.bold}>UNIBOOKS SARL</Text></Text>
                    </View>

                    {/* CCP */}
                    <View style={styles.paymentMethod}>
                        <Text style={styles.methodTitle}>📮 CCP</Text>
                        <Text style={styles.methodDetail}>CCP Number: <Text style={styles.bold}>1234567 Clé 89</Text></Text>
                        <Text style={styles.methodDetail}>Name: <Text style={styles.bold}>UNIBOOKS</Text></Text>
                    </View>

                    {/* Warning */}
                    <View style={[styles.paymentMethod, styles.warningMethod]}>
                        <Text style={[styles.methodTitle, { color: '#f39c12' }]}>⚠️ Important</Text>
                        <Text style={styles.methodDetail}>
                            After transferring, upload a photo of your receipt below. Your subscription will be activated within 24 hours after verification.
                        </Text>
                    </View>
                </View>
            </View>

            {/* Upload Proof Card */}
            <View style={styles.card}>
                <Text style={styles.cardTitle}>📤 Upload Payment Proof</Text>
                <Text style={styles.uploadDesc}>
                    Upload a clear photo or screenshot of your payment receipt.
                </Text>

                {/* Image Picker */}
                <TouchableOpacity style={styles.filePicker} onPress={pickImage}>
                    <Text style={styles.filePickerIcon}>🧾</Text>
                    <Text style={styles.filePickerText}>
                        {paymentProof ? '✅ Image Selected' : 'Tap to upload receipt'}
                    </Text>
                    <Text style={styles.filePickerHint}>PNG, JPG supported</Text>
                </TouchableOpacity>

                {/* Preview */}
                {paymentProof && (
                    <View style={styles.previewBox}>
                        <Image
                            source={{ uri: paymentProof.uri }}
                            style={styles.previewImage}
                            resizeMode="cover"
                        />
                        <Text style={styles.previewText}>✅ Receipt uploaded successfully</Text>
                    </View>
                )}

                {/* Submit Button */}
                <TouchableOpacity
                    style={[
                        styles.submitBtn,
                        (!paymentProof || loading) && styles.submitBtnDisabled,
                    ]}
                    onPress={handleSubmit}
                    disabled={!paymentProof || loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.submitBtnText}>✅ Submit Payment Proof</Text>
                    )}
                </TouchableOpacity>

                {/* Cancel Button */}
                <TouchableOpacity style={styles.cancelBtn} onPress={() => router.back()}>
                    <Text style={styles.cancelBtnText}>← Go Back</Text>
                </TouchableOpacity>
            </View>

        </ScrollView>
    );
}

const styles = StyleSheet.create({
    page: {
        flex: 1,
        backgroundColor: '#f0f4f8',
    },
    pageContent: {
        paddingBottom: 40,
    },

    // Header
    header: {
        backgroundColor: '#0f3460',
        paddingTop: 55,
        paddingBottom: 20,
        paddingHorizontal: 20,
    },
    backBtn: {
        alignSelf: 'flex-start',
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 7,
        marginBottom: 14,
    },
    backBtnText: {
        color: 'white',
        fontWeight: '700',
        fontSize: 13,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: 'white',
    },

    // Card
    card: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 20,
        margin: 16,
        marginBottom: 0,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.07,
        shadowRadius: 8,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1a1a2e',
        marginBottom: 16,
        paddingBottom: 12,
        borderBottomWidth: 2,
        borderBottomColor: '#f0f4f8',
    },

    // Summary
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    summaryLabel: {
        color: '#64748b',
        fontSize: 14,
    },
    summaryValue: {
        fontWeight: '700',
        fontSize: 14,
        color: '#1a1a2e',
        textTransform: 'capitalize',
    },
    divider: {
        height: 1.5,
        backgroundColor: '#f0f4f8',
        marginVertical: 12,
    },
    totalLabel: {
        fontWeight: '800',
        fontSize: 16,
        color: '#1a1a2e',
    },
    totalValue: {
        fontWeight: '800',
        fontSize: 18,
        color: '#0f3460',
    },

    // Instructions
    instructionsBox: {
        backgroundColor: '#f8fafc',
        borderRadius: 12,
        padding: 16,
        marginTop: 16,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    instructionsTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#1a1a2e',
        marginBottom: 10,
    },
    instructionsDesc: {
        color: '#374151',
        fontSize: 13,
        marginBottom: 14,
    },
    bold: {
        fontWeight: '700',
    },
    paymentMethod: {
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 14,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    warningMethod: {
        backgroundColor: '#fff8e1',
        borderColor: '#f1c40f',
    },
    methodTitle: {
        fontWeight: '700',
        color: '#1a1a2e',
        fontSize: 14,
        marginBottom: 8,
    },
    methodDetail: {
        fontSize: 13,
        color: '#374151',
        marginBottom: 3,
    },

    // Upload
    uploadDesc: {
        color: '#64748b',
        fontSize: 13,
        marginBottom: 16,
    },
    filePicker: {
        borderWidth: 2,
        borderColor: '#e2e8f0',
        borderStyle: 'dashed',
        borderRadius: 12,
        padding: 28,
        alignItems: 'center',
        backgroundColor: '#f8fafc',
        marginBottom: 16,
    },
    filePickerIcon: {
        fontSize: 36,
        marginBottom: 8,
    },
    filePickerText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 4,
    },
    filePickerHint: {
        fontSize: 12,
        color: '#94a3b8',
    },
    previewBox: {
        backgroundColor: '#f8fafc',
        borderRadius: 12,
        padding: 12,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    previewImage: {
        width: '100%',
        height: 180,
        borderRadius: 10,
        marginBottom: 8,
    },
    previewText: {
        color: '#27ae60',
        fontWeight: '600',
        fontSize: 13,
        textAlign: 'center',
    },

    // Buttons
    submitBtn: {
        backgroundColor: '#27ae60',
        borderRadius: 10,
        padding: 15,
        alignItems: 'center',
        marginBottom: 10,
    },
    submitBtnDisabled: {
        backgroundColor: '#94a3b8',
    },
    submitBtnText: {
        color: 'white',
        fontWeight: '700',
        fontSize: 16,
    },
    cancelBtn: {
        borderWidth: 1.5,
        borderColor: '#e2e8f0',
        borderRadius: 10,
        padding: 13,
        alignItems: 'center',
    },
    cancelBtnText: {
        color: '#64748b',
        fontWeight: '600',
        fontSize: 15,
    },

    // Success
    successPage: {
        flex: 1,
        backgroundColor: '#f0f4f8',
        justifyContent: 'center',
        padding: 20,
    },
    successCard: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 40,
        alignItems: 'center',
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
    },
    successIcon: {
        fontSize: 64,
        marginBottom: 16,
    },
    successTitle: {
        fontSize: 22,
        fontWeight: '800',
        color: '#27ae60',
        marginBottom: 12,
    },
    successDesc: {
        fontSize: 14,
        color: '#64748b',
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 28,
    },
    backToDashboardBtn: {
        backgroundColor: '#0f3460',
        borderRadius: 10,
        paddingHorizontal: 28,
        paddingVertical: 13,
    },
    backToDashboardBtnText: {
        color: 'white',
        fontWeight: '700',
        fontSize: 15,
    },
});