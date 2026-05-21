import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

function Navbar() {
    const navigate = useNavigate();

    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    const user = userData ? JSON.parse(userData) : null;

    const [cartCount, setCartCount] = useState(0);
    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);

    const adminId = "78937316-c177-4e94-9a19-b82a0f8cc916";
    const isAdmin = user && user.id === adminId;

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('cart');
        setCartCount(0);
        setNotifications([]);
        navigate('/login');
    };

    const fetchData = async () => {
        if (!user) return;
        try {
            const cartRes = await axios.get(`http://localhost:5000/api/cart/count/${user.id}`);
            setCartCount(cartRes.data.count);
            const notifyRes = await axios.get(`http://localhost:5000/api/reclamations/notifications/${user.id}`);
            setNotifications(notifyRes.data);
        } catch (err) {
            console.error("Error fetching navbar data:", err);
        }
    };

    useEffect(() => {
        fetchData();
        window.addEventListener('cartUpdated', fetchData);
        window.addEventListener('storage', fetchData);
        const interval = setInterval(fetchData, 5000);
        return () => {
            window.removeEventListener('cartUpdated', fetchData);
            window.removeEventListener('storage', fetchData);
            clearInterval(interval);
        };
    }, [user?.id]);

    const handleNotificationClick = async (notification) => {
        try {
            await axios.put(`http://localhost:5000/api/reclamations/notifications/read/${notification.id}`);
            fetchData();
            setShowNotifications(false);
            if (user.role === 'SELLER') {
    // إذا كان الإشعار متعلق بالاشتراك
    if (notification.message.includes('subscription')) {
        navigate('/seller-dashboard?section=subscription');
    } else {
        navigate(`/my-sales?reclamationId=${notification.reclamation_id}`);
    }
} else {
    navigate(`/my-orders?reclamationId=${notification.reclamation_id}`);
}
        } catch (err) {
            console.error("Navigation error:", err);
        }
    };

    const unreadCount = notifications.filter(n => !n.is_read).length;

    return (
        <nav style={navStyle}>

            {/* Logo */}
            <Link to="/" style={logoStyle}>
                📚 UNIBOOKS
            </Link>

            {/* Links */}
            <div style={linksContainerStyle}>
                <Link to="/" style={linkStyle}
                    onMouseEnter={e => e.target.style.color = '#10b981'}
                    onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.85)'}
                >
                    Home
                </Link>

                {isAdmin ? (
                    <>
                        <Link to="/admin-dashboard" style={linkStyle}
                            onMouseEnter={e => e.target.style.color = '#10b981'}
                            onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.85)'}
                        >
                            Dashboard
                        </Link>
                        <span style={adminBadgeStyle}>⭐ Admin</span>
                        <button onClick={handleLogout} style={logoutBtnStyle}
                            onMouseEnter={e => e.target.style.backgroundColor = '#c0392b'}
                            onMouseLeave={e => e.target.style.backgroundColor = '#e74c3c'}
                        >
                            Logout
                        </button>
                    </>
                ) : (
                    <>
                        {user && user.role === 'SELLER' && (
                            <>
                                <Link to="/add-book" style={linkStyle}
                                    onMouseEnter={e => e.target.style.color = '#10b981'}
                                    onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.85)'}
                                >
                                    Add Book
                                </Link>
                                <Link to="/seller-dashboard" style={linkStyle}
                                    onMouseEnter={e => e.target.style.color = '#10b981'}
                                    onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.85)'}
                                >
                                    My Dashboard
                                </Link>
                                <Link to="/subscription/plans" style={linkStyle}
                                  onMouseEnter={e => e.target.style.color = '#10b981'}
                                  onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.85)'}
                                >
                                   💳 Subscription
                                </Link>
                            </>
                        )}

                        {token && (
                            <>
                                {/* Cart */}
                                <Link to="/cart" style={cartLinkStyle}
                                    onMouseEnter={e => e.currentTarget.style.color = '#10b981'}
                                    onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.85)'}
                                >
                                     
                                    🛒 Cart
                                    {cartCount > 0 && <span style={badgeStyle}>{cartCount}</span>}
                                </Link>

                                {/* My Orders */}
                                <Link to="/my-orders" style={linkStyle}
                                    onMouseEnter={e => e.target.style.color = '#10b981'}
                                    onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.85)'}
                                >
                                    My Orders
                                </Link>

                                {/* Notifications */}
                                <div style={{ position: 'relative' }}>
                                    <button
                                        onClick={() => setShowNotifications(!showNotifications)}
                                        style={notifBtnStyle}
                                    >
                                        🔔
                                        {unreadCount > 0 && (
                                            <span style={badgeStyle}>{unreadCount}</span>
                                        )}
                                    </button>

                                    {showNotifications && (
                                        <div style={dropdownStyle}>
                                            <h4 style={dropdownTitleStyle}>🔔 Notifications</h4>
                                            {notifications.length === 0 ? (
                                                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                                                    <p style={{ fontSize: '1.5rem', margin: 0 }}>📭</p>
                                                    <p style={{ fontSize: '0.82rem', color: '#94a3b8', marginTop: '5px' }}>No notifications yet</p>
                                                </div>
                                            ) : (
                                                notifications.map(n => (
                                                    <div
                                                        key={n.id}
                                                        onClick={() => handleNotificationClick(n)}
                                                        style={{
                                                            ...notifItemStyle,
                                                            backgroundColor: n.is_read ? 'white' : '#f0f4ff',
                                                            borderLeft: n.is_read ? '3px solid transparent' : '3px solid #0f3460',
                                                        }}
                                                        onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f8fafc'}
                                                        onMouseLeave={e => e.currentTarget.style.backgroundColor = n.is_read ? 'white' : '#f0f4ff'}
                                                    >
                                                        <p style={{ margin: '0 0 4px 0', fontSize: '0.83rem', color: '#1a1a2e', fontWeight: n.is_read ? '400' : '600' }}>
                                                            {n.message}
                                                        </p>
                                                        <small style={{ color: '#94a3b8', fontSize: '0.72rem' }}>
                                                            {new Date(n.created_at).toLocaleTimeString()}
                                                        </small>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Welcome */}
                                <span style={welcomeStyle}>👋Welcome {user?.name}</span>

                                {/* Logout */}
                                <button onClick={handleLogout} style={logoutBtnStyle}
                                    onMouseEnter={e => e.target.style.backgroundColor = '#c0392b'}
                                    onMouseLeave={e => e.target.style.backgroundColor = '#e74c3c'}
                                >
                                    Logout
                                </button>
                            </>
                        )}

                        {!token && (
                            <>
                                <Link to="/login" style={linkStyle}
                                    onMouseEnter={e => e.target.style.color = '#10b981'}
                                    onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.85)'}
                                >
                                    Login
                                </Link>
                                <Link to="/register" style={registerBtnStyle}
                                    onMouseEnter={e => e.target.style.backgroundColor = '#059669'}
                                    onMouseLeave={e => e.target.style.backgroundColor = '#10b981'}
                                >
                                    Register
                                </Link>
                            </>
                        )}
                    </>
                )}
            </div>
        </nav>
    );
}

const navStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.9rem 2.5rem',
    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
    boxShadow: '0 2px 20px rgba(0,0,0,0.3)',
    position: 'sticky',
    top: 0,
    zIndex: 1000,
};

const logoStyle = {
    fontSize: '1.4rem',
    fontWeight: '800',
    color: 'white',
    textDecoration: 'none',
    letterSpacing: '1px',
};

const linksContainerStyle = {
    display: 'flex',
    gap: '22px',
    alignItems: 'center',
};

const linkStyle = {
    color: 'rgba(255,255,255,0.85)',
    textDecoration: 'none',
    fontSize: '0.9rem',
    fontWeight: '500',
    transition: 'color 0.2s',
};

const cartLinkStyle = {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    color: 'rgba(255,255,255,0.85)',
    textDecoration: 'none',
    fontSize: '0.9rem',
    fontWeight: '500',
    transition: 'color 0.2s',
};

const badgeStyle = {
    backgroundColor: '#e74c3c',
    color: 'white',
    borderRadius: '50%',
    padding: '2px 6px',
    fontSize: '0.65rem',
    position: 'absolute',
    top: '-8px',
    right: '-10px',
    fontWeight: '700',
    minWidth: '16px',
    textAlign: 'center',
};

const notifBtnStyle = {
    background: 'none',
    border: 'none',
    color: 'rgba(255,255,255,0.85)',
    fontSize: '1.2rem',
    cursor: 'pointer',
    position: 'relative',
    padding: '4px',
};

const dropdownStyle = {
    position: 'absolute',
    top: '45px',
    right: '0',
    width: '300px',
    backgroundColor: 'white',
    color: 'black',
    borderRadius: '14px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
    padding: '15px',
    zIndex: 1000,
    maxHeight: '360px',
    overflowY: 'auto',
    border: '1px solid #e2e8f0',
};

const dropdownTitleStyle = {
    margin: '0 0 12px 0',
    fontSize: '0.95rem',
    fontWeight: '700',
    color: '#1a1a2e',
    borderBottom: '1.5px solid #f0f4f8',
    paddingBottom: '10px',
};

const notifItemStyle = {
    padding: '10px 12px',
    borderBottom: '1px solid #f0f4f8',
    cursor: 'pointer',
    borderRadius: '8px',
    marginBottom: '5px',
    transition: 'background 0.2s',
};

const welcomeStyle = {
    fontSize: '0.85rem',
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '500',
};

const adminBadgeStyle = {
    fontSize: '0.82rem',
    color: '#f1c40f',
    fontWeight: '700',
    backgroundColor: 'rgba(241,196,15,0.1)',
    padding: '4px 10px',
    borderRadius: '20px',
    border: '1px solid rgba(241,196,15,0.3)',
};

const logoutBtnStyle = {
    backgroundColor: '#e74c3c',
    color: 'white',
    border: 'none',
    padding: '7px 16px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '0.85rem',
    transition: 'background-color 0.2s',
};

const registerBtnStyle = {
    backgroundColor: '#10b981',
    padding: '7px 16px',
    borderRadius: '8px',
    color: 'white',
    textDecoration: 'none',
    fontWeight: '600',
    fontSize: '0.85rem',
    transition: 'background-color 0.2s',
};

export default Navbar;