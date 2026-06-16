import React, { useEffect, useState, useRef, useContext, useCallback } from 'react';
import { AuthContext } from '../context/AuthContext';
import { io } from 'socket.io-client';
import { Trash2, X, CheckCheck } from 'lucide-react';
import { API_URL } from '../api.js';

const socket = io(API_URL);

const Tick = ({ read, sender }) => {
  if (sender !== 'captain') return null;
  return (
    <span style={{ marginLeft: '4px', fontSize: '0.7rem' }}>
      {read
        ? <span style={{ color: '#3b82f6', fontWeight: '700', letterSpacing: '-2px' }}>✓✓</span>
        : <span style={{ color: 'rgba(0,0,0,0.4)', fontWeight: '700' }}>✓</span>}
    </span>
  );
};

const DROPDOWN_ITEMS = (onCopy, onReply, onSelect, onDelete) => [
  { icon: '📋', label: 'Copy',           action: onCopy },
  { icon: '↩️', label: 'Reply',          action: onReply },
  { icon: '☑️', label: 'Select Message', action: onSelect },
  { icon: '🗑️', label: 'Delete Message', action: onDelete, danger: true },
];

const CaptainChat = () => {
  const { user, token } = useContext(AuthContext);
  const [messages, setMessages]     = useState([]);
  const [input, setInput]           = useState('');
  const [loading, setLoading]       = useState(true);
  const [selectedMsgs, setSelectedMsgs] = useState(new Set());
  const [dropdown, setDropdown]     = useState(null); // { x, y, msgId, text }
  const messagesEndRef  = useRef(null);
  const longPressTimer  = useRef(null);
  const captainId = user?.id;

  useEffect(() => {
    if (captainId) socket.emit('identify', { role: 'captain', id: captainId });
  }, [captainId]);

  const fetchMessages = useCallback(async () => {
    if (!captainId) return;
    try {
      const res  = await fetch(`${API_URL}/api/chat/${captainId}?role=captain`);
      const data = await res.json();
      setMessages(Array.isArray(data) ? data : []);
    } finally { setLoading(false); }
  }, [captainId]);

  useEffect(() => { fetchMessages(); }, [fetchMessages]);

  useEffect(() => {
    const onMsg = (msg) => {
      if (msg.captainId !== captainId) return;
      setMessages(prev => {
        if (msg.sender === 'admin')
          return [...prev.map(m => m.sender === 'captain' ? { ...m, read: true } : m), msg];
        return [...prev, msg];
      });
      if (msg._id && msg.sender === 'admin')
        fetch(`${API_URL}/api/chat/read/${msg._id}`, { method: 'PATCH' }).catch(() => {});
    };
    const onDeleted = ({ messageId, role }) => {
      if (role === 'captain') setMessages(prev => prev.filter(m => m._id !== messageId));
    };
    const onCleared = ({ captainId: cId, role }) => {
      if (role === 'captain' && cId === captainId) setMessages([]);
    };
    socket.on('chat:message',        onMsg);
    socket.on('chat:messageDeleted', onDeleted);
    socket.on('chat:cleared',        onCleared);
    return () => {
      socket.off('chat:message',        onMsg);
      socket.off('chat:messageDeleted', onDeleted);
      socket.off('chat:cleared',        onCleared);
    };
  }, [captainId]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  // Close dropdown on outside click
  useEffect(() => {
    const close = (e) => { if (!e.target.closest('[data-dd]')) setDropdown(null); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const sendMessage = async () => {
    if (!input.trim() || !captainId) return;
    const text = input.trim(); setInput('');
    try {
      await fetch(`${API_URL}/api/chat/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ captainId, sender: 'captain', text }),
      });
    } catch {}
  };

  const handleKey = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } };

  const toggleSelect = (msgId) => {
    setSelectedMsgs(prev => { const s = new Set(prev); s.has(msgId) ? s.delete(msgId) : s.add(msgId); return s; });
  };

  // Click on bubble → open dropdown anchored below bubble
  const handleBubbleClick = (e, msg) => {
    e.stopPropagation();
    if (selectedMsgs.size > 0) { toggleSelect(msg._id); return; }
    const rect = e.currentTarget.getBoundingClientRect();
    const x = msg.sender === 'captain' ? rect.right - 192 : rect.left;
    const y = rect.bottom + 6;
    setDropdown(prev => prev?.msgId === msg._id ? null : { x, y, msgId: msg._id, text: msg.text });
  };

  // Right-click also opens dropdown
  const handleRightClick = (e, msg) => {
    e.preventDefault();
    setDropdown({ x: e.clientX, y: e.clientY, msgId: msg._id, text: msg.text });
  };

  // Long press (mobile)
  const handleTouchStart = (msg) => {
    longPressTimer.current = setTimeout(() => {
      setDropdown({ x: 60, y: 280, msgId: msg._id, text: msg.text });
    }, 500);
  };
  const handleTouchEnd = () => clearTimeout(longPressTimer.current);

  const deleteSingleMessage = async (msgId) => {
    setDropdown(null);
    await fetch(`${API_URL}/api/chat/message/${msgId}`, {
      method: 'DELETE', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: 'captain' }),
    });
    setMessages(prev => prev.filter(m => m._id !== msgId));
  };

  const deleteSelectedMessages = async () => {
    for (const msgId of selectedMsgs) {
      await fetch(`${API_URL}/api/chat/message/${msgId}`, {
        method: 'DELETE', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: 'captain' }),
      });
    }
    setMessages(prev => prev.filter(m => !selectedMsgs.has(m._id)));
    setSelectedMsgs(new Set());
  };

  const deleteChat = async () => {
    if (!window.confirm('Delete entire chat with admin? This cannot be undone for your side.')) return;
    await fetch(`${API_URL}/api/chat/chat/${captainId}`, {
      method: 'DELETE', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: 'captain' }),
    });
    setMessages([]); setSelectedMsgs(new Set());
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 160px)', background: '#141414', borderRadius: '16px', border: '1px solid #1E1E1E', overflow: 'hidden' }}>

      {/* Header */}
      <div style={{ padding: '0.75rem 1.5rem', borderBottom: '1px solid #1E1E1E', background: '#111', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {selectedMsgs.size > 0 ? (
          <>
            <button onClick={() => setSelectedMsgs(new Set())} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888', display: 'flex', alignItems: 'center' }}><X size={18} /></button>
            <span style={{ fontWeight: '700', fontSize: '0.9rem', color: '#fff' }}>{selectedMsgs.size} selected</span>
            <button onClick={deleteSelectedMessages} style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.4rem', background: '#2A0A0A', color: '#ef4444', border: '1px solid #3A1A1A', borderRadius: '8px', padding: '0.4rem 0.9rem', fontWeight: '700', fontSize: '0.8rem', cursor: 'pointer' }}>
              <Trash2 size={14} /> Delete ({selectedMsgs.size})
            </button>
          </>
        ) : (
          <>
            <div style={{ position: 'relative' }}>
              <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'linear-gradient(135deg,#FFD700,#FF8C00)', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '0.9rem' }}>A</div>
              <div style={{ position: 'absolute', bottom: 1, right: 1, width: 10, height: 10, borderRadius: '50%', background: '#22C55E', border: '2px solid #111', boxShadow: '0 0 5px #22C55E' }} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: '700', fontSize: '0.9rem', color: '#fff' }}>TaxiNova Admin</div>
              <div style={{ fontSize: '0.72rem', color: '#22C55E' }}>● Support Team — Always Available</div>
            </div>
            <button onClick={deleteChat} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: '#2A0A0A', color: '#ef4444', border: '1px solid #3A1A1A', borderRadius: '8px', padding: '0.4rem 0.9rem', fontWeight: '700', fontSize: '0.8rem', cursor: 'pointer' }}>
              <Trash2 size={14} /> Delete Chat
            </button>
          </>
        )}
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', background: '#0D0D0D' }}>
        {loading && <div style={{ textAlign: 'center', color: '#555', fontSize: '0.85rem' }}>Loading messages...</div>}
        {!loading && messages.length === 0 && (
          <div style={{ textAlign: 'center', color: '#444', fontSize: '0.85rem', marginTop: '2rem' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem', opacity: 0.3 }}>💬</div>
            No messages yet. Send a message to admin!
          </div>
        )}

        {messages.map((msg, i) => {
          const isSelected = selectedMsgs.has(msg._id);
          const isOpen     = dropdown?.msgId === msg._id;
          return (
            <div key={msg._id || i}
              style={{ display: 'flex', justifyContent: msg.sender === 'captain' ? 'flex-end' : 'flex-start', background: isSelected ? 'rgba(255,215,0,0.08)' : 'transparent', borderRadius: '8px', padding: '2px 4px', transition: 'background 0.15s' }}
              onContextMenu={(e) => handleRightClick(e, msg)}
              onTouchStart={() => handleTouchStart(msg)}
              onTouchEnd={handleTouchEnd}
            >
              {/* Checkbox in multi-select mode */}
              {selectedMsgs.size > 0 && (
                <div onClick={(e) => { e.stopPropagation(); toggleSelect(msg._id); }}
                  style={{ alignSelf: 'center', marginRight: msg.sender === 'captain' ? '0' : '0.5rem', marginLeft: msg.sender === 'captain' ? '0.5rem' : '0', order: msg.sender === 'captain' ? 1 : -1, cursor: 'pointer' }}>
                  <div style={{ width: 20, height: 20, borderRadius: '50%', border: `2px solid ${isSelected ? '#FFD700' : '#333'}`, background: isSelected ? '#FFD700' : '#1A1A1A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {isSelected && <CheckCheck size={11} color="#000" />}
                  </div>
                </div>
              )}

              {/* Bubble */}
              <div data-dd
                onClick={(e) => handleBubbleClick(e, msg)}
                style={{ maxWidth: '65%', padding: '0.6rem 0.9rem', borderRadius: msg.sender === 'captain' ? '16px 16px 4px 16px' : '16px 16px 16px 4px', background: isOpen ? (msg.sender === 'captain' ? '#e6b800' : '#222') : (msg.sender === 'captain' ? '#FFD700' : '#1A1A1A'), color: msg.sender === 'captain' ? '#000' : '#ddd', fontSize: '0.875rem', border: msg.sender === 'admin' ? '1px solid #2A2A2A' : 'none', cursor: 'pointer', userSelect: 'none', transition: 'background 0.15s' }}
              >
                <div>{msg.text}</div>
                <div style={{ fontSize: '0.65rem', opacity: 0.65, marginTop: '0.25rem', textAlign: 'right', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '2px' }}>
                  {new Date(msg.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                  <Tick read={msg.read} sender={msg.sender} />
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid #1E1E1E', background: '#111', display: 'flex', gap: '0.75rem', alignItems: 'flex-end' }}>
        <textarea value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKey}
          placeholder="Message admin... (Enter to send)" rows={1}
          style={{ flex: 1, resize: 'none', border: '1px solid #2A2A2A', borderRadius: '12px', padding: '0.65rem 1rem', fontSize: '0.875rem', outline: 'none', fontFamily: 'inherit', background: '#1A1A1A', color: '#fff', maxHeight: '100px', overflowY: 'auto' }} />
        <button onClick={sendMessage} disabled={!input.trim()}
          style={{ background: input.trim() ? '#FFD700' : '#1A1A1A', color: input.trim() ? '#000' : '#555', border: 'none', borderRadius: '12px', padding: '0.65rem 1.25rem', fontWeight: '700', fontSize: '0.875rem', cursor: input.trim() ? 'pointer' : 'not-allowed', transition: 'all 0.2s', whiteSpace: 'nowrap' }}>
          Send ➤
        </button>
      </div>

      {/* WhatsApp-style dropdown */}
      {dropdown && (
        <div data-dd
          style={{ position: 'fixed', top: Math.min(dropdown.y, window.innerHeight - 210), left: Math.min(Math.max(dropdown.x, 8), window.innerWidth - 200), background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: '12px', boxShadow: '0 8px 32px rgba(0,0,0,0.55)', zIndex: 9999, minWidth: '192px', overflow: 'hidden', animation: 'ddIn 0.14s ease' }}
          onClick={e => e.stopPropagation()}>
          <style>{`@keyframes ddIn{from{opacity:0;transform:scale(0.9) translateY(-4px)}to{opacity:1;transform:scale(1) translateY(0)}}`}</style>
          {DROPDOWN_ITEMS(
            () => { navigator.clipboard?.writeText(dropdown.text || ''); setDropdown(null); },
            () => { setInput(`> ${dropdown.text}\n`); setDropdown(null); },
            () => { toggleSelect(dropdown.msgId); setDropdown(null); },
            () => deleteSingleMessage(dropdown.msgId),
          ).map((item, i) => (
            <button key={item.label} onClick={item.action}
              style={{ width: '100%', padding: '0.72rem 1.1rem', background: 'none', border: 'none', borderTop: i > 0 ? '1px solid #2A2A2A' : 'none', textAlign: 'left', fontSize: '0.875rem', cursor: 'pointer', color: item.danger ? '#ef4444' : '#ddd', display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: item.danger ? '600' : '500' }}
              onMouseEnter={e => e.currentTarget.style.background = item.danger ? '#2A0A0A' : '#222'}
              onMouseLeave={e => e.currentTarget.style.background = 'none'}
            >
              <span>{item.icon}</span>{item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default CaptainChat;
