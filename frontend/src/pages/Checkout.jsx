import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';

function Checkout() {
    const [cartItems, setCartItems] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const directBook = location.state?.directBook;

    const [shippingData, setShippingData] = useState({ phone: '', address: '' });
    const userData = JSON.parse(localStorage.getItem("user"));
    const userId = userData ? userData.id : null;

    useEffect(() => {
        if (directBook) {
            setCartItems([{
                cart_item_id: directBook.id,
                title: directBook.title,
                price: directBook.price,
                quantity: 1
            }]);
            setTotal(Number(directBook.price));
            return;
        }
        const fetchCart = async () => {
            if (!userId) return;
            try {
                const res = await axios.get(`http://localhost:5000/api/cart/${userId}`);
                setCartItems(res.data);
                const sum = res.data.reduce((acc, item) => acc + (item.price * item.quantity), 0);
                setTotal(sum);
            } catch (err) {
                console.error("Error fetching cart for checkout", err);
            }
        };
        fetchCart();
    }, [userId, directBook]);

    const handlePlaceOrder = async () => {
        const token = localStorage.getItem("token");
        if (!token) return alert("Please login first to complete your purchase");
        if (!shippingData.phone || !shippingData.address) {
            return alert("Please fill in your shipping details!");
        }
        setLoading(true);
        try {
            if (directBook) {
                await axios.post('http://localhost:5000/api/cart/add', {
                    user_id: userId,
                    book_id: directBook.id
                });
            }
            await axios.post(
                'http://localhost:5000/api/orders/place-order',
                { phone_number: shippingData.phone, address: shippingData.address },
                { headers: { 'Authorization': `Bearer ${token}` } }
            );
            alert("🎉 Order Placed Successfully! The seller will contact you soon.");
            window.dispatchEvent(new Event('cartUpdated'));
            navigate('/');
        } catch (err) {
            if (err.response?.status === 401 || err.response?.status === 403) {
                alert("Your session has expired. Please login again.");
            } else {
                alert(err.response?.data?.message || "Something went wrong.");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        setShippingData({ ...shippingData, [e.target.name]: e.target.value });
    };

    if (cartItems.length === 0) return (
        <div style={emptyStyle}>
            <p style={{ fontSize: '3rem', margin: 0 }}>🛒</p>
            <p style={{ color: '#94a3b8', marginTop: '10px' }}>Your cart is empty!</p>
        </div>
    );

    return (
        <div style={pageStyle}>
            <div style={containerStyle}>

                <h2 style={pageTitleStyle}>🧾 Checkout</h2>

                <div style={contentStyle}>

                    {/* Order Summary */}
                    <div style={summaryCardStyle}>
                        <h3 style={sectionTitleStyle}>📦 Order Summary</h3>

                        <div style={itemsListStyle}>
                            {cartItems.map(item => (
                                <div key={item.cart_item_id} style={itemRowStyle}>
                                    <div>
                                        <p style={itemTitleStyle}>{item.title}</p>
                                        <p style={itemQtyStyle}>Quantity: {item.quantity}</p>
                                    </div>
                                    <span style={itemPriceStyle}>
                                        ${(item.price * item.quantity).toFixed(2)}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <div style={dividerStyle}></div>

                        <div style={totalSectionStyle}>
                            <div style={totalRowStyle}>
                                <span style={{ color: '#64748b' }}>Subtotal</span>
                                <span style={{ fontWeight: '600' }}>${total.toFixed(2)}</span>
                            </div>
                            <div style={totalRowStyle}>
                                <span style={{ color: '#64748b' }}>Shipping</span>
                                <span style={{ color: '#27ae60', fontWeight: '600' }}>Paid $50</span>
                            </div>
                            <div style={{ ...totalRowStyle, marginTop: '10px' }}>
                                <span style={{ fontWeight: '800', fontSize: '1.1rem', color: '#1a1a2e' }}>Total</span>
                                <span style={{ fontWeight: '800', fontSize: '1.3rem', color: '#0f3460' }}>
                                    ${Number( total.toFixed(2)) + 50}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Shipping Details */}
                    <div style={shippingCardStyle}>
                        <h3 style={sectionTitleStyle}>🚚 Shipping Details</h3>

                        <div style={fieldGroupStyle}>
                            <label style={labelStyle}>Phone Number</label>
                            <input
                                type="text"
                                name="phone"
                                placeholder="Enter your phone number"
                                value={shippingData.phone}
                                onChange={handleInputChange}
                                style={inputStyle}
                                onFocus={e => e.target.style.borderColor = '#0f3460'}
                                onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                                required
                            />
                        </div>

                        <div style={fieldGroupStyle}>
                            <label style={labelStyle}>Delivery Address</label>
                            <textarea
                                name="address"
                                placeholder="City, Street, Building..."
                                value={shippingData.address}
                                onChange={handleInputChange}
                                style={{ ...inputStyle, height: '100px', resize: 'vertical' }}
                                onFocus={e => e.target.style.borderColor = '#0f3460'}
                                onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                                required
                            />
                        </div>

                        <div style={orderInfoBoxStyle}>
                            <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>
                                🔒 Your order information is secure and encrypted.
                            </p>
                        </div>

                        <button
                            onClick={handlePlaceOrder}
                            disabled={loading}
                            style={{
                                ...confirmBtnStyle,
                                backgroundColor: loading ? '#94a3b8' : '#27ae60',
                                cursor: loading ? 'not-allowed' : 'pointer'
                            }}
                            onMouseEnter={e => { if (!loading) e.target.style.backgroundColor = '#1e8449'; }}
                            onMouseLeave={e => { if (!loading) e.target.style.backgroundColor = '#27ae60'; }}
                        >
                            {loading ? '⏳ Processing...' : '✅ Confirm & Place Order'}
                        </button>

                        <button
                            onClick={() => navigate(-1)}
                            style={backBtnStyle}
                            onMouseEnter={e => e.target.style.backgroundColor = '#e2e8f0'}
                            onMouseLeave={e => e.target.style.backgroundColor = 'transparent'}
                        >
                            ← Go Back
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
}

const pageStyle = {
    backgroundColor: '#f0f4f8',
    minHeight: '100vh',
    padding: '40px 20px',
};

const containerStyle = {
    maxWidth: '900px',
    margin: '0 auto',
};

const pageTitleStyle = {
    fontSize: '1.8rem',
    fontWeight: '800',
    color: '#1a1a2e',
    marginBottom: '25px',
};

const contentStyle = {
    display: 'flex',
    gap: '25px',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
};

const summaryCardStyle = {
    flex: '1',
    backgroundColor: 'white',
    borderRadius: '16px',
    padding: '25px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
    border: '1px solid #e2e8f0',
    minWidth: '280px',
};

const shippingCardStyle = {
    flex: '1.2',
    backgroundColor: 'white',
    borderRadius: '16px',
    padding: '25px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
    border: '1px solid #e2e8f0',
    minWidth: '280px',
};

const sectionTitleStyle = {
    fontSize: '1.1rem',
    fontWeight: '700',
    color: '#1a1a2e',
    margin: '0 0 20px 0',
    paddingBottom: '12px',
    borderBottom: '2px solid #f0f4f8',
};

const itemsListStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
};

const itemRowStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: '10px',
    backgroundColor: '#f8fafc',
    borderRadius: '10px',
};

const itemTitleStyle = {
    margin: '0 0 4px 0',
    fontWeight: '600',
    color: '#1a1a2e',
    fontSize: '0.9rem',
};

const itemQtyStyle = {
    margin: 0,
    color: '#94a3b8',
    fontSize: '0.8rem',
};

const itemPriceStyle = {
    fontWeight: '700',
    color: '#0f3460',
    fontSize: '0.95rem',
    whiteSpace: 'nowrap',
};

const dividerStyle = {
    height: '1.5px',
    backgroundColor: '#f0f4f8',
    margin: '15px 0',
};

const totalSectionStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
};

const totalRowStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.95rem',
};

const fieldGroupStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    marginBottom: '18px',
};

const labelStyle = {
    fontSize: '0.85rem',
    fontWeight: '600',
    color: '#374151',
};

const inputStyle = {
    padding: '12px 14px',
    borderRadius: '10px',
    border: '1.5px solid #e2e8f0',
    fontSize: '0.95rem',
    outline: 'none',
    transition: 'border-color 0.2s',
    backgroundColor: '#f8fafc',
    boxSizing: 'border-box',
    width: '100%',
    fontFamily: 'inherit',
};

const orderInfoBoxStyle = {
    backgroundColor: '#f0f4ff',
    border: '1px solid #e0e7ff',
    borderRadius: '10px',
    padding: '12px',
    marginBottom: '18px',
};

const confirmBtnStyle = {
    width: '100%',
    padding: '14px',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontWeight: '700',
    fontSize: '1rem',
    transition: 'background-color 0.2s',
    marginBottom: '10px',
};

const backBtnStyle = {
    width: '100%',
    padding: '12px',
    backgroundColor: 'transparent',
    color: '#64748b',
    border: '1.5px solid #e2e8f0',
    borderRadius: '10px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '0.95rem',
    transition: 'background-color 0.2s',
};

const emptyStyle = {
    textAlign: 'center',
    marginTop: '100px',
};

export default Checkout;