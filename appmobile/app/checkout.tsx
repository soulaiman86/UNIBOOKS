import { useEffect, useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export default function Checkout() {
    const router = useRouter();
    const params = useLocalSearchParams();

    // directBook يُمرر كـ JSON string عبر params
    const rawBook = Array.isArray(params.directBook) 
    ? params.directBook[0] 
    : params.directBook;
    const directBook = rawBook ? JSON.parse(rawBook) : null;
    const [cartItems, setCartItems] = useState<any[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [shippingData, setShippingData] = useState({ phone: '', address: '' });

    useEffect(() => {
        const init = async () => {
            if (directBook) {
                setCartItems([{
                    cart_item_id: directBook.id,
                    title: directBook.title,
                    price: directBook.price,
                    quantity: 1,
                }]);
                setTotal(Number(directBook.price));
                return;
            }

            const userStr = await AsyncStorage.getItem('user');
            const userData = userStr ? JSON.parse(userStr) : null;
            const userId = userData?.id;
            if (!userId) return;

            try {
                const res = await axios.get(`${API_URL}/cart/${userId}`);
                setCartItems(res.data);
                const sum = res.data.reduce(
                    (acc: number, item: any) => acc + item.price * item.quantity,
                    0
                );
                setTotal(sum);
            } catch (err: any) {
                console.error('Error fetching cart for checkout', err);
            }
        };

        init();
    }, []);

    const handlePlaceOrder = async () => {
        const token = await AsyncStorage.getItem('token');
        const userStr = await AsyncStorage.getItem('user');
        const userData = userStr ? JSON.parse(userStr) : null;
        const userId = userData?.id;

        if (!token) {
            Alert.alert('Error', 'Please login first to complete your purchase');
            return;
        }
        if (!shippingData.phone || !shippingData.address) {
            Alert.alert('Error', 'Please fill in your shipping details!');
            return;
        }

        setLoading(true);
        try {
            if (directBook) {
                await axios.post(`${API_URL}/cart/add`, {
                    user_id: userId,
                    book_id: directBook.id,
                });
            }

            await axios.post(
                `${API_URL}/orders/place-order`,
                { phone_number: shippingData.phone, address: shippingData.address },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            Alert.alert(
                '🎉 Success',
                'Order Placed Successfully! The seller will contact you soon.',
                [{ text: 'OK', onPress: () => router.push('/(tabs)/' as any) }]
            );
        } catch (err: any) {
            if (err.response?.status === 401 || err.response?.status === 403) {
                Alert.alert('Session Expired', 'Your session has expired. Please login again.');
            } else {
                Alert.alert('Error', err.response?.data?.message || 'Something went wrong.');
            }
        } finally {
            setLoading(false);
        }
    };

    // --- Empty State ---
    if (cartItems.length === 0) {
        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyIcon}>🛒</Text>
                <Text style={styles.emptyText}>Your cart is empty!</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.page} contentContainerStyle={styles.pageContent}>

            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>🧾 Checkout</Text>
            </View>

            {/* Order Summary Card */}
            <View style={styles.card}>
                <Text style={styles.cardTitle}>📦 Order Summary</Text>

                {cartItems.map((item: any) => (
                    <View key={item.cart_item_id} style={styles.itemRow}>
                        <View style={styles.itemInfo}>
                            <Text style={styles.itemTitle}>{item.title}</Text>
                            <Text style={styles.itemQty}>Quantity: {item.quantity}</Text>
                        </View>
                        <Text style={styles.itemPrice}>
                            ${(item.price * item.quantity).toFixed(2)}
                        </Text>
                    </View>
                ))}

                <View style={styles.divider} />

                <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>Subtotal</Text>
                    <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
                </View>
                <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>Shipping</Text>
                    <Text style={styles.shippingValue}>Paid $50</Text>
                </View>
                <View style={[styles.totalRow, { marginTop: 10 }]}>
                    <Text style={styles.grandTotalLabel}>Total</Text>
                    <Text style={styles.grandTotalValue}>
                        ${(Number(total.toFixed(2)) + 50).toFixed(2)}
                    </Text>
                </View>
            </View>

            {/* Shipping Details Card */}
            <View style={styles.card}>
                <Text style={styles.cardTitle}>🚚 Shipping Details</Text>

                <Text style={styles.label}>Phone Number</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Enter your phone number"
                    placeholderTextColor="#94a3b8"
                    value={shippingData.phone}
                    onChangeText={(val) => setShippingData({ ...shippingData, phone: val })}
                    keyboardType="phone-pad"
                />

                <Text style={styles.label}>Delivery Address</Text>
                <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="City, Street, Building..."
                    placeholderTextColor="#94a3b8"
                    value={shippingData.address}
                    onChangeText={(val) => setShippingData({ ...shippingData, address: val })}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                />

                {/* Info Box */}
                <View style={styles.infoBox}>
                    <Text style={styles.infoText}>
                        🔒 Your order information is secure and encrypted.
                    </Text>
                </View>

                {/* Confirm Button */}
                <TouchableOpacity
                    style={[styles.confirmBtn, loading && styles.confirmBtnDisabled]}
                    onPress={handlePlaceOrder}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.confirmBtnText}>✅ Confirm & Place Order</Text>
                    )}
                </TouchableOpacity>

                {/* Back Button */}
                <TouchableOpacity
                    style={styles.backBtn}
                    onPress={() => router.back()}
                >
                    <Text style={styles.backBtnText}>← Go Back</Text>
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
        paddingTop: 50,
        paddingBottom: 20,
        paddingHorizontal: 20,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: '800',
        color: '#fff',
    },

    // Card
    card: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        margin: 16,
        marginBottom: 0,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
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

    // Items
    itemRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        backgroundColor: '#f8fafc',
        borderRadius: 10,
        padding: 12,
        marginBottom: 10,
    },
    itemInfo: {
        flex: 1,
        marginRight: 10,
    },
    itemTitle: {
        fontWeight: '600',
        color: '#1a1a2e',
        fontSize: 14,
        marginBottom: 4,
    },
    itemQty: {
        color: '#94a3b8',
        fontSize: 12,
    },
    itemPrice: {
        fontWeight: '700',
        color: '#0f3460',
        fontSize: 14,
    },

    // Divider
    divider: {
        height: 1.5,
        backgroundColor: '#f0f4f8',
        marginVertical: 14,
    },

    // Totals
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 6,
    },
    totalLabel: {
        color: '#64748b',
        fontSize: 14,
    },
    totalValue: {
        fontWeight: '600',
        fontSize: 14,
        color: '#1a1a2e',
    },
    shippingValue: {
        color: '#27ae60',
        fontWeight: '600',
        fontSize: 14,
    },
    grandTotalLabel: {
        fontWeight: '800',
        fontSize: 16,
        color: '#1a1a2e',
    },
    grandTotalValue: {
        fontWeight: '800',
        fontSize: 18,
        color: '#0f3460',
    },

    // Form
    label: {
        fontSize: 13,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 6,
        marginTop: 4,
    },
    input: {
        backgroundColor: '#f8fafc',
        borderWidth: 1.5,
        borderColor: '#e2e8f0',
        borderRadius: 10,
        padding: 12,
        fontSize: 15,
        color: '#1a1a2e',
        marginBottom: 16,
    },
    textArea: {
        height: 100,
    },

    // Info Box
    infoBox: {
        backgroundColor: '#f0f4ff',
        borderWidth: 1,
        borderColor: '#e0e7ff',
        borderRadius: 10,
        padding: 12,
        marginBottom: 18,
    },
    infoText: {
        fontSize: 13,
        color: '#64748b',
    },

    // Buttons
    confirmBtn: {
        backgroundColor: '#27ae60',
        borderRadius: 10,
        padding: 15,
        alignItems: 'center',
        marginBottom: 10,
    },
    confirmBtnDisabled: {
        backgroundColor: '#94a3b8',
    },
    confirmBtnText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 16,
    },
    backBtn: {
        borderWidth: 1.5,
        borderColor: '#e2e8f0',
        borderRadius: 10,
        padding: 13,
        alignItems: 'center',
    },
    backBtnText: {
        color: '#64748b',
        fontWeight: '600',
        fontSize: 15,
    },

    // Empty State
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f0f4f8',
        marginTop: 150,
    },
    emptyIcon: {
        fontSize: 60,
        marginBottom: 12,
    },
    emptyText: {
        color: '#94a3b8',
        fontSize: 16,
    },
});