import { useState } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';

function SubscriptionPayment() {
    const navigate = useNavigate();
    const location = useLocation();
    const { plan, price, duration } = location.state || {};

    const userData = JSON.parse(localStorage.getItem("user"));
    const sellerId = userData?.id;

    const [paymentProof, setPaymentProof] = useState(null);
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!paymentProof) return alert("Please upload your payment proof.");

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('seller_id', sellerId);
            formData.append('plan_type', plan);
            formData.append('price', price);
            formData.append('payment_proof', paymentProof);

            await axios.post('http://localhost:5000/api/seller/subscription/request', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setSubmitted(true);
        } catch (err) {
            alert("Error submitting request. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (submitted) return (
        <div style={pageStyle}>
            <div style={successCardStyle}>
                <p style={{ fontSize: '4rem', margin: 0 }}>✅</p>
                <h2 style={{ color: '#27ae60', margin: '15px 0 10px 0' }}>Request Submitted!</h2>
                <p style={{ color: '#64748b', marginBottom: '25px' }}>
                    Your payment proof has been sent to the admin. Your subscription will be activated after verification.
                </p>
                <button
                    onClick={() => navigate('/seller-dashboard')}
                    style={backBtnStyle}
                >
                    Back to Dashboard
                </button>
            </div>
        </div>
    );

    return (
        <div style={pageStyle}>
            <div style={containerStyle}>

                {/* Order Summary */}
                <div style={summaryCardStyle}>
                    <h2 style={summaryTitleStyle}>📋 Order Summary</h2>

                    <div style={summaryRowStyle}>
                        <span style={{ color: '#64748b' }}>Plan</span>
                        <span style={{ fontWeight: '700', textTransform: 'capitalize' }}>{plan}</span>
                    </div>
                    <div style={summaryRowStyle}>
                        <span style={{ color: '#64748b' }}>Duration</span>
                        <span style={{ fontWeight: '700' }}>{duration}</span>
                    </div>
                    <div style={dividerStyle}></div>
                    <div style={summaryRowStyle}>
                        <span style={{ fontWeight: '800', fontSize: '1.1rem' }}>Total</span>
                        <span style={{ fontWeight: '800', fontSize: '1.3rem', color: '#0f3460' }}>{price} MAD</span>
                    </div>

                    {/* Payment Instructions */}
                    <div style={instructionsBoxStyle}>
                        <h3 style={{ margin: '0 0 15px 0', color: '#1a1a2e', fontSize: '1rem' }}>
                            💳 Payment Instructions
                        </h3>
                        <p style={instructionTextStyle}>
                            Please transfer <strong>{price} MAD</strong> to one of the following accounts:
                        </p>

                        <div style={paymentMethodStyle}>
                            <p style={methodTitleStyle}>🏦 Bank Transfer</p>
                            <p style={methodDetailStyle}>Bank: <strong>CIH Bank</strong></p>
                            <p style={methodDetailStyle}>Account: <strong>007 810 0000123456789</strong></p>
                            <p style={methodDetailStyle}>Name: <strong>UNIBOOKS SARL</strong></p>
                        </div>

                        <div style={paymentMethodStyle}>
                            <p style={methodTitleStyle}>📮 CCP</p>
                            <p style={methodDetailStyle}>CCP Number: <strong>1234567 Clé 89</strong></p>
                            <p style={methodDetailStyle}>Name: <strong>UNIBOOKS</strong></p>
                        </div>

                        <div style={{ ...paymentMethodStyle, backgroundColor: '#fff8e1', borderColor: '#f1c40f' }}>
                            <p style={{ ...methodTitleStyle, color: '#f39c12' }}>⚠️ Important</p>
                            <p style={methodDetailStyle}>After transferring, upload a photo of your receipt below. Your subscription will be activated within 24 hours after verification.</p>
                        </div>
                    </div>
                </div>

                {/* Upload Proof */}
                <div style={uploadCardStyle}>
                    <h2 style={summaryTitleStyle}>📤 Upload Payment Proof</h2>
                    <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '25px' }}>
                        Upload a clear photo or screenshot of your payment receipt.
                    </p>

                    <form onSubmit={handleSubmit} style={formStyle}>

                        <div style={fileBoxStyle}>
                            <span style={{ fontSize: '2.5rem' }}>🧾</span>
                            <p style={{ margin: '10px 0 5px 0', fontWeight: '600', color: '#1a1a2e' }}>
                                {paymentProof ? paymentProof.name : 'Click to upload receipt'}
                            </p>
                            <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8' }}>
                                PNG, JPG supported
                            </p>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => setPaymentProof(e.target.files[0])}
                                style={fileInputStyle}
                                required
                            />
                        </div>

                        {paymentProof && (
                            <div style={previewStyle}>
                                <img
                                    src={URL.createObjectURL(paymentProof)}
                                    alt="Payment proof preview"
                                    style={{ width: '100%', borderRadius: '10px', maxHeight: '200px', objectFit: 'cover' }}
                                />
                                <p style={{ margin: '8px 0 0 0', fontSize: '0.8rem', color: '#27ae60', fontWeight: '600' }}>
                                    ✅ {paymentProof.name}
                                </p>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading || !paymentProof}
                            style={{
                                ...submitBtnStyle,
                                backgroundColor: loading || !paymentProof ? '#94a3b8' : '#27ae60',
                                cursor: loading || !paymentProof ? 'not-allowed' : 'pointer',
                            }}
                            onMouseEnter={e => { if (!loading && paymentProof) e.target.style.backgroundColor = '#1e8449'; }}
                            onMouseLeave={e => { if (!loading && paymentProof) e.target.style.backgroundColor = '#27ae60'; }}
                        >
                            {loading ? '⏳ Submitting...' : '✅ Submit Payment Proof'}
                        </button>

                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            style={cancelBtnStyle}
                            onMouseEnter={e => e.target.style.backgroundColor = '#e2e8f0'}
                            onMouseLeave={e => e.target.style.backgroundColor = 'transparent'}
                        >
                            ← Go Back
                        </button>
                    </form>
                </div>

            </div>
        </div>
    );
}

const pageStyle = { minHeight: '100vh', backgroundColor: '#f0f4f8', padding: '40px 20px' };
const containerStyle = { maxWidth: '900px', margin: '0 auto', display: 'flex', gap: '25px', alignItems: 'flex-start', flexWrap: 'wrap' };
const summaryCardStyle = { flex: '1', backgroundColor: 'white', borderRadius: '16px', padding: '30px', boxShadow: '0 4px 20px rgba(0,0,0,0.07)', border: '1px solid #e2e8f0', minWidth: '280px' };
const uploadCardStyle = { flex: '1', backgroundColor: 'white', borderRadius: '16px', padding: '30px', boxShadow: '0 4px 20px rgba(0,0,0,0.07)', border: '1px solid #e2e8f0', minWidth: '280px' };
const summaryTitleStyle = { fontSize: '1.2rem', fontWeight: '700', color: '#1a1a2e', margin: '0 0 20px 0', paddingBottom: '12px', borderBottom: '2px solid #f0f4f8' };
const summaryRowStyle = { display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '0.95rem' };
const dividerStyle = { height: '1.5px', backgroundColor: '#f0f4f8', margin: '15px 0' };
const instructionsBoxStyle = { backgroundColor: '#f8fafc', borderRadius: '12px', padding: '20px', marginTop: '20px', border: '1px solid #e2e8f0' };
const instructionTextStyle = { color: '#374151', fontSize: '0.9rem', margin: '0 0 15px 0' };
const paymentMethodStyle = { backgroundColor: 'white', borderRadius: '10px', padding: '15px', marginBottom: '12px', border: '1px solid #e2e8f0' };
const methodTitleStyle = { margin: '0 0 8px 0', fontWeight: '700', color: '#1a1a2e', fontSize: '0.95rem' };
const methodDetailStyle = { margin: '4px 0', fontSize: '0.85rem', color: '#374151' };
const formStyle = { display: 'flex', flexDirection: 'column', gap: '15px' };
const fileBoxStyle = { position: 'relative', border: '2px dashed #e2e8f0', borderRadius: '12px', padding: '30px', textAlign: 'center', backgroundColor: '#f8fafc', cursor: 'pointer' };
const fileInputStyle = { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' };
const previewStyle = { backgroundColor: '#f8fafc', borderRadius: '12px', padding: '15px', border: '1px solid #e2e8f0' };
const submitBtnStyle = { width: '100%', padding: '14px', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '700', fontSize: '1rem', transition: 'background-color 0.2s' };
const cancelBtnStyle = { width: '100%', padding: '12px', backgroundColor: 'transparent', color: '#64748b', border: '1.5px solid #e2e8f0', borderRadius: '10px', cursor: 'pointer', fontWeight: '600', fontSize: '0.95rem', transition: 'background-color 0.2s' };
const successCardStyle = { maxWidth: '450px', margin: '100px auto', backgroundColor: 'white', borderRadius: '20px', padding: '50px 40px', textAlign: 'center', boxShadow: '0 10px 40px rgba(0,0,0,0.1)' };
const backBtnStyle = { padding: '12px 30px', backgroundColor: '#0f3460', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', fontSize: '1rem' };

export default SubscriptionPayment;