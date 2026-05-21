import { useEffect, useState } from 'react';
import axios from 'axios';

function AdminOverview() {
    const [stats, setStats] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/admin/stats');
                setStats(res.data);
            } catch (err) {
                console.error("Error fetching stats:", err);
            }
        };
        fetchStats();
    }, []);

    if (!stats) return <p>Loading...</p>;

    return (
        <div>
            <h2 style={{ marginBottom: '25px', color: '#2c3e50' }}>📊 Overview</h2>

            {/* الإحصائيات الرئيسية */}
            <div style={cardsContainerStyle}>
                <div style={cardStyle('#3498db')}>
                    <h3 style={cardNumberStyle}>{stats.totalUsers}</h3>
                    <p style={cardLabelStyle}>Total Users</p>
                </div>
                <div style={cardStyle('#27ae60')}>
                    <h3 style={cardNumberStyle}>{stats.totalSellers}</h3>
                    <p style={cardLabelStyle}>Sellers</p>
                </div>
                <div style={cardStyle('#9b59b6')}>
                    <h3 style={cardNumberStyle}>{stats.totalBuyers}</h3>
                    <p style={cardLabelStyle}>Buyers</p>
                </div>
                <div style={cardStyle('#e67e22')}>
                    <h3 style={cardNumberStyle}>{stats.totalBooks}</h3>
                    <p style={cardLabelStyle}>Books Listed</p>
                </div>
                <div style={cardStyle('#2c3e50')}>
                    <h3 style={cardNumberStyle}>{stats.totalOrders}</h3>
                    <p style={cardLabelStyle}>Total Orders</p>
                </div>
                <div style={cardStyle('#27ae60')}>
                    <h3 style={cardNumberStyle}>${Number(stats.totalRevenue).toFixed(2)}</h3>
                    <p style={cardLabelStyle}>Total Revenue</p>
                </div>
                <div style={cardStyle('#e74c3c')}>
                    <h3 style={cardNumberStyle}>{stats.totalReclamations}</h3>
                    <p style={cardLabelStyle}>Reclamations</p>
                </div>
            </div>

            {/* الطلبات حسب الحالة */}
            <div style={{ marginTop: '35px' }}>
                <h3 style={{ color: '#2c3e50', marginBottom: '15px' }}>📦 Orders by Status</h3>
                <div style={cardsContainerStyle}>
                    {stats.ordersByStatus.map(item => (
                        <div key={item.status} style={cardStyle(statusColor(item.status))}>
                            <h3 style={cardNumberStyle}>{item.count}</h3>
                            <p style={cardLabelStyle}>{item.status}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

const statusColor = (status) => {
    if (status === 'Delivered') return '#27ae60';
    if (status === 'Pending') return '#f1c40f';
    if (status === 'Shipped') return '#3498db';
    if (status === 'Cancelled') return '#e74c3c';
    return '#95a5a6';
};

const cardsContainerStyle = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '20px',
};

const cardStyle = (color) => ({
    backgroundColor: color,
    color: 'white',
    padding: '20px 25px',
    borderRadius: '10px',
    minWidth: '150px',
    textAlign: 'center',
    boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
});

const cardNumberStyle = {
    margin: 0,
    fontSize: '2rem',
    fontWeight: 'bold',
};

const cardLabelStyle = {
    margin: '5px 0 0 0',
    fontSize: '0.9rem',
    opacity: 0.9,
};

export default AdminOverview;