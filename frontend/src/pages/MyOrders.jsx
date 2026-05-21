import { useEffect, useState } from 'react';
import axios from 'axios';
import ChatBox from '../components/ChatBox';
import { useLocation } from 'react-router-dom';

function MyOrders() {
    const [orders, setOrders] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const userData = JSON.parse(localStorage.getItem("user"));
    const userId = userData?.id;

    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const [showReclaimModal, setShowReclaimModal] = useState(false);
    const [reclaimData, setReclaimData] = useState({ subject: '', description: '' });
    const [isReclaiming, setIsReclaiming] = useState(false);

    const location = useLocation();

    const fetchOrders = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) return;
            const res = await axios.get('http://localhost:5000/api/orders/my-orders', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setOrders(res.data);
            if (res.data.length > 0) {
                if (!selectedOrder) {
                    setSelectedOrder(res.data[0]);
                } else {
                    const currentOrder = res.data.find(o => o.order_id === selectedOrder.order_id);
                    if (currentOrder) setSelectedOrder(currentOrder);
                }
            }
        } catch (err) {
            console.error("Error fetching orders:", err);
        }
    };

    useEffect(() => {
        fetchOrders();
        const interval = setInterval(fetchOrders, 10000);
        return () => clearInterval(interval);
    }, [selectedOrder?.order_id]);

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const recId = queryParams.get('reclamationId');
        if (recId && orders.length > 0) {
            const targetOrder = orders.find(o => String(o.reclamation_id) === String(recId));
            if (targetOrder) setSelectedOrder(targetOrder);
        }
    }, [location, orders]);

    const submitReview = async (orderId) => {
        if (!comment.trim()) {
            alert("Please write a comment before submitting your review.");
            return;
        }
        try {
            setSubmitting(true);
            const token = localStorage.getItem("token");
            await axios.post('http://localhost:5000/api/reviews/add',
                { order_id: orderId, rating, comment },
                { headers: { 'Authorization': `Bearer ${token}` } }
            );
            alert("Thank you! Your review has been submitted successfully.");
            setComment("");
            setRating(5);
            fetchOrders();
        } catch (err) {
            alert(err.response?.data?.message || "Failed to submit review.");
        } finally {
            setSubmitting(false);
        }
    };

    const submitReclamation = async () => {
        if (!reclaimData.subject || !reclaimData.description) {
            alert("Please fill in all fields.");
            return;
        }
        try {
            setIsReclaiming(true);
            const token = localStorage.getItem("token");
            await axios.post('http://localhost:5000/api/reclamations/add', {
                order_id: selectedOrder.order_id,
                buyer_id: userId,
                seller_id: selectedOrder.seller_id,
                subject: reclaimData.subject,
                description: reclaimData.description
            }, { headers: { 'Authorization': `Bearer ${token}` } });
            alert("Complaint sent to admin successfully.");
            setShowReclaimModal(false);
            setReclaimData({ subject: '', description: '' });
        } catch (err) {
            alert("Error sending complaint.");
        } finally {
            setIsReclaiming(false);
        }
    };

    const cancelOrder = async (orderId) => {
        if (!window.confirm("Are you sure you want to cancel this order?")) return;
        try {
            const token = localStorage.getItem("token");
            await axios.put(`http://localhost:5000/api/orders/cancel-order/${orderId}`, {}, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            alert("Order cancelled successfully.");
            fetchOrders();
        } catch (err) {
            alert(err.response?.data?.message || "Failed to cancel order");
        }
    };

    return (
        <div style={pageStyle}>
            <div style={containerStyle}>

                <h2 style={pageTitleStyle}>📦 My Purchases</h2>

                <div style={contentStyle}>

                    {/* Orders List */}
                    <div style={ordersListStyle}>
                        {orders.length === 0 ? (
                            <div style={emptyStyle}>
                                <p style={{ fontSize: '2.5rem', margin: 0 }}>📭</p>
                                <p style={{ color: '#94a3b8', marginTop: '10px' }}>No purchases yet.</p>
                            </div>
                        ) : (
                            orders.map(order => (
                                <div
                                    key={order.order_id}
                                    onClick={() => setSelectedOrder(order)}
                                    style={{
                                        ...orderCardStyle,
                                        border: selectedOrder?.order_id === order.order_id ? '2px solid #0f3460' : '1.5px solid #e2e8f0',
                                        backgroundColor: selectedOrder?.order_id === order.order_id ? '#f0f4ff' : 'white',
                                    }}
                                >
                                    <img
                                        src={order.image_urls?.[0]?.startsWith("http") ? order.image_urls[0] : `http://localhost:5000${order.image_urls?.[0] || '/uploads/default.png'}`}
                                        alt="Book"
                                        style={orderImageStyle}
                                    />
                                    <div style={{ flex: 1 }}>
                                        <p style={orderIdStyle}>Order {order.order_id}</p>
                                        <p style={orderTitleStyle}>{order.book_title}</p>
                                        <span style={statusBadgeStyle(order.status)}>{order.status}</span>
                                        {order.reclamation_id && (
                                            <p style={{ margin: '5px 0 0 0', fontSize: '0.75rem', color: '#e74c3c', fontWeight: 'bold' }}>
                                                ⚠️ Under Reclamation
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Chat & Details */}
                    <div style={detailsCardStyle}>
                        {selectedOrder ? (
                            <>
                                {/* Order Header */}
                                <div style={orderHeaderStyle}>
                                    <div>
                                        <h3 style={{ margin: '0 0 4px 0', color: '#1a1a2e', fontSize: '1.1rem' }}>
                                            💬 Chat with {selectedOrder.seller_name}
                                        </h3>
                                        <small style={{ color: '#94a3b8' }}>Order {selectedOrder.order_id}</small>
                                        <button
                                            onClick={() => setShowReclaimModal(true)}
                                            style={reclaimBtnStyle}
                                        >
                                            ⚠️ Report an Issue
                                        </button>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <span style={statusBadgeStyle(selectedOrder.status)}>
                                            {selectedOrder.status}
                                        </span>
                                        {selectedOrder.status === 'Pending' && (
                                            <button
                                                onClick={() => cancelOrder(selectedOrder.order_id)}
                                                style={cancelBtnStyle}
                                            >
                                                Cancel Order
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <ChatBox
                                    orderId={selectedOrder.order_id}
                                    currentUserId={userId}
                                    receiverId={selectedOrder.seller_id}
                                    reclamationId={selectedOrder.reclamation_id}
                                />

                                {/* Review Section */}
                                {selectedOrder.status === 'Delivered' && !selectedOrder.is_reviewed && (
                                    <div style={reviewCardStyle}>
                                        <h4 style={{ margin: '0 0 15px 0', color: '#1a1a2e' }}>⭐ Rate Your Experience</h4>
                                        <div style={{ marginBottom: '12px' }}>
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <span
                                                    key={star}
                                                    onClick={() => setRating(star)}
                                                    style={{ cursor: 'pointer', fontSize: '1.8rem', color: star <= rating ? '#f1c40f' : '#e2e8f0' }}
                                                >★</span>
                                            ))}
                                        </div>
                                        <textarea
                                            placeholder="Share your experience..."
                                            value={comment}
                                            onChange={(e) => setComment(e.target.value)}
                                            style={textareaStyle}
                                        />
                                        <button
                                            onClick={() => submitReview(selectedOrder.order_id)}
                                            disabled={submitting}
                                            style={submitReviewBtnStyle}
                                            onMouseEnter={e => e.target.style.backgroundColor = '#1e8449'}
                                            onMouseLeave={e => e.target.style.backgroundColor = '#27ae60'}
                                        >
                                            {submitting ? "Submitting..." : "Submit Review"}
                                        </button>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '60px 0', color: '#94a3b8' }}>
                                <p style={{ fontSize: '3rem', margin: 0 }}>👈</p>
                                <p style={{ marginTop: '10px' }}>Select an order to view details.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Reclamation Modal */}
            {showReclaimModal && (
                <div style={modalOverlayStyle}>
                    <div style={modalCardStyle}>
                        <h3 style={{ marginTop: 0, color: '#e74c3c' }}>⚠️ Report a Problem</h3>
                        <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '20px' }}>
                            Your message will be sent directly to the administrator.
                        </p>

                        <label style={modalLabelStyle}>Subject</label>
                        <select
                            style={modalInputStyle}
                            value={reclaimData.subject}
                            onChange={(e) => setReclaimData({ ...reclaimData, subject: e.target.value })}
                        >
                            <option value="">Select a reason</option>
                            <option value="I didn't receive the book">I didn't receive the book</option>
                            <option value="Book is different from description">Book is different from description</option>
                            <option value="Seller is unresponsive">Seller is unresponsive</option>
                            <option value="Other">Other</option>
                        </select>

                        <label style={modalLabelStyle}>Detailed Message</label>
                        <textarea
                            style={{ ...modalInputStyle, height: '120px', resize: 'none' }}
                            placeholder="Describe the issue in detail..."
                            value={reclaimData.description}
                            onChange={(e) => setReclaimData({ ...reclaimData, description: e.target.value })}
                        />

                        <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                            <button
                                onClick={submitReclamation}
                                disabled={isReclaiming}
                                style={{ ...modalBtnStyle, backgroundColor: '#e74c3c' }}
                                onMouseEnter={e => e.target.style.backgroundColor = '#c0392b'}
                                onMouseLeave={e => e.target.style.backgroundColor = '#e74c3c'}
                            >
                                {isReclaiming ? "Sending..." : "Send to Admin"}
                            </button>
                            <button
                                onClick={() => setShowReclaimModal(false)}
                                style={{ ...modalBtnStyle, backgroundColor: '#94a3b8' }}
                                onMouseEnter={e => e.target.style.backgroundColor = '#64748b'}
                                onMouseLeave={e => e.target.style.backgroundColor = '#94a3b8'}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

const pageStyle = { backgroundColor: '#f0f4f8', minHeight: '100vh', padding: '30px 20px' };
const containerStyle = { maxWidth: '1200px', margin: '0 auto' };
const pageTitleStyle = { fontSize: '1.8rem', fontWeight: '800', color: '#1a1a2e', marginBottom: '25px', borderBottom: '2px solid #e2e8f0', paddingBottom: '15px' };
const contentStyle = { display: 'flex', gap: '20px', alignItems: 'flex-start' };
const ordersListStyle = { width: '300px', flexShrink: 0, maxHeight: '80vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' };
const orderCardStyle = { display: 'flex', alignItems: 'center', gap: '12px', padding: '14px', borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' };
const orderImageStyle = { width: '50px', height: '70px', objectFit: 'cover', borderRadius: '8px', flexShrink: 0 };
const orderIdStyle = { margin: '0 0 3px 0', fontWeight: '700', color: '#1a1a2e', fontSize: '0.9rem' };
const orderTitleStyle = { margin: '0 0 6px 0', fontSize: '0.8rem', color: '#64748b' };
const detailsCardStyle = { flex: 1, backgroundColor: 'white', borderRadius: '16px', padding: '25px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid #e2e8f0', minHeight: '400px' };
const orderHeaderStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', paddingBottom: '15px', borderBottom: '1.5px solid #f0f4f8' };
const reclaimBtnStyle = { backgroundColor: 'transparent', color: '#e74c3c', border: 'none', padding: '4px 0', cursor: 'pointer', fontSize: '0.82rem', fontWeight: '700', textDecoration: 'underline', display: 'block', marginTop: '6px' };
const cancelBtnStyle = { display: 'block', marginTop: '8px', backgroundColor: 'transparent', color: '#e74c3c', border: '1.5px solid #e74c3c', padding: '5px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '600', width: '100%', transition: '0.2s' };
const reviewCardStyle = { marginTop: '20px', padding: '20px', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' };
const textareaStyle = { width: '100%', height: '80px', padding: '10px', borderRadius: '8px', border: '1.5px solid #e2e8f0', marginBottom: '10px', fontFamily: 'inherit', resize: 'none', outline: 'none', boxSizing: 'border-box' };
const submitReviewBtnStyle = { backgroundColor: '#27ae60', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', width: '100%', transition: 'background-color 0.2s' };
const emptyStyle = { textAlign: 'center', padding: '40px 0' };
const modalOverlayStyle = { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000 };
const modalCardStyle = { backgroundColor: 'white', padding: '30px', borderRadius: '16px', width: '460px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' };
const modalLabelStyle = { display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '0.85rem', color: '#374151', marginTop: '12px' };
const modalInputStyle = { width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #e2e8f0', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' };
const modalBtnStyle = { flex: 1, padding: '11px', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '0.95rem', transition: 'background-color 0.2s' };

const statusBadgeStyle = (status) => {
    let bg = '#f1c40f';
    if (status === 'Shipped') bg = '#3498db';
    if (status === 'Delivered') bg = '#27ae60';
    if (status === 'Cancelled') bg = '#e74c3c';
    return { backgroundColor: bg, color: 'white', padding: '3px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '700', display: 'inline-block', whiteSpace: 'nowrap' };
};

export default MyOrders;