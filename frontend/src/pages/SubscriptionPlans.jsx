import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function SubscriptionPlans() {
    const navigate = useNavigate();
    const userData = JSON.parse(localStorage.getItem("user"));
    const sellerId = userData?.id;
    const [currentSubscription, setCurrentSubscription] = useState(null);

    useEffect(() => {
        const fetchSubscription = async () => {
            try {
                const res = await axios.get(`http://localhost:5000/api/seller/subscription/${sellerId}`);
                if (res.data.hasActiveSubscription) {
                    setCurrentSubscription(res.data.subscription);
                }
            } catch (err) {
                console.error("Error fetching subscription:", err);
            }
        };
        if (sellerId) fetchSubscription();
    }, [sellerId]);

    const plans = [
    {
        id: 'monthly',
        title: 'Monthly',
        duration: '1 Month',
        price: 100,
        originalPrice: null,
        discount: null,
        color: '#3498db',
        icon: '📅',
        features: [
            'Up to 50 books',
            'Basic support',
            'Standard listing',
            '🥉 Priority Level 3: Your books appear after Semi-Annual and Annual subscribers'
        ]
    },
    {
        id: 'semi-annual',
        title: 'Semi-Annual',
        duration: '6 Months',
        price: 400,
        originalPrice: 600,
        discount: 33,
        color: '#0f3460',
        icon: '🌟',
        features: [
            'Up to 50 books',
            'Priority support',
            'Featured listing',
            'Save 33%',
            '🥈 Priority Level 2: Your books appear before Monthly subscribers'
        ]
    },
    {
        id: 'annual',
        title: 'Annual',
        duration: '1 Year',
        price: 650,
        originalPrice: 1200,
        discount: 46,
        color: '#27ae60',
        icon: '👑',
        features: [
            'Up to 50 books',
            'VIP support',
            'Top listing priority',
            'Save 46%',
            '🥇 Priority Level 1: Your books ALWAYS appear first on the homepage'
        ]
    }
];

    return (
        <div style={pageStyle}>
            <div style={containerStyle}>

                {/* Header */}
                <div style={headerStyle}>
                    <h1 style={titleStyle}>📚 UNIBOOKS Premium</h1>
                    <h2 style={subtitleStyle}>Choose Your Subscription Plan</h2>
                    <p style={descStyle}>Unlock unlimited book listings and grow your sales</p>

                    {currentSubscription && (
                        <div style={activeSubBannerStyle}>
                            ✅ You have an active <strong>{currentSubscription.plan_type}</strong> subscription
                            valid until <strong>{new Date(currentSubscription.end_date).toLocaleDateString()}</strong>
                        </div>
                    )}
                </div>

                {/* Plans */}
                <div style={plansContainerStyle}>
                    {plans.map(plan => (
                        <div
                            key={plan.id}
                            style={{
                                ...planCardStyle,
                                border: plan.id === 'semi-annual' ? `3px solid ${plan.color}` : '1.5px solid #e2e8f0',
                                transform: plan.id === 'semi-annual' ? 'scale(1.05)' : 'scale(1)',
                            }}
                        >
                            {/* Popular Badge */}
                            {plan.id === 'semi-annual' && (
                                <div style={popularBadgeStyle}>⭐ Most Popular</div>
                            )}

                            {/* Discount Badge */}
                            {plan.discount && (
                                <div style={discountBadgeStyle}>Save {plan.discount}%</div>
                            )}

                            <div style={planIconStyle}>{plan.icon}</div>
                            <h3 style={{ ...planTitleStyle, color: plan.color }}>{plan.title}</h3>
                            <p style={planDurationStyle}>{plan.duration}</p>

                            {/* Price */}
                            <div style={priceContainerStyle}>
                                {plan.originalPrice && (
                                    <span style={originalPriceStyle}>{plan.originalPrice} MAD</span>
                                )}
                                <div style={priceStyle}>
                                    <span style={{ fontSize: '1.2rem', color: plan.color }}>MAD</span>
                                    <span style={{ fontSize: '3rem', fontWeight: '800', color: plan.color }}>{plan.price}</span>
                                </div>
                            </div>

                            {/* Features */}
                            <ul style={featuresListStyle}>
                                {plan.features.map((feature, index) => (
                                    <li key={index} style={featureItemStyle}>
                                        <span style={{ color: plan.color, marginRight: '8px' }}>✓</span>
                                        {feature}
                                    </li>
                                ))}
                            </ul>

                            <button
                                onClick={() => navigate('/subscription/payment', {
                                    state: { plan: plan.id, price: plan.price, duration: plan.duration }
                                })}
                                style={{
                                    ...choosePlanBtnStyle,
                                    backgroundColor: plan.color,
                                }}
                                onMouseEnter={e => e.target.style.opacity = '0.9'}
                                onMouseLeave={e => e.target.style.opacity = '1'}
                            >
                                Choose {plan.title}
                            </button>
                        </div>
                    ))}
                </div>
                {/* Priority Info Box */}
<div style={priorityBoxStyle}>
    <h3 style={{ margin: '0 0 15px 0', color: 'white', fontSize: '1.1rem' }}>
        🏆 How Book Priority Works
    </h3>
    <div style={priorityGridStyle}>
        <div style={priorityItemStyle}>
            <span style={{ fontSize: '1.5rem' }}>🥇</span>
            <div>
                <p style={priorityTitleStyle}>Annual Subscribers</p>
                <p style={priorityDescStyle}>Books always appear first on the homepage</p>
            </div>
        </div>
        <div style={priorityItemStyle}>
            <span style={{ fontSize: '1.5rem' }}>🥈</span>
            <div>
                <p style={priorityTitleStyle}>Semi-Annual Subscribers</p>
                <p style={priorityDescStyle}>Books appear after Annual subscribers</p>
            </div>
        </div>
        <div style={priorityItemStyle}>
            <span style={{ fontSize: '1.5rem' }}>🥉</span>
            <div>
                <p style={priorityTitleStyle}>Monthly Subscribers</p>
                <p style={priorityDescStyle}>Books appear after Semi-Annual subscribers</p>
            </div>
        </div>
        <div style={priorityItemStyle}>
            <span style={{ fontSize: '1.5rem' }}>📚</span>
            <div>
                <p style={priorityTitleStyle}>Free Sellers</p>
                <p style={priorityDescStyle}>Books appear last (up to 3 books only)</p>
            </div>
        </div>
    </div>
</div>

                {/* Info */}
                <div style={infoBoxStyle}>
                    <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem', textAlign: 'center' }}>
                        🔒 Your subscription will be activated after payment verification by admin.
                        For any questions contact us at <strong>unibooks@support.com</strong>
                    </p>
                </div>

            </div>
        </div>
    );
}

const pageStyle = {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
    padding: '50px 20px',
};

const containerStyle = {
    maxWidth: '1100px',
    margin: '0 auto',
};

const headerStyle = {
    textAlign: 'center',
    marginBottom: '50px',
};

const titleStyle = {
    fontSize: '2rem',
    fontWeight: '800',
    color: 'white',
    margin: '0 0 10px 0',
};

const subtitleStyle = {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: 'rgba(255,255,255,0.9)',
    margin: '0 0 10px 0',
};

const descStyle = {
    fontSize: '1rem',
    color: 'rgba(255,255,255,0.6)',
    margin: 0,
};

const activeSubBannerStyle = {
    marginTop: '20px',
    backgroundColor: 'rgba(39,174,96,0.2)',
    border: '1px solid #27ae60',
    borderRadius: '10px',
    padding: '12px 20px',
    color: '#27ae60',
    fontSize: '0.9rem',
    display: 'inline-block',
};

const plansContainerStyle = {
    display: 'flex',
    gap: '25px',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: '40px',
};

const planCardStyle = {
    backgroundColor: 'white',
    borderRadius: '20px',
    padding: '35px 25px',
    width: '300px',
    position: 'relative',
    boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
    transition: 'transform 0.2s',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
};

const popularBadgeStyle = {
    position: 'absolute',
    top: '-15px',
    left: '50%',
    transform: 'translateX(-50%)',
    backgroundColor: '#0f3460',
    color: 'white',
    padding: '5px 20px',
    borderRadius: '20px',
    fontSize: '0.8rem',
    fontWeight: '700',
    whiteSpace: 'nowrap',
};

const discountBadgeStyle = {
    position: 'absolute',
    top: '15px',
    right: '15px',
    backgroundColor: '#e74c3c',
    color: 'white',
    padding: '4px 10px',
    borderRadius: '20px',
    fontSize: '0.75rem',
    fontWeight: '700',
};

const planIconStyle = {
    fontSize: '3rem',
    marginBottom: '10px',
};

const planTitleStyle = {
    fontSize: '1.4rem',
    fontWeight: '800',
    margin: '0 0 5px 0',
};

const planDurationStyle = {
    color: '#94a3b8',
    fontSize: '0.9rem',
    margin: '0 0 15px 0',
};

const priceContainerStyle = {
    marginBottom: '20px',
};

const originalPriceStyle = {
    color: '#94a3b8',
    textDecoration: 'line-through',
    fontSize: '0.9rem',
    display: 'block',
    marginBottom: '5px',
};

const priceStyle = {
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: '4px',
};

const featuresListStyle = {
    listStyle: 'none',
    padding: 0,
    margin: '0 0 25px 0',
    width: '100%',
    textAlign: 'left',
};

const featureItemStyle = {
    padding: '8px 0',
    borderBottom: '1px solid #f0f4f8',
    fontSize: '0.9rem',
    color: '#374151',
};

const choosePlanBtnStyle = {
    width: '100%',
    padding: '14px',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontWeight: '700',
    fontSize: '1rem',
    transition: 'opacity 0.2s',
    marginTop: 'auto',
};

const infoBoxStyle = {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: '12px',
    padding: '20px',
    border: '1px solid rgba(255,255,255,0.2)',
};

const priorityBoxStyle = {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: '16px',
    padding: '25px 30px',
    border: '1px solid rgba(255,255,255,0.2)',
    marginBottom: '30px',
};

const priorityGridStyle = {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '15px',
};

const priorityItemStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: '10px',
    padding: '12px 15px',
};

const priorityTitleStyle = {
    margin: '0 0 3px 0',
    color: 'white',
    fontWeight: '700',
    fontSize: '0.9rem',
};

const priorityDescStyle = {
    margin: 0,
    color: 'rgba(255,255,255,0.65)',
    fontSize: '0.8rem',
};

export default SubscriptionPlans;