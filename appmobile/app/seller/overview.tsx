import { useEffect, useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const statusColor = (status: string) => {
    if (status === 'Delivered') return '#27ae60';
    if (status === 'Pending') return '#f1c40f';
    if (status === 'Shipped') return '#3498db';
    if (status === 'Cancelled') return '#e74c3c';
    return '#95a5a6';
};

export default function SellerOverview() {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const userStr = await AsyncStorage.getItem('user');
                const userData = userStr ? JSON.parse(userStr) : null;
                const sellerId = userData?.id;
                if (!sellerId) return;

                const res = await axios.get(`${API_URL}/seller/seller-stats/${sellerId}`);
                setStats(res.data);
            } catch (err: any) {
                console.error('Error fetching seller stats:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0f3460" />
            </View>
        );
    }

    if (!stats) {
        return (
            <View style={styles.loadingContainer}>
                <Text style={styles.errorText}>Failed to load stats.</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>

            <Text style={styles.sectionTitle}>📊 My Overview</Text>

            {/* Main Stats */}
            <View style={styles.cardsRow}>
                <View style={[styles.statCard, { backgroundColor: '#3498db' }]}>
                    <Text style={styles.cardNumber}>{stats.totalBooks}</Text>
                    <Text style={styles.cardLabel}>Books Listed</Text>
                </View>
                <View style={[styles.statCard, { backgroundColor: '#2c3e50' }]}>
                    <Text style={styles.cardNumber}>{stats.totalOrders}</Text>
                    <Text style={styles.cardLabel}>Total Orders</Text>
                </View>
                <View style={[styles.statCard, { backgroundColor: '#27ae60' }]}>
                    <Text style={styles.cardNumber}>
                        ${Number(stats.totalRevenue).toFixed(2)}
                    </Text>
                    <Text style={styles.cardLabel}>Total Revenue</Text>
                </View>
            </View>

            {/* Orders by Status */}
            <Text style={[styles.sectionTitle, { marginTop: 30 }]}>📦 Orders by Status</Text>
            <View style={styles.cardsRow}>
                {stats.ordersByStatus.map((item: any) => (
                    <View
                        key={item.status}
                        style={[styles.statCard, { backgroundColor: statusColor(item.status) }]}
                    >
                        <Text style={styles.cardNumber}>{item.count}</Text>
                        <Text style={styles.cardLabel}>{item.status}</Text>
                    </View>
                ))}
            </View>

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
    errorText: {
        color: '#94a3b8',
        fontSize: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1a1a2e',
        marginBottom: 15,
    },
    cardsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    statCard: {
        flex: 1,
        minWidth: 90,
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.12,
        shadowRadius: 6,
    },
    cardNumber: {
        fontSize: 26,
        fontWeight: '800',
        color: 'white',
        marginBottom: 4,
    },
    cardLabel: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.9)',
        textAlign: 'center',
    },
});