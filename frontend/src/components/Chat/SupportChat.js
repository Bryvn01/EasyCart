import React, { useState, useEffect, useRef } from 'react';

const SupportChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, text: "Hello! How can I help you today?", sender: 'support', timestamp: new Date() }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const message = {
      id: Date.now(),
      text: newMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, message]);
    
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        text: "Thanks for your message! Our team will get back to you shortly.",
        sender: 'support',
        timestamp: new Date()
      }]);
    }, 1000);
    
    setNewMessage('');
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        style={{
          position: 'fixed', bottom: '20px', right: '20px', width: '60px', height: '60px',
          borderRadius: '50%', backgroundColor: '#007bff', color: 'white', border: 'none',
          fontSize: '24px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', zIndex: 1000
        }}
      >
        💬
      </button>
    );
  }

  return (
    <div style={{
      position: 'fixed', bottom: '20px', right: '20px', width: '320px', height: '400px',
      backgroundColor: 'white', border: '1px solid #ddd', borderRadius: '12px',
      boxShadow: '0 8px 24px rgba(0,0,0,0.15)', display: 'flex', flexDirection: 'column', zIndex: 1000
    }}>
      <div style={{
        padding: '16px', backgroundColor: '#007bff', color: 'white', borderRadius: '12px 12px 0 0',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
      }}>
        <h4 style={{ margin: 0, fontSize: '16px' }}>Support Chat</h4>
        <button onClick={() => setIsOpen(false)} style={{
          background: 'none', border: 'none', color: 'white', fontSize: '18px', cursor: 'pointer'
        }}>×</button>
      </div>

      <div style={{
        flex: 1, padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px'
      }}>
        {messages.map(message => (
          <div key={message.id} style={{ alignSelf: message.sender === 'user' ? 'flex-end' : 'flex-start', maxWidth: '80%' }}>
            <div style={{
              padding: '8px 12px', borderRadius: '12px',
              backgroundColor: message.sender === 'user' ? '#007bff' : '#f1f3f4',
              color: message.sender === 'user' ? 'white' : 'black', fontSize: '14px'
            }}>
              {message.text}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={sendMessage} style={{ padding: '16px', borderTop: '1px solid #eee', display: 'flex', gap: '8px' }}>
        <input
          type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..." style={{
            flex: 1, padding: '8px 12px', border: '1px solid #ddd', borderRadius: '20px', outline: 'none', fontSize: '14px'
          }}
        />
        <button type="submit" style={{
          padding: '8px 16px', backgroundColor: '#007bff', color: 'white', border: 'none',
          borderRadius: '20px', cursor: 'pointer', fontSize: '14px'
        }}>Send</button>
      </form>
    </div>
  );
};

export default SupportChat;