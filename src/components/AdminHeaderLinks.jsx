import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaPlus, FaTrash, FaSave } from 'react-icons/fa';

const AdminHeaderLinks = () => {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newLink, setNewLink] = useState({ label: '', path: '', visible: true, order: 0 });

  const apiErrorMessage = (err, fallback) => {
    return err?.response?.data?.message || err?.message || fallback;
  };

  const getAuthConfig = () => {
    const token = localStorage.getItem('adminToken');
    return {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        'Content-Type': 'application/json',
      },
    };
  };

  const ensureAuthentication = () => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      setError('Admin authentication is required. Please log in again.');
      window.location.href = '/admin-login';
      return false;
    }
    return true;
  };

  const fetchLinks = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get('http://localhost:5000/api/admin/header-links');
      setLinks(res.data);
    } catch (err) {
      console.error(err);
      setError(apiErrorMessage(err, 'Unable to load header links.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLinks();
  }, []);

  const handleSave = async (linkId) => {
    if (!ensureAuthentication()) return;
    const link = links.find((item) => item._id === linkId);
    if (!link) return;
    try {
      const payload = {
        ...link,
        path: link.path?.startsWith('/') ? link.path : `/${link.path}`,
      };
      await axios.put(`http://localhost:5000/api/admin/header-links/${linkId}`, payload, getAuthConfig());
      fetchLinks();
    } catch (err) {
      console.error(err);
      setError(apiErrorMessage(err, 'Unable to save link.'));
    }
  };

  const handleDelete = async (linkId) => {
    if (!ensureAuthentication()) return;
    const confirmDelete = window.confirm('Delete this header link?');
    if (!confirmDelete) return;
    try {
      await axios.delete(`http://localhost:5000/api/admin/header-links/${linkId}`, getAuthConfig());
      fetchLinks();
    } catch (err) {
      console.error(err);
      setError(apiErrorMessage(err, 'Unable to delete link.'));
    }
  };

  const handleAdd = async () => {
    if (!newLink.label.trim() || !newLink.path.trim()) {
      setError('Label and path are required.');
      return;
    }
    if (!ensureAuthentication()) return;
    try {
      const payload = {
        ...newLink,
        path: newLink.path.startsWith('/') ? newLink.path : `/${newLink.path}`,
      };
      await axios.post('http://localhost:5000/api/admin/header-links', payload, getAuthConfig());
      setNewLink({ label: '', path: '', visible: true, order: links.length + 1 });
      fetchLinks();
    } catch (err) {
      console.error(err);
      setError(apiErrorMessage(err, 'Unable to add link.'));
    }
  };

  const updateLinkField = (id, field, value) => {
    setLinks((prev) => prev.map((link) => (link._id === id ? { ...link, [field]: value } : link)));
  };

  if (loading) return <div className="loading">Loading header links...</div>;

  return (
    <div className="admin-table-container" style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
        <h2 className="section-title" style={{ margin: 0 }}>Header Navigation</h2>
        <div style={{ color: '#475569', fontSize: '0.95rem' }}>
          Edit header menu items and page links displayed in the site navigation.
        </div>
      </div>

      {error && (
        <div style={{ marginTop: '1rem', color: '#dc2626', fontWeight: 600 }}>{error}</div>
      )}

      <div style={{ marginTop: '1.5rem', overflowX: 'auto' }}>
        <table className="admin-table" style={{ minWidth: '760px' }}>
          <thead>
            <tr>
              <th>#</th>
              <th>Label</th>
              <th>Path</th>
              <th>Visible</th>
              <th>Order</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {links.map((link, index) => (
              <tr key={link._id}>
                <td>{index + 1}</td>
                <td>
                  <input
                    type="text"
                    value={link.label}
                    onChange={(e) => updateLinkField(link._id, 'label', e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '10px', border: '1px solid #e2e8f0' }}
                  />
                </td>
                <td>
                  <input
                    type="text"
                    value={link.path}
                    onChange={(e) => updateLinkField(link._id, 'path', e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '10px', border: '1px solid #e2e8f0' }}
                  />
                </td>
                <td>
                  <input
                    type="checkbox"
                    checked={link.visible}
                    onChange={(e) => updateLinkField(link._id, 'visible', e.target.checked)}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={link.order ?? index}
                    onChange={(e) => updateLinkField(link._id, 'order', Number(e.target.value))}
                    style={{ width: '80px', padding: '8px 10px', borderRadius: '10px', border: '1px solid #e2e8f0' }}
                  />
                </td>
                <td style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <button onClick={() => handleSave(link._id)} className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                    <FaSave size={12} /> Save
                  </button>
                  <button onClick={() => handleDelete(link._id)} className="btn btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                    <FaTrash size={12} /> Delete
                  </button>
                </td>
              </tr>
            ))}
            <tr>
              <td>{links.length + 1}</td>
              <td>
                <input
                  type="text"
                  value={newLink.label}
                  onChange={(e) => setNewLink((p) => ({ ...p, label: e.target.value }))}
                  placeholder="Label"
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '10px', border: '1px solid #e2e8f0' }}
                />
              </td>
              <td>
                <input
                  type="text"
                  value={newLink.path}
                  onChange={(e) => setNewLink((p) => ({ ...p, path: e.target.value }))}
                  placeholder="Path"
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '10px', border: '1px solid #e2e8f0' }}
                />
              </td>
              <td>
                <input
                  type="checkbox"
                  checked={newLink.visible}
                  onChange={(e) => setNewLink((p) => ({ ...p, visible: e.target.checked }))}
                />
              </td>
              <td>
                <input
                  type="number"
                  value={newLink.order}
                  onChange={(e) => setNewLink((p) => ({ ...p, order: Number(e.target.value) }))}
                  style={{ width: '80px', padding: '8px 10px', borderRadius: '10px', border: '1px solid #e2e8f0' }}
                />
              </td>
              <td>
                <button onClick={handleAdd} className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                  <FaPlus size={12} /> Add
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminHeaderLinks;
