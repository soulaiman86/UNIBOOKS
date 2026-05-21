import { useEffect, useState } from 'react';
import axios from 'axios';

function AdminUsers() {
    const [users, setUsers] = useState([]);
    const [filter, setFilter] = useState('ALL');
    const [search, setSearch] = useState('');

    const fetchUsers = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/admin/users');
            setUsers(res.data);
        } catch (err) {
            console.error("Error fetching users:", err);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this user?")) return;
        try {
            await axios.delete(`http://localhost:5000/api/admin/users/${id}`);
            alert("User deleted successfully.");
            fetchUsers();
        } catch (err) {
            alert("Failed to delete user.");
        }
    };

    const filteredUsers = users
    .filter(u => {
        if (filter === 'ALL') return true;
        if (filter === 'SUBSCRIBED') return u.subscription_plan !== null && u.role === 'SELLER';
        if (filter === 'BUYER') return u.role === 'BUYER';
        if (filter === 'SELLER') return u.role === 'SELLER';
        return true;
    })
    .filter(u => u.name.toLowerCase().includes(search.toLowerCase()));

    return (
        <div>
            <h2 style={{ marginBottom: '25px', color: '#2c3e50' }}>👥 Users Management</h2>

            {/* Search Input */}
            <input
                type="text"
                placeholder="🔎 Search by name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={searchInputStyle}
                onFocus={e => e.target.style.borderColor = '#0f3460'}
                onBlur={e => e.target.style.borderColor = '#e2e8f0'}
            />

            {/* Filter Buttons */}
            <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {['ALL', 'BUYER', 'SELLER', 'SUBSCRIBED'].map(role => (
                    <button
                        key={role}
                        onClick={() => setFilter(role)}
                        style={{
                            padding: '8px 20px',
                            borderRadius: '20px',
                            border: 'none',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            backgroundColor: filter === role ? '#2c3e50' : '#ddd',
                            color: filter === role ? 'white' : '#333',
                        }}
                    >
                        {role === 'SUBSCRIBED' ? '💳 Subscribed' : role}
                        {role === 'SUBSCRIBED' && users.filter(u => u.subscription_plan !== null).length > 0 && (
                            <span style={{
                                marginLeft: '6px',
                                backgroundColor: '#27ae60',
                                color: 'white',
                                borderRadius: '50%',
                                padding: '1px 6px',
                                fontSize: '0.75rem',
                            }}>
                                {users.filter(u => u.subscription_plan !== null).length}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Results Count */}
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '15px' }}>
                Showing <strong>{filteredUsers.length}</strong> user{filteredUsers.length !== 1 ? 's' : ''}
            </p>

            {/* Table */}
            <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'white', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.08)' }}>
                <thead>
                    <tr style={{ backgroundColor: '#2c3e50', color: 'white' }}>
                        <th style={thStyle}>Name</th>
                        <th style={thStyle}>Email</th>
                        <th style={thStyle}>Role</th>
                        <th style={thStyle}>Subscription</th>
                        <th style={thStyle}>Joined</th>
                        <th style={thStyle}>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredUsers.length === 0 ? (
                        <tr>
                            <td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: '#999' }}>
                                No users found.
                            </td>
                        </tr>
                    ) : (
                        filteredUsers.map(user => (
                            <tr key={user.id} style={{ borderBottom: '1px solid #eee' }}>
                                <td style={tdStyle}>{user.name}</td>
                                <td style={tdStyle}>{user.email}</td>
                                <td style={tdStyle}>
                                    <span style={roleBadgeStyle(user.role)}>{user.role}</span>
                                </td>
                                <td style={tdStyle}>
                                    {user.subscription_plan ? (
                                        <div>
                                            <span style={subBadgeStyle(user.subscription_plan)}>
                                                💳 {user.subscription_plan}
                                            </span>
                                            <p style={{ margin: '4px 0 0 0', fontSize: '0.72rem', color: '#94a3b8' }}>
                                                Until {new Date(user.subscription_end).toLocaleDateString()}
                                            </p>
                                        </div>
                                    ) : (
                                        <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
                                            {user.role === 'SELLER' ? 'No subscription' : '—'}
                                        </span>
                                    )}
                                </td>
                                <td style={tdStyle}>{new Date(user.created_at).toLocaleDateString()}</td>
                                <td style={tdStyle}>
                                    <button
                                        onClick={() => handleDelete(user.id)}
                                        style={deleteButtonStyle}
                                        onMouseEnter={e => e.target.style.backgroundColor = '#c0392b'}
                                        onMouseLeave={e => e.target.style.backgroundColor = '#e74c3c'}
                                    >
                                        🗑️ Delete
                                    </button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}

const searchInputStyle = {
    width: '100%',
    padding: '10px 15px',
    borderRadius: '8px',
    border: '1.5px solid #e2e8f0',
    marginBottom: '15px',
    fontSize: '0.95rem',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s',
    backgroundColor: '#f8fafc',
};

const thStyle = { padding: '14px 16px', textAlign: 'left', fontWeight: 'bold' };
const tdStyle = { padding: '12px 16px' };
const deleteButtonStyle = { backgroundColor: '#e74c3c', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', transition: 'background-color 0.2s' };

const roleBadgeStyle = (role) => ({
    padding: '4px 10px',
    borderRadius: '12px',
    fontSize: '0.75rem',
    fontWeight: 'bold',
    backgroundColor: role === 'SELLER' ? '#3498db' : role === 'BUYER' ? '#27ae60' : '#95a5a6',
    color: 'white'
});

const subBadgeStyle = (plan) => ({
    padding: '4px 10px',
    borderRadius: '12px',
    fontSize: '0.75rem',
    fontWeight: '700',
    backgroundColor: plan === 'annual' ? '#27ae60' : plan === 'semi-annual' ? '#0f3460' : '#3498db',
    color: 'white',
    textTransform: 'capitalize',
    whiteSpace: 'nowrap',
});

export default AdminUsers;