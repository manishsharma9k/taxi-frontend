import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Search, Trash2, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';

const AdminRidesList = ({ category, statusFilter }) => {
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [areaFilter, setAreaFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 100;

  const fetchRides = async () => {
    try {
      const params = new URLSearchParams();
      if (category) params.append('vehicleType', category);
      if (statusFilter) params.append('status', statusFilter);
      if (areaFilter.trim()) params.append('area', areaFilter.trim());
      if (filterDate) params.append('startDate', filterDate);
      if (filterDate) params.append('endDate', filterDate);
      const res = await axios.get(`http://localhost:5000/api/admin/rides?${params.toString()}`);
      setRides(res.data);
    } catch (error) {
      console.error('Error fetching rides:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRides(); }, [category, statusFilter, areaFilter, filterDate]);

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
          await axios.delete(`http://localhost:5000/api/admin/rides/${id}`);
          toast.success('Ride deleted successfully!');
          fetchRides();
        } catch (error) {
          console.error('Error deleting ride:', error);
          toast.error('Failed to delete ride');
        }
      }
    });
  };

  const handleReply = async (userPhone, captainPhone) => {
    const { value: message } = await Swal.fire({
      title: 'Send Message / Reply',
      input: 'textarea',
      inputLabel: 'Message content',
      inputPlaceholder: 'Type your message here...',
      inputAttributes: {
        'aria-label': 'Type your message here'
      },
      showCancelButton: true,
      confirmButtonColor: 'var(--primary)',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Send Message'
    });

    if (message) {
      Swal.fire({
        title: 'Sending...',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      setTimeout(() => {
        Swal.fire({
          title: 'Success!',
          text: `Message sent successfully to User and Captain!`,
          icon: 'success',
          confirmButtonColor: 'var(--primary)'
        });
      }, 1000);
    }
  };

  // Apply only text search (backend handles rest)
  const filteredRides = rides.filter((ride) => {
    if (!searchTerm) return true;
    return (
      (ride?.pickup || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (ride?.dropoff || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (ride?.user?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (ride?.captain?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const getTitle = () => {
    if (statusFilter === 'completed') return 'Completed Rides';
    if (statusFilter === 'cancelled') return 'Cancelled Rides';
    switch (category) {
      case 'bike': return 'TaxiNova Bike Rides';
      case 'auto': return 'TaxiNova Auto Rides';
      case 'cab': return 'TaxiNova Cab Rides';
      default: return 'All Booked Rides';
    }
  };

  if (loading) return <div className="loading">Loading Rides...</div>;

  return (
    <div className="admin-table-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
        <h2 className="section-title" style={{ margin: 0 }}>{getTitle()}</h2>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', width: '100%', maxWidth: '700px' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '180px' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
            <input
              type="text"
              placeholder="Search user, captain..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              style={{ width: '100%', padding: '10px 10px 10px 40px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '14px' }}
            />
          </div>
          <div style={{ position: 'relative', minWidth: '160px' }}>
            <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
            <input
              type="text"
              placeholder="Filter by area..."
              value={areaFilter}
              onChange={(e) => { setAreaFilter(e.target.value); setCurrentPage(1); }}
              style={{ width: '100%', padding: '10px 10px 10px 34px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '14px' }}
            />
          </div>
          <div style={{ position: 'relative', width: '150px' }}>
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
              <th>User</th>
              <th>Captain</th>
              <th>Type</th>
              <th>Date</th>
              <th>Pickup</th>
              <th>Dropoff</th>
              <th>Fare</th>
              <th>Commission</th>
              <th>Status</th>
              {statusFilter === 'cancelled' && <th>Reason</th>}
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(filteredRides) && filteredRides.length > 0 ? (
              filteredRides.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((ride, index) => (
                <tr key={ride._id}>
                  <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                  <td>{ride.user ? ride.user.name : 'N/A'}</td>
                  <td>{ride.captain ? ride.captain.name : 'Unassigned'}</td>
                  <td style={{ textTransform: 'capitalize' }}>{ride.vehicleType}</td>
                  <td style={{ whiteSpace: 'nowrap', fontSize: '13px' }}>{new Date(ride.createdAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })}</td>
                  <td style={{ maxWidth: '150px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={ride.pickup}>{ride.pickup}</td>
                  <td style={{ maxWidth: '150px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={ride.dropoff}>{ride.dropoff}</td>
                  <td>₹{ride.fare}</td>
                  <td style={{ color: ride.commission > 0 ? '#10b981' : '#94a3b8', fontWeight: '600', fontSize: '13px' }}>
                    {ride.commission > 0 ? `₹${ride.commission}` : '—'}
                  </td>
                  <td>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      background: ride.status === 'completed' ? '#dcfce7' : ride.status === 'accepted' ? '#fef9c3' : ride.status === 'cancelled' ? '#fee2e2' : '#f3f4f6',
                      color: ride.status === 'completed' ? '#166534' : ride.status === 'accepted' ? '#854d0e' : ride.status === 'cancelled' ? '#991b1b' : '#374151'
                    }}>
                      {ride.status.toUpperCase()}
                    </span>
                  </td>
                  {statusFilter === 'cancelled' && (
                    <td style={{ color: '#ef4444', fontStyle: 'italic', maxWidth: '150px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={ride.cancelReason}>
                      {ride.cancelReason || 'No reason provided'}
                    </td>
                  )}
                  <td>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <button onClick={() => handleReply(ride.user?.phone, ride.captain?.phone)} title="Reply / Send Message" style={{ background: 'none', border: 'none', padding: 0, display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                        <MessageSquare size={20} color="#3b82f6" />
                      </button>
                      <button onClick={() => handleDelete(ride._id)} title="Delete Ride" style={{ background: 'none', border: 'none', padding: 0, display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                        <Trash2 size={20} color="#ef4444" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={statusFilter === 'cancelled' ? 12 : 11} className="empty-state">No rides found matching your search.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {filteredRides.length > itemsPerPage && (
        <div className="pagination-container">
          <div className="pagination-info">
            Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredRides.length)} of {filteredRides.length} entries
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
              disabled={currentPage === Math.ceil(filteredRides.length / itemsPerPage)}
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(filteredRides.length / itemsPerPage)))}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminRidesList;
