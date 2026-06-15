import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Search, Trash2, Reply } from 'lucide-react';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';

const AdminContactsList = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 100;

  const fetchContacts = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/admin/contacts');
      setContacts(res.data);
    } catch (error) {
      console.error('Error fetching contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
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
          await axios.delete(`http://localhost:5000/api/admin/contacts/${id}`);
          toast.success('Contact inquiry deleted successfully!');
          fetchContacts();
        } catch (error) {
          console.error('Error deleting contact:', error);
          toast.error('Failed to delete contact inquiry');
        }
      }
    });
  };

  const filteredContacts = contacts.filter((contact) => {
    const matchesSearch = 
      (contact?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (contact?.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (contact?.subject || '').toLowerCase().includes(searchTerm.toLowerCase());
      
    let matchesDate = true;
    if (filterDate) {
      const contactDate = new Date(contact.createdAt).toISOString().split('T')[0];
      matchesDate = contactDate === filterDate;
    }
    
    return matchesSearch && matchesDate;
  });

  if (loading) return <div className="loading">Loading Contacts...</div>;

  return (
    <div className="admin-table-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
        <h2 className="section-title" style={{ margin: 0 }}>Contact Inquiries</h2>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', width: '100%', maxWidth: '550px' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
            <input
              type="text"
              placeholder="Search by name, email, or subject..."
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
              <th>ID</th>
              <th>Name</th>
              <th>Role</th>
              <th>Email</th>
              <th>Subject</th>
              <th>Message</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(filteredContacts) && filteredContacts.length > 0 ? (
              filteredContacts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((contact, index) => (
                <tr key={contact._id || index}>
                  <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                  <td>{contact?.name || 'N/A'}</td>
                  <td style={{ textTransform: 'capitalize' }}>
                    <span className={`status-badge ${contact?.userType === 'captain' ? 'active' : 'inactive'}`}>
                      {contact?.userType || 'Customer'}
                    </span>
                  </td>
                  <td>{contact?.email || 'N/A'}</td>
                  <td>{contact?.subject || 'N/A'}</td>
                  <td className="message-cell" title={contact?.message}>{contact?.message || 'N/A'}</td>
                  <td style={{ whiteSpace: 'nowrap' }}>{contact?.createdAt ? new Date(contact.createdAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }) : 'N/A'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <a href={`mailto:${contact?.email}?subject=Re: ${contact?.subject || 'Your Inquiry'}`} title="Reply" style={{ display: 'flex', alignItems: 'center' }}>
                        <Reply size={20} color="#3b82f6" style={{ cursor: 'pointer' }} />
                      </a>
                      <button onClick={() => handleDelete(contact._id)} title="Delete" style={{ background: 'none', border: 'none', padding: 0, display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                        <Trash2 size={20} color="#ef4444" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="empty-state">No contact inquiries found matching your search.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {filteredContacts.length > itemsPerPage && (
        <div className="pagination-container">
          <div className="pagination-info">
            Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredContacts.length)} of {filteredContacts.length} entries
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
              disabled={currentPage === Math.ceil(filteredContacts.length / itemsPerPage)} 
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(filteredContacts.length / itemsPerPage)))}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminContactsList;
