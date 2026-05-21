import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const ChatBox = ({ orderId, currentUserId, receiverId, reclamationId }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        const container = messagesEndRef.current?.parentElement;
        if (container) container.scrollTop = container.scrollHeight;
    };

    const fetchMessages = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token || !orderId) return;
            let url = `http://localhost:5000/api/chat/chat/${orderId}`;
            if (reclamationId && reclamationId !== 'undefined' && reclamationId !== 'null') {
                url += `?reclamation_id=${reclamationId}`;
            }
            const res = await axios.get(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setMessages(res.data);
        } catch (err) {
            console.error("Error fetching messages:", err);
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        fetchMessages();
        const interval = setInterval(fetchMessages, 3000);
        return () => clearInterval(interval);
    }, [orderId, reclamationId]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;
        try {
            const token = localStorage.getItem("token");
            await axios.post('http://localhost:5000/api/chat/chat/send',
                {
                    order_id: orderId,
                    sender_id: currentUserId,
                    receiver_id: receiverId || null,
                    message: newMessage,
                    reclamation_id: (reclamationId && reclamationId !== 'undefined') ? reclamationId : null
                },
                { headers: { 'Authorization': `Bearer ${token}` } }
            );
            setNewMessage("");
            fetchMessages();
        } catch (err) {
            alert("Failed to send message.");
        }
    };

    return (
        <div style={chatContainerStyle}>

            {/* Messages List */}
            <div style={messagesListStyle}>
                {messages.length === 0 ? (
                    <div style={emptyMessagesStyle}>
                        <p style={{ fontSize: '2rem', margin: 0 }}>💬</p>
                        <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: '8px 0 0 0' }}>
                            No messages yet. Start the conversation!
                        </p>
                    </div>
                ) : (
                    messages.map((msg) => {
                        const isAdmin = msg.sender_role === 'admin';
                        const isMe = String(msg.sender_id) === String(currentUserId);

                        return (
                            <div
                                key={msg.id}
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: isAdmin ? 'center' : (isMe ? 'flex-end' : 'flex-start'),
                                    width: '100%',
                                }}
                            >
                                <small style={{
                                    fontSize: '0.7rem',
                                    color: '#94a3b8',
                                    fontWeight: '600',
                                    marginBottom: '3px',
                                    paddingLeft: isAdmin ? 0 : '4px',
                                    paddingRight: isAdmin ? 0 : '4px',
                                }}>
                                    {isAdmin ? '🛡️ ADMIN' : (isMe ? 'You' : msg.sender_name || 'Other Party')}
                                </small>
                                <div style={{
                                    padding: '10px 14px',
                                    borderRadius: isAdmin ? '12px' : (isMe ? '16px 16px 4px 16px' : '16px 16px 16px 4px'),
                                    maxWidth: isAdmin ? '90%' : '75%',
                                    width: isAdmin ? '90%' : 'auto',
                                    backgroundColor: isAdmin ? '#0f3460' : (isMe ? '#27ae60' : 'white'),
                                    color: isAdmin || isMe ? 'white' : '#1a1a2e',
                                    boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
                                    border: (!isAdmin && !isMe) ? '1.5px solid #e2e8f0' : 'none',
                                    textAlign: isAdmin ? 'center' : 'left',
                                }}>
                                    <span style={{ wordBreak: 'break-word', fontSize: '0.92rem', lineHeight: '1.5' }}>
                                        {msg.message || msg.message_text}
                                    </span>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSendMessage} style={inputAreaStyle}>
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder={reclamationId ? "Type a message to Admin..." : "Type a message..."}
                    style={inputStyle}
                    onFocus={e => e.target.style.borderColor = '#0f3460'}
                    onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                />
                <button
                    type="submit"
                    style={sendBtnStyle}
                    onMouseEnter={e => e.target.style.backgroundColor = '#1e8449'}
                    onMouseLeave={e => e.target.style.backgroundColor = '#27ae60'}
                >
                    Send ➤
                </button>
            </form>
        </div>
    );
};

const chatContainerStyle = {
    border: '1.5px solid #e2e8f0',
    borderRadius: '14px',
    background: '#f8fafc',
    height: '420px',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
};

const messagesListStyle = {
    flex: 1,
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    padding: '15px',
};

const emptyMessagesStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    textAlign: 'center',
};

const inputAreaStyle = {
    display: 'flex',
    gap: '10px',
    borderTop: '1.5px solid #e2e8f0',
    padding: '12px 15px',
    backgroundColor: 'white',
};

const inputStyle = {
    flex: 1,
    padding: '10px 14px',
    borderRadius: '10px',
    border: '1.5px solid #e2e8f0',
    outline: 'none',
    fontSize: '0.92rem',
    backgroundColor: '#f8fafc',
    transition: 'border-color 0.2s',
    fontFamily: 'inherit',
};

const sendBtnStyle = {
    padding: '10px 20px',
    backgroundColor: '#27ae60',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontWeight: '700',
    fontSize: '0.9rem',
    transition: 'background-color 0.2s',
    whiteSpace: 'nowrap',
};

export default ChatBox;