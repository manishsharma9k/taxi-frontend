import React, { useEffect, useState, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import { Trash2, X, CheckCheck } from 'lucide-react';
import { API_URL } from '../api.js';

const socket = io(API_URL);

const Tick = ({ read, sender }) => {
  if (sender !== 'admin') return null;
  return (
    <span style={{ marginLeft: '4px', fontSize: '0.7rem', display: 'inline-flex', alignItems: 'center' }}>
      {read
        ? <span style={{ color: '#60a5fa', fontWeight: '700', letterSpacing: '-2px' }}>✓✓</span>
        : <span style={{ color: 'rgba(255,255,255,0.5)', fontWeight: '700' }}>✓</span>}
    </span>
  );
};

const AdminChatPanel = () => {
  const [captainList, setCaptainList] = useState([]);
  const [selectedCaptain, setSelectedCaptain] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedMsgs, setSelectedMsgs] = useState(new Set()); // selected message ids
  const [contextMenu, setContextMenu] = useState(null); // { x, y, msgId }
  const messagesEndRef = useRef(null);
  const longPressTimer = useRef(null);

  useEffect(() => { socket.emit('identify', { role: 'admin', id: 'admin' }); }, []);

  const fetchCaptains = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/chat/captains`);
      const data = await res.json();
      setCaptainList(Array.isArray(data) ? data : []);
    } catch {}
  }, []);

  useEffect(() => { fetchCaptains(); }, [fetchCaptains]);

  const fetchMessages = useCallback(async (captain) => {
    if (!captain) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/chat/${captain._id}?role=admin`);
      const data = await res.json();
      setMessages(Array.isArray(data) ? data : []);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchMessages(selectedCaptain); }, [selectedCaptain, fetchMessages]);

  useEffect(() => {
    const onMsg = (msg) => {
      if (selectedCaptain && msg.captainId === selectedCaptain._id) {
        setMessages(prev => {
          if (msg.sender === 'captain') return [...prev.map(m => m.sender === 'admin' ? { ...m, read: true } : m), msg];
          return [...prev, msg];
        });
      }
      fetchCaptains();
    };
    const onDeleted = ({ messageId, role }) => {
      if (role === 'admin') setMessages(prev => prev.filter(m => m._id !== messageId));
    };
    const onCleared = ({ captainId, role }) => {
      if (role === 'admin' && selectedCaptain?._id === captainId) setMessages([]);
    };
    socket.on('chat:message', onMsg);
    socket.on('chat:messageDeleted', onDeleted);
    socket.on('chat:cleared', onCleared);
    return () => {
      socket.off('chat:message', onMsg);
      socket.off('chat:messageDeleted', onDeleted);
      socket.off('chat:cleared', onCleared);
    };
  }, [selectedCaptain, fetchCaptains]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  useEffect(() => {
    const close = (e) => { if (!e.target.closest('[data-dropdown]')) setContextMenu(null); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const sendMessage = async () => {
    if (!input.trim() || !selectedCaptain) return;
    const text = input.trim(); setInput('');
    try {
      await fetch(`${API_URL}/api/chat/send`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ captainId: selectedCaptain._id, sender: 'admin', text }),
      });
    } catch {}
  };

  const handleKey = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } };

  const handleMsgClick = (e, msg) => {
    e.stopPropagation();
    if (selectedMsgs.size > 0) { toggleSelect(msg._id); return; }
    const rect = e.currentTarget.getBoundingClientRect();
    const x = msg.sender === 'admin' ? rect.right - 192 : rect.left;
    const y = rect.bottom + 6;
    setContextMenu(prev => prev?.msgId === msg._id ? null : { x, y, msgId: msg._id, text: msg.text });
  };
  const handleContextMenu = (e, msg) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, msgId: msg._id, text: msg.text });
  };
  const handleTouchStart = (msg) => {
    longPressTimer.current = setTimeout(() => {
      setContextMenu({ x: 80, y: 300, msgId: msg._id, text: msg.text });
    }, 500);
  };
  const handleTouchEnd = () => clearTimeout(longPressTimer.current);

  const toggleSelect = (msgId) => {
    setSelectedMsgs(prev => { const s = new Set(prev); s.has(msgId) ? s.delete(msgId) : s.add(msgId); return s; });
  };

  const deleteSelectedMessages = async () => {
    for (const msgId of selectedMsgs) {
      await fetch(`${API_URL}/api/chat/message/${msgId}`, {
        method: 'DELETE', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: 'admin' }),
      });
    }
    setMessages(prev => prev.filter(m => !selectedMsgs.has(m._id)));
    setSelectedMsgs(new Set());
  };

  const deleteSingleMessage = async (msgId) => {
    setContextMenu(null);
    await fetch(`${API_URL}/api/chat/message/${msgId}`, {
      method: 'DELETE', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: 'admin' }),
    });
    setMessages(prev => prev.filter(m => m._id !== msgId));
  };

  const deleteChat = async () => {
    if (!selectedCaptain) return;
    if (!window.confirm(`Delete entire chat with ${selectedCaptain.name}? This cannot be undone for your side.`)) return;
    await fetch(`${API_URL}/api/chat/chat/${selectedCaptain._id}`, {
      method: 'DELETE', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: 'admin' }),
    });
    setMessages([]);
    setSelectedMsgs(new Set());
  };

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 160px)', background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>

      {/* Captain List */}
      <div style={{ width: '280px', borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #e2e8f0', fontWeight: '700', fontSize: '0.9rem', color: '#1e293b', background: '#f8fafc' }}>
          Captains ({captainList.length})
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {captainList.length === 0 && <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>No captains found</div>}
          {captainList.map(({ captain, lastMessage }) => (
            <div key={captain._id} onClick={() => { setSelectedCaptain(captain); setSelectedMsgs(new Set()); }}
              style={{ padding: '0.9rem 1.25rem', cursor: 'pointer', borderBottom: '1px solid #f1f5f9', background: selectedCaptain?._id === captain._id ? '#eff6ff' : '#fff', borderLeft: selectedCaptain?._id === captain._id ? '3px solid #3b82f6' : '3px solid transparent', transition: 'all 0.15s' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.2rem' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: captain.isOnline ? '#22c55e' : '#cbd5e1', flexShrink: 0 }} />
                <span style={{ fontWeight: '600', fontSize: '0.875rem', color: '#1e293b' }}>{captain.name}</span>
                <span style={{ marginLeft: 'auto', fontSize: '0.68rem', color: captain.isOnline ? '#22c55e' : '#94a3b8', fontWeight: '600' }}>{captain.isOnline ? 'Online' : 'Offline'}</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', paddingLeft: '14px' }}>{captain.vehicleType} • {captain.phone}</div>
              {lastMessage && (
                <div style={{ fontSize: '0.72rem', color: '#94a3b8', paddingLeft: '14px', marginTop: '0.2rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {lastMessage.sender === 'admin' ? 'You: ' : ''}{lastMessage.text}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {!selectedCaptain ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '0.75rem', color: '#94a3b8' }}>
            <div style={{ fontSize: '3rem' }}>💬</div>
            <div style={{ fontWeight: '600', fontSize: '1rem', color: '#64748b' }}>Select a captain to start chatting</div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div style={{ padding: '0.75rem 1.5rem', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              {selectedMsgs.size > 0 ? (
                <>
                  <button onClick={() => setSelectedMsgs(new Set())} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center' }}><X size={18} /></button>
                  <span style={{ fontWeight: '700', fontSize: '0.9rem', color: '#1e293b' }}>{selectedMsgs.size} selected</span>
                  <button onClick={deleteSelectedMessages} style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.4rem', background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '8px', padding: '0.4rem 0.9rem', fontWeight: '700', fontSize: '0.8rem', cursor: 'pointer' }}>
                    <Trash2 size={14} /> Delete ({selectedMsgs.size})
                  </button>
                </>
              ) : (
                <>
                  <div style={{ position: 'relative' }}>
                    <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'linear-gradient(135deg,#3b82f6,#4f46e5)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '0.9rem' }}>
                      {selectedCaptain.name?.[0]?.toUpperCase()}
                    </div>
                    <div style={{ position: 'absolute', bottom: 1, right: 1, width: 10, height: 10, borderRadius: '50%', background: selectedCaptain.isOnline ? '#22c55e' : '#cbd5e1', border: '2px solid #f8fafc' }} />
                  </div>
                  <div>
                    <div style={{ fontWeight: '700', fontSize: '0.9rem', color: '#1e293b' }}>{selectedCaptain.name}</div>
                    <div style={{ fontSize: '0.75rem', color: selectedCaptain.isOnline ? '#22c55e' : '#94a3b8' }}>{selectedCaptain.isOnline ? '● Online' : '○ Offline'} • {selectedCaptain.vehicleType}</div>
                  </div>
                  <button onClick={deleteChat} title="Delete Chat" style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.4rem', background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '8px', padding: '0.4rem 0.9rem', fontWeight: '700', fontSize: '0.8rem', cursor: 'pointer' }}>
                    <Trash2 size={14} /> Delete Chat
                  </button>
                </>
              )}
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', background: '#fafafa' }}>
              {loading && <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>Loading messages...</div>}
              {!loading && messages.length === 0 && <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem', marginTop: '2rem' }}>No messages yet.</div>}
              {messages.map((msg, i) => {
                const isSelected = selectedMsgs.has(msg._id);
                const isOpen = contextMenu?.msgId === msg._id;
                return (
                  <div key={msg._id || i}
                    style={{ display: 'flex', justifyContent: msg.sender === 'admin' ? 'flex-end' : 'flex-start', background: isSelected ? 'rgba(59,130,246,0.08)' : 'transparent', borderRadius: '8px', padding: '2px 4px', transition: 'background 0.15s', position: 'relative' }}
                    onContextMenu={(e) => handleContextMenu(e, msg)}
                    onTouchStart={() => handleTouchStart(msg)}
                    onTouchEnd={handleTouchEnd}
                  >
                    {selectedMsgs.size > 0 && (                     
                      <div onClick={(e) => { e.stopPropagation(); toggleSelect(msg._id); }}
                        style={{ alignSelf: 'center', marginRight: msg.sender === 'admin' ? '0' : '0.5rem', marginLeft: msg.sender === 'admin' ? '0.5rem' : '0', order: msg.sender === 'admin' ? 1 : -1, cursor: 'pointer' }}>
                        <div style={{ width: 20, height: 20, borderRadius: '50%', border: `2px solid ${isSelected ? '#3b82f6' : '#cbd5e1'}`, background: isSelected ? '#3b82f6' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {isSelected && <CheckCheck size={11} color="#fff" />}
                        </div>
                      </div>
                    )}
                    <div data-dropdown
                      onClick={(e) => handleMsgClick(e, msg)}
                      style={{ maxWidth: '65%', padding: '0.6rem 0.9rem', borderRadius: msg.sender === 'admin' ? '16px 16px 4px 16px' : '16px 16px 16px 4px', background: isOpen ? (msg.sender === 'admin' ? 'linear-gradient(135deg,#2563eb,#3730a3)' : '#f1f5f9') : (msg.sender === 'admin' ? 'linear-gradient(135deg,#3b82f6,#4f46e5)' : '#fff'), color: msg.sender === 'admin' ? '#fff' : '#1e293b', fontSize: '0.875rem', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', border: msg.sender === 'captain' ? '1px solid #e2e8f0' : 'none', cursor: 'pointer', userSelect: 'none', transition: 'background 0.15s' }}
                    >
                      <div>{msg.text}</div>
                      <div style={{ fontSize: '0.65rem', opacity: 0.75, marginTop: '0.25rem', textAlign: 'right', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '2px' }}>
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
            <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid #e2e8f0', background: '#fff', display: 'flex', gap: '0.75rem', alignItems: 'flex-end' }}>
              <textarea value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKey} placeholder="Type a message... (Enter to send)" rows={1}
                style={{ flex: 1, resize: 'none', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '0.65rem 1rem', fontSize: '0.875rem', outline: 'none', fontFamily: 'inherit', background: '#f8fafc', color: '#1e293b', maxHeight: '100px', overflowY: 'auto' }} />
              <button onClick={sendMessage} disabled={!input.trim()}
                style={{ background: input.trim() ? 'linear-gradient(135deg,#3b82f6,#4f46e5)' : '#e2e8f0', color: input.trim() ? '#fff' : '#94a3b8', border: 'none', borderRadius: '12px', padding: '0.65rem 1.25rem', fontWeight: '700', fontSize: '0.875rem', cursor: input.trim() ? 'pointer' : 'not-allowed', transition: 'all 0.2s', whiteSpace: 'nowrap' }}>
                Send ➤
              </button>
            </div>
          </>
        )}
      </div>

      {contextMenu && (
        <div data-dropdown
          style={{ position: 'fixed', top: Math.min(contextMenu.y, window.innerHeight - 210), left: Math.min(Math.max(contextMenu.x, 8), window.innerWidth - 200), background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 8px 32px rgba(0,0,0,0.18)', zIndex: 9999, minWidth: '192px', overflow: 'hidden', animation: 'ddIn 0.14s ease' }}
          onClick={e => e.stopPropagation()}>
          <style>{`@keyframes ddIn{from{opacity:0;transform:scale(0.9) translateY(-4px)}to{opacity:1;transform:scale(1) translateY(0)}}`}</style>
          {[
            { icon: '📋', label: 'Copy', action: () => { navigator.clipboard?.writeText(contextMenu.text || ''); setContextMenu(null); } },
            { icon: '↩️', label: 'Reply', action: () => { setInput(`> ${contextMenu.text}\n`); setContextMenu(null); } },
            { icon: '☑️', label: 'Select Message', action: () => { toggleSelect(contextMenu.msgId); setContextMenu(null); } },
            { icon: '🗑️', label: 'Delete Message', action: () => deleteSingleMessage(contextMenu.msgId), danger: true },
          ].map((item, i) => (
            <button key={item.label} onClick={item.action}
              style={{ width: '100%', padding: '0.72rem 1.1rem', background: 'none', border: 'none', borderTop: i > 0 ? '1px solid #f1f5f9' : 'none', textAlign: 'left', fontSize: '0.875rem', cursor: 'pointer', color: item.danger ? '#ef4444' : '#1e293b', display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: item.danger ? '600' : '500' }}
              onMouseEnter={e => e.currentTarget.style.background = item.danger ? '#fff5f5' : '#f8fafc'}
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

export default AdminChatPanel;
