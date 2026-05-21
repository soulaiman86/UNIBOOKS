import { useEffect, useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export default function SellerSubscription() {
    const [subscription, setSubscription] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchSubscription = async () => {
            try {
                const userStr = await AsyncStorage.getItem('user');
                const userData = userStr ? JSON.parse(userStr) : null;
                const sellerId = userData?.id;
                if (!sellerId) return;

                const res = await axios.get(`${API_URL}/seller/subscription/${sellerId}`);
                setSubscription(res.data.hasActiveSubscription ? res.data.subscription : null);
            } catch (err: any) {
                console.error('Error fetching subscription:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchSubscription();
    }, []);

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0f3460" />
            </View>
        );
    }

    // ── Progress calculation ──
    const getProgress = () => {
        if (!subscription) return null;
        const start = new Date(subscription.start_date).getTime();
        const end = new Date(subscription.end_date).getTime();
        const now = Date.now();
        const total = end - start;
        const elapsed = now - start;
        const percentage = Math.min(100, Math.round((elapsed / total) * 100));
        const daysLeft = Math.max(0, Math.round((end - now) / (1000 * 60 * 60 * 24)));
        return { percentage, daysLeft };
    };

    const progress = getProgress();

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>

            <Text style={styles.pageTitle}>💳 My Subscription</Text>

            {subscription ? (
                <View style={styles.activeCard}>

                    {/* Active Badge */}
                    <View style={styles.activeBadge}>
                        <Text style={styles.activeBadgeText}>✅ Active Subscription</Text>
                    </View>

                    {/* Info Grid */}
                    <View style={styles.infoGrid}>
                        <View style={styles.infoItem}>
                            <Text style={styles.infoLabel}>PLAN</Text>
                            <Text style={styles.infoValue}>{subscription.plan_type}</Text>
                        </View>
                        <View style={styles.infoItem}>
                            <Text style={styles.infoLabel}>PRICE PAID</Text>
                            <Text style={styles.infoValue}>{subscription.price} MAD</Text>
                        </View>
                        <View style={styles.infoItem}>
                            <Text style={styles.infoLabel}>START DATE</Text>
                            <Text style={styles.infoValue}>
                                {new Date(subscription.start_date).toLocaleDateString()}
                            </Text>
                        </View>
                        <View style={styles.infoItem}>
                            <Text style={styles.infoLabel}>END DATE</Text>
                            <Text style={styles.infoValue}>
                                {new Date(subscription.end_date).toLocaleDateString()}
                            </Text>
                        </View>
                    </View>

                    {/* Progress Bar */}
                    {progress && (
                        <View style={styles.progressSection}>
                            <View style={styles.progressLabelRow}>
                                <Text style={styles.progressLabel}>Subscription Progress</Text>
                                <Text style={[
                                    styles.daysLeft,
                                    { color: progress.daysLeft < 7 ? '#e74c3c' : '#27ae60' }
                                ]}>
                                    {progress.daysLeft} days remaining
                                </Text>
                            </View>

                            {/* Bar */}
                            <View style={styles.progressBarBg}>
                                <View style={[
                                    styles.progressBarFill,
                                    {
                                        width: `${progress.percentage}%` as any,
                                        backgroundColor: progress.daysLeft < 7 ? '#e74c3c' : '#27ae60',
                                    }
                                ]} />
                            </View>

                            {progress.daysLeft < 7 && (
                                <Text style={styles.expiryWarning}>
                                    ⚠️ Your subscription is expiring soon! Renew to continue listing books.
                                </Text>
                            )}
                        </View>
                    )}

                    {/* Renew Button */}
                    <TouchableOpacity
                        style={styles.renewBtn}
                        onPress={() => router.push('/subscription/plans' as any)}
                    >
                        <Text style={styles.renewBtnText}>🔄 Renew or Upgrade Plan</Text>
                    </TouchableOpacity>

                </View>
            ) : (
                // ── No Subscription ──
                <View style={styles.noSubCard}>
                    <Text style={styles.noSubIcon}>📭</Text>
                    <Text style={styles.noSubTitle}>No Active Subscription</Text>
                    <Text style={styles.noSubDesc}>
                        You can list up to 3 books for free. Subscribe to unlock unlimited listings.
                    </Text>
                    <TouchableOpacity
                        style={styles.subscribeBtn}
                        onPress={() => router.push('/subscription/plans' as any)}
                    >
                        <Text style={styles.subscribeBtnText}>💳 View Subscription Plans</Text>
                    </TouchableOpacity>
                </View>
            )}

        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f0f4f8',
    },
    content: {
        padding: 20,
        paddingBottom: 40,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f0f4f8',
    },
    pageTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: '#1a1a2e',
        marginBottom: 20,
    },

    // Active Card
    activeCard: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 24,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 10,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    activeBadge: {
        alignSelf: 'flex-start',
        backgroundColor: '#f0fdf4',
        borderWidth: 1,
        borderColor: '#27ae60',
        borderRadius: 20,
        paddingHorizontal: 14,
        paddingVertical: 6,
        marginBottom: 20,
    },
    activeBadgeText: {
        color: '#27ae60',
        fontWeight: '700',
        fontSize: 13,
    },

    // Info Grid
    infoGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 8,
    },
    infoItem: {
        width: '47%',
        backgroundColor: '#f8fafc',
        borderRadius: 10,
        padding: 14,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    infoLabel: {
        fontSize: 11,
        color: '#94a3b8',
        fontWeight: '700',
        marginBottom: 6,
        letterSpacing: 0.5,
    },
    infoValue: {
        fontSize: 15,
        color: '#1a1a2e',
        fontWeight: '700',
        textTransform: 'capitalize',
    },

    // Progress
    progressSection: {
        marginTop: 20,
    },
    progressLabelRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    progressLabel: {
        fontSize: 13,
        color: '#64748b',
        fontWeight: '600',
    },
    daysLeft: {
        fontSize: 13,
        fontWeight: '700',
    },
    progressBarBg: {
        width: '100%',
        height: 10,
        backgroundColor: '#e2e8f0',
        borderRadius: 10,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 10,
    },
    expiryWarning: {
        color: '#e74c3c',
        fontSize: 13,
        fontWeight: '600',
        marginTop: 10,
    },

    // Renew Button
    renewBtn: {
        marginTop: 24,
        backgroundColor: '#0f3460',
        borderRadius: 10,
        padding: 14,
        alignItems: 'center',
    },
    renewBtnText: {
        color: 'white',
        fontWeight: '700',
        fontSize: 15,
    },

    // No Subscription Card
    noSubCard: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 40,
        alignItems: 'center',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 10,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    noSubIcon: {
        fontSize: 60,
        marginBottom: 16,
    },
    noSubTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#1a1a2e',
        marginBottom: 10,
    },
    noSubDesc: {
        fontSize: 14,
        color: '#64748b',
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 24,
    },
    subscribeBtn: {
        backgroundColor: '#27ae60',
        borderRadius: 10,
        paddingHorizontal: 28,
        paddingVertical: 13,
    },
    subscribeBtnText: {
        color: 'white',
        fontWeight: '700',
        fontSize: 15,
    },
});