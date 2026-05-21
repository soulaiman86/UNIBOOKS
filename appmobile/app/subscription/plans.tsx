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

const PLANS = [
    {
        id: 'monthly',
        title: 'Monthly',
        duration: '1 Month',
        price: 100,
        originalPrice: null,
        discount: null,
        color: '#3498db',
        icon: '📅',
        features: [
            'Up to 50 books',
            'Basic support',
            'Standard listing',
            '🥉 Priority Level 3: Appears after Semi-Annual & Annual',
        ],
    },
    {
        id: 'semi-annual',
        title: 'Semi-Annual',
        duration: '6 Months',
        price: 400,
        originalPrice: 600,
        discount: 33,
        color: '#0f3460',
        icon: '🌟',
        popular: true,
        features: [
            'Up to 50 books',
            'Priority support',
            'Featured listing',
            'Save 33%',
            '🥈 Priority Level 2: Appears before Monthly subscribers',
        ],
    },
    {
        id: 'annual',
        title: 'Annual',
        duration: '1 Year',
        price: 650,
        originalPrice: 1200,
        discount: 46,
        color: '#27ae60',
        icon: '👑',
        features: [
            'Up to 50 books',
            'VIP support',
            'Top listing priority',
            'Save 46%',
            '🥇 Priority Level 1: Books ALWAYS appear first',
        ],
    },
];

const PRIORITY_ITEMS = [
    { icon: '🥇', title: 'Annual Subscribers',      desc: 'Books always appear first on the homepage' },
    { icon: '🥈', title: 'Semi-Annual Subscribers', desc: 'Books appear after Annual subscribers' },
    { icon: '🥉', title: 'Monthly Subscribers',     desc: 'Books appear after Semi-Annual subscribers' },
    { icon: '📚', title: 'Free Sellers',            desc: 'Books appear last (up to 3 books only)' },
];

export default function SubscriptionPlans() {
    const router = useRouter();
    const [currentSubscription, setCurrentSubscription] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSubscription = async () => {
            try {
                const userStr = await AsyncStorage.getItem('user');
                const userData = userStr ? JSON.parse(userStr) : null;
                const sellerId = userData?.id;
                if (!sellerId) return;

                const res = await axios.get(`${API_URL}/seller/subscription/${sellerId}`);
                if (res.data.hasActiveSubscription) {
                    setCurrentSubscription(res.data.subscription);
                }
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
                <ActivityIndicator size="large" color="white" />
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
                <Text style={styles.headerTitle}>📚 UNIBOOKS Premium</Text>
                <Text style={styles.headerSubtitle}>Choose Your Subscription Plan</Text>
                <Text style={styles.headerDesc}>Unlock unlimited book listings and grow your sales</Text>

                {currentSubscription && (
                    <View style={styles.activeSubBanner}>
                        <Text style={styles.activeSubText}>
                            ✅ You have an active <Text style={styles.boldGreen}>{currentSubscription.plan_type}</Text> subscription
                            valid until <Text style={styles.boldGreen}>{new Date(currentSubscription.end_date).toLocaleDateString()}</Text>
                        </Text>
                    </View>
                )}
            </View>

            {/* Plans */}
            {PLANS.map(plan => (
                <View
                    key={plan.id}
                    style={[
                        styles.planCard,
                        plan.popular && { borderWidth: 3, borderColor: plan.color },
                    ]}
                >
                    {/* Popular Badge */}
                    {plan.popular && (
                        <View style={styles.popularBadge}>
                            <Text style={styles.popularBadgeText}>⭐ Most Popular</Text>
                        </View>
                    )}

                    {/* Discount Badge */}
                    {plan.discount && (
                        <View style={styles.discountBadge}>
                            <Text style={styles.discountBadgeText}>Save {plan.discount}%</Text>
                        </View>
                    )}

                    {/* Plan Info */}
                    <Text style={styles.planIcon}>{plan.icon}</Text>
                    <Text style={[styles.planTitle, { color: plan.color }]}>{plan.title}</Text>
                    <Text style={styles.planDuration}>{plan.duration}</Text>

                    {/* Price */}
                    <View style={styles.priceContainer}>
                        {plan.originalPrice && (
                            <Text style={styles.originalPrice}>{plan.originalPrice} MAD</Text>
                        )}
                        <View style={styles.priceRow}>
                            <Text style={[styles.priceCurrency, { color: plan.color }]}>MAD</Text>
                            <Text style={[styles.priceAmount, { color: plan.color }]}>{plan.price}</Text>
                        </View>
                    </View>

                    {/* Features */}
                    <View style={styles.featuresList}>
                        {plan.features.map((feature, index) => (
                            <View key={index} style={styles.featureItem}>
                                <Text style={[styles.featureCheck, { color: plan.color }]}>✓</Text>
                                <Text style={styles.featureText}>{feature}</Text>
                            </View>
                        ))}
                    </View>

                    {/* Choose Plan Button */}
                    <TouchableOpacity
                        style={[styles.choosePlanBtn, { backgroundColor: plan.color }]}
                        onPress={() => router.push({
                            pathname: '/subscription/payment' as any,
                            params: {
                                plan: plan.id,
                                price: String(plan.price),
                                duration: plan.duration,
                            },
                        })}
                    >
                        <Text style={styles.choosePlanBtnText}>Choose {plan.title}</Text>
                    </TouchableOpacity>
                </View>
            ))}

            {/* Priority Info Box */}
            <View style={styles.priorityBox}>
                <Text style={styles.priorityBoxTitle}>🏆 How Book Priority Works</Text>
                {PRIORITY_ITEMS.map((item, index) => (
                    <View key={index} style={styles.priorityItem}>
                        <Text style={styles.priorityIcon}>{item.icon}</Text>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.priorityTitle}>{item.title}</Text>
                            <Text style={styles.priorityDesc}>{item.desc}</Text>
                        </View>
                    </View>
                ))}
            </View>

            {/* Info Box */}
            <View style={styles.infoBox}>
                <Text style={styles.infoText}>
                    🔒 Your subscription will be activated after payment verification by admin.
                    For any questions contact us at <Text style={styles.boldWhite}>unibooks@support.com</Text>
                </Text>
            </View>

        </ScrollView>
    );
}

const styles = StyleSheet.create({
    page: {
        flex: 1,
        backgroundColor: '#0f3460',
    },
    pageContent: {
        paddingBottom: 40,
    },
    loadingContainer: {
        flex: 1,
        backgroundColor: '#0f3460',
        justifyContent: 'center',
        alignItems: 'center',
    },

    // Header
    header: {
        padding: 24,
        paddingTop: 55,
        alignItems: 'center',
        marginBottom: 10,
    },
    backBtn: {
        alignSelf: 'flex-start',
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 7,
        marginBottom: 20,
    },
    backBtnText: {
        color: 'white',
        fontWeight: '700',
        fontSize: 13,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '800',
        color: 'white',
        marginBottom: 8,
        textAlign: 'center',
    },
    headerSubtitle: {
        fontSize: 18,
        fontWeight: '700',
        color: 'rgba(255,255,255,0.9)',
        marginBottom: 8,
        textAlign: 'center',
    },
    headerDesc: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.6)',
        textAlign: 'center',
    },
    activeSubBanner: {
        marginTop: 16,
        backgroundColor: 'rgba(39,174,96,0.2)',
        borderWidth: 1,
        borderColor: '#27ae60',
        borderRadius: 10,
        padding: 12,
    },
    activeSubText: {
        color: '#27ae60',
        fontSize: 13,
        textAlign: 'center',
    },
    boldGreen: {
        fontWeight: '700',
        color: '#27ae60',
    },

    // Plan Card
    planCard: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 24,
        marginHorizontal: 16,
        marginBottom: 20,
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: '#e2e8f0',
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
    },
    popularBadge: {
        position: 'absolute',
        top: -14,
        backgroundColor: '#0f3460',
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 5,
    },
    popularBadgeText: {
        color: 'white',
        fontSize: 12,
        fontWeight: '700',
    },
    discountBadge: {
        position: 'absolute',
        top: 14,
        right: 14,
        backgroundColor: '#e74c3c',
        borderRadius: 20,
        paddingHorizontal: 10,
        paddingVertical: 4,
    },
    discountBadgeText: {
        color: 'white',
        fontSize: 11,
        fontWeight: '700',
    },
    planIcon: {
        fontSize: 48,
        marginBottom: 10,
        marginTop: 10,
    },
    planTitle: {
        fontSize: 22,
        fontWeight: '800',
        marginBottom: 4,
    },
    planDuration: {
        color: '#94a3b8',
        fontSize: 14,
        marginBottom: 16,
    },

    // Price
    priceContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    originalPrice: {
        color: '#94a3b8',
        textDecorationLine: 'line-through',
        fontSize: 14,
        marginBottom: 4,
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: 4,
    },
    priceCurrency: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 6,
    },
    priceAmount: {
        fontSize: 52,
        fontWeight: '800',
    },

    // Features
    featuresList: {
        width: '100%',
        marginBottom: 24,
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f4f8',
        gap: 8,
    },
    featureCheck: {
        fontWeight: '700',
        fontSize: 14,
        marginTop: 1,
    },
    featureText: {
        flex: 1,
        fontSize: 13,
        color: '#374151',
        lineHeight: 18,
    },

    // Button
    choosePlanBtn: {
        width: '100%',
        padding: 15,
        borderRadius: 12,
        alignItems: 'center',
    },
    choosePlanBtnText: {
        color: 'white',
        fontWeight: '700',
        fontSize: 16,
    },

    // Priority Box
    priorityBox: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 16,
        padding: 20,
        marginHorizontal: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    priorityBoxTitle: {
        color: 'white',
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 16,
    },
    priorityItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderRadius: 10,
        padding: 12,
        marginBottom: 10,
        gap: 12,
    },
    priorityIcon: {
        fontSize: 24,
    },
    priorityTitle: {
        color: 'white',
        fontWeight: '700',
        fontSize: 13,
        marginBottom: 2,
    },
    priorityDesc: {
        color: 'rgba(255,255,255,0.65)',
        fontSize: 12,
    },

    // Info Box
    infoBox: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 12,
        padding: 16,
        marginHorizontal: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    infoText: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 13,
        textAlign: 'center',
        lineHeight: 20,
    },
    boldWhite: {
        fontWeight: '700',
        color: 'white',
    },
});