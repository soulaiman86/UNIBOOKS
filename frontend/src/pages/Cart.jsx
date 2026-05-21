import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

function Cart() {
    const navigate = useNavigate();
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const userData = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        const fetchCartItems = async () => {
            if (!userData) return;
            try {
                const res = await axios.get(`http://localhost:5000/api/cart/${userData.id}`);
                setCartItems(res.data);
                setLoading(false);
            } catch (err) {
                console.error("Error fetching cart:", err);
                setLoading(false);
            }
        };
        fetchCartItems();
    }, []);

    const totalPrice = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    const removeFromCart = async (cartItemId) => {
        try {
            await axios.delete(`http://localhost:5000/api/cart/${cartItemId}`);
            setCartItems(cartItems.filter(item => item.cart_item_id !== cartItemId));
            window.dispatchEvent(new Event('cartUpdated'));
        } catch (err) {
            alert("Could not remove item. Try again.");
        }
    };

    const updateQuantity = async (cartItemId, action) => {
        try {
            await axios.put(`http://localhost:5000/api/cart/update-quantity`, {
                cart_item_id: cartItemId,
                action: action
            });
            setCartItems(prevItems => prevItems.map(item => {
                if (item.cart_item_id === cartItemId) {
                    const newQty = action === 'increment' ? item.quantity + 1 : Math.max(1, item.quantity - 1);
                    return { ...item, quantity: newQty };
                }
                return item;
            }));
            window.dispatchEvent(new Event('cartUpdated'));
        } catch (err) {
            if (err.response && err.response.status === 400) {
                alert(err.response.data.message);
            } else {
                alert("Something went wrong. Please try again.");
            }
        }
    };

    if (loading) return (
        <div style={loadingStyle}>
            <div style={spinnerStyle}></div>
            <p style={{ color: '#64748b', marginTop: '15px' }}>Loading your cart...</p>
        </div>
    );

    return (
        <div style={pageStyle}>
            <div style={containerStyle}>

                {/* Header */}
                <div style={headerStyle}>
                    <h2 style={titleStyle}>🛒 Your Shopping Cart</h2>
                    {cartItems.length > 0 && (
                        <span style={itemCountStyle}>{cartItems.length} item{cartItems.length > 1 ? 's' : ''}</span>
                    )}
                </div>

                {cartItems.length === 0 ? (
                    <div style={emptyStyle}>
                        <p style={{ fontSize: '4rem', margin: 0 }}>🛒</p>
                        <h3 style={{ color: '#1a1a2e', margin: '15px 0 8px 0' }}>Your cart is empty</h3>
                        <p style={{ color: '#94a3b8', margin: '0 0 20px 0' }}>Looks like you haven't added any books yet.</p>
                        <Link to="/" style={shopLinkStyle}>Browse Books</Link>
                    </div>
                ) : (
                    <div style={contentStyle}>

                        {/* Cart Items */}
                        <div style={itemsListStyle}>
                            {cartItems.map((item) => (
                                <div key={item.cart_item_id} style={cartItemStyle}>
                                    <img
                                        src={item.image_urls[0].startsWith('http')
                                            ? item.image_urls[0]
                                            : `http://localhost:5000${item.image_urls[0].startsWith('/') ? '' : '/'}${item.image_urls[0]}`}
                                        alt={item.title}
                                        style={itemImageStyle}
                                    />
                                    <div style={itemInfoStyle}>
                                        <h4 style={itemTitleStyle}>{item.title}</h4>
                                        <p style={itemPriceStyle}>${Number(item.price).toFixed(2)}</p>
                                        <p style={itemSubtotalStyle}>
                                            Subtotal: <strong>${(item.price * item.quantity).toFixed(2)}</strong>
                                        </p>
                                    </div>
                                    <div style={itemActionsStyle}>
                                        <div style={qtyRowStyle}>
                                            <button
                                                onClick={() => updateQuantity(item.cart_item_id, 'decrement')}
                                                style={qtyBtnStyle}
                                                onMouseEnter={e => e.target.style.backgroundColor = '#e2e8f0'}
                                                onMouseLeave={e => e.target.style.backgroundColor = '#f8fafc'}
                                            >−</button>
                                            <span style={qtyNumStyle}>{item.quantity}</span>
                                            <button
                                                onClick={() => updateQuantity(item.cart_item_id, 'increment')}
                                                style={qtyBtnStyle}
                                                onMouseEnter={e => e.target.style.backgroundColor = '#e2e8f0'}
                                                onMouseLeave={e => e.target.style.backgroundColor = '#f8fafc'}
                                            >+</button>
                                        </div>
                                        <button
                                            onClick={() => removeFromCart(item.cart_item_id)}
                                            style={removeBtnStyle}
                                            onMouseEnter={e => e.target.style.backgroundColor = '#c0392b'}
                                            onMouseLeave={e => e.target.style.backgroundColor = '#e74c3c'}
                                        >
                                            🗑️ Remove
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Summary */}
                        <div style={summaryStyle}>
                            <h3 style={summaryTitleStyle}>Order Summary</h3>
                            <div style={summaryRowStyle}>
                                <span style={{ color: '#64748b' }}>Items ({cartItems.length})</span>
                                <span style={{ fontWeight: '600' }}>${totalPrice.toFixed(2)}</span>
                            </div>
                            <div style={summaryRowStyle}>
                                <span style={{ color: '#64748b' }}>Shipping</span>
                                <span style={{ color: '#27ae60', fontWeight: '600' }}>Free</span>
                            </div>
                            <div style={dividerStyle}></div>
                            <div style={totalRowStyle}>
                                <span style={{ fontWeight: '700', fontSize: '1.1rem' }}>Total</span>
                                <span style={{ fontWeight: '800', fontSize: '1.3rem', color: '#0f3460' }}>
                                    ${totalPrice.toFixed(2)}
                                </span>
                            </div>
                            <button
                                onClick={() => navigate('/checkout')}
                                style={checkoutBtnStyle}
                                onMouseEnter={e => e.target.style.backgroundColor = '#0a2540'}
                                onMouseLeave={e => e.target.style.backgroundColor = '#0f3460'}
                            >
                                Proceed to Checkout →
                            </button>
                            <Link to="/" style={continueLinkStyle}>← Continue Shopping</Link>
                        </div>

                    </div>
                )}
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
    maxWidth: '1000px',
    margin: '0 auto',
};

const headerStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    marginBottom: '25px',
};

const titleStyle = {
    fontSize: '1.8rem',
    fontWeight: '800',
    color: '#1a1a2e',
    margin: 0,
};

const itemCountStyle = {
    backgroundColor: '#0f3460',
    color: 'white',
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '0.85rem',
    fontWeight: '600',
};

const contentStyle = {
    display: 'flex',
    gap: '25px',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
};

const itemsListStyle = {
    flex: '2',
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
    minWidth: '300px',
};

const cartItemStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    padding: '20px',
    backgroundColor: 'white',
    borderRadius: '16px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
    border: '1px solid #e2e8f0',
};

const itemImageStyle = {
    width: '80px',
    height: '110px',
    objectFit: 'cover',
    borderRadius: '10px',
    boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
    flexShrink: 0,
};

const itemInfoStyle = {
    flex: 1,
};

const itemTitleStyle = {
    margin: '0 0 8px 0',
    color: '#1a1a2e',
    fontWeight: '700',
    fontSize: '1rem',
};

const itemPriceStyle = {
    margin: '0 0 4px 0',
    color: '#0f3460',
    fontWeight: '700',
    fontSize: '1.1rem',
};

const itemSubtotalStyle = {
    margin: 0,
    color: '#94a3b8',
    fontSize: '0.85rem',
};

const itemActionsStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '10px',
};

const qtyRowStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    backgroundColor: '#f8fafc',
    border: '1.5px solid #e2e8f0',
    borderRadius: '10px',
    padding: '4px 8px',
};

const qtyBtnStyle = {
    width: '28px',
    height: '28px',
    border: 'none',
    backgroundColor: '#f8fafc',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '1.1rem',
    fontWeight: '700',
    color: '#0f3460',
    transition: 'background-color 0.2s',
};

const qtyNumStyle = {
    fontWeight: '700',
    fontSize: '1rem',
    color: '#1a1a2e',
    minWidth: '20px',
    textAlign: 'center',
};

const removeBtnStyle = {
    backgroundColor: '#e74c3c',
    color: 'white',
    border: 'none',
    padding: '7px 14px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.8rem',
    fontWeight: '600',
    transition: 'background-color 0.2s',
};

const summaryStyle = {
    flex: '1',
    backgroundColor: 'white',
    borderRadius: '16px',
    padding: '25px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
    border: '1px solid #e2e8f0',
    minWidth: '250px',
};

const summaryTitleStyle = {
    fontSize: '1.2rem',
    fontWeight: '700',
    color: '#1a1a2e',
    margin: '0 0 20px 0',
    paddingBottom: '15px',
    borderBottom: '2px solid #f0f4f8',
};

const summaryRowStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '12px',
    fontSize: '0.95rem',
};

const dividerStyle = {
    height: '1.5px',
    backgroundColor: '#f0f4f8',
    margin: '15px 0',
};

const totalRowStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '20px',
};

const checkoutBtnStyle = {
    width: '100%',
    padding: '14px',
    backgroundColor: '#0f3460',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontWeight: '700',
    fontSize: '1rem',
    transition: 'background-color 0.2s',
    marginBottom: '12px',
};

const continueLinkStyle = {
    display: 'block',
    textAlign: 'center',
    color: '#64748b',
    fontSize: '0.9rem',
    textDecoration: 'none',
    fontWeight: '600',
};

const emptyStyle = {
    textAlign: 'center',
    padding: '80px 0',
    backgroundColor: 'white',
    borderRadius: '16px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
};

const shopLinkStyle = {
    display: 'inline-block',
    padding: '12px 30px',
    backgroundColor: '#0f3460',
    color: 'white',
    borderRadius: '10px',
    textDecoration: 'none',
    fontWeight: '700',
    fontSize: '0.95rem',
};

const loadingStyle = {
    textAlign: 'center',
    marginTop: '100px',
};

const spinnerStyle = {
    width: '45px',
    height: '45px',
    border: '4px solid #e2e8f0',
    borderTop: '4px solid #0f3460',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
    margin: '0 auto',
};

export default Cart;