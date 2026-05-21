import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import ChatBox from '../../components/ChatBox';
import { useLocation } from 'react-router-dom';

function MySales() {
    const [sales, setSales] = useState([]);
    const [selectedSale, setSelectedSale] = useState(null);
    const userData = JSON.parse(localStorage.getItem("user"));
    const sellerId = userData?.id;
    const location = useLocation();

    const fetchSales = useCallback(async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await axios.get(`http://localhost:5000/api/orders/seller-orders`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setSales(res.data);
            if (res.data.length > 0) {
                if (!selectedSale) {
                    setSelectedSale(res.data[0]);
                } else {
                    const updatedSale = res.data.find(s => s.order_id === selectedSale.order_id);
                    if (updatedSale) setSelectedSale(updatedSale);
                }
            }
        } catch (err) {
            console.error("Error fetching sales:", err);
        }
    }, [selectedSale]);

    useEffect(() => {
        fetchSales();
    }, []);

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const recId = queryParams.get('reclamationId');
        if (recId && sales.length > 0) {
            const targetSale = sales.find(s =>
                String(s.reclamation_id) === String(recId) ||
                String(s.order_id) === String(recId)
            );
            if (targetSale) setSelectedSale(targetSale);
        }
    }, [location.search, sales]);

    const updateOrderStatus = async (orderId, newStatus) => {
        try {
            const token = localStorage.getItem("token");
            await axios.put(`http://localhost:5000/api/orders/update-status/${orderId}`,
                { status: newStatus },
                { headers: { 'Authorization': `Bearer ${token}` } }
            );
            alert("Status updated successfully!");
            fetchSales();
        } catch (err) {
            alert("Failed to update status");
        }
    };

    return (
        <div style={pageStyle}>
            <div style={containerStyle}>

                <h2 style={pageTitleStyle}>💰 My Sales</h2>

                <div style={contentStyle}>

                    {/* Sales List */}
                    <div style={salesListStyle}>
                        {sales.length === 0 ? (
                            <div style={emptyStyle}>
                                <p style={{ fontSize: '2.5rem', margin: 0 }}>📭</p>
                                <p style={{ color: '#94a3b8', marginTop: '10px', fontSize: '0.9rem' }}>No sales yet.</p>
                            </div>
                        ) : (
                            sales.map(sale => (
                                <div
                                    key={sale.order_id}
                                    onClick={() => setSelectedSale(sale)}
                                    style={{
                                        ...saleCardStyle,
                                        border: selectedSale?.order_id === sale.order_id ? '2px solid #0f3460' : '1.5px solid #e2e8f0',
                                        backgroundColor: selectedSale?.order_id === sale.order_id ? '#f0f4ff' : 'white',
                                    }}
                                >
                                    <div style={{ marginBottom: '10px' }}>
                                        <p style={saleOrderIdStyle}>Order {sale.order_id}</p>
                                        <p style={saleTitleStyle}>{sale.book_title}</p>
                                        <p style={saleBuyerStyle}>👤 {sale.buyer_name}</p>
                                        {sale.reclamation_id && (
                                            <p style={reclamationBadgeStyle}>⚠️ Under Reclamation</p>
                                        )}
                                    </div>

                                    <div style={statusRowStyle}>
                                        <label style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '600' }}>Status:</label>
                                        <select
                                            value={sale.status}
                                            onChange={(e) => updateOrderStatus(sale.order_id, e.target.value)}
                                            onClick={(e) => e.stopPropagation()}
                                            style={selectStyle}
                                        >
                                            <option value="Pending">Pending</option>
                                            <option value="Shipped">Shipped</option>
                                            <option value="Delivered">Delivered</option>
                                            <option value="Cancelled">Cancelled</option>
                                        </select>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Chat Section */}
                    <div style={chatCardStyle}>
                        {selectedSale ? (
                            <div>
                                <div style={chatHeaderStyle}>
                                    <div>
                                        <h3 style={{ margin: '0 0 4px 0', color: '#1a1a2e', fontSize: '1.1rem' }}>
                                            💬 Chat with {selectedSale.buyer_name}
                                        </h3>
                                        <small style={{ color: '#94a3b8' }}>Order {selectedSale.order_id}</small>
                                    </div>
                                    <span style={statusBadgeStyle(selectedSale.status)}>
                                        {selectedSale.status}
                                    </span>
                                </div>

                                <ChatBox
                                    orderId={selectedSale.order_id}
                                    currentUserId={sellerId}
                                    receiverId={selectedSale.buyer_id}
                                    reclamationId={selectedSale.reclamation_id}
                                />
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '60px 0', color: '#94a3b8' }}>
                                <p style={{ fontSize: '3rem', margin: 0 }}>👈</p>
                                <p style={{ marginTop: '10px' }}>Select a sale to chat with the buyer.</p>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
}

const pageStyle = { backgroundColor: '#f0f4f8', minHeight: '100vh', padding: '30px 20px' };
const containerStyle = { maxWidth: '1200px', margin: '0 auto' };
const pageTitleStyle = { fontSize: '1.8rem', fontWeight: '800', color: '#1a1a2e', marginBottom: '25px', borderBottom: '2px solid #e2e8f0', paddingBottom: '15px' };
const contentStyle = { display: 'flex', gap: '20px', alignItems: 'flex-start' };
const salesListStyle = { width: '300px', flexShrink: 0, maxHeight: '80vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' };

const saleCardStyle = {
    padding: '15px',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
};

const saleOrderIdStyle = { margin: '0 0 3px 0', fontWeight: '700', color: '#1a1a2e', fontSize: '0.9rem' };
const saleTitleStyle = { margin: '0 0 3px 0', fontSize: '0.82rem', color: '#64748b' };
const saleBuyerStyle = { margin: '0 0 5px 0', fontSize: '0.82rem', color: '#0f3460', fontWeight: '600' };
const reclamationBadgeStyle = { margin: '5px 0 0 0', fontSize: '0.75rem', color: '#e74c3c', fontWeight: '700' };

const statusRowStyle = {
    borderTop: '1px solid #f0f4f8',
    paddingTop: '10px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
};

const selectStyle = {
    flex: 1,
    padding: '6px 10px',
    borderRadius: '8px',
    border: '1.5px solid #e2e8f0',
    fontSize: '0.82rem',
    cursor: 'pointer',
    outline: 'none',
    backgroundColor: '#f8fafc',
    color: '#374151',
    fontWeight: '600',
};

const chatCardStyle = {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: '16px',
    padding: '25px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
    border: '1px solid #e2e8f0',
    minHeight: '400px',
};

const chatHeaderStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '20px',
    paddingBottom: '15px',
    borderBottom: '1.5px solid #f0f4f8',
};

const emptyStyle = { textAlign: 'center', padding: '40px 0' };

const statusBadgeStyle = (status) => {
    let bg = '#f1c40f';
    if (status === 'Shipped') bg = '#3498db';
    if (status === 'Delivered') bg = '#27ae60';
    if (status === 'Cancelled') bg = '#e74c3c';
    return { backgroundColor: bg, color: 'white', padding: '5px 14px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '700', whiteSpace: 'nowrap' };
};

export default MySales;