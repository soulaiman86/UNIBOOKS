import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

function BookDetails() {
    const { id } = useParams();
    const [book, setBook] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchBookData = async () => {
            try {
                const [bookRes, reviewsRes] = await Promise.all([
                    axios.get(`http://localhost:5000/api/books/${id}`),
                    axios.get(`http://localhost:5000/api/reviews/book/${id}`)
                ]);
                setBook(bookRes.data);
                setReviews(reviewsRes.data);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching data:", error);
                setLoading(false);
            }
        };
        fetchBookData();
    }, [id]);

    const averageRating = reviews.length > 0
        ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length).toFixed(1)
        : 0;

    if (loading) return (
        <div style={loadingStyle}>
            <div style={spinnerStyle}></div>
            <p style={{ color: '#64748b', marginTop: '15px' }}>Loading book details...</p>
        </div>
    );

    if (!book) return (
        <div style={loadingStyle}>
            <p style={{ fontSize: '3rem' }}>📭</p>
            <p style={{ color: '#94a3b8' }}>Book not found!</p>
        </div>
    );

    const user = JSON.parse(localStorage.getItem('user'));
    const currentUserId = user ? user.id : null;
    const isOwner = book && currentUserId === book.seller_id;

    const handleDelete = async () => {
        if (window.confirm("Are you sure you want to delete this book?")) {
            try {
                await axios.delete(`http://localhost:5000/api/books/${id}`);
                alert("Book deleted successfully!");
                navigate('/');
            } catch (error) {
                alert("Something went wrong. Could not delete the book.");
            }
        }
    };

    const addToCart = async () => {
        const userData = localStorage.getItem('user');
        if (!userData) {
            alert("Please login to add books to your cart");
            navigate('/login');
            return;
        }
        const userObj = JSON.parse(userData);
        try {
            const resCount = await axios.get(`http://localhost:5000/api/cart/user/${userObj.id}/book/${id}`);
            const currentQtyInCart = resCount.data.quantity || 0;
            if (currentQtyInCart >= book.stock) {
                alert(`Sorry, you already have all available items (${book.stock}) in your cart.`);
                return;
            }
            const response = await axios.post('http://localhost:5000/api/cart/add', {
                user_id: userObj.id,
                book_id: id
            });
            if (response.status === 200) {
                alert("Book added to your cart! 📚");
                window.dispatchEvent(new Event('cartUpdated'));
            }
        } catch (error) {
            alert("Failed to add book to cart.");
        }
    };

    return (
        <div style={pageStyle}>
            <div style={containerStyle}>

                {/* Main Content */}
                <div style={contentWrapper}>

                    {/* Book Image */}
                    <div style={imageSection}>
                        <img
                            src={book.image_urls && book.image_urls[0].startsWith('http') ? book.image_urls[0] : `http://localhost:5000${book.image_urls[0]}`}
                            alt={book.title}
                            style={imageStyle}
                        />
                    </div>

                    {/* Book Info */}
                    <div style={infoSection}>

                        {/* Category & Condition */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                            <span style={categoryTagStyle}>{book.category}</span>
                            <span style={{
                                padding: '5px 14px',
                                borderRadius: '20px',
                                fontSize: '0.8rem',
                                fontWeight: '700',
                                backgroundColor: book.condition === 'New' ? '#f0fdf4' : '#eff6ff',
                                color: book.condition === 'New' ? '#27ae60' : '#2980b9',
                                border: `1.5px solid ${book.condition === 'New' ? '#27ae60' : '#2980b9'}`
                            }}>
                                {book.condition === 'New' ? '✨ New' : '📖 Used'}
                            </span>
                        </div>

                        {/* Title */}
                        <h1 style={titleStyle}>{book.title}</h1>

                        {/* Rating */}
                        <div style={ratingRowStyle}>
                            <span style={{ color: '#f1c40f', fontSize: '1.2rem' }}>
                                {'★'.repeat(Math.floor(averageRating))}{'☆'.repeat(5 - Math.floor(averageRating))}
                            </span>
                            <span style={{ fontWeight: '700', color: '#1a1a2e' }}>{averageRating} / 5</span>
                            <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>({reviews.length} reviews)</span>
                        </div>

                        {/* Seller Card */}
                        <div style={sellerCardStyle}>
                            <img
                                src={book.seller_image ? `http://localhost:5000${book.seller_image}` : 'https://cdn-icons-png.flaticon.com/512/149/149071.png'}
                                alt="Seller"
                                style={sellerAvatarStyle}
                            />
                            <div>
                                <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8' }}>Sold by</p>
                                <strong style={{ fontSize: '1rem', color: '#1a1a2e' }}>{book.seller_name}</strong>
                                <div style={{ fontSize: '0.8rem', color: '#f1c40f', marginTop: '2px' }}>
                                    {'★'.repeat(Math.round(book.seller_avg_rating || 0))}
                                    <span style={{ color: '#94a3b8', marginLeft: '5px' }}>
                                        ({book.seller_review_count || 0} ratings)
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <p style={descriptionStyle}>{book.description}</p>

                        {/* Price */}
                        <div style={priceRowStyle}>
                            <h2 style={priceStyle}>${book.price}</h2>
                            <span style={{
                                padding: '6px 14px',
                                borderRadius: '20px',
                                fontSize: '0.85rem',
                                fontWeight: '700',
                                backgroundColor: book.stock > 0 ? '#f0fdf4' : '#fef2f2',
                                color: book.stock > 0 ? '#27ae60' : '#e74c3c',
                                border: `1.5px solid ${book.stock > 0 ? '#27ae60' : '#e74c3c'}`
                            }}>
                                {book.stock > 0 ? `✅ ${book.stock} in stock` : '❌ Out of Stock'}
                            </span>
                        </div>

                        {/* Action Buttons */}
                        {isOwner ? (
                            <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                                <button
                                    onClick={() => navigate(`/edit-book/${id}`)}
                                    style={{ ...actionBtnStyle, backgroundColor: '#f39c12' }}
                                    onMouseEnter={e => e.target.style.opacity = '0.9'}
                                    onMouseLeave={e => e.target.style.opacity = '1'}
                                >
                                    ✏️ Edit Book
                                </button>
                                <button
                                    onClick={handleDelete}
                                    style={{ ...actionBtnStyle, backgroundColor: '#e74c3c' }}
                                    onMouseEnter={e => e.target.style.opacity = '0.9'}
                                    onMouseLeave={e => e.target.style.opacity = '1'}
                                >
                                    🗑️ Delete Book
                                </button>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '20px' }}>
                                <button
                                    onClick={addToCart}
                                    disabled={book.stock <= 0}
                                    style={{
                                        ...actionBtnStyle,
                                        backgroundColor: book.stock <= 0 ? '#94a3b8' : '#0f3460',
                                        cursor: book.stock <= 0 ? 'not-allowed' : 'pointer'
                                    }}
                                    onMouseEnter={e => { if (book.stock > 0) e.target.style.backgroundColor = '#0a2540'; }}
                                    onMouseLeave={e => { if (book.stock > 0) e.target.style.backgroundColor = '#0f3460'; }}
                                >
                                    {book.stock > 0 ? '🛒 Add to Cart' : 'Not Available'}
                                </button>
                                <button 
                                    onClick={() => {
                                    const userData = localStorage.getItem('user');
                                    if (!userData) {
                                        alert("Please login to purchase this book.");
                                        navigate('/login');
                                        return;
                                    }
                                    navigate('/checkout', { state: { directBook: book } });
                                 }}
                                  disabled={book.stock <= 0}
                                   style={{
        ...actionBtnStyle,
        backgroundColor: book.stock <= 0 ? '#94a3b8' : '#27ae60',
        cursor: book.stock <= 0 ? 'not-allowed' : 'pointer'
    }}
    onMouseEnter={e => { if (book.stock > 0) e.target.style.backgroundColor = '#1e8449'; }}
    onMouseLeave={e => { if (book.stock > 0) e.target.style.backgroundColor = '#27ae60'; }}
                                >
                                  ⚡ Buy It Now
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Reviews Section */}
                <div style={reviewsSectionStyle}>
                    <h2 style={reviewsTitleStyle}>Customer Reviews</h2>
                    {reviews.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '40px 0' }}>
                            <p style={{ fontSize: '2.5rem', margin: 0 }}>💬</p>
                            <p style={{ color: '#94a3b8', marginTop: '10px' }}>No reviews yet. Be the first to review!</p>
                        </div>
                    ) : (
                        <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            {reviews.map((review) => (
                                <div key={review.id} style={reviewCardStyle}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                        <strong style={{ color: '#1a1a2e' }}>👤 {review.buyer_name}</strong>
                                        <span style={{ color: '#f1c40f', fontSize: '1rem' }}>{'★'.repeat(review.rating)}</span>
                                    </div>
                                    <p style={{ margin: '5px 0', color: '#374151', lineHeight: '1.6' }}>{review.comment}</p>
                                    <small style={{ color: '#94a3b8', fontSize: '0.78rem' }}>{new Date(review.created_at).toLocaleDateString()}</small>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}

const pageStyle = {
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
  padding: '40px 20px',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'flex-start',
};

const containerStyle = {
    maxWidth: '1050px',
    margin: '0 auto',
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

const contentWrapper = {
    display: 'flex',
    gap: '40px',
    flexWrap: 'wrap',
    backgroundColor: 'white',
    borderRadius: '20px',
    padding: '35px',
    boxShadow: '0 4px 24px rgba(0,0,0,0.07)',
    marginBottom: '30px',
};

const imageSection = {
    flex: '1',
    minWidth: '280px',
};

const imageStyle = {
    width: '100%',
    borderRadius: '15px',
    boxShadow: '0 8px 25px rgba(0,0,0,0.12)',
    objectFit: 'cover',
};

const infoSection = {
    flex: '1.3',
    minWidth: '280px',
};

const categoryTagStyle = {
    color: '#0f3460',
    fontWeight: '700',
    textTransform: 'uppercase',
    fontSize: '0.85rem',
    backgroundColor: '#f0f4ff',
    padding: '4px 12px',
    borderRadius: '20px',
};

const titleStyle = {
    fontSize: '2.2rem',
    margin: '10px 0 15px 0',
    color: '#1a1a2e',
    fontWeight: '800',
    lineHeight: '1.2',
};

const ratingRowStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '20px',
};

const sellerCardStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    backgroundColor: '#f8fafc',
    borderRadius: '12px',
    marginBottom: '20px',
    border: '1px solid #e2e8f0',
};

const sellerAvatarStyle = {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    objectFit: 'cover',
    border: '2px solid #e2e8f0',
};

const descriptionStyle = {
    lineHeight: '1.7',
    color: '#374151',
    marginBottom: '20px',
    fontSize: '0.95rem',
};

const priceRowStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    marginBottom: '10px',
};

const priceStyle = {
    fontSize: '2.2rem',
    color: '#0f3460',
    margin: 0,
    fontWeight: '800',
};

const actionBtnStyle = {
    color: 'white',
    border: 'none',
    padding: '14px',
    fontSize: '1rem',
    borderRadius: '10px',
    cursor: 'pointer',
    width: '100%',
    fontWeight: '700',
    transition: 'all 0.2s',
};

const reviewsSectionStyle = {
    backgroundColor: 'white',
    borderRadius: '20px',
    padding: '30px 35px',
    boxShadow: '0 4px 24px rgba(0,0,0,0.07)',
};

const reviewsTitleStyle = {
    fontSize: '1.4rem',
    fontWeight: '700',
    color: '#1a1a2e',
    borderBottom: '2px solid #f0f4f8',
    paddingBottom: '15px',
    margin: '0 0 10px 0',
};

const reviewCardStyle = {
    padding: '18px',
    backgroundColor: '#f8fafc',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
};

export default BookDetails;