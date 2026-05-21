import { useState, useEffect } from 'react';
import {
    View, Text, FlatList, TouchableOpacity,
    StyleSheet, ActivityIndicator, Alert, Image
} from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export default function MyOrdersScreen() {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        loadUser();
    }, []);

    const loadUser = async () => {
        const userData = await AsyncStorage.getItem('user');
        const token = await AsyncStorage.getItem('token');
        if (userData && token) {
            const parsedUser = JSON.parse(userData);
            setUser(parsedUser);
            fetchOrders(token);
        } else {
            setLoading(false);
        }
    };

    const fetchOrders = async (token: string) => {
        try {
            const res = await axios.get(`${API_URL}/orders/my-orders`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setOrders(res.data);
        } catch (error) {
            console.error("Error fetching orders:", error);
        } finally {
            setLoading(false);
        }
    };

    const cancelOrder = async (orderId: string) => {
        Alert.alert(
            'Cancel Order',
            'Are you sure you want to cancel this order?',
            [
                { text: 'No' },
                {
                    text: 'Yes',
                    onPress: async () => {
                        try {
                            const token = await AsyncStorage.getItem('token');
                            await axios.put(`${API_URL}/orders/cancel-order/${orderId}`, {}, {
                                headers: { 'Authorization': `Bearer ${token}` }
                            });
                            Alert.alert('Success', 'Order cancelled successfully.');
                            loadUser();
                        } catch (error: any) {
                            Alert.alert('Error', error.response?.data?.message || 'Failed to cancel order');
                        }
                    }
                }
            ]
        );
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Delivered': return '#27ae60';
            case 'Shipped': return '#3498db';
            case 'Cancelled': return '#e74c3c';
            default: return '#f39c12';
        }
    };

    const renderOrder = ({ item }: any) => {
        let imageUrl = 'https://via.placeholder.com/150';
        if (item.image_urls && item.image_urls.length > 0) {
            imageUrl = item.image_urls[0].startsWith('http')
                ? item.image_urls[0]
                : `http://192.168.11.105:5000${item.image_urls[0]}`;
        }

        return (
            <View style={styles.orderCard}>
                <View style={styles.orderHeader}>
                    <Image source={{ uri: imageUrl }} style={styles.orderImage} />
                    <View style={styles.orderInfo}>
                        <Text style={styles.orderId}>Order #{item.order_id}</Text>
                        <Text style={styles.orderTitle} numberOfLines={2}>{item.book_title}</Text>
                        <Text style={styles.orderSeller}>Seller: {item.seller_name}</Text>
                        <Text style={styles.orderPrice}>${Number(item.total_price).toFixed(2)}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                        <Text style={styles.statusText}>{item.status}</Text>
                    </View>
                </View>

                <View style={styles.orderFooter}>
                    <Text style={styles.orderDate}>
                        📅 {new Date(item.created_at).toLocaleDateString()}
                    </Text>
                    {item.status === 'Pending' && (
                        <TouchableOpacity
                            style={styles.cancelBtn}
                            onPress={() => cancelOrder(item.order_id)}
                        >
                            <Text style={styles.cancelBtnText}>Cancel Order</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        );
    };

    if (loading) return (
        <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0f3460" />
        </View>
    );

    if (!user) return (
        <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🔐</Text>
            <Text style={styles.emptyTitle}>Login Required</Text>
            <Text style={styles.emptyText}>Please login to view your orders</Text>
            <TouchableOpacity
                style={styles.loginBtn}
                onPress={() => router.push('/auth/login' as any)}
            >
                <Text style={styles.loginBtnText}>Login</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={styles.container}>

            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>📦 My Orders</Text>
                <Text style={styles.headerSubtitle}>{orders.length} order{orders.length !== 1 ? 's' : ''}</Text>
            </View>

            {orders.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyIcon}>📭</Text>
                    <Text style={styles.emptyTitle}>No orders yet</Text>
                    <Text style={styles.emptyText}>Browse books and make your first purchase!</Text>
                    <TouchableOpacity
                        style={styles.browseBtn}
                        onPress={() => router.push('/' as any)}
                    >
                        <Text style={styles.browseBtnText}>Browse Books</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <FlatList
                    data={orders}
                    keyExtractor={(item) => item.order_id.toString()}
                    renderItem={renderOrder}
                    contentContainerStyle={styles.list}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f0f4f8' },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { backgroundColor: '#0f3460', padding: 20, paddingTop: 50 },
    headerTitle: { fontSize: 22, fontWeight: '800', color: 'white' },
    headerSubtitle: { fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 4 },
    list: { padding: 15 },
    orderCard: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 15,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2
    },
    orderHeader: { flexDirection: 'row', gap: 12, marginBottom: 12 },
    orderImage: { width: 70, height: 90, borderRadius: 10, resizeMode: 'cover' },
    orderInfo: { flex: 1 },
    orderId: { fontSize: 13, fontWeight: '700', color: '#1a1a2e', marginBottom: 3 },
    orderTitle: { fontSize: 13, color: '#374151', marginBottom: 3 },
    orderSeller: { fontSize: 12, color: '#94a3b8', marginBottom: 5 },
    orderPrice: { fontSize: 16, fontWeight: '800', color: '#0f3460' },
    statusBadge: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4, alignSelf: 'flex-start' },
    statusText: { color: 'white', fontSize: 11, fontWeight: '700' },
    orderFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#f0f4f8', paddingTop: 12 },
    orderDate: { fontSize: 12, color: '#94a3b8' },
    cancelBtn: { backgroundColor: '#fef2f2', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: '#e74c3c' },
    cancelBtnText: { color: '#e74c3c', fontSize: 12, fontWeight: '700' },
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    emptyIcon: { fontSize: 60, marginBottom: 15 },
    emptyTitle: { fontSize: 20, fontWeight: '700', color: '#1a1a2e', marginBottom: 8 },
    emptyText: { color: '#94a3b8', fontSize: 14, textAlign: 'center', marginBottom: 20 },
    browseBtn: { backgroundColor: '#0f3460', borderRadius: 10, paddingHorizontal: 30, paddingVertical: 12 },
    browseBtnText: { color: 'white', fontWeight: '700', fontSize: 15 },
    loginBtn: { backgroundColor: '#0f3460', borderRadius: 10, paddingHorizontal: 30, paddingVertical: 12 },
    loginBtnText: { color: 'white', fontWeight: '700', fontSize: 15 },
});