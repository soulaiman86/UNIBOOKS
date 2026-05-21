import { useEffect, useState, useRef } from 'react'; // أضفنا useRef هنا
import axios from 'axios';

function AdminDashboard() {
    const [reclamations, setReclamations] = useState([]);
    const [selectedReclamation, setSelectedReclamation] = useState(null);
    
    // --- حالات الدردشة ---
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const adminId = "78937316-c177-4e94-9a19-b82a0f8cc916"; 

    // مرجع لعنصر الدردشة الأخير
    const messagesEndRef = useRef(null);

    useEffect(() => {
        const fetchReclamations = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/reclamations/admin/all');
                setReclamations(res.data);
            } catch (err) {
                console.error("Error fetching reclamations");
            }
        };
        fetchReclamations();
    }, []);

    // دالة للتمرير التلقائي للأسفل
    const scrollToBottom = () => {
    const container = messagesEndRef.current?.parentElement;
    if (container) container.scrollTop = container.scrollHeight;
};

    // استدعاء التمرير التلقائي عند تغير قائمة الرسائل
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
    if (!selectedReclamation) return;
    
    fetchMessages(selectedReclamation.id);
    const interval = setInterval(() => {
        fetchMessages(selectedReclamation.id);
    }, 3000);

    return () => clearInterval(interval);
}, [selectedReclamation?.id]);

    const fetchMessages = async (reclamationId) => {
        try {
            const res = await axios.get(`http://localhost:5000/api/reclamations/messages/${reclamationId}`);
            setMessages(res.data);
        } catch (err) {
            console.error("Error fetching messages");
        }
    };

    const handleUpdateStatus = async (newStatus) => {
        try {
            await axios.put(`http://localhost:5000/api/reclamations/admin/update-status/${selectedReclamation.id}`, {
                status: newStatus
            });
            setReclamations(reclamations.map(r => r.id === selectedReclamation.id ? { ...r, status: newStatus } : r));
            setSelectedReclamation(prev => ({ ...prev, status: newStatus }));
            alert(`Complaint status updated to: ${newStatus}`);
        } catch (err) {
            console.error("Failed to update status");
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        try {
            const res = await axios.post('http://localhost:5000/api/reclamations/messages/add', {
                reclamation_id: selectedReclamation.id,
                sender_id: adminId,
                message_text: newMessage
            });
            setMessages([...messages, res.data]);
            setNewMessage("");
        } catch (err) {
            console.error("Error sending message");
        }
    };

    return (
        <div style={{ padding: '30px', fontFamily: 'Arial, sans-serif' }}>
            <h1>🛡️ Admin Control Panel</h1>
            <h3>Active Complaints</h3>
            
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
                <thead>
                    <tr style={{ backgroundColor: '#f4f4f4', textAlign: 'left' }}>
                        <th style={tableHeaderStyle}>Order ID</th>
                        <th style={tableHeaderStyle}>Buyer</th>
                        <th style={tableHeaderStyle}>Seller</th>
                        <th style={tableHeaderStyle}>Subject</th>
                        <th style={tableHeaderStyle}>Status</th>
                        <th style={tableHeaderStyle}>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {reclamations.map((rec) => (
                        <tr key={rec.id} style={{ borderBottom: '1px solid #eee' }}>
                            <td style={tableCellStyle}>{rec.order_id ? String(rec.order_id) : 'N/A'}</td>
                            <td style={tableCellStyle}>{rec.buyer_name}</td>
                            <td style={tableCellStyle}>{rec.seller_name}</td>
                            <td style={tableCellStyle}>{rec.subject}</td>
                            <td style={tableCellStyle}><span style={statusBadgeStyle(rec.status)}>{rec.status}</span></td>
                            <td style={tableCellStyle}>
                                <button style={viewButtonStyle} onClick={() => setSelectedReclamation(rec)}>
                                    {selectedReclamation?.id === rec.id ? "Viewing..." : "Open Investigation"}
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {selectedReclamation && (
                <div style={investigationContainerStyle}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h2>🔎 Investigation: Order {selectedReclamation.order_id}</h2>
                        <button onClick={() => setSelectedReclamation(null)} style={{ cursor: 'pointer', background: 'none', border: 'none', fontSize: '1.5rem' }}>✖</button>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
                        <div style={infoBoxStyle}>
                            <h4 style={{ color: '#2c3e50', marginBottom: '10px' }}>👤 Buyer Information</h4>
                            <p><strong>Name:</strong> {selectedReclamation.buyer_name}</p>
                            <p><strong>Subject:</strong> {selectedReclamation.subject}</p>
                            <p style={{ marginTop: '10px', fontStyle: 'italic', color: '#555' }}>"{selectedReclamation.description}"</p>
                        </div>
                        
                        <div style={infoBoxStyle}>
                            <h4 style={{ color: '#2c3e50', marginBottom: '10px' }}>🏬 Seller Information</h4>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                <img 
                                    src={selectedReclamation.seller_image?.includes('uploads') ? `http://localhost:5000/${selectedReclamation.seller_image.replace(/^\//, '')}` : `http://localhost:5000/uploads/profiles/${selectedReclamation.seller_image}`} 
                                    alt="Seller" style={{ width: '65px', height: '65px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #2c3e50' }}
                                    onError={(e) => { e.target.src = 'https://cdn-icons-png.flaticon.com/512/149/149071.png'; }}
                                />
                                <div>
                                    <p style={{ margin: 0 }}><strong>Name:</strong> {selectedReclamation.seller_name}</p>
                                    <p style={{ margin: 0, fontSize: '0.9rem' }}>Status: <strong>{selectedReclamation.status}</strong></p>
                                </div>
                            </div>
                            <div style={{ marginTop: '15px', display: 'flex', gap: '5px' }}>
                                <button onClick={() => handleUpdateStatus('Resolved')} style={{ ...actionButtonStyle, backgroundColor: '#27ae60' }}>✅ Resolve</button>
                                <button onClick={() => handleUpdateStatus('Under Review')} style={{ ...actionButtonStyle, backgroundColor: '#f39c12' }}>⏳ Review</button>
                                <button onClick={() => handleUpdateStatus('Rejected')} style={{ ...actionButtonStyle, backgroundColor: '#e74c3c' }}>❌ Reject</button>
                            </div>
                        </div>
                    </div>

                    <div style={chatSectionStyle}>
                        <h4 style={{ marginBottom: '15px' }}>💬 Investigation Messages</h4>
                        <div style={chatBoxStyle}>
                            {messages.length === 0 ? <p style={{ textAlign: 'center', color: '#999' }}>No messages yet.</p> : 
                             messages.map((msg) => (
                                <div key={msg.id} style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: msg.sender_id === adminId ? 'flex-end' : 'flex-start',
                                    marginBottom: '10px'
                                }}>
                                    {/* تنسيق اسم المرسل والوقت */}
                                    <span style={{ fontSize: '0.7rem', color: '#666', marginBottom: '2px' }}>
                                        {msg.sender_name} ({msg.sender_role}) • {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                    <div style={{
                                        backgroundColor: msg.sender_id === adminId ? '#2c3e50' : '#e1e1e1',
                                        color: msg.sender_id === adminId ? 'white' : 'black',
                                        padding: '10px 15px',
                                        borderRadius: '15px',
                                        maxWidth: '70%',
                                        wordBreak: 'break-word' 
                                    }}>{msg.message_text}</div>
                                </div>
                             ))
                            }
                            {/* عنصر المرجع للتمرير التلقائي */}
                            <div ref={messagesEndRef} />
                        </div>
                        <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                            <input 
                                type="text" 
                                value={newMessage} 
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Type a message to parties..."
                                style={chatInputStyle}
                            />
                            <button type="submit" style={sendButtonStyle}>Send</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

// التنسيقات
const chatSectionStyle = { marginTop: '30px', padding: '20px', backgroundColor: '#fdfdfd', borderRadius: '10px', border: '1px solid #ddd' };
const chatBoxStyle = { height: '300px', overflowY: 'auto', padding: '15px', backgroundColor: 'white', border: '1px solid #eee', borderRadius: '8px' };
const chatInputStyle = { flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #ddd', outline: 'none' };
const sendButtonStyle = { backgroundColor: '#2c3e50', color: 'white', border: 'none', padding: '10px 25px', borderRadius: '8px', cursor: 'pointer' };
const tableHeaderStyle = { padding: '12px', borderBottom: '2px solid #ddd' };
const tableCellStyle = { padding: '12px' };
const viewButtonStyle = { backgroundColor: '#2c3e50', color: 'white', border: 'none', padding: '7px 12px', borderRadius: '4px', cursor: 'pointer' };
const actionButtonStyle = { padding: '6px 10px', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.75rem' };
const investigationContainerStyle = { marginTop: '40px', padding: '25px', border: '2px solid #2c3e50', borderRadius: '12px', backgroundColor: '#fff', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' };
const infoBoxStyle = { flex: 1, padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '8px', border: '1px solid #eee' };
const statusBadgeStyle = (status) => {
    let bg = '#f1c40f';
    if (status === 'Resolved') bg = '#27ae60';
    if (status === 'Rejected') bg = '#e74c3c';
    if (status === 'Under Review') bg = '#e67e22';
    return { padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', backgroundColor: bg, color: 'white', fontWeight: 'bold', whiteSpace: 'nowrap' };
};

export default AdminDashboard;