import { Link } from 'react-router-dom'; // أضفنا هذا الاستيراد

const BookCard = ({ book }) => {
  let displayImage = 'https://via.placeholder.com/150';

  if (book.image_urls) {
    if (Array.isArray(book.image_urls) && book.image_urls.length > 0) {
      displayImage = book.image_urls[0];
    } else if (typeof book.image_urls === 'string') {
      displayImage = book.image_urls;
    }
  }

  return (
    // أضفنا الرابط هنا ليغلف الكارت بالكامل
    <Link to={`/book/${book.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
      <div style={cardStyle} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'} 
           onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
        
        <img 
          src={displayImage} 
          alt={book.title} 
          style={imageStyle} 
          onError={(e) => { e.target.src = 'https://via.placeholder.com/150'; }} 
        />
        <div style={{ padding: '15px' }}>
          <h3 style={titleStyle}>{book.title}</h3>
          <p style={categoryStyle}>{book.category}</p>
          <p style={descriptionStyle}>
            {book.description ? book.description.substring(0, 60) + '...' : 'No description available'}
          </p>
          <div style={footerStyle}>
            <span style={priceStyle}>${book.price}</span>
            {/* الزر الآن أصبح شكلياً لأن الكارت بالكامل أصبح رابطاً */}
            <button style={buttonStyle}>Details</button>
          </div>
        </div>
      </div>
    </Link>
  );
};

// التنسيقات (أضفت لها تأثير الـ transition فقط)
const cardStyle = {
  border: '1px solid #eee',
  borderRadius: '12px',
  overflow: 'hidden',
  boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
  backgroundColor: '#fff',
  transition: 'transform 0.3s ease', // حركة ناعمة عند التمرير
  cursor: 'pointer'
};

const imageStyle = { width: '100%', height: '200px', objectFit: 'cover' };
const titleStyle = { margin: '10px 0 5px', fontSize: '1.1rem' };
const categoryStyle = { color: '#888', fontSize: '0.85rem', marginBottom: '10px' };
const descriptionStyle = { fontSize: '0.9rem', color: '#555', height: '40px' };
const footerStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '15px' };
const priceStyle = { fontWeight: 'bold', fontSize: '1.2rem', color: '#2c3e50' };
const buttonStyle = { backgroundColor: '#3498db', color: '#fff', border: 'none', padding: '8px 15px', borderRadius: '5px', cursor: 'pointer' };

export default BookCard;