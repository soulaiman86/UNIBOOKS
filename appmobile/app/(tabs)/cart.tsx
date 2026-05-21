import { useState, useEffect } from 'react';
import {
    View, Text, FlatList, TouchableOpacity,
    StyleSheet, ActivityIndicator, Alert, Image
} from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export default function CartScreen() {
    const [cartItems, setCartItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        loadUser();
    }, []);

    const loadUser = async () => {
        const userData = await AsyncStorage.getItem('user');
        if (userData) {
            const parsedUser = JSON.parse(userData);
            setUser(parsedUser);
            fetchCart(parsedUser.id);
        } else {
            setLoading(false);
        }
    };

    const fetchCart = async (userId: string) => {
        try {
            const res = await axios.get(`${API_URL}/cart/${userId}`);
            setCartItems(res.data);
        } catch (error) {
            console.error("Error fetching cart:", error);
        } finally {
            setLoading(false);
        }
    };

    const removeFromCart = async (cartItemId: string) => {
        try {
            await axios.delete(`${API_URL}/cart/${cartItemId}`);
            setCartItems(cartItems.filter(item => item.cart_item_id !== cartItemId));
        } catch (error) {
            Alert.alert('Error', 'Could not remove item.');
        }
    };

    const updateQuantity = async (cartItemId: string, action: string) => {
        try {
            await axios.put(`${API_URL}/cart/update-quantity`, {
                cart_item_id: cartItemId,
                action: action
            });
            setCartItems(prevItems => prevItems.map(item => {
                if (item.cart_item_id === cartItemId) {
                    const newQty = action === 'increment' ? item.quantity + 1 : Math.max(1, item.quantity - 1);
                    return { ...item, quantity: newQty };
                }
                return item;
            }));
        } catch (error: any) {
            if (error.response?.status === 400) {
                Alert.alert('Error', error.response.data.message);
            }
        }
    };

    const totalPrice = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    const renderItem = ({ item }: any) => {
        let imageUrl = 'https://via.placeholder.com/150';
        if (item.image_urls && item.image_urls.length > 0) {
            imageUrl = item.image_urls[0];
        }

        return (
            <View style={styles.cartItem}>
                <Image source={{ uri: imageUrl }} style={styles.itemImage} />
                <View style={styles.itemInfo}>
                    <Text style={styles.itemTitle} numberOfLines={2}>{item.title}</Text>
                    <Text style={styles.itemPrice}>${Number(item.price).toFixed(2)}</Text>
                    <Text style={styles.itemSubtotal}>
                        Subtotal: <Text style={{ fontWeight: '700' }}>${(item.price * item.quantity).toFixed(2)}</Text>
                    </Text>
                    <View style={styles.qtyRow}>
                        <TouchableOpacity
                            style={styles.qtyBtn}
                            onPress={() => updateQuantity(item.cart_item_id, 'decrement')}
                        >
                            <Text style={styles.qtyBtnText}>−</Text>
                        </TouchableOpacity>
                        <Text style={styles.qtyNum}>{item.quantity}</Text>
                        <TouchableOpacity
                            style={styles.qtyBtn}
                            onPress={() => updateQuantity(item.cart_item_id, 'increment')}
                        >
                            <Text style={styles.qtyBtnText}>+</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.removeBtn}
                            onPress={() => removeFromCart(item.cart_item_id)}
                        >
                            <Text style={styles.removeBtnText}>🗑️ Remove</Text>
                        </TouchableOpacity>
                    </View>
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
            <Text style={styles.emptyText}>Please login to view your cart</Text>
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
                <Text style={styles.headerTitle}>🛒 Your Cart</Text>
                {cartItems.length > 0 && (
                    <View style={styles.countBadge}>
                        <Text style={styles.countBadgeText}>{cartItems.length} item{cartItems.length > 1 ? 's' : ''}</Text>
                    </View>
                )}
            </View>

            {cartItems.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyIcon}>🛒</Text>
                    <Text style={styles.emptyTitle}>Your cart is empty</Text>
                    <Text style={styles.emptyText}>Browse books and add them to your cart</Text>
                    <TouchableOpacity
                        style={styles.browseBtn}
                        onPress={() => router.push('/' as any)}
                    >
                        <Text style={styles.browseBtnText}>Browse Books</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <>
                    <FlatList
                        data={cartItems}
                        keyExtractor={(item) => item.cart_item_id.toString()}
                        renderItem={renderItem}
                        contentContainerStyle={styles.list}
                        showsVerticalScrollIndicator={false}
                    />

                    {/* Summary */}
                    <View style={styles.summary}>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Items ({cartItems.length})</Text>
                            <Text style={styles.summaryValue}>${totalPrice.toFixed(2)}</Text>
                        </View>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Shipping</Text>
                            <Text style={[styles.summaryValue, { color: '#27ae60' }]}>Free</Text>
                        </View>
                        <View style={styles.divider} />
                        <View style={styles.summaryRow}>
                            <Text style={styles.totalLabel}>Total</Text>
                            <Text style={styles.totalValue}>${totalPrice.toFixed(2)}</Text>
                        </View>
                        <TouchableOpacity
                            style={styles.checkoutBtn}
                            onPress={() => router.push('/checkout' as any)}
                        >
                            <Text style={styles.checkoutBtnText}>Proceed to Checkout →</Text>
                        </TouchableOpacity>
                    </View>
                </>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f0f4f8' },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { backgroundColor: '#0f3460', padding: 20, paddingTop: 50, flexDirection: 'row', alignItems: 'center', gap: 12 },
    headerTitle: { fontSize: 22, fontWeight: '800', color: 'white' },
    countBadge: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
    countBadgeText: { color: 'white', fontSize: 12, fontWeight: '600' },
    list: { padding: 15 },
    cartItem: { backgroundColor: 'white', borderRadius: 16, padding: 15, marginBottom: 12, flexDirection: 'row', gap: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
    itemImage: { width: 80, height: 110, borderRadius: 10, resizeMode: 'cover' },
    itemInfo: { flex: 1 },
    itemTitle: { fontSize: 14, fontWeight: '700', color: '#1a1a2e', marginBottom: 5 },
    itemPrice: { fontSize: 16, fontWeight: '700', color: '#0f3460', marginBottom: 3 },
    itemSubtotal: { fontSize: 12, color: '#94a3b8', marginBottom: 10 },
    qtyRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    qtyBtn: { width: 30, height: 30, borderRadius: 8, backgroundColor: '#f0f4f8', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#e2e8f0' },
    qtyBtnText: { fontSize: 16, fontWeight: '700', color: '#0f3460' },
    qtyNum: { fontSize: 16, fontWeight: '700', color: '#1a1a2e', minWidth: 20, textAlign: 'center' },
    removeBtn: { marginLeft: 'auto' as any, backgroundColor: '#fef2f2', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5 },
    removeBtnText: { color: '#e74c3c', fontSize: 12, fontWeight: '600' },
    summary: { backgroundColor: 'white', padding: 20, borderTopWidth: 1, borderTopColor: '#e2e8f0' },
    summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
    summaryLabel: { color: '#64748b', fontSize: 14 },
    summaryValue: { fontWeight: '600', fontSize: 14, color: '#1a1a2e' },
    divider: { height: 1, backgroundColor: '#f0f4f8', marginVertical: 10 },
    totalLabel: { fontWeight: '800', fontSize: 16, color: '#1a1a2e' },
    totalValue: { fontWeight: '800', fontSize: 20, color: '#0f3460' },
    checkoutBtn: { backgroundColor: '#0f3460', borderRadius: 10, padding: 15, alignItems: 'center', marginTop: 12 },
    checkoutBtnText: { color: 'white', fontWeight: '700', fontSize: 16 },
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    emptyIcon: { fontSize: 60, marginBottom: 15 },
    emptyTitle: { fontSize: 20, fontWeight: '700', color: '#1a1a2e', marginBottom: 8 },
    emptyText: { color: '#94a3b8', fontSize: 14, textAlign: 'center', marginBottom: 20 },
    browseBtn: { backgroundColor: '#0f3460', borderRadius: 10, paddingHorizontal: 30, paddingVertical: 12 },
    browseBtnText: { color: 'white', fontWeight: '700', fontSize: 15 },
    loginBtn: { backgroundColor: '#0f3460', borderRadius: 10, paddingHorizontal: 30, paddingVertical: 12 },
    loginBtnText: { color: 'white', fontWeight: '700', fontSize: 15 },
});