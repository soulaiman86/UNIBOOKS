import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import ChatBot from './components/ChatBot';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import AddBook from './pages/AddBook';
import BookDetails from './pages/BookDetails';
import EditBook from './components/EditBook';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import MyOrders from './pages/MyOrders';
import MySales from './pages/seller/MySales';
import AdminDashboard from './pages/admin/AdminDashboard';
import SellerDashboard from './pages/seller/SellerDashboard';
import SubscriptionPlans from './pages/SubscriptionPlans';
import SubscriptionPayment from './pages/SubscriptionPayment';

const AdminRoute = ({ children }) => {
    const userData = JSON.parse(localStorage.getItem("user"));
    if (!userData || userData.role !== 'admin') {
        return <Navigate to="/" />;
    }
    return children;
};

function App() {
  return (
    <Router>
      <Navbar />
      <ChatBot />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/add-book" element={<AddBook />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/book/:id" element={<BookDetails />} />
        <Route path="/edit-book/:id" element={<EditBook />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/my-orders" element={<MyOrders />} />
        <Route path="/my-sales" element={<MySales />} />
        <Route
          path="/admin-dashboard"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />
        <Route path="/seller-dashboard" element={<SellerDashboard />} />
        <Route path="/subscription/plans" element={<SubscriptionPlans />} />
        <Route path="/subscription/payment" element={<SubscriptionPayment />} />
      </Routes>
    </Router>
  );
}

export default App;