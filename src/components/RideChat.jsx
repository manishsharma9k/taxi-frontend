import React, { useState, useEffect, useRef, useContext } from 'react';
import { X, Send, User, Loader2 } from 'lucide-react';
import { SocketContext } from '../context/SocketContext';
import './CSS/RideChat.css';

const RideChat = ({ rideId, senderId, receiverId, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);
  const { socket } = useContext(SocketContext);

  useEffect(() => {
    if (!socket) return;

    // Listen for incoming messages
    const handleReceiveMessage = (msg) => {
      // Only process messages for this ride
      if (msg.rideId === rideId) {
        setMessages((prev) => [...prev, msg]);
      }
    };

    socket.on('ride:chat:receive', handleReceiveMessage);

    return () => {
      socket.off('ride:chat:receive', handleReceiveMessage);
    };
  }, [socket, rideId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !socket) return;

    const msgData = {
      rideId,
      senderId,
      receiverId,
      text: newMessage.trim(),
      timestamp: new Date().toISOString()
    };

    // Optimistically add to UI
    setMessages((prev) => [...prev, msgData]);
    
    // Emit to server
    socket.emit('ride:chat:send', msgData);
    
    setNewMessage('');
  };

  return (
    <div className="ride-chat-overlay animate-fade-in-up">
      <div className="ride-chat-container">
        <div className="ride-chat-header">
          <div className="ride-chat-title">
            <MessageSquareIcon /> Chat
          </div>
          <button className="ride-chat-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="ride-chat-messages">
          {messages.length === 0 ? (
            <div className="ride-chat-empty">
              No messages yet. Say hello!
            </div>
          ) : (
            messages.map((msg, idx) => {
              const isMine = msg.senderId === senderId;
              return (
                <div key={idx} className={`ride-chat-bubble-wrapper ${isMine ? 'mine' : 'theirs'}`}>
                  <div className={`ride-chat-bubble ${isMine ? 'mine' : 'theirs'}`}>
                    {msg.text}
                  </div>
                  <div className="ride-chat-time">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        <form className="ride-chat-input-area" onSubmit={handleSendMessage}>
          <input
            type="text"
            className="ride-chat-input"
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <button type="submit" className="ride-chat-send" disabled={!newMessage.trim()}>
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
};

const MessageSquareIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
  </svg>
);

export default RideChat;
