import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Search, Trash2, Activity } from 'lucide-react';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';

const AdminCaptainsList = ({ statusFilter }) => {
  const [captains, setCaptains] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 100;

  const fetchCaptains = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/admin/captains');
      setCaptains(res.data);
    } catch (error) {
      console.error('Error fetching captains:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCaptains();
  }, []);

  const handleApprove = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/admin/captains/${id}/approve`);
      toast.success('Captain approved successfully!');
      fetchCaptains();
    } catch (error) {
      console.error('Error approving captain:', error);
      toast.error('Failed to approve captain');
    }
  };

  const handleReject = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/admin/captains/${id}/reject`);
      toast.success('Captain rejected successfully!');
      fetchCaptains();
    } catch (error) {
      console.error('Error rejecting captain:', error);
      toast.error('Failed to reject captain');
    }
  };

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
          await axios.delete(`http://localhost:5000/api/admin/captains/${id}`);
          toast.success('Captain deleted successfully!');
          fetchCaptains();
        } catch (error) {
          console.error('Error deleting captain:', error);
          toast.error('Failed to delete captain');
        }
      }
    });
  };

  const handleViewStats = async (captain) => {
    try {
      Swal.fire({
        title: 'Loading Stats...',
        didOpen: () => {
          Swal.showLoading();
        }
      });
      const res = await axios.get(`http://localhost:5000/api/admin/captains/${captain._id}/stats`);
      const stats = res.data;
      
      Swal.fire({
        title: `Performance: ${captain.name}`,
        html: `
          <div style="text-align: left; margin-top: 15px; padding: 15px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px; padding-bottom: 10px; border-bottom: 1px solid #e2e8f0;">
              <strong style="color: #475569;">Total Rides:</strong>
              <span style="font-weight: bold; color: #3b82f6;">${stats.totalRides || 0}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px; padding-bottom: 10px; border-bottom: 1px solid #e2e8f0;">
              <strong style="color: #475569;">Completed Rides:</strong>
              <span style="font-weight: bold; color: #10b981;">${stats.completedRides || 0}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px; padding-bottom: 10px; border-bottom: 1px solid #e2e8f0;">
              <strong style="color: #475569;">Cancelled Rides:</strong>
              <span style="font-weight: bold; color: #ef4444;">${stats.cancelledRides || 0}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px; padding-bottom: 10px; border-bottom: 1px solid #e2e8f0;">
              <strong style="color: #475569;">Missed Requests:</strong>
              <span style="font-weight: bold; color: #f59e0b;">${stats.missedRides || 0}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px; padding-bottom: 10px; border-bottom: 1px solid #e2e8f0;">
              <strong style="color: #475569;">Total Earnings:</strong>
              <span style="font-weight: bold; color: #10b981;">₹${stats.totalEarnings || 0}</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <strong style="color: #475569;">Daily Performance:</strong>
              <span style="font-weight: bold; color: #6366f1;">${stats.dailyPerformance || 'N/A'}</span>
            </div>
          </div>
        `,
        icon: 'info',
        confirmButtonColor: '#3b82f6',
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      Swal.fire('Error', 'Could not load captain statistics', 'error');
    }
  };

  const filteredCaptains = captains.filter((captain) => {
    const matchesSearch = 
      (captain?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (captain?.phone || '').includes(searchTerm) ||
      (captain?.vehicleNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (captain?.vehicleType || '').toLowerCase().includes(searchTerm.toLowerCase());
      
    let matchesDate = true;
    if (filterDate) {
      const captainDate = new Date(captain.createdAt).toISOString().split('T')[0];
      matchesDate = captainDate === filterDate;
    }
    
    // Check approval status if provided
    const matchesStatus = statusFilter ? captain.approvalStatus === statusFilter : true;
    
    return matchesSearch && matchesDate && matchesStatus;
  });

  const getTitle = () => {
    if (statusFilter === 'pending') return 'Pending Captain Approvals';
    if (statusFilter === 'approved') return 'Approved Captains';
    if (statusFilter === 'rejected') return 'Rejected Captains';
    return 'All Registered Captains';
  };

  if (loading) return <div className="loading">Loading Captains...</div>;

  return (
    <div className="admin-table-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
        <h2 className="section-title" style={{ margin: 0 }}>{getTitle()}</h2>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', width: '100%', maxWidth: '550px' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
            <input
              type="text"
              placeholder="Search by name, phone, email, or vehicle..."
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
        <table className="admin-table" style={{ backgroundColor: '#f3f4f6', color: 'black' }}>
          <thead style={{ backgroundColor: '#2e4157', color: 'white', fontWeight: 'bold' }}>
            <tr>
              <th>S.No.</th>
              <th>Captain ID</th>
              <th>Photo</th>
              <th>Name</th>
              <th>Phone</th>
              <th>Vehicle Type</th>
              <th>Vehicle Number</th>
              <th>Online Status</th>
              <th>Approval</th>
              <th>Joined At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(filteredCaptains) && filteredCaptains.length > 0 ? (
              filteredCaptains.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((captain, index) => (
                <tr key={captain._id}>
                  <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                  <td style={{ fontWeight: 'bold', color: 'var(--primary)' }}>{captain.customId || 'N/A'}</td>
                  <td>
                    {captain.photo ? (
                      <img src={captain.photo} alt={captain.name} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--glass-border)' }} />
                    ) : (
                      <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#111', fontSize: '16px', fontWeight: 'bold' }}>
                        {captain.name ? captain.name.charAt(0).toUpperCase() : 'C'}
                      </div>
                    )}
                  </td>
                  <td>{captain.name}</td>
                  <td>{captain.phone}</td>
                  <td className="capitalize">{captain.vehicleType}</td>
                  <td>{captain.vehicleNumber}</td>
                  <td>
                    <span className={`status-badge ${captain.status === 'active' ? 'active' : 'inactive'}`}>
                      {captain.status}
                    </span>
                  </td>
                  <td>
                    <span style={{ 
                      padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold',
                      background: captain.approvalStatus === 'approved' ? '#dcfce7' : captain.approvalStatus === 'rejected' ? '#fee2e2' : '#fef9c3',
                      color: captain.approvalStatus === 'approved' ? '#166534' : captain.approvalStatus === 'rejected' ? '#991b1b' : '#854d0e'
                    }}>
                      {captain.approvalStatus?.toUpperCase() || 'PENDING'}
                    </span>
                  </td>
                  <td style={{ whiteSpace: 'nowrap' }}>{new Date(captain.createdAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      {statusFilter === 'pending' && (
                        <>
                          <button onClick={() => handleApprove(captain._id)} title="Approve" style={{ background: '#10b981', color: 'white', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>
                            Approve
                          </button>
                          <button onClick={() => handleReject(captain._id)} title="Reject" style={{ background: '#ef4444', color: 'white', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>
                            Reject
                          </button>
                        </>
                      )}
                      <button onClick={() => handleViewStats(captain)} title="View Performance" style={{ background: 'none', border: 'none', padding: 0, display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                        <Activity size={20} color="#3b82f6" />
                      </button>
                      <button onClick={() => handleDelete(captain._id)} title="Delete" style={{ background: 'none', border: 'none', padding: 0, display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                        <Trash2 size={20} color="#ef4444" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="9" className="empty-state">No captains found matching your search.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {filteredCaptains.length > itemsPerPage && (
        <div className="pagination-container">
          <div className="pagination-info">
            Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredCaptains.length)} of {filteredCaptains.length} entries
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
              disabled={currentPage === Math.ceil(filteredCaptains.length / itemsPerPage)} 
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(filteredCaptains.length / itemsPerPage)))}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCaptainsList;
