import { useEffect, useState, useCallback } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ActivityIndicator,
    TextInput,
    KeyboardAvoidingView,
    Platform,
    FlatList,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const STATUS_OPTIONS = ['Pending', 'Shipped', 'Delivered', 'Cancelled'];

const statusColor = (status: string) => {
    if (status === 'Shipped') return '#3498db';
    if (status === 'Delivered') return '#27ae60';
    if (status === 'Cancelled') return '#e74c3c';
    return '#f1c40f';
};

// ─── ChatBox Component ───────────────────────────────────────────────
function ChatBox({ orderId, currentUserId, receiverId }: any) {
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [sending, setSending] = useState(false);

    const fetchMessages = useCallback(async () => {
        try {
            const res = await axios.get(`${API_URL}/chat/chat/${orderId}`);
            setMessages(res.data);
        } catch (err) {
            console.error('Error fetching messages:', err);
        }
    }, [orderId]);

    useEffect(() => {
        fetchMessages();
        const interval = setInterval(fetchMessages, 5000);
        return () => clearInterval(interval);
    }, [fetchMessages]);

    const sendMessage = async () => {
        if (!newMessage.trim()) return;
        setSending(true);
        try {
            await axios.post(`${API_URL}/chat/chat/send`, {
                order_id: orderId,
                sender_id: currentUserId,
                receiver_id: receiverId,
                message: newMessage.trim(),
            });
            setNewMessage('');
            fetchMessages();
        } catch (err) {
            Alert.alert('Error', 'Failed to send message.');
        } finally {
            setSending(false);
        }
    };

    return (
        <View style={chatStyles.container}>
            {/* Messages */}
            <ScrollView
                style={chatStyles.messagesList}
                contentContainerStyle={{ paddingVertical: 10 }}
            >
                {messages.length === 0 ? (
                    <Text style={chatStyles.noMessages}>No messages yet. Start the conversation!</Text>
                ) : (
                    messages.map((msg: any) => {
                        const isMe = String(msg.sender_id) === String(currentUserId);
                        return (
                            <View
                                key={msg.id}
                                style={[
                                    chatStyles.messageBubble,
                                    isMe ? chatStyles.myBubble : chatStyles.theirBubble,
                                ]}
                            >
                                <Text style={[
                                    chatStyles.messageText,
                                    isMe ? chatStyles.myText : chatStyles.theirText,
                                ]}>
                                    {msg.message}
                                </Text>
                                <Text style={chatStyles.messageTime}>
                                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </Text>
                            </View>
                        );
                    })
                )}
            </ScrollView>

            {/* Input */}
            <View style={chatStyles.inputRow}>
                <TextInput
                    style={chatStyles.input}
                    placeholder="Type a message..."
                    placeholderTextColor="#94a3b8"
                    value={newMessage}
                    onChangeText={setNewMessage}
                    multiline
                />
                <TouchableOpacity
                    style={[chatStyles.sendBtn, sending && { opacity: 0.6 }]}
                    onPress={sendMessage}
                    disabled={sending}
                >
                    <Text style={chatStyles.sendBtnText}>➤</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

// ─── MySales Screen ───────────────────────────────────────────────────
export default function MySales() {
    const [sales, setSales] = useState<any[]>([]);
    const [selectedSale, setSelectedSale] = useState<any>(null);
    const [sellerId, setSellerId] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState<'list' | 'chat'>('list');
    const [showStatusPicker, setShowStatusPicker] = useState(false);

    useEffect(() => {
        const init = async () => {
            const userStr = await AsyncStorage.getItem('user');
            const userData = userStr ? JSON.parse(userStr) : null;
            if (userData?.id) setSellerId(userData.id);
            fetchSales();
        };
        init();
    }, []);

    const fetchSales = useCallback(async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            const res = await axios.get(`${API_URL}/orders/seller-orders`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setSales(res.data);
            if (res.data.length > 0 && !selectedSale) {
                setSelectedSale(res.data[0]);
            }
        } catch (err) {
            console.error('Error fetching sales:', err);
        } finally {
            setLoading(false);
        }
    }, [selectedSale]);

    const updateOrderStatus = async (orderId: string, newStatus: string) => {
        try {
            const token = await AsyncStorage.getItem('token');
            await axios.put(
                `${API_URL}/orders/update-status/${orderId}`,
                { status: newStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            Alert.alert('Success', 'Status updated successfully!');
            setShowStatusPicker(false);
            fetchSales();
        } catch (err) {
            Alert.alert('Error', 'Failed to update status.');
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0f3460" />
            </View>
        );
    }

    // ── Chat View ──
    if (view === 'chat' && selectedSale) {
        return (
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <View style={styles.container}>
                    {/* Chat Header */}
                    <View style={styles.chatHeader}>
                        <TouchableOpacity onPress={() => setView('list')} style={styles.backBtn}>
                            <Text style={styles.backBtnText}>← Back</Text>
                        </TouchableOpacity>
                        <View style={styles.chatHeaderInfo}>
                            <Text style={styles.chatHeaderTitle}>
                                💬 {selectedSale.buyer_name}
                            </Text>
                            <Text style={styles.chatHeaderSub}>Order {selectedSale.order_id}</Text>
                        </View>
                        <View style={[styles.statusBadge, { backgroundColor: statusColor(selectedSale.status) }]}>
                            <Text style={styles.statusBadgeText}>{selectedSale.status}</Text>
                        </View>
                    </View>

                    {/* ChatBox */}
                    <ChatBox
                        orderId={selectedSale.order_id}
                        currentUserId={sellerId}
                        receiverId={selectedSale.buyer_id}
                    />
                </View>
            </KeyboardAvoidingView>
        );
    }

    // ── List View ──
    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>💰 My Sales</Text>
            </View>

            {sales.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyIcon}>📭</Text>
                    <Text style={styles.emptyText}>No sales yet.</Text>
                </View>
            ) : (
                <FlatList
                    data={sales}
                    keyExtractor={(item) => String(item.order_id)}
                    contentContainerStyle={{ padding: 16 }}
                    renderItem={({ item: sale }) => (
                        <View style={[
                            styles.saleCard,
                            selectedSale?.order_id === sale.order_id && styles.saleCardActive,
                        ]}>
                            {/* Sale Info */}
                            <TouchableOpacity onPress={() => {
                                setSelectedSale(sale);
                                setView('chat');
                            }}>
                                <Text style={styles.orderId}>Order #{sale.order_id}</Text>
                                <Text style={styles.bookTitle}>{sale.book_title}</Text>
                                <Text style={styles.buyerName}>👤 {sale.buyer_name}</Text>
                                {sale.reclamation_id && (
                                    <Text style={styles.reclamationBadge}>⚠️ Under Reclamation</Text>
                                )}
                            </TouchableOpacity>

                            {/* Status Row */}
                            <View style={styles.statusRow}>
                                <Text style={styles.statusLabel}>Status:</Text>
                                <View style={{ flex: 1 }}>
                                    <TouchableOpacity
                                        style={styles.statusSelector}
                                        onPress={() => {
                                            setSelectedSale(sale);
                                            setShowStatusPicker(true);
                                        }}
                                    >
                                        <View style={[styles.statusDot, { backgroundColor: statusColor(sale.status) }]} />
                                        <Text style={styles.statusSelectorText}>{sale.status}</Text>
                                        <Text style={styles.statusArrow}>▼</Text>
                                    </TouchableOpacity>
                                </View>

                                <TouchableOpacity
                                    style={styles.chatBtn}
                                    onPress={() => {
                                        setSelectedSale(sale);
                                        setView('chat');
                                    }}
                                >
                                    <Text style={styles.chatBtnText}>💬 Chat</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                />
            )}

            {/* Status Picker Modal */}
            {showStatusPicker && selectedSale && (
                <View style={styles.modalOverlay}>
                    <View style={styles.modalCard}>
                        <Text style={styles.modalTitle}>Update Status</Text>
                        <Text style={styles.modalSubtitle}>Order #{selectedSale.order_id}</Text>
                        {STATUS_OPTIONS.map(status => (
                            <TouchableOpacity
                                key={status}
                                style={[
                                    styles.modalOption,
                                    selectedSale.status === status && styles.modalOptionActive,
                                ]}
                                onPress={() => updateOrderStatus(selectedSale.order_id, status)}
                            >
                                <View style={[styles.statusDot, { backgroundColor: statusColor(status) }]} />
                                <Text style={[
                                    styles.modalOptionText,
                                    selectedSale.status === status && { color: '#0f3460', fontWeight: '700' },
                                ]}>
                                    {status}
                                </Text>
                            </TouchableOpacity>
                        ))}
                        <TouchableOpacity
                            style={styles.modalCancelBtn}
                            onPress={() => setShowStatusPicker(false)}
                        >
                            <Text style={styles.modalCancelText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}
        </View>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f0f4f8' },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f4f8' },

    // Header
    header: {
        backgroundColor: '#0f3460',
        paddingTop: 50,
        paddingBottom: 20,
        paddingHorizontal: 20,
    },
    headerTitle: { fontSize: 22, fontWeight: '800', color: 'white' },

    // Empty
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    emptyIcon: { fontSize: 50, marginBottom: 12 },
    emptyText: { color: '#94a3b8', fontSize: 16 },

    // Sale Card
    saleCard: {
        backgroundColor: 'white',
        borderRadius: 14,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1.5,
        borderColor: '#e2e8f0',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
    },
    saleCardActive: {
        borderColor: '#0f3460',
        backgroundColor: '#f0f4ff',
    },
    orderId: { fontSize: 13, fontWeight: '700', color: '#1a1a2e', marginBottom: 3 },
    bookTitle: { fontSize: 13, color: '#64748b', marginBottom: 3 },
    buyerName: { fontSize: 13, color: '#0f3460', fontWeight: '600', marginBottom: 4 },
    reclamationBadge: { fontSize: 12, color: '#e74c3c', fontWeight: '700', marginTop: 4 },

    // Status Row
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        borderTopWidth: 1,
        borderTopColor: '#f0f4f8',
        marginTop: 12,
        paddingTop: 12,
    },
    statusLabel: { fontSize: 12, color: '#64748b', fontWeight: '600' },
    statusSelector: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8fafc',
        borderWidth: 1.5,
        borderColor: '#e2e8f0',
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 6,
        gap: 6,
    },
    statusDot: { width: 8, height: 8, borderRadius: 4 },
    statusSelectorText: { fontSize: 12, fontWeight: '600', color: '#374151', flex: 1 },
    statusArrow: { fontSize: 10, color: '#94a3b8' },
    chatBtn: {
        backgroundColor: '#0f3460',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 7,
    },
    chatBtnText: { color: 'white', fontSize: 12, fontWeight: '700' },

    // Modal
    modalOverlay: {
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalCard: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 24,
        width: '100%',
        maxWidth: 340,
    },
    modalTitle: { fontSize: 18, fontWeight: '800', color: '#1a1a2e', marginBottom: 4 },
    modalSubtitle: { fontSize: 13, color: '#94a3b8', marginBottom: 16 },
    modalOption: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        padding: 14,
        borderRadius: 10,
        marginBottom: 8,
        backgroundColor: '#f8fafc',
    },
    modalOptionActive: { backgroundColor: '#f0f4ff' },
    modalOptionText: { fontSize: 15, color: '#374151' },
    modalCancelBtn: {
        borderWidth: 1.5,
        borderColor: '#e2e8f0',
        borderRadius: 10,
        padding: 13,
        alignItems: 'center',
        marginTop: 4,
    },
    modalCancelText: { color: '#64748b', fontWeight: '600' },

    // Chat Header
    chatHeader: {
        backgroundColor: '#0f3460',
        paddingTop: 50,
        paddingBottom: 16,
        paddingHorizontal: 16,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    backBtn: {
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 6,
    },
    backBtnText: { color: 'white', fontWeight: '700', fontSize: 13 },
    chatHeaderInfo: { flex: 1 },
    chatHeaderTitle: { fontSize: 15, fontWeight: '700', color: 'white' },
    chatHeaderSub: { fontSize: 12, color: 'rgba(255,255,255,0.7)' },
    statusBadge: {
        borderRadius: 20,
        paddingHorizontal: 10,
        paddingVertical: 4,
    },
    statusBadgeText: { color: 'white', fontSize: 11, fontWeight: '700' },
});

const chatStyles = StyleSheet.create({
    container: { flex: 1, backgroundColor: 'white' },
    messagesList: { flex: 1, paddingHorizontal: 16 },
    noMessages: { textAlign: 'center', color: '#94a3b8', marginTop: 40, fontSize: 14 },
    messageBubble: {
        maxWidth: '75%',
        borderRadius: 14,
        padding: 12,
        marginBottom: 8,
    },
    myBubble: {
        backgroundColor: '#0f3460',
        alignSelf: 'flex-end',
        borderBottomRightRadius: 4,
    },
    theirBubble: {
        backgroundColor: '#f0f4f8',
        alignSelf: 'flex-start',
        borderBottomLeftRadius: 4,
    },
    messageText: { fontSize: 14, lineHeight: 20 },
    myText: { color: 'white' },
    theirText: { color: '#1a1a2e' },
    messageTime: { fontSize: 10, color: 'rgba(255,255,255,0.6)', marginTop: 4, alignSelf: 'flex-end' },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        padding: 12,
        borderTopWidth: 1,
        borderTopColor: '#e2e8f0',
        backgroundColor: 'white',
        gap: 10,
    },
    input: {
        flex: 1,
        backgroundColor: '#f8fafc',
        borderWidth: 1.5,
        borderColor: '#e2e8f0',
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 10,
        fontSize: 14,
        color: '#1a1a2e',
        maxHeight: 100,
    },
    sendBtn: {
        backgroundColor: '#0f3460',
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sendBtnText: { color: 'white', fontSize: 18 },
});