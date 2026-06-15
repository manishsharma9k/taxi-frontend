import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaPlus, FaTrash, FaSave } from 'react-icons/fa';

const API_BASE = 'http://localhost:5000/api/admin';

const AdminPageContentManager = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newItem, setNewItem] = useState({ path: '/about', title: '', content: '', visible: true, order: 0 });

  const adminToken = localStorage.getItem('adminToken');
  const authConfig = {
    headers: {
      Authorization: `Bearer ${adminToken}`,
      'Content-Type': 'application/json',
    },
  };

  const fetchItems = async () => {
    if (!adminToken) {
      setError('Admin token missing. Please log in again.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await axios.get(`${API_BASE}/page-contents`, authConfig);
      setItems(res.data);
    } catch (err) {
      console.error(err);
      const message = err.response?.data?.message || err.message || 'Unable to load page content records.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const updateItemField = (id, field, value) => {
    setItems((prev) => prev.map((item) => (item._id === id ? { ...item, [field]: value } : item)));
  };

  const handleSave = async (id) => {
    if (!adminToken) {
      setError('Admin token missing. Please log in again.');
      return;
    }
    const item = items.find((record) => record._id === id);
    if (!item) return;
    try {
      await axios.put(`${API_BASE}/page-contents/${id}`, item, authConfig);
      await fetchItems();
      setError('');
    } catch (err) {
      console.error(err);
      const message = err.response?.data?.message || err.message || 'Unable to save page content.';
      setError(message);
    }
  };

  const handleDelete = async (id) => {
    if (!adminToken) {
      setError('Admin token missing. Please log in again.');
      return;
    }
    if (!window.confirm('Delete this page content entry?')) return;
    try {
      await axios.delete(`${API_BASE}/page-contents/${id}`, authConfig);
      await fetchItems();
    } catch (err) {
      console.error(err);
      const message = err.response?.data?.message || err.message || 'Unable to delete page content.';
      setError(message);
    }
  };

  const handleAdd = async () => {
    if (!adminToken) {
      setError('Admin token missing. Please log in again.');
      return;
    }
    if (!newItem.path.trim() || !newItem.title.trim()) {
      setError('Path and title are required for page content.');
      return;
    }
    try {
      await axios.post(`${API_BASE}/page-contents`, newItem, authConfig);
      setNewItem({ path: '/about', title: '', content: '', visible: true, order: items.length });
      await fetchItems();
      setError('');
    } catch (err) {
      console.error(err);
      const message = err.response?.data?.message || err.message || 'Unable to add page content.';
      setError(message);
    }
  };

  if (loading) return <div className="loading">Loading page content manager...</div>;

  return (
    <div className="admin-table-container" style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
        <h2 className="section-title" style={{ margin: 0 }}>Page Content Manager</h2>
        <div style={{ color: '#475569', fontSize: '0.95rem' }}>
          Add or update the content for header-linked pages dynamically from the admin dashboard.
        </div>
      </div>

      {error && <div style={{ marginTop: '1rem', color: '#dc2626', fontWeight: 600 }}>{error}</div>}

      <div style={{ marginTop: '1.5rem', overflowX: 'auto' }}>
        <table className="admin-table" style={{ minWidth: '920px' }}>
          <thead>
            <tr>
              <th>#</th>
              <th>Path</th>
              <th>Title</th>
              <th>Content</th>
              <th>Visible</th>
              <th>Order</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={item._id}>
                <td>{index + 1}</td>
                <td>
                  <input
                    type="text"
                    value={item.path}
                    onChange={(e) => updateItemField(item._id, 'path', e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '10px', border: '1px solid #e2e8f0' }}
                  />
                </td>
                <td>
                  <input
                    type="text"
                    value={item.title}
                    onChange={(e) => updateItemField(item._id, 'title', e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '10px', border: '1px solid #e2e8f0' }}
                  />
                </td>
                <td>
                  <textarea
                    value={item.content}
                    onChange={(e) => updateItemField(item._id, 'content', e.target.value)}
                    style={{ width: '100%', minHeight: '120px', padding: '8px 10px', borderRadius: '10px', border: '1px solid #e2e8f0', resize: 'vertical' }}
                  />
                </td>
                <td style={{ textAlign: 'center' }}>
                  <input
                    type="checkbox"
                    checked={item.visible}
                    onChange={(e) => updateItemField(item._id, 'visible', e.target.checked)}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={item.order ?? index}
                    onChange={(e) => updateItemField(item._id, 'order', Number(e.target.value))}
                    style={{ width: '80px', padding: '8px 10px', borderRadius: '10px', border: '1px solid #e2e8f0' }}
                  />
                </td>
                <td style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <button onClick={() => handleSave(item._id)} className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                    <FaSave size={12} /> Save
                  </button>
                  <button onClick={() => handleDelete(item._id)} className="btn btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                    <FaTrash size={12} /> Delete
                  </button>
                </td>
              </tr>
            ))}
            <tr>
              <td>{items.length + 1}</td>
              <td>
                <input
                  type="text"
                  value={newItem.path}
                  onChange={(e) => setNewItem((prev) => ({ ...prev, path: e.target.value }))}
                  placeholder="/about"
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '10px', border: '1px solid #e2e8f0' }}
                />
              </td>
              <td>
                <input
                  type="text"
                  value={newItem.title}
                  onChange={(e) => setNewItem((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="Page Title"
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '10px', border: '1px solid #e2e8f0' }}
                />
              </td>
              <td>
                <textarea
                  value={newItem.content}
                  onChange={(e) => setNewItem((prev) => ({ ...prev, content: e.target.value }))}
                  placeholder="Page content can include HTML markup"
                  style={{ width: '100%', minHeight: '120px', padding: '8px 10px', borderRadius: '10px', border: '1px solid #e2e8f0', resize: 'vertical' }}
                />
              </td>
              <td style={{ textAlign: 'center' }}>
                <input
                  type="checkbox"
                  checked={newItem.visible}
                  onChange={(e) => setNewItem((prev) => ({ ...prev, visible: e.target.checked }))}
                />
              </td>
              <td>
                <input
                  type="number"
                  value={newItem.order}
                  onChange={(e) => setNewItem((prev) => ({ ...prev, order: Number(e.target.value) }))}
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

export default AdminPageContentManager;
