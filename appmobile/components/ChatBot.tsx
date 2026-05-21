import { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    Modal,
    ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://localhost:5000/api';

const getWelcomeMessage = (userRole: string, userName: string) => {
    if (userRole === 'SELLER') {
        return `👋 Hello ${userName}! I'm UniBot, your UNIBOOKS assistant.\n\nAs a seller, I can help you with:\n- 📚 Adding or managing your books\n- 💰 Tracking your sales\n- 💳 Subscription plans\n- ⚠️ Handling complaints`;
    } else if (userRole === 'BUYER') {
        return `👋 Hello ${userName}! I'm UniBot, your UNIBOOKS assistant.\n\nAs a buyer, I can help you with:\n- 🔍 Finding books\n- 🛒 Managing your cart\n- 📦 Tracking your orders\n- ⚠️ Submitting complaints`;
    } else {
        return `👋 Hello! I'm UniBot, your UNIBOOKS assistant.\n\nI can help you with:\n- 📚 Browsing books\n- 🔑 Login or Register\n- ℹ️ Learning about UNIBOOKS`;
    }
};

const getQuickButtons = (userRole: string) => {
    if (userRole === 'SELLER') {
        return [
            { label: '📚 Add a Book',   message: 'I want to add a new book' },
            { label: '💰 My Sales',     message: 'Show me my sales' },
            { label: '💳 Subscription', message: 'Tell me about subscription plans' },
            { label: '❓ Help',         message: 'What can you help me with?' },
        ];
    } else if (userRole === 'BUYER') {
        return [
            { label: '🔍 Find Books',   message: 'I want to browse books' },
            { label: '📦 My Orders',    message: 'Show me my orders' },
            { label: '🛒 My Cart',      message: 'Take me to my cart' },
            { label: '⚠️ Report Issue', message: 'I want to report a problem' },
        ];
    } else {
        return [
            { label: '🔑 Login',        message: 'I want to login' },
            { label: '📝 Register',     message: 'I want to create an account' },
            { label: '📚 Browse Books', message: 'Show me the books' },
            { label: '❓ Help',         message: 'What is UNIBOOKS?' },
        ];
    }
};

export default function ChatBot() {
    const router = useRouter();
    const scrollRef = useRef<ScrollView>(null);

    const [isOpen, setIsOpen] = useState(false);
    const [userRole, setUserRole] = useState('guest');
    const [userName, setUserName] = useState('there');
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const loadUser = async () => {
            const userStr = await AsyncStorage.getItem('user');
            const userData = userStr ? JSON.parse(userStr) : null;
            const role = userData?.role || 'guest';
            const name = userData?.name || 'there';
            setUserRole(role);
            setUserName(name);
            setMessages([{ role: 'assistant', content: getWelcomeMessage(role, name) }]);
        };
        loadUser();
    }, []);

    const scrollToBottom = () => {
        setTimeout(() => {
            scrollRef.current?.scrollToEnd({ animated: true });
        }, 100);
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const sendMessage = async (msgText: string, currentMessages: any[]) => {
        if (!msgText.trim() || loading) return;

        const userMsg = { role: 'user', content: msgText };
        const updatedMessages = [...currentMessages, userMsg];
        setMessages(updatedMessages);
        setNewMessage('');
        setLoading(true);

        try {
            const response = await fetch(`${API_URL}/chatbot/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: updatedMessages.map(m => ({
                        role: m.role,
                        content: m.content,
                    })),
                    userRole,
                    userName,
                }),
            });

            const data = await response.json();
            const botReply = data.reply;

            const navigateMatch = botReply.match(/\[NAVIGATE:([^\]]+)\]/);
            if (navigateMatch) {
                const route = navigateMatch[1];
                const cleanReply = botReply.replace(/\[NAVIGATE:[^\]]+\]/, '').trim();
                setMessages(prev => [...prev, {
                    role: 'assistant',
                    content: cleanReply,
                    navigateTo: route,
                }]);
            } else {
                setMessages(prev => [...prev, { role: 'assistant', content: botReply }]);
            }
        } catch (err) {
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: '❌ Sorry, I encountered an error. Please try again.',
            }]);
        } finally {
            setLoading(false);
        }
    };

    const handleSend = () => {
        if (!newMessage.trim()) return;
        sendMessage(newMessage, messages);
    };

    const handleQuickButton = (msg: string) => {
        sendMessage(msg, messages);
    };

    const handleNavigate = (route: string) => {
        setIsOpen(false);
        router.push(route as any);
    };

    return (
        <>
            {/* Floating Toggle Button */}
            <TouchableOpacity
                style={styles.floatingBtn}
                onPress={() => setIsOpen(true)}
                activeOpacity={0.85}
            >
                <View style={styles.floatingBtnInner}>
                      <Text style={styles.floatingBtnEmoji}>🤖</Text>
                </View>
            </TouchableOpacity>

            {/* Chat Modal */}
            <Modal
                visible={isOpen}
                transparent
                animationType="slide"
                onRequestClose={() => setIsOpen(false)}
            >
                <View style={styles.modalOverlay}>
                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                        style={styles.chatWindow}
                    >
                        {/* Header */}
                        <View style={styles.header}>
                            <View style={styles.headerLeft}>
                                <View style={styles.botAvatar}>
                                    <Text style={styles.botAvatarIcon}>🤖</Text>
                                </View>
                                <View>
                                    <Text style={styles.botName}>UniBot</Text>
                                    <Text style={styles.botSubtitle}>UNIBOOKS Assistant</Text>
                                </View>
                            </View>
                            <TouchableOpacity
                                style={styles.closeBtn}
                                onPress={() => setIsOpen(false)}
                            >
                                <Text style={styles.closeBtnText}>✕</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Messages */}
                        <ScrollView
                            ref={scrollRef}
                            style={styles.messagesList}
                            contentContainerStyle={styles.messagesContent}
                            showsVerticalScrollIndicator={false}
                        >
                            {messages.map((msg, index) => (
                                <View
                                    key={index}
                                    style={[
                                        styles.messageRow,
                                        msg.role === 'user' ? styles.messageRowUser : styles.messageRowBot,
                                    ]}
                                >
                                    <View style={[
                                        styles.bubble,
                                        msg.role === 'user' ? styles.bubbleUser : styles.bubbleBot,
                                    ]}>
                                        <Text style={[
                                            styles.bubbleText,
                                            msg.role === 'user' ? styles.bubbleTextUser : styles.bubbleTextBot,
                                        ]}>
                                            {msg.content}
                                        </Text>
                                    </View>

                                    {msg.navigateTo && (
                                        <TouchableOpacity
                                            style={styles.navigateBtn}
                                            onPress={() => handleNavigate(msg.navigateTo)}
                                        >
                                            <Text style={styles.navigateBtnText}>Go there →</Text>
                                        </TouchableOpacity>
                                    )}
                                </View>
                            ))}

                            {/* Quick Buttons - only on first message */}
                            {messages.length === 1 && (
                                <View style={styles.quickButtons}>
                                    {getQuickButtons(userRole).map((btn, index) => (
                                        <TouchableOpacity
                                            key={index}
                                            style={styles.quickBtn}
                                            onPress={() => handleQuickButton(btn.message)}
                                        >
                                            <Text style={styles.quickBtnText}>{btn.label}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            )}

                            {/* Loading */}
                            {loading && (
                                <View style={styles.messageRowBot}>
                                    <View style={[styles.bubble, styles.bubbleBot]}>
                                        <ActivityIndicator size="small" color="#94a3b8" />
                                    </View>
                                </View>
                            )}
                        </ScrollView>

                        {/* Input */}
                        <View style={styles.inputArea}>
                            <TextInput
                                style={styles.input}
                                value={newMessage}
                                onChangeText={setNewMessage}
                                placeholder="Ask me anything..."
                                placeholderTextColor="#94a3b8"
                                onSubmitEditing={handleSend}
                                returnKeyType="send"
                                editable={!loading}
                            />
                            <TouchableOpacity
                                style={[styles.sendBtn, loading && styles.sendBtnDisabled]}
                                onPress={handleSend}
                                disabled={loading}
                            >
                                <Text style={styles.sendBtnText}>➤</Text>
                            </TouchableOpacity>
                        </View>

                    </KeyboardAvoidingView>
                </View>
            </Modal>
        </>
    );
}

const styles = StyleSheet.create({
    // Floating Button
    floatingBtn: {
        position: 'absolute',
        bottom: 80,  // 60 ارتفاع Tab Bar + 20 مسافة
        right: 16,
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#0f3460',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        zIndex: 999,
    },
    floatingBtnInner: {
    alignItems: 'center',
},
floatingBtnEmoji: {
    fontSize: 22,
},
floatingBtnLabel: {
    fontSize: 9,
    color: 'white',
    fontWeight: '800',
    letterSpacing: 1,
    marginTop: -2,
},

    // Modal
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    chatWindow: {
        backgroundColor: '#f8fafc',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        height: '80%',
        overflow: 'hidden',
    },

    // Header
    header: {
        backgroundColor: '#0f3460',
        paddingHorizontal: 20,
        paddingVertical: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    botAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.15)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    botAvatarIcon: {
        fontSize: 20,
    },
    botName: {
        color: 'white',
        fontWeight: '700',
        fontSize: 15,
    },
    botSubtitle: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 12,
    },
    closeBtn: {
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 6,
    },
    closeBtnText: {
        color: 'white',
        fontWeight: '700',
        fontSize: 14,
    },

    // Messages
    messagesList: {
        flex: 1,
    },
    messagesContent: {
        padding: 16,
        paddingBottom: 8,
    },
    messageRow: {
        marginBottom: 12,
    },
    messageRowUser: {
        alignItems: 'flex-end',
    },
    messageRowBot: {
        alignItems: 'flex-start',
    },
    bubble: {
        maxWidth: '80%',
        padding: 12,
        borderRadius: 16,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
    },
    bubbleUser: {
        backgroundColor: '#0f3460',
        borderBottomRightRadius: 4,
    },
    bubbleBot: {
        backgroundColor: 'white',
        borderBottomLeftRadius: 4,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    bubbleText: {
        fontSize: 14,
        lineHeight: 20,
    },
    bubbleTextUser: {
        color: 'white',
    },
    bubbleTextBot: {
        color: '#1a1a2e',
    },

    // Navigate Button
    navigateBtn: {
        marginTop: 6,
        backgroundColor: '#10b981',
        borderRadius: 20,
        paddingHorizontal: 14,
        paddingVertical: 6,
        alignSelf: 'flex-start',
    },
    navigateBtnText: {
        color: 'white',
        fontWeight: '700',
        fontSize: 12,
    },

    // Quick Buttons
    quickButtons: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginTop: 10,
        marginBottom: 4,
    },
    quickBtn: {
        backgroundColor: 'white',
        borderWidth: 1.5,
        borderColor: '#0f3460',
        borderRadius: 20,
        paddingHorizontal: 12,
        paddingVertical: 7,
    },
    quickBtnText: {
        color: '#0f3460',
        fontWeight: '600',
        fontSize: 12,
    },

    // Input
    inputArea: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        padding: 12,
        borderTopWidth: 1.5,
        borderTopColor: '#e2e8f0',
        backgroundColor: 'white',
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
    },
    sendBtn: {
        backgroundColor: '#0f3460',
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sendBtnDisabled: {
        backgroundColor: '#94a3b8',
    },
    sendBtnText: {
        color: 'white',
        fontSize: 18,
    },
});