import { Link } from 'react-router-dom';

const BookCard = ({ book }) => {
    const isSoldOut = book.stock === 0;
    const userData = JSON.parse(localStorage.getItem('user'));
    const currentUserId = userData?.id;
    const isOwner = currentUserId === book.seller_id;

    let displayImage = 'https://via.placeholder.com/150';
    if (book.image_urls) {
        if (Array.isArray(book.image_urls) && book.image_urls.length > 0) {
            displayImage = book.image_urls[0];
        } else if (typeof book.image_urls === 'string') {
            displayImage = book.image_urls;
        }
    }

    const cardContent = (
        <div
            style={{
                ...cardStyle,
                opacity: isSoldOut ? 0.65 : 1,
                filter: isSoldOut ? 'grayscale(0.7)' : 'none',
                cursor: isSoldOut ? 'not-allowed' : 'pointer',
            }}
            onMouseEnter={(e) => {
                if (!isSoldOut) {
                    e.currentTarget.style.transform = 'translateY(-6px)';
                    e.currentTarget.style.boxShadow = '0 12px 30px rgba(0,0,0,0.12)';
                }
            }}
            onMouseLeave={(e) => {
                if (!isSoldOut) {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.07)';
                }
            }}
        >
            {/* Book Image */}
            <div style={imageWrapperStyle}>
                <img
                    src={displayImage}
                    alt={book.title}
                    style={imageStyle}
                    onError={(e) => { e.target.src = 'https://via.placeholder.com/150'; }}
                />

                {/* Sold Out Badge */}
                {isSoldOut && (
                    <div style={soldOutBadgeStyle}>Sold Out</div>
                )}

                {/* Condition Badge */}
                {book.condition && (
                    <div style={{
                        ...conditionBadgeStyle,
                        backgroundColor: book.condition === 'New' ? '#27ae60' : '#3498db',
                    }}>
                        {book.condition === 'New' ? '✨ New' : '📖 Used'}
                    </div>
                )}
            </div>

            {/* Card Body */}
            <div style={cardBodyStyle}>
                <p style={categoryStyle}>{book.category}</p>
                <h3 style={titleStyle}>{book.title}</h3>
                <p style={sellerStyle}>by {book.seller_name || 'Unknown Seller'}</p>
                <p style={descriptionStyle}>
                    {book.description ? book.description.substring(0, 65) + '...' : 'No description available'}
                </p>

                <div style={footerStyle}>
                    <span style={priceStyle}>${Number(book.price).toFixed(2)}</span>
                    <button
                        style={{
                            ...detailsBtnStyle,
                            backgroundColor: isSoldOut ? '#94a3b8' : '#0f3460',
                            cursor: isSoldOut ? 'not-allowed' : 'pointer',
                        }}
                        disabled={isSoldOut}
                        onMouseEnter={e => { if (!isSoldOut) e.target.style.backgroundColor = '#0a2540'; }}
                        onMouseLeave={e => { if (!isSoldOut) e.target.style.backgroundColor = '#0f3460'; }}
                    >
                        {isSoldOut ? 'Out of Stock' : 'View Details'}
                    </button>
                </div>
            </div>
        </div>
    );

    // إذا نفد الكتاب لكن المستخدم هو البائع نسمح له بالدخول
if (isSoldOut && !isOwner) return cardContent;

    return (
        <Link to={`/book/${book.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block', height: '100%' }}>
            {cardContent}
        </Link>
    );
};

const cardStyle = {
    position: 'relative',
    border: '1.5px solid #e2e8f0',
    borderRadius: '16px',
    overflow: 'hidden',
    boxShadow: '0 4px 15px rgba(0,0,0,0.07)',
    backgroundColor: 'white',
    transition: 'transform 0.25s ease, box-shadow 0.25s ease',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
};

const imageWrapperStyle = {
    position: 'relative',
    width: '100%',
    height: '210px',
    overflow: 'hidden',
};

const imageStyle = {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transition: 'transform 0.3s ease',
};

const soldOutBadgeStyle = {
    position: 'absolute',
    top: '12px',
    left: '12px',
    backgroundColor: '#e74c3c',
    color: 'white',
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '0.72rem',
    fontWeight: '700',
    zIndex: 2,
    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
};

const conditionBadgeStyle = {
    position: 'absolute',
    top: '12px',
    right: '12px',
    color: 'white',
    padding: '4px 10px',
    borderRadius: '20px',
    fontSize: '0.72rem',
    fontWeight: '700',
    zIndex: 2,
    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
};

const cardBodyStyle = {
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
};

const categoryStyle = {
    color: '#0f3460',
    fontSize: '0.75rem',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    margin: '0 0 6px 0',
};

const titleStyle = {
    margin: '0 0 4px 0',
    fontSize: '1rem',
    color: '#1a1a2e',
    fontWeight: '700',
    lineHeight: '1.3',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
};

const sellerStyle = {
    margin: '0 0 8px 0',
    fontSize: '0.78rem',
    color: '#94a3b8',
    fontWeight: '500',
};

const descriptionStyle = {
    fontSize: '0.83rem',
    color: '#64748b',
    lineHeight: '1.5',
    margin: '0 0 15px 0',
    flex: 1,
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
};

const footerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 'auto',
};

const priceStyle = {
    fontWeight: '800',
    fontSize: '1.2rem',
    color: '#0f3460',
};

const detailsBtnStyle = {
    border: 'none',
    padding: '8px 16px',
    borderRadius: '8px',
    color: 'white',
    fontWeight: '700',
    fontSize: '0.82rem',
    transition: 'background-color 0.2s',
};

export default BookCard;