import { Link, useNavigate } from 'react-router-dom';

function Navbar() {
  const navigate = useNavigate();
  
  // 1. جلب بيانات المستخدم والتوكن من التخزين المحلي
  const token = localStorage.getItem('token');
  const userData = localStorage.getItem('user');
  const user = userData ? JSON.parse(userData) : null;

  // 2. دالة تسجيل الخروج
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <nav style={navStyle}>
      <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
        <Link to="/" style={{ color: 'white', textDecoration: 'none' }}>UNIBOOKS 📚</Link>
      </div>

      <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
        <Link to="/" style={linkStyle}>Home</Link>

        {/* 3. شرط إظهار "إضافة كتاب" فقط للبائع */}
        {user && user.role === 'SELLER' && (
          <Link to="/add-book" style={linkStyle}>Add Book</Link>
        )}

        {/* 4. تبديل القائمة بناءً على حالة تسجيل الدخول */}
        {token ? (
          <>
            <span style={{ fontSize: '0.9rem', color: '#ecf0f1' }}>Welcome {user?.name} !</span>
            <button onClick={handleLogout} style={logoutButtonStyle}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" style={linkStyle}>Login</Link>
            <Link to="/register" style={registerButtonStyle}>Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}

// التنسيقات
const navStyle = { display: 'flex', justifyContent: 'space-between', padding: '1rem 2rem', backgroundColor: '#2c3e50', color: 'white', alignItems: 'center', fontFamily: 'Arial, sans-serif' };
const linkStyle = { color: 'white', textDecoration: 'none' };
const registerButtonStyle = { backgroundColor: '#27ae60', padding: '5px 15px', borderRadius: '5px', color: 'white', textDecoration: 'none' };
const logoutButtonStyle = { backgroundColor: '#e74c3c', color: 'white', border: 'none', padding: '5px 12px', borderRadius: '5px', cursor: 'pointer' };

export default Navbar;