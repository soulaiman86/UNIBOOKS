import { useState } from 'react';
import AdminOverview from './AdminOverview';
import AdminUsers from './AdminUsers';
import AdminBooks from './AdminBooks';
import AdminReclamations from './AdminReclamations';
import AdminSubscriptions from './AdminSubscriptions';

function AdminDashboard() {
    const [activeSection, setActiveSection] = useState('overview');

    const sections = [
        { id: 'overview', label: '📊 Overview' },
        { id: 'users', label: '👥 Users Management' },
        { id: 'books', label: '📚 Books Management' },
        { id: 'reclamations', label: '⚠️ Reclamations' },
        { id: 'subscriptions', label: '💳 Subscriptions' },
    ];

    const renderSection = () => {
        if (activeSection === 'overview') return <AdminOverview />;
        if (activeSection === 'users') return <AdminUsers />;
        if (activeSection === 'books') return <AdminBooks />;
        if (activeSection === 'reclamations') return <AdminReclamations />;
        if (activeSection === 'subscriptions') return <AdminSubscriptions />;
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'Arial, sans-serif' }}>
            <div style={sidebarStyle}>
                <h2 style={{ color: 'white', marginBottom: '30px', fontSize: '1.2rem' }}>🛡️ Admin Panel</h2>
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

export default AdminDashboard;