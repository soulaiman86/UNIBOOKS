import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function SellerSubscription() {
    const [subscription, setSubscription] = useState(null);
    const [loading, setLoading] = useState(true);
    const userData = JSON.parse(localStorage.getItem("user"));
    const sellerId = userData?.id;
    const navigate = useNavigate();

    useEffect(() => {
        const fetchSubscription = async () => {
            try {
                const res = await axios.get(`http://localhost:5000/api/seller/subscription/${sellerId}`);
                setSubscription(res.data.hasActiveSubscription ? res.data.subscription : null);
            } catch (err) {
                console.error("Error fetching subscription:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchSubscription();
    }, [sellerId]);

    if (loading) return <p>Loading...</p>;

    return (
        <div>
            <h2 style={{ marginBottom: '25px', color: '#2c3e50' }}>💳 My Subscription</h2>

            {subscription ? (
                <div style={activeCardStyle}>
                    <div style={activeBadgeStyle}>✅ Active Subscription</div>

                    <div style={infoGridStyle}>
                        <div style={infoItemStyle}>
                            <p style={infoLabelStyle}>Plan</p>
                            <p style={infoValueStyle}>{subscription.plan_type}</p>
                        </div>
                        <div style={infoItemStyle}>
                            <p style={infoLabelStyle}>Price Paid</p>
                            <p style={infoValueStyle}>{subscription.price} MAD</p>
                        </div>
                        <div style={infoItemStyle}>
                            <p style={infoLabelStyle}>Start Date</p>
                            <p style={infoValueStyle}>{new Date(subscription.start_date).toLocaleDateString()}</p>
                        </div>
                        <div style={infoItemStyle}>
                            <p style={infoLabelStyle}>End Date</p>
                            <p style={infoValueStyle}>{new Date(subscription.end_date).toLocaleDateString()}</p>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    {(() => {
                        const start = new Date(subscription.start_date);
                        const end = new Date(subscription.end_date);
                        const now = new Date();
                        const total = end - start;
                        const elapsed = now - start;
                        const percentage = Math.min(100, Math.round((elapsed / total) * 100));
                        const daysLeft = Math.max(0, Math.round((end - now) / (1000 * 60 * 60 * 24)));

                        return (
                            <div style={{ marginTop: '25px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                    <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '600' }}>Subscription Progress</span>
                                    <span style={{ fontSize: '0.85rem', color: daysLeft < 7 ? '#e74c3c' : '#27ae60', fontWeight: '700' }}>
                                        {daysLeft} days remaining
                                    </span>
                                </div>
                                <div style={progressBarBgStyle}>
                                    <div style={{
                                        ...progressBarFillStyle,
                                        width: `${percentage}%`,
                                        backgroundColor: daysLeft < 7 ? '#e74c3c' : '#27ae60',
                                    }}></div>
                                </div>
                                {daysLeft < 7 && (
                                    <p style={{ color: '#e74c3c', fontSize: '0.85rem', marginTop: '8px', fontWeight: '600' }}>
                                        ⚠️ Your subscription is expiring soon! Renew to continue listing books.
                                    </p>
                                )}
                            </div>
                        );
                    })()}

                    <button
                        onClick={() => navigate('/subscription/plans')}
                        style={renewBtnStyle}
                        onMouseEnter={e => e.target.style.backgroundColor = '#0a2540'}
                        onMouseLeave={e => e.target.style.backgroundColor = '#0f3460'}
                    >
                        🔄 Renew or Upgrade Plan
                    </button>
                </div>
            ) : (
                <div style={noSubCardStyle}>
                    <p style={{ fontSize: '4rem', margin: 0 }}>📭</p>
                    <h3 style={{ color: '#1a1a2e', margin: '15px 0 8px 0' }}>No Active Subscription</h3>
                    <p style={{ color: '#64748b', margin: '0 0 25px 0', fontSize: '0.9rem' }}>
                        You can list up to 3 books for free. Subscribe to unlock unlimited listings.
                    </p>
                    <button
                        onClick={() => navigate('/subscription/plans')}
                        style={subscribeBtnStyle}
                        onMouseEnter={e => e.target.style.backgroundColor = '#1e8449'}
                        onMouseLeave={e => e.target.style.backgroundColor = '#27ae60'}
                    >
                        💳 View Subscription Plans
                    </button>
                </div>
            )}
        </div>
    );
}

const activeCardStyle = { backgroundColor: 'white', borderRadius: '16px', padding: '30px', boxShadow: '0 4px 20px rgba(0,0,0,0.07)', border: '1px solid #e2e8f0', maxWidth: '700px' };
const activeBadgeStyle = { display: 'inline-block', backgroundColor: '#f0fdf4', color: '#27ae60', border: '1px solid #27ae60', borderRadius: '20px', padding: '6px 16px', fontWeight: '700', fontSize: '0.9rem', marginBottom: '20px' };
const infoGridStyle = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' };
const infoItemStyle = { backgroundColor: '#f8fafc', borderRadius: '10px', padding: '15px', border: '1px solid #e2e8f0' };
const infoLabelStyle = { margin: '0 0 5px 0', fontSize: '0.8rem', color: '#94a3b8', fontWeight: '600', textTransform: 'uppercase' };
const infoValueStyle = { margin: 0, fontSize: '1.1rem', color: '#1a1a2e', fontWeight: '700', textTransform: 'capitalize' };
const progressBarBgStyle = { width: '100%', height: '10px', backgroundColor: '#e2e8f0', borderRadius: '10px', overflow: 'hidden' };
const progressBarFillStyle = { height: '100%', borderRadius: '10px', transition: 'width 0.5s ease' };
const renewBtnStyle = { marginTop: '25px', padding: '12px 25px', backgroundColor: '#0f3460', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', fontSize: '0.95rem', transition: 'background-color 0.2s' };
const noSubCardStyle = { backgroundColor: 'white', borderRadius: '16px', padding: '50px 30px', textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.07)', border: '1px solid #e2e8f0', maxWidth: '500px' };
const subscribeBtnStyle = { padding: '12px 30px', backgroundColor: '#27ae60', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', fontSize: '0.95rem', transition: 'background-color 0.2s' };

export default SellerSubscription;