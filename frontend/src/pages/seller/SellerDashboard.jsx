import { useState, useEffect } from 'react';
import SellerOverview from './SellerOverview';
import SellerBooks from './SellerBooks';
import MySales from './MySales';
import SellerSubscription from './SellerSubscription';
import { useLocation } from 'react-router-dom';

function SellerDashboard() {
    const [activeSection, setActiveSection] = useState('overview');
    const location = useLocation();

    // التحقق من الـ query parameter عند الدخول
    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const section = queryParams.get('section');
        if (section) setActiveSection(section);
    }, [location.search]);

    const sections = [
        { id: 'overview', label: '📊 Overview' },
        { id: 'books', label: '📚 My Books' },
        { id: 'orders', label: '💰 My Sales' },
        { id: 'subscription', label: '💳 Subscription' },
    ];

    const renderSection = () => {
        if (activeSection === 'overview') return <SellerOverview />;
        if (activeSection === 'books') return <SellerBooks />;
        if (activeSection === 'orders') return <MySales />;
        if (activeSection === 'subscription') return <SellerSubscription />;
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'Arial, sans-serif' }}>
            <div style={sidebarStyle}>
                <h2 style={{ color: 'white', marginBottom: '30px', fontSize: '1.2rem' }}>💰 Seller Panel</h2>
                {sections.map(section => (
                    <button
                        key={section.id}
                        onClick={() => setActiveSection(section.id)}
                        style={{
                             ...sidebarButtonStyle,
    backgroundColor: activeSection === section.id ? 'rgba(255,255,255,0.15)' : 'transparent',
    borderLeft: activeSection === section.id ? '4px solid #10b981' : '4px solid transparent',
    fontWeight: activeSection === section.id ? '700' : '400',
    color: activeSection === section.id ? '#10b981' : 'rgba(255,255,255,0.85)',
                        }}
                    >
                        {section.label}
                    </button>
                ))}
            </div>
            <div style={mainContentStyle}>
                {renderSection()}
            </div>
        </div>
    );
}

const sidebarStyle = { width: '240px', background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)', padding: '30px 15px', display: 'flex', flexDirection: 'column', gap: '10px', minHeight: '100vh' };
const sidebarButtonStyle = { 
    color: 'white', 
    border: 'none', 
    padding: '12px 15px', 
    borderRadius: '6px', 
    cursor: 'pointer', 
    textAlign: 'left', 
    fontSize: '0.95rem', 
    transition: '0.2s',
    width: '100%',
};
const mainContentStyle = { flex: 1, padding: '30px', backgroundColor: '#f4f6f8', overflowY: 'auto' };

export default SellerDashboard;