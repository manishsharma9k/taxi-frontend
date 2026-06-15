import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Search, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';

const AdminUsersList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 100;

  const fetchUsers = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/admin/users');
      setUsers(res.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (id) => {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, cancel'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`http://localhost:5000/api/admin/users/${id}`);
          toast.success('User deleted successfully!');
          fetchUsers();
        } catch (error) {
          console.error('Error deleting user:', error);
          toast.error('Failed to delete user');
        }
      }
    });
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch = 
      (user?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user?.phone || '').includes(searchTerm) ||
      (user?.email || '').toLowerCase().includes(searchTerm.toLowerCase());
      
    let matchesDate = true;
    if (filterDate) {
      const userDate = new Date(user.createdAt).toISOString().split('T')[0];
      matchesDate = userDate === filterDate;
    }
    
    return matchesSearch && matchesDate;
  });

  if (loading) return <div className="loading">Loading Users...</div>;

  return (
    <div className="admin-table-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
        <h2 className="section-title" style={{ margin: 0 }}>Registered Users</h2>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', width: '100%', maxWidth: '550px' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              style={{ width: '100%', padding: '10px 10px 10px 40px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '14px' }}
            />
          </div>
          
          <div style={{ position: 'relative', width: '160px' }}>
            <input
              type="date"
              value={filterDate}
              onChange={(e) => { setFilterDate(e.target.value); setCurrentPage(1); }}
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '14px', color: filterDate ? '#334155' : '#9ca3af' }}
            />
          </div>
        </div>
      </div>
      <div className="table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>S.No.</th>
              <th>User ID</th>
              <th>Name</th>
              <th>Phone</th>
              <th>Email</th>
              <th>Joined At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(filteredUsers) && filteredUsers.length > 0 ? (
              filteredUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((user, index) => (
                <tr key={user._id}>
                  <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                  <td style={{ fontWeight: 'bold', color: 'var(--primary)' }}>{user.customId || 'N/A'}</td>
                  <td>{user.name}</td>
                  <td>{user.phone}</td>
                  <td>{user.email || 'N/A'}</td>
                  <td style={{ whiteSpace: 'nowrap' }}>{new Date(user.createdAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })}</td>
                  <td>
                    <button onClick={() => handleDelete(user._id)} title="Delete" style={{ background: 'none', border: 'none', padding: 0, display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                      <Trash2 size={20} color="#ef4444" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="empty-state">No users found matching your search.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {filteredUsers.length > itemsPerPage && (
        <div className="pagination-container">
          <div className="pagination-info">
            Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredUsers.length)} of {filteredUsers.length} entries
          </div>
          <div className="pagination-controls">
            <button 
              className="pagination-btn" 
              disabled={currentPage === 1} 
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            >
              Previous
            </button>
            <button 
              className="pagination-btn" 
              disabled={currentPage === Math.ceil(filteredUsers.length / itemsPerPage)} 
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(filteredUsers.length / itemsPerPage)))}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsersList;
