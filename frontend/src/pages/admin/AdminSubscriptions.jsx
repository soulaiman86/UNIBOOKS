import { useEffect, useState } from 'react';
import axios from 'axios';

function AdminSubscriptions() {
    const [subscriptions, setSubscriptions] = useState([]);
    const [filter, setFilter] = useState('all');

    const fetchSubscriptions = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/admin/subscriptions');
            setSubscriptions(res.data);
        } catch (err) {
            console.error("Error fetching subscriptions:", err);
        }
    };

    useEffect(() => {
        fetchSubscriptions();
    }, []);

    const handleAction = async (id, action) => {
        const confirmMsg = action === 'approve' ? "Approve this subscription?" : "Reject this subscription?";
        if (!window.confirm(confirmMsg)) return;
        try {
            await axios.put(`http://localhost:5000/api/admin/subscriptions/${id}`, { action });
            alert(action === 'approve' ? "Subscription approved successfully!" : "Subscription rejected.");
            fetchSubscriptions();
        } catch (err) {
            alert("Error processing request.");
        }
    };

    const filteredSubscriptions = filter === 'all'
        ? subscriptions
        : subscriptions.filter(s => s.status === filter);

    return (
        <div>
            <h2 style={{ marginBottom: '25px', color: '#2c3e50' }}>💳 Subscriptions Management</h2>

            {/* Filter Buttons */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '25px', flexWrap: 'wrap' }}>
                {['all', 'pending', 'active', 'rejected'].map(f => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        style={{
                            padding: '8px 20px',
                            borderRadius: '20px',
                            border: 'none',
                            cursor: 'pointer',
                            fontWeight: '700',
                            fontSize: '0.85rem',
                            backgroundColor: filter === f ? '#2c3e50' : '#e2e8f0',
                            color: filter === f ? 'white' : '#374151',
                            textTransform: 'capitalize',
                        }}
                    >
                        {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
                        {f === 'pending' && subscriptions.filter(s => s.status === 'pending').length > 0 && (
                            <span style={{
                                marginLeft: '6px',
                                backgroundColor: '#e74c3c',
                                color: 'white',
                                borderRadius: '50%',
                                padding: '1px 6px',
                                fontSize: '0.75rem',
                            }}>
                                {subscriptions.filter(s => s.status === 'pending').length}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Subscriptions List */}
            {filteredSubscriptions.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 0' }}>
                    <p style={{ fontSize: '3rem', margin: 0 }}>📭</p>
                    <p style={{ color: '#94a3b8', marginTop: '10px' }}>No subscriptions found.</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    {filteredSubscriptions.map(sub => (
                        <div key={sub.id} style={subCardStyle}>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '15px' }}>

                                {/* Seller Info */}
                                <div>
                                    <p style={sellerNameStyle}>👤 {sub.seller_name}</p>
                                    <p style={sellerEmailStyle}>{sub.seller_email}</p>
                                    <div style={{ display: 'flex', gap: '10px', marginTop: '8px', flexWrap: 'wrap' }}>
                                        <span style={infoBadgeStyle('#3498db')}>{sub.plan_type}</span>
                                        <span style={infoBadgeStyle('#0f3460')}>{sub.price} MAD</span>
                                        <span style={statusBadgeStyle(sub.status)}>{sub.status}</span>
                                    </div>
                                </div>

                                {/* Dates */}
                                <div style={{ textAlign: 'right' }}>
                                    <p style={dateStyle}>📅 Start: {new Date(sub.start_date).toLocaleDateString()}</p>
                                    <p style={dateStyle}>📅 End: {new Date(sub.end_date).toLocaleDateString()}</p>
                                    <p style={dateStyle}>💳 Payment: <strong style={{ color: sub.payment_status === 'verified' ? '#27ae60' : sub.payment_status === 'rejected' ? '#e74c3c' : '#f39c12' }}>{sub.payment_status}</strong></p>
                                </div>
                            </div>

                            {/* Payment Proof */}
                            {sub.payment_proof && (
                                <div style={proofContainerStyle}>
                                    <p style={{ margin: '0 0 10px 0', fontWeight: '600', color: '#374151', fontSize: '0.9rem' }}>🧾 Payment Proof:</p>
                                    <img
                                        src={sub.payment_proof}
                                        alt="Payment proof"
                                        style={proofImageStyle}
                                        onClick={() => window.open(sub.payment_proof, '_blank')}
                                    />
                                    <p style={{ margin: '5px 0 0 0', fontSize: '0.75rem', color: '#94a3b8' }}>Click to view full size</p>
                                </div>
                            )}

                            {/* Action Buttons */}
                            {sub.status === 'pending' && (
                                <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                                    <button
                                        onClick={() => handleAction(sub.id, 'approve')}
                                        style={approveBtnStyle}
                                        onMouseEnter={e => e.target.style.backgroundColor = '#1e8449'}
                                        onMouseLeave={e => e.target.style.backgroundColor = '#27ae60'}
                                    >
                                        ✅ Approve Subscription
                                    </button>
                                    <button
                                        onClick={() => handleAction(sub.id, 'reject')}
                                        style={rejectBtnStyle}
                                        onMouseEnter={e => e.target.style.backgroundColor = '#c0392b'}
                                        onMouseLeave={e => e.target.style.backgroundColor = '#e74c3c'}
                                    >
                                        ❌ Reject
                                    </button>
                                </div>
                            )}

                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

const subCardStyle = {
    backgroundColor: 'white',
    borderRadius: '16px',
    padding: '25px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
    border: '1px solid #e2e8f0',
};

const sellerNameStyle = {
    margin: '0 0 3px 0',
    fontWeight: '700',
    color: '#1a1a2e',
    fontSize: '1rem',
};

const sellerEmailStyle = {
    margin: '0',
    color: '#64748b',
    fontSize: '0.85rem',
};

const dateStyle = {
    margin: '0 0 4px 0',
    fontSize: '0.82rem',
    color: '#64748b',
};

const proofContainerStyle = {
    marginTop: '15px',
    padding: '15px',
    backgroundColor: '#f8fafc',
    borderRadius: '10px',
    border: '1px solid #e2e8f0',
};

const proofImageStyle = {
    width: '150px',
    height: '150px',
    objectFit: 'cover',
    borderRadius: '8px',
    cursor: 'pointer',
    border: '2px solid #e2e8f0',
    transition: 'transform 0.2s',
};

const infoBadgeStyle = (color) => ({
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '0.75rem',
    fontWeight: '700',
    backgroundColor: color,
    color: 'white',
    textTransform: 'capitalize',
});

const statusBadgeStyle = (status) => {
    let bg = '#f39c12';
    if (status === 'active') bg = '#27ae60';
    if (status === 'rejected') bg = '#e74c3c';
    return {
        padding: '4px 12px',
        borderRadius: '20px',
        fontSize: '0.75rem',
        fontWeight: '700',
        backgroundColor: bg,
        color: 'white',
        textTransform: 'capitalize',
    };
};

const approveBtnStyle = {
    padding: '10px 20px',
    backgroundColor: '#27ae60',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '700',
    fontSize: '0.9rem',
    transition: 'background-color 0.2s',
};

const rejectBtnStyle = {
    padding: '10px 20px',
    backgroundColor: '#e74c3c',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '700',
    fontSize: '0.9rem',
    transition: 'background-color 0.2s',
};

export default AdminSubscriptions;