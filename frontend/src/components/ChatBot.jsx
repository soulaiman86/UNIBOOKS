import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const ChatBot = () => {
    const navigate = useNavigate();

    // 1. أولاً تعريف بيانات المستخدم
    const userData = JSON.parse(localStorage.getItem('user'));
    const userRole = userData?.role || 'guest';
    const userName = userData?.name || 'there';

    // 2. ثانياً تعريف الدوال التي تستخدم userRole
    const getWelcomeMessage = () => {
        if (userRole === 'SELLER') {
            return `👋 Hello ${userName}! I'm UniBot, your UNIBOOKS assistant.\n\nAs a seller, I can help you with:\n- 📚 Adding or managing your books\n- 💰 Tracking your sales\n- 💳 Subscription plans\n- ⚠️ Handling complaints`;
        } else if (userRole === 'BUYER') {
            return `👋 Hello ${userName}! I'm UniBot, your UNIBOOKS assistant.\n\nAs a buyer, I can help you with:\n- 🔍 Finding books\n- 🛒 Managing your cart\n- 📦 Tracking your orders\n- ⚠️ Submitting complaints`;
        } else {
            return `👋 Hello! I'm UniBot, your UNIBOOKS assistant.\n\nI can help you with:\n- 📚 Browsing books\n- 🔑 Login or Register\n- ℹ️ Learning about UNIBOOKS`;
        }
    };

    const getQuickButtons = () => {
        if (userRole === 'SELLER') {
            return [
                { label: '📚 Add a Book', message: 'I want to add a new book' },
                { label: '💰 My Sales', message: 'Show me my sales' },
                { label: '💳 Subscription', message: 'Tell me about subscription plans' },
                { label: '❓ Help', message: 'What can you help me with?' },
            ];
        } else if (userRole === 'BUYER') {
            return [
                { label: '🔍 Find Books', message: 'I want to browse books' },
                { label: '📦 My Orders', message: 'Show me my orders' },
                { label: '🛒 My Cart', message: 'Take me to my cart' },
                { label: '⚠️ Report Issue', message: 'I want to report a problem' },
            ];
        } else {
            return [
                { label: '🔑 Login', message: 'I want to login' },
                { label: '📝 Register', message: 'I want to create an account' },
                { label: '📚 Browse Books', message: 'Show me the books' },
                { label: '❓ Help', message: 'What is UNIBOOKS?' },
            ];
        }
    };

    // 3. ثالثاً تعريف الـ states التي تستخدم الدوال
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            content: getWelcomeMessage()
        }
    ]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

   
    

    

    const scrollToBottom = () => {
        const container = messagesEndRef.current?.parentElement;
        if (container) container.scrollTop = container.scrollHeight;
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || loading) return;

        const userMsg = { role: 'user', content: newMessage };
        setMessages(prev => [...prev, userMsg]);
        setNewMessage('');
        setLoading(true);

        try {
            const response = await fetch('http://localhost:5000/api/chatbot/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        messages: [...messages, userMsg].map(m => ({
            role: m.role,
            content: m.content
        })),
        userRole: userRole,
        userName: userName
    })
});

const data = await response.json();
const botReply = data.reply;

            // التحقق من وجود navigate tag
            const navigateMatch = botReply.match(/\[NAVIGATE:([^\]]+)\]/);
            if (navigateMatch) {
                const route = navigateMatch[1];
                const cleanReply = botReply.replace(/\[NAVIGATE:[^\]]+\]/, '').trim();
                setMessages(prev => [...prev, {
                    role: 'assistant',
                    content: cleanReply,
                    navigateTo: route
                }]);
            } else {
                setMessages(prev => [...prev, { role: 'assistant', content: botReply }]);
            }
        } catch (err) {
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: '❌ Sorry, I encountered an error. Please try again.'
            }]);
        } finally {
            setLoading(false);
        }
    };

    const handleNavigate = (route) => {
        navigate(route);
        setIsOpen(false);
    };

    // إضافة useEffect يراقب تغيير المستخدم
useEffect(() => {
    setMessages([
        {
            role: 'assistant',
            content: getWelcomeMessage()
        }
    ]);
}, [userData?.id]);

    return (
        <>
            {/* Chat Window */}
            {isOpen && (
                <div style={chatWindowStyle}>
                    {/* Header */}
                    <div style={headerStyle}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={botAvatarStyle}>🤖</div>
                            <div>
                                <p style={{ margin: 0, fontWeight: '700', fontSize: '0.95rem' }}>UniBot</p>
                                <p style={{ margin: 0, fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)' }}>UNIBOOKS Assistant</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            style={closeButtonStyle}
                        >
                            ✕
                        </button>
                    </div>

                    {/* Messages */}
                    <div style={messagesContainerStyle}>
                        {messages.map((msg, index) => (
                            <div
                                key={index}
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start',
                                    marginBottom: '12px',
                                }}
                            >
                                <div style={{
                                    ...messageBubbleStyle,
                                    backgroundColor: msg.role === 'user' ? '#0f3460' : 'white',
                                    color: msg.role === 'user' ? 'white' : '#1a1a2e',
                                    borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                                    border: msg.role === 'assistant' ? '1px solid #e2e8f0' : 'none',
                                }}>
                                    {msg.content}
                                </div>
                                {msg.navigateTo && (
                                    <button
                                        onClick={() => handleNavigate(msg.navigateTo)}
                                        style={navigateBtnStyle}
                                    >
                                        Go there →
                                    </button>
                                )}
                            </div>
                        ))}
                        {/* Quick Buttons - تظهر فقط في بداية المحادثة */}
{messages.length === 1 && (
    <div style={quickButtonsContainerStyle}>
        {getQuickButtons().map((btn, index) => (
            <button
                key={index}
                onClick={async () => {
    const userMsg = { role: 'user', content: btn.message };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
        const response = await fetch('http://localhost:5000/api/chatbot/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                messages: [...messages, userMsg].map(m => ({
                    role: m.role,
                    content: m.content
                })),
                userRole: userRole,
                userName: userName
            })
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
                navigateTo: route
            }]);
        } else {
            setMessages(prev => [...prev, { role: 'assistant', content: botReply }]);
        }
    } catch (err) {
        setMessages(prev => [...prev, {
            role: 'assistant',
            content: '❌ Sorry, I encountered an error. Please try again.'
        }]);
    } finally {
        setLoading(false);
    }
}}
                style={quickBtnStyle}
                onMouseEnter={e => e.target.style.backgroundColor = '#0f3460'}
                onMouseLeave={e => e.target.style.backgroundColor = 'white'}
            >
                {btn.label}
            </button>
        ))}
    </div>
)}
                        {loading && (
                            <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '12px' }}>
                                <div style={{ ...messageBubbleStyle, backgroundColor: 'white', border: '1px solid #e2e8f0', color: '#94a3b8' }}>
                                    ⏳ Thinking...
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <form onSubmit={handleSend} style={inputAreaStyle}>
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Ask me anything..."
                            style={inputStyle}
                            onFocus={e => e.target.style.borderColor = '#0f3460'}
                            onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                        />
                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                ...sendBtnStyle,
                                backgroundColor: loading ? '#94a3b8' : '#0f3460',
                                cursor: loading ? 'not-allowed' : 'pointer',
                            }}
                        >
                            ➤
                        </button>
                    </form>
                </div>
            )}

            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                style={toggleBtnStyle}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            >
                {isOpen ? '✕' : '🤖'}
            </button>
        </>
    );
};

const chatWindowStyle = {
    position: 'fixed',
    bottom: '90px',
    right: '20px',
    width: '350px',
    height: '500px',
    backgroundColor: '#f8fafc',
    borderRadius: '20px',
    boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
    display: 'flex',
    flexDirection: 'column',
    zIndex: 9999,
    border: '1px solid #e2e8f0',
    overflow: 'hidden',
};

const headerStyle = {
    background: 'linear-gradient(135deg, #1a1a2e, #0f3460)',
    padding: '15px 20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    color: 'white',
};

const botAvatarStyle = {
    width: '38px',
    height: '38px',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.2rem',
};

const closeButtonStyle = {
    background: 'none',
    border: 'none',
    color: 'white',
    fontSize: '1rem',
    cursor: 'pointer',
    padding: '4px 8px',
    borderRadius: '6px',
    transition: 'background 0.2s',
};

const messagesContainerStyle = {
    flex: 1,
    overflowY: 'auto',
    padding: '15px',
    display: 'flex',
    flexDirection: 'column',
};

const messageBubbleStyle = {
    padding: '10px 14px',
    borderRadius: '16px',
    maxWidth: '80%',
    fontSize: '0.88rem',
    lineHeight: '1.5',
    wordBreak: 'break-word',
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
};

const navigateBtnStyle = {
    marginTop: '6px',
    padding: '6px 14px',
    backgroundColor: '#10b981',
    color: 'white',
    border: 'none',
    borderRadius: '20px',
    cursor: 'pointer',
    fontSize: '0.8rem',
    fontWeight: '700',
    transition: 'opacity 0.2s',
};

const inputAreaStyle = {
    display: 'flex',
    gap: '8px',
    padding: '12px 15px',
    borderTop: '1.5px solid #e2e8f0',
    backgroundColor: 'white',
};

const inputStyle = {
    flex: 1,
    padding: '10px 14px',
    borderRadius: '10px',
    border: '1.5px solid #e2e8f0',
    outline: 'none',
    fontSize: '0.88rem',
    fontFamily: 'inherit',
    transition: 'border-color 0.2s',
};

const sendBtnStyle = {
    padding: '10px 14px',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontWeight: '700',
    fontSize: '1rem',
    transition: 'background-color 0.2s',
};

const toggleBtnStyle = {
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #1a1a2e, #0f3460)',
    color: 'white',
    border: 'none',
    fontSize: '1.5rem',
    cursor: 'pointer',
    boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
    zIndex: 9999,
    transition: 'transform 0.2s',
};

const quickButtonsContainerStyle = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    marginTop: '10px',
};

const quickBtnStyle = {
    padding: '7px 12px',
    backgroundColor: 'white',
    color: '#0f3460',
    border: '1.5px solid #0f3460',
    borderRadius: '20px',
    cursor: 'pointer',
    fontSize: '0.78rem',
    fontWeight: '600',
    transition: 'all 0.2s',
    color: '#0f3460',
};

export default ChatBot;