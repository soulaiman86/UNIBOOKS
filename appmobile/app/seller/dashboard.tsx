import { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    ActivityIndicator,
    Alert,
    TextInput,
    FlatList,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const TABS = [
    { key: 'overview',     label: 'Overview',     icon: '📊' },
    { key: 'books',        label: 'My Books',      icon: '📚' },
    { key: 'sales',        label: 'My Sales',      icon: '💰' },
    { key: 'subscription', label: 'Subscription',  icon: '💳' },
];

const statusColor = (status: string) => {
    if (status === 'Delivered') return '#27ae60';
    if (status === 'Shipped')   return '#3498db';
    if (status === 'Cancelled') return '#e74c3c';
    return '#f1c40f';
};

const STATUS_OPTIONS = ['Pending', 'Shipped', 'Delivered', 'Cancelled'];

// ─────────────────────────────────────────────
// OVERVIEW TAB
// ─────────────────────────────────────────────
function OverviewTab({ sellerId }: { sellerId: string }) {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            try {
                const res = await axios.get(`${API_URL}/seller/seller-stats/${sellerId}`);
                setStats(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, [sellerId]);

    if (loading) return <View style={s.center}><ActivityIndicator color="#0f3460" /></View>;
    if (!stats)  return <View style={s.center}><Text style={s.errorText}>Failed to load stats.</Text></View>;

    return (
        <ScrollView contentContainerStyle={s.tabContent}>
            <Text style={s.sectionTitle}>📊 Overview</Text>
            <View style={s.cardsRow}>
                <View style={[s.statCard, { backgroundColor: '#3498db' }]}>
                    <Text style={s.cardNumber}>{stats.totalBooks}</Text>
                    <Text style={s.cardLabel}>Books Listed</Text>
                </View>
                <View style={[s.statCard, { backgroundColor: '#2c3e50' }]}>
                    <Text style={s.cardNumber}>{stats.totalOrders}</Text>
                    <Text style={s.cardLabel}>Total Orders</Text>
                </View>
                <View style={[s.statCard, { backgroundColor: '#27ae60' }]}>
                    <Text style={s.cardNumber}>${Number(stats.totalRevenue).toFixed(2)}</Text>
                    <Text style={s.cardLabel}>Revenue</Text>
                </View>
            </View>

            <Text style={[s.sectionTitle, { marginTop: 24 }]}>📦 Orders by Status</Text>
            <View style={s.cardsRow}>
                {stats.ordersByStatus.map((item: any) => (
                    <View key={item.status} style={[s.statCard, { backgroundColor: statusColor(item.status) }]}>
                        <Text style={s.cardNumber}>{item.count}</Text>
                        <Text style={s.cardLabel}>{item.status}</Text>
                    </View>
                ))}
            </View>
        </ScrollView>
    );
}

// ─────────────────────────────────────────────
// BOOKS TAB
// ─────────────────────────────────────────────
function BooksTab({ sellerId }: { sellerId: string }) {
    const [books, setBooks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const fetchBooks = async () => {
        try {
            const res = await axios.get(`${API_URL}/seller/books/${sellerId}`);
            setBooks(res.data);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchBooks(); }, [sellerId]);

    const handleDelete = (id: string) => {
        Alert.alert('Delete Book', 'Are you sure?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete', style: 'destructive',
                onPress: async () => {
                    try {
                        await axios.delete(`${API_URL}/seller/books/${id}`);
                        fetchBooks();
                    } catch { Alert.alert('Error', 'Failed to delete book.'); }
                },
            },
        ]);
    };

    if (loading) return <View style={s.center}><ActivityIndicator color="#0f3460" /></View>;

    return (
        <ScrollView contentContainerStyle={s.tabContent}>
            <Text style={s.sectionTitle}>📚 My Books</Text>
            {books.length === 0 ? (
                <View style={s.emptyBox}>
                    <Text style={s.emptyIcon}>📭</Text>
                    <Text style={s.emptyText}>No books found.</Text>
                </View>
            ) : (
                books.map((book: any) => (
                    <View key={book.id} style={s.bookCard}>
                        <View style={s.bookCardHeader}>
                            <Text style={s.bookTitle} numberOfLines={2}>{book.title}</Text>
                            <Text style={s.bookDate}>{new Date(book.created_at).toLocaleDateString()}</Text>
                        </View>
                        <View style={s.bookCardMeta}>
                            <Text style={s.bookPrice}>${Number(book.price).toFixed(2)}</Text>
                            <View style={[s.stockBadge, { backgroundColor: book.stock > 0 ? '#27ae60' : '#e74c3c' }]}>
                                <Text style={s.stockText}>Stock: {book.stock}</Text>
                            </View>
                        </View>
                        <View style={s.bookCardActions}>
                            <TouchableOpacity style={s.editBtn} onPress={() => router.push(`/book/edit/${book.id}` as any)}>
                                <Text style={s.btnText}>✏️ Edit</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={s.deleteBtn} onPress={() => handleDelete(book.id)}>
                                <Text style={s.btnText}>🗑️ Delete</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                ))
            )}
        </ScrollView>
    );
}

// ─────────────────────────────────────────────
// CHAT BOX
// ─────────────────────────────────────────────
function ChatBox({ orderId, currentUserId, receiverId }: any) {
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState('');

    const fetchMessages = useCallback(async () => {
        try {
            const res = await axios.get(`${API_URL}/chat/chat/${orderId}`);
            setMessages(res.data);
        } catch (err) { console.error(err); }
    }, [orderId]);

    useEffect(() => {
        fetchMessages();
        const interval = setInterval(fetchMessages, 5000);
        return () => clearInterval(interval);
    }, [fetchMessages]);

    const sendMessage = async () => {
        if (!newMessage.trim()) return;
        try {
            await axios.post(`${API_URL}/chat/chat/send`, {
                order_id: orderId,
                sender_id: currentUserId,
                receiver_id: receiverId,
                message: newMessage.trim(),
            });
            setNewMessage('');
            fetchMessages();
        } catch { Alert.alert('Error', 'Failed to send message.'); }
    };

    return (
        <View style={chat.container}>
            <ScrollView style={chat.list} contentContainerStyle={{ paddingVertical: 10 }}>
                {messages.length === 0
                    ? <Text style={chat.noMsg}>No messages yet.</Text>
                    : messages.map((msg: any) => {
                        const isMe = String(msg.sender_id) === String(currentUserId);
                        return (
                            <View key={msg.id} style={[chat.bubble, isMe ? chat.myBubble : chat.theirBubble]}>
                                <Text style={[chat.msgText, isMe ? chat.myText : chat.theirText]}>{msg.message}</Text>
                                <Text style={chat.msgTime}>
                                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </Text>
                            </View>
                        );
                    })
                }
            </ScrollView>
            <View style={chat.inputRow}>
                <TextInput
                    style={chat.input}
                    placeholder="Type a message..."
                    placeholderTextColor="#94a3b8"
                    value={newMessage}
                    onChangeText={setNewMessage}
                    multiline
                />
                <TouchableOpacity style={chat.sendBtn} onPress={sendMessage}>
                    <Text style={chat.sendIcon}>➤</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

// ─────────────────────────────────────────────
// SALES TAB
// ─────────────────────────────────────────────
function SalesTab({ sellerId }: { sellerId: string }) {
    const [sales, setSales] = useState<any[]>([]);
    const [selectedSale, setSelectedSale] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [showChat, setShowChat] = useState(false);
    const [showStatusPicker, setShowStatusPicker] = useState(false);

    const fetchSales = useCallback(async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            const res = await axios.get(`${API_URL}/orders/seller-orders`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setSales(res.data);
            if (res.data.length > 0 && !selectedSale) setSelectedSale(res.data[0]);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    }, [selectedSale]);

    useEffect(() => { fetchSales(); }, []);

    const updateStatus = async (orderId: string, newStatus: string) => {
        try {
            const token = await AsyncStorage.getItem('token');
            await axios.put(`${API_URL}/orders/update-status/${orderId}`,
                { status: newStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setShowStatusPicker(false);
            fetchSales();
        } catch { Alert.alert('Error', 'Failed to update status.'); }
    };

    if (loading) return <View style={s.center}><ActivityIndicator color="#0f3460" /></View>;

    if (showChat && selectedSale) {
        return (
            <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                <View style={{ flex: 1 }}>
                    <View style={s.chatHeader}>
                        <TouchableOpacity style={s.backBtn} onPress={() => setShowChat(false)}>
                            <Text style={s.backBtnText}>← Back</Text>
                        </TouchableOpacity>
                        <View style={{ flex: 1 }}>
                            <Text style={s.chatHeaderTitle}>💬 {selectedSale.buyer_name}</Text>
                            <Text style={s.chatHeaderSub}>Order #{selectedSale.order_id}</Text>
                        </View>
                        <View style={[s.statusBadge, { backgroundColor: statusColor(selectedSale.status) }]}>
                            <Text style={s.statusBadgeText}>{selectedSale.status}</Text>
                        </View>
                    </View>
                    <ChatBox orderId={selectedSale.order_id} currentUserId={sellerId} receiverId={selectedSale.buyer_id} />
                </View>
            </KeyboardAvoidingView>
        );
    }

    return (
        <View style={{ flex: 1 }}>
            <FlatList
                data={sales}
                keyExtractor={(item) => String(item.order_id)}
                contentContainerStyle={s.tabContent}
                ListHeaderComponent={<Text style={s.sectionTitle}>💰 My Sales</Text>}
                ListEmptyComponent={
                    <View style={s.emptyBox}>
                        <Text style={s.emptyIcon}>📭</Text>
                        <Text style={s.emptyText}>No sales yet.</Text>
                    </View>
                }
                renderItem={({ item: sale }) => (
                    <View style={s.saleCard}>
                        <Text style={s.orderId}>Order #{sale.order_id}</Text>
                        <Text style={s.bookTitle2}>{sale.book_title}</Text>
                        <Text style={s.buyerName}>👤 {sale.buyer_name}</Text>
                        {sale.reclamation_id && <Text style={s.recBadge}>⚠️ Under Reclamation</Text>}
                        <View style={s.saleActions}>
                            <TouchableOpacity style={s.statusSelector} onPress={() => { setSelectedSale(sale); setShowStatusPicker(true); }}>
                                <View style={[s.statusDot, { backgroundColor: statusColor(sale.status) }]} />
                                <Text style={s.statusText}>{sale.status}</Text>
                                <Text style={s.statusArrow}>▼</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={s.chatBtn} onPress={() => { setSelectedSale(sale); setShowChat(true); }}>
                                <Text style={s.chatBtnText}>💬 Chat</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            />
            {showStatusPicker && selectedSale && (
                <View style={s.modalOverlay}>
                    <View style={s.modalCard}>
                        <Text style={s.modalTitle}>Update Status</Text>
                        {STATUS_OPTIONS.map(status => (
                            <TouchableOpacity key={status} style={s.modalOption} onPress={() => updateStatus(selectedSale.order_id, status)}>
                                <View style={[s.statusDot, { backgroundColor: statusColor(status) }]} />
                                <Text style={s.modalOptionText}>{status}</Text>
                            </TouchableOpacity>
                        ))}
                        <TouchableOpacity style={s.modalCancelBtn} onPress={() => setShowStatusPicker(false)}>
                            <Text style={s.modalCancelText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}
        </View>
    );
}

// ─────────────────────────────────────────────
// SUBSCRIPTION TAB
// ─────────────────────────────────────────────
function SubscriptionTab({ sellerId }: { sellerId: string }) {
    const [subscription, setSubscription] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetch = async () => {
            try {
                const res = await axios.get(`${API_URL}/seller/subscription/${sellerId}`);
                setSubscription(res.data.hasActiveSubscription ? res.data.subscription : null);
            } catch (err) { console.error(err); }
            finally { setLoading(false); }
        };
        fetch();
    }, [sellerId]);

    if (loading) return <View style={s.center}><ActivityIndicator color="#0f3460" /></View>;

    const getProgress = () => {
        if (!subscription) return null;
        const start = new Date(subscription.start_date).getTime();
        const end   = new Date(subscription.end_date).getTime();
        const now   = Date.now();
        const percentage = Math.min(100, Math.round(((now - start) / (end - start)) * 100));
        const daysLeft   = Math.max(0, Math.round((end - now) / 86400000));
        return { percentage, daysLeft };
    };

    const progress = getProgress();

    return (
        <ScrollView contentContainerStyle={s.tabContent}>
            <Text style={s.sectionTitle}>💳 My Subscription</Text>
            {subscription ? (
                <View style={s.subCard}>
                    <View style={s.activeBadge}>
                        <Text style={s.activeBadgeText}>✅ Active Subscription</Text>
                    </View>
                    <View style={s.infoGrid}>
                        {[
                            { label: 'PLAN',       value: subscription.plan_type },
                            { label: 'PRICE',      value: `${subscription.price} MAD` },
                            { label: 'START DATE', value: new Date(subscription.start_date).toLocaleDateString() },
                            { label: 'END DATE',   value: new Date(subscription.end_date).toLocaleDateString() },
                        ].map(item => (
                            <View key={item.label} style={s.infoItem}>
                                <Text style={s.infoLabel}>{item.label}</Text>
                                <Text style={s.infoValue}>{item.value}</Text>
                            </View>
                        ))}
                    </View>
                    {progress && (
                        <View style={{ marginTop: 20 }}>
                            <View style={s.progressLabelRow}>
                                <Text style={s.progressLabel}>Progress</Text>
                                <Text style={[s.daysLeft, { color: progress.daysLeft < 7 ? '#e74c3c' : '#27ae60' }]}>
                                    {progress.daysLeft} days left
                                </Text>
                            </View>
                            <View style={s.progressBg}>
                                <View style={[s.progressFill, {
                                    width: `${progress.percentage}%` as any,
                                    backgroundColor: progress.daysLeft < 7 ? '#e74c3c' : '#27ae60',
                                }]} />
                            </View>
                            {progress.daysLeft < 7 && (
                                <Text style={s.expiryWarn}>⚠️ Expiring soon! Renew to continue listing books.</Text>
                            )}
                        </View>
                    )}
                    <TouchableOpacity style={s.renewBtn} onPress={() => router.push('/subscription/plans' as any)}>
                        <Text style={s.renewBtnText}>🔄 Renew or Upgrade Plan</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <View style={s.noSubCard}>
                    <Text style={s.emptyIcon}>📭</Text>
                    <Text style={s.noSubTitle}>No Active Subscription</Text>
                    <Text style={s.noSubDesc}>List up to 3 books for free. Subscribe to unlock unlimited listings.</Text>
                    <TouchableOpacity style={s.subscribeBtn} onPress={() => router.push('/subscription/plans' as any)}>
                        <Text style={s.subscribeBtnText}>💳 View Subscription Plans</Text>
                    </TouchableOpacity>
                </View>
            )}
        </ScrollView>
    );
}

// ─────────────────────────────────────────────
// MAIN DASHBOARD
// ─────────────────────────────────────────────
export default function SellerDashboard() {
    const [activeTab, setActiveTab] = useState('overview');
    const [sellerId, setSellerId] = useState('');
    const router = useRouter();

    useEffect(() => {
        const init = async () => {
            const userStr = await AsyncStorage.getItem('user');
            const userData = userStr ? JSON.parse(userStr) : null;
            if (userData?.id) setSellerId(userData.id);
        };
        init();
    }, []);

    if (!sellerId) return <View style={s.center}><ActivityIndicator color="#0f3460" /></View>;

    const renderContent = () => {
        switch (activeTab) {
            case 'overview':     return <OverviewTab sellerId={sellerId} />;
            case 'books':        return <BooksTab sellerId={sellerId} />;
            case 'sales':        return <SalesTab sellerId={sellerId} />;
            case 'subscription': return <SubscriptionTab sellerId={sellerId} />;
            default:             return <OverviewTab sellerId={sellerId} />;
        }
    };

    return (
        <View style={s.container}>
            <View style={s.header}>
                <View>
                    <Text style={s.headerTitle}>🏬 Seller Dashboard</Text>
                    <Text style={s.headerSub}>Manage your store</Text>
                </View>
                <TouchableOpacity style={s.addBtn} onPress={() => router.push('/seller/add-book' as any)}>
                    <Text style={s.addBtnText}>+ Add Book</Text>
                </TouchableOpacity>
            </View>

            <View style={s.tabBarWrapper}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.tabBar}>
                    {TABS.map(tab => (
                        <TouchableOpacity
                            key={tab.key}
                            style={[s.tabItem, activeTab === tab.key && s.tabItemActive]}
                            onPress={() => setActiveTab(tab.key)}
                        >
                            <Text style={s.tabIcon}>{tab.icon}</Text>
                            <Text style={[s.tabLabel, activeTab === tab.key && s.tabLabelActive]}>
                                {tab.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            <View style={{ flex: 1 }}>
                {renderContent()}
            </View>
        </View>
    );
}

// ─────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────
const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f0f4f8' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    errorText: { color: '#94a3b8', fontSize: 15 },
    header: { backgroundColor: '#0f3460', paddingTop: 50, paddingBottom: 20, paddingHorizontal: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    headerTitle: { fontSize: 20, fontWeight: '800', color: 'white', marginBottom: 2 },
    headerSub: { fontSize: 13, color: 'rgba(255,255,255,0.7)' },
    addBtn: { backgroundColor: '#27ae60', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 9 },
    addBtnText: { color: 'white', fontWeight: '700', fontSize: 13 },
    tabBarWrapper: { backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#e2e8f0', elevation: 2 },
    tabBar: { flexDirection: 'row', paddingHorizontal: 12 },
    tabItem: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 2, borderBottomColor: 'transparent', marginRight: 4 },
    tabItemActive: { borderBottomColor: '#0f3460' },
    tabIcon: { fontSize: 16 },
    tabLabel: { fontSize: 13, fontWeight: '600', color: '#94a3b8' },
    tabLabelActive: { color: '#0f3460' },
    tabContent: { padding: 16, paddingBottom: 40 },
    sectionTitle: { fontSize: 18, fontWeight: '700', color: '#1a1a2e', marginBottom: 16 },
    cardsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    statCard: { flex: 1, minWidth: 90, borderRadius: 12, padding: 16, alignItems: 'center', elevation: 3 },
    cardNumber: { fontSize: 24, fontWeight: '800', color: 'white', marginBottom: 4 },
    cardLabel: { fontSize: 11, color: 'rgba(255,255,255,0.9)', textAlign: 'center' },
    bookCard: { backgroundColor: 'white', borderRadius: 14, padding: 16, marginBottom: 12, elevation: 2 },
    bookCardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
    bookTitle: { flex: 1, fontSize: 15, fontWeight: '700', color: '#1a1a2e', marginRight: 10 },
    bookDate: { fontSize: 12, color: '#94a3b8' },
    bookCardMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
    bookPrice: { fontSize: 16, fontWeight: '800', color: '#0f3460' },
    stockBadge: { borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
    stockText: { color: 'white', fontSize: 12, fontWeight: '700' },
    bookCardActions: { flexDirection: 'row', gap: 10 },
    editBtn: { flex: 1, backgroundColor: '#3498db', borderRadius: 8, padding: 10, alignItems: 'center' },
    deleteBtn: { flex: 1, backgroundColor: '#e74c3c', borderRadius: 8, padding: 10, alignItems: 'center' },
    btnText: { color: 'white', fontWeight: '700', fontSize: 14 },
    saleCard: { backgroundColor: 'white', borderRadius: 14, padding: 16, marginBottom: 12, elevation: 2 },
    orderId: { fontSize: 13, fontWeight: '700', color: '#1a1a2e', marginBottom: 3 },
    bookTitle2: { fontSize: 13, color: '#64748b', marginBottom: 3 },
    buyerName: { fontSize: 13, color: '#0f3460', fontWeight: '600', marginBottom: 4 },
    recBadge: { fontSize: 12, color: '#e74c3c', fontWeight: '700', marginBottom: 8 },
    saleActions: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 10, borderTopWidth: 1, borderTopColor: '#f0f4f8', paddingTop: 10 },
    statusSelector: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', borderWidth: 1.5, borderColor: '#e2e8f0', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 7, gap: 6 },
    statusDot: { width: 8, height: 8, borderRadius: 4 },
    statusText: { flex: 1, fontSize: 12, fontWeight: '600', color: '#374151' },
    statusArrow: { fontSize: 10, color: '#94a3b8' },
    chatBtn: { backgroundColor: '#0f3460', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8 },
    chatBtnText: { color: 'white', fontSize: 12, fontWeight: '700' },
    modalOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
    modalCard: { backgroundColor: 'white', borderRadius: 16, padding: 24, width: '100%', maxWidth: 340 },
    modalTitle: { fontSize: 18, fontWeight: '800', color: '#1a1a2e', marginBottom: 16 },
    modalOption: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 10, marginBottom: 8, backgroundColor: '#f8fafc' },
    modalOptionText: { fontSize: 15, color: '#374151' },
    modalCancelBtn: { borderWidth: 1.5, borderColor: '#e2e8f0', borderRadius: 10, padding: 13, alignItems: 'center', marginTop: 4 },
    modalCancelText: { color: '#64748b', fontWeight: '600' },
    chatHeader: { backgroundColor: '#0f3460', paddingTop: 16, paddingBottom: 16, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 12 },
    backBtn: { backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
    backBtnText: { color: 'white', fontWeight: '700', fontSize: 13 },
    chatHeaderTitle: { fontSize: 15, fontWeight: '700', color: 'white' },
    chatHeaderSub: { fontSize: 12, color: 'rgba(255,255,255,0.7)' },
    statusBadge: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
    statusBadgeText: { color: 'white', fontSize: 11, fontWeight: '700' },
    subCard: { backgroundColor: 'white', borderRadius: 16, padding: 24, elevation: 3 },
    activeBadge: { alignSelf: 'flex-start', backgroundColor: '#f0fdf4', borderWidth: 1, borderColor: '#27ae60', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6, marginBottom: 20 },
    activeBadgeText: { color: '#27ae60', fontWeight: '700', fontSize: 13 },
    infoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    infoItem: { width: '47%', backgroundColor: '#f8fafc', borderRadius: 10, padding: 14, borderWidth: 1, borderColor: '#e2e8f0' },
    infoLabel: { fontSize: 11, color: '#94a3b8', fontWeight: '700', marginBottom: 6 },
    infoValue: { fontSize: 15, color: '#1a1a2e', fontWeight: '700' },
    progressLabelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    progressLabel: { fontSize: 13, color: '#64748b', fontWeight: '600' },
    daysLeft: { fontSize: 13, fontWeight: '700' },
    progressBg: { height: 10, backgroundColor: '#e2e8f0', borderRadius: 10, overflow: 'hidden' },
    progressFill: { height: '100%', borderRadius: 10 },
    expiryWarn: { color: '#e74c3c', fontSize: 13, fontWeight: '600', marginTop: 10 },
    renewBtn: { marginTop: 24, backgroundColor: '#0f3460', borderRadius: 10, padding: 14, alignItems: 'center' },
    renewBtnText: { color: 'white', fontWeight: '700', fontSize: 15 },
    noSubCard: { backgroundColor: 'white', borderRadius: 16, padding: 40, alignItems: 'center', elevation: 3 },
    noSubTitle: { fontSize: 18, fontWeight: '800', color: '#1a1a2e', marginBottom: 10 },
    noSubDesc: { fontSize: 14, color: '#64748b', textAlign: 'center', lineHeight: 20, marginBottom: 24 },
    subscribeBtn: { backgroundColor: '#27ae60', borderRadius: 10, paddingHorizontal: 28, paddingVertical: 13 },
    subscribeBtnText: { color: 'white', fontWeight: '700', fontSize: 15 },
    emptyBox: { alignItems: 'center', marginTop: 40 },
    emptyIcon: { fontSize: 50, marginBottom: 12 },
    emptyText: { color: '#94a3b8', fontSize: 16 },
});

const chat = StyleSheet.create({
    container: { flex: 1, backgroundColor: 'white' },
    list: { flex: 1, paddingHorizontal: 16 },
    noMsg: { textAlign: 'center', color: '#94a3b8', marginTop: 40, fontSize: 14 },
    bubble: { maxWidth: '75%', borderRadius: 14, padding: 12, marginBottom: 8 },
    myBubble: { backgroundColor: '#0f3460', alignSelf: 'flex-end', borderBottomRightRadius: 4 },
    theirBubble: { backgroundColor: '#f0f4f8', alignSelf: 'flex-start', borderBottomLeftRadius: 4 },
    msgText: { fontSize: 14, lineHeight: 20 },
    myText: { color: 'white' },
    theirText: { color: '#1a1a2e' },
    msgTime: { fontSize: 10, color: 'rgba(255,255,255,0.6)', marginTop: 4, alignSelf: 'flex-end' },
    inputRow: { flexDirection: 'row', alignItems: 'flex-end', padding: 12, borderTopWidth: 1, borderTopColor: '#e2e8f0', backgroundColor: 'white', gap: 10 },
    input: { flex: 1, backgroundColor: '#f8fafc', borderWidth: 1.5, borderColor: '#e2e8f0', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, fontSize: 14, color: '#1a1a2e', maxHeight: 100 },
    sendBtn: { backgroundColor: '#0f3460', width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
    sendIcon: { color: 'white', fontSize: 18 },
});